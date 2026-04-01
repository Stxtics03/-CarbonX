"""
historical_check.py
Compares the current submission against the farmer's own past submissions.
Returns a score 0–100.
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/mrv_db")
engine = create_engine(DATABASE_URL)

# Max allowed growth season-over-season before flagging (50%)
MAX_GROWTH_RATIO = 1.50


def historical_score(farmer_address: str, crop: str, quantity_kg: float) -> int:
    """
    Compare current submission against farmer's historical average for this crop.

    Scoring:
        - No history yet          → 70 (benefit of the doubt, first submission)
        - Within ±30% of their avg → 100
        - Within ±60%             → 70
        - > MAX_GROWTH_RATIO      → 20 (sudden spike, suspicious)

    Returns int 0–100.
    """
    if not farmer_address or not crop or quantity_kg is None:
        return 70

    history = _fetch_history(farmer_address, crop.lower())

    if not history:
        return 70   # first-time farmer for this crop

    avg_past = sum(history) / len(history)

    if avg_past == 0:
        return 70

    ratio = quantity_kg / avg_past
    deviation = abs(quantity_kg - avg_past) / avg_past

    if ratio > MAX_GROWTH_RATIO:
        return 20   # suspicious jump
    elif deviation <= 0.30:
        return 100
    elif deviation <= 0.60:
        return 70
    else:
        return 30


def _fetch_history(farmer_address: str, crop: str) -> list[float]:
    """Return list of past approved quantity_kg values for this farmer + crop."""
    query = text("""
        SELECT quantity_kg
        FROM submissions
        WHERE farmer_address = :addr
          AND crop_type      = :crop
          AND status         = 'approved'
        ORDER BY created_at DESC
        LIMIT 10
    """)
    try:
        with engine.connect() as conn:
            result = conn.execute(query, {"addr": farmer_address, "crop": crop})
            return [float(row[0]) for row in result.fetchall()]
    except SQLAlchemyError as e:
        print(f"[historical_check] DB error: {e}")
        return []