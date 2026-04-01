"""
main.py — FastAPI entry point for the MRV Carbon Credit Platform
"""

import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.ocr              import scan_receipt
from app.services.regional_check   import regional_score
from app.services.historical_check import historical_score
from app.services.anomaly          import anomaly_score
from app.services.carbon_calc      import calculate_credits
from app.services.blockchain_service import (
    log_verification,
    mint_credit,
    get_balance,
    get_submission,
)

app = FastAPI(title="MRV Carbon Credit API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── /submit ──────────────────────────────────────────────────────────────────

@app.post("/submit")
async def submit_crop_data(
    farmer_address: str = Form(...),
    crop_type:      str = Form(...),
    ipfs_cid:       str = Form(...),   # IPFS hash of encrypted receipt
    receipt:        UploadFile = File(...),
):
    """
    Full submission pipeline:
      1. OCR the receipt
      2. Run all verification checks
      3. Calculate final confidence score
      4. Decide: approve / manual_review / reject
      5. Log on blockchain
      6. Mint credits if approved
    """

    # 1. OCR
    image_bytes = await receipt.read()
    ocr_result = scan_receipt(image_bytes)

    quantity_kg = ocr_result.get("quantity_kg") or 0
    region      = ocr_result.get("region") or "unknown"
    ocr_conf    = ocr_result.get("confidence", 50)

    # 2. Individual checks
    reg_score  = regional_score(crop_type, region, quantity_kg)
    hist_score = historical_score(farmer_address, crop_type, quantity_kg)
    anom       = anomaly_score({
        "quantity_kg":       quantity_kg,
        "confidence_ocr":    ocr_conf,
        "regional_score":    reg_score,
        "historical_score":  hist_score,
    })

    # 3. Final confidence score: OCR×0.3 + regional×0.4 + historical×0.3
    final_confidence = int(
        (ocr_conf * 0.3) +
        (reg_score * 0.4) +
        (hist_score * 0.3)
    )

    # Override downward if anomaly detected
    if anom["is_anomaly"]:
        final_confidence = min(final_confidence, 45)

    # 4. Decision
    if final_confidence >= 80:
        decision = "approved"
    elif final_confidence >= 50:
        decision = "manual_review"
    else:
        decision = "rejected"

    approved = decision == "approved"

    # 5. Log on blockchain
    blockchain_result = log_verification(
        farmer_address=farmer_address,
        ipfs_cid=ipfs_cid,
        confidence_score=final_confidence,
        approved=approved,
    )
    submission_id = blockchain_result.get("submission_id")

    # 6. Mint credits if approved
    mint_result = None
    credit_result = None

    if approved and submission_id is not None:
        credit_result = calculate_credits(crop_type, quantity_kg, final_confidence)
        if credit_result["credits"] > 0:
            mint_result = mint_credit(
                farmer_address=farmer_address,
                amount=credit_result["credits"],
                submission_id=submission_id,
            )

    return {
        "status":           decision,
        "final_confidence": final_confidence,
        "submission_id":    submission_id,
        "ocr": {
            "crop_detected":  ocr_result.get("crop_type"),
            "quantity_kg":    quantity_kg,
            "region":         region,
            "ocr_confidence": ocr_conf,
        },
        "scores": {
            "ocr":        ocr_conf,
            "regional":   reg_score,
            "historical": hist_score,
        },
        "anomaly": {
            "is_anomaly": anom["is_anomaly"],
            "flags":      anom["flags"],
        },
        "blockchain": blockchain_result,
        "credits":    credit_result,
        "mint":       mint_result,
    }


# ─── /balance ─────────────────────────────────────────────────────────────────

@app.get("/balance/{farmer_address}")
def get_farmer_balance(farmer_address: str):
    """Return carbon credit balance for a farmer wallet."""
    balance = get_balance(farmer_address)
    return {"farmer_address": farmer_address, "balance": balance}


# ─── /submission ──────────────────────────────────────────────────────────────

@app.get("/submission/{submission_id}")
def fetch_submission(submission_id: int):
    """Fetch a submission record from the blockchain."""
    data = get_submission(submission_id)
    if not data:
        raise HTTPException(status_code=404, detail="Submission not found")
    return data


# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}