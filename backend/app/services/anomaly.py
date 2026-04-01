"""
anomaly.py
ML-based anomaly detection on crop submission data.
Uses Isolation Forest (no labelled data needed — unsupervised).
Returns a score 0–100 and a list of flag reasons.
"""

import os
import pickle
from pathlib import Path

import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = Path(__file__).parent / "anomaly_model.pkl"

# Number of samples needed before we trust the model
MIN_SAMPLES_FOR_MODEL = 30


def anomaly_score(features: dict) -> dict:
    """
    Detect anomalies in the submission feature set.

    Args:
        features: {
            "quantity_kg": float,
            "confidence_ocr": int,    # 0-100 from OCR
            "regional_score": int,    # 0-100 from regional_check
            "historical_score": int,  # 0-100 from historical_check
        }

    Returns:
        {
            "score": int,          # 0–100, higher = more normal
            "is_anomaly": bool,
            "flags": list[str]
        }
    """
    flags = _rule_based_flags(features)

    # If rules already flag hard, skip ML
    if len(flags) >= 2:
        return {"score": 15, "is_anomaly": True, "flags": flags}

    model = _load_model()
    if model is None:
        # Not enough data yet — rely on rule-based only
        score = 85 if not flags else 50
        return {"score": score, "is_anomaly": bool(flags), "flags": flags}

    feature_vector = _to_vector(features)
    prediction = model.predict([feature_vector])[0]   # 1 = normal, -1 = anomaly
    isolation_score = model.score_samples([feature_vector])[0]

    # Convert Isolation Forest score (negative, closer to 0 = normal) to 0–100
    normalized = int(min(100, max(0, (isolation_score + 0.5) * 200)))

    is_anomaly = prediction == -1
    if is_anomaly:
        flags.append("ML model flagged this submission as an outlier")

    return {
        "score":      normalized,
        "is_anomaly": is_anomaly or bool(flags),
        "flags":      flags,
    }


def train_and_save_model(training_data: list[dict]) -> bool:
    """
    Train Isolation Forest on historical submissions and save to disk.
    Call this periodically (e.g., after every 50 new approved submissions).

    Returns True on success.
    """
    if len(training_data) < MIN_SAMPLES_FOR_MODEL:
        print(f"[anomaly] Need at least {MIN_SAMPLES_FOR_MODEL} samples to train.")
        return False

    X = np.array([_to_vector(d) for d in training_data])
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    model.fit(X)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    print(f"[anomaly] Model trained on {len(training_data)} samples and saved.")
    return True


# ─── Internals ────────────────────────────────────────────────────────────────

def _rule_based_flags(features: dict) -> list[str]:
    flags = []
    qty = features.get("quantity_kg", 0)
    ocr = features.get("confidence_ocr", 100)
    reg = features.get("regional_score", 100)
    his = features.get("historical_score", 100)

    if qty <= 0:
        flags.append("Quantity is zero or negative")
    if qty > 1_000_000:
        flags.append("Quantity exceeds 1,000 metric tons — unusually large")
    if ocr < 30:
        flags.append("OCR confidence very low — receipt may be unreadable or forged")
    if reg < 20:
        flags.append("Yield far outside regional norms")
    if his < 25:
        flags.append("Massive spike compared to farmer's own history")

    return flags


def _to_vector(features: dict) -> list[float]:
    return [
        float(features.get("quantity_kg", 0)),
        float(features.get("confidence_ocr", 50)),
        float(features.get("regional_score", 50)),
        float(features.get("historical_score", 50)),
    ]


def _load_model():
    if MODEL_PATH.exists():
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return None