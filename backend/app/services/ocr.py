"""
ocr.py
Scans uploaded crop receipt images using pytesseract.
Returns extracted fields and a confidence score (0–100).
"""

import re
import pytesseract
from PIL import Image
import io


# ─── Main entry point ─────────────────────────────────────────────────────────

def scan_receipt(image_bytes: bytes) -> dict:
    """
    Run OCR on a receipt image.

    Returns:
        {
            "raw_text": str,
            "crop_type": str | None,
            "quantity_kg": float | None,
            "region": str | None,
            "confidence": int   # 0–100
        }
    """
    image = Image.open(io.BytesIO(image_bytes))

    # Get OCR data with confidence per word
    ocr_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    raw_text = pytesseract.image_to_string(image)

    # Word-level confidence (pytesseract returns -1 for non-words)
    word_confidences = [
        int(c) for c in ocr_data["conf"] if int(c) >= 0
    ]
    avg_confidence = int(sum(word_confidences) / len(word_confidences)) if word_confidences else 0

    extracted = _extract_fields(raw_text)
    extracted["raw_text"]   = raw_text.strip()
    extracted["confidence"] = avg_confidence

    return extracted


# ─── Field extraction ─────────────────────────────────────────────────────────

# Known Indian crop names for matching
KNOWN_CROPS = [
    "rice", "wheat", "maize", "corn", "sorghum", "jowar", "bajra",
    "millet", "sugarcane", "cotton", "soybean", "groundnut", "mustard",
    "sunflower", "potato", "onion", "tomato", "chilli", "turmeric",
    "ginger", "banana", "mango", "coconut", "arhar", "tur", "moong",
    "urad", "chana", "gram", "lentil", "masoor",
]

# Indian state/district keywords that may appear on receipts
REGION_KEYWORDS = [
    "karnataka", "maharashtra", "andhra", "telangana", "tamil", "kerala",
    "gujarat", "rajasthan", "punjab", "haryana", "uttar pradesh", "bihar",
    "odisha", "madhya pradesh", "bengal", "assam",
    # Add district names as needed
]


def _extract_fields(text: str) -> dict:
    lower = text.lower()

    crop_type = _find_crop(lower)
    quantity_kg = _find_quantity(lower)
    region = _find_region(lower)

    return {
        "crop_type":   crop_type,
        "quantity_kg": quantity_kg,
        "region":      region,
    }


def _find_crop(text: str) -> str | None:
    for crop in KNOWN_CROPS:
        if crop in text:
            return crop
    return None


def _find_quantity(text: str) -> float | None:
    """
    Match patterns like:
      "150 kg", "150kg", "150 quintals", "150 q",
      "150.5 MT", "150 tonnes"
    Returns value normalized to kg.
    """
    patterns = [
        r"(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilogram)",
        r"(\d+(?:\.\d+)?)\s*(?:quintal|quintals|q)\b",
        r"(\d+(?:\.\d+)?)\s*(?:mt|metric\s*ton|tonne|tonnes|ton)\b",
    ]
    multipliers = {
        0: 1,       # already kg
        1: 100,     # 1 quintal = 100 kg
        2: 1000,    # 1 MT = 1000 kg
    }

    for i, pattern in enumerate(patterns):
        match = re.search(pattern, text)
        if match:
            value = float(match.group(1))
            return value * multipliers[i]

    return None


def _find_region(text: str) -> str | None:
    for region in REGION_KEYWORDS:
        if region in text:
            return region.title()
    return None