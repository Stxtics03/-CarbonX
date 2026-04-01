"""
regional_check.py
Compares submitted crop yield against ICRISAT VDSA regional averages
stored in PostgreSQL (regional_yields table).
Returns a score 0–100.
"""

import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/mrv_db")
engine = create_engine(DATABASE_URL)


def regional_score(crop: str, region: str, quantity_kg: float) -> int:
    """
    Compare submitted quantity_kg against regional average for the crop.

    Scoring logic:
        - Within ±20% of avg_yield  → 100
        - Within ±40%               → 75
        - Between min and max       → 50
        - Outside min/max entirely  → 10 (suspicious)

    Returns int 0–100.
    """
    if not crop or not region or quantity_kg is None:
        return 50   # neutral if data missing

    row = _fetch_regional_data(crop.lower(), region.lower())
    if row is None:
        return 50   # no data for this region/crop → neutral

    avg    = float(row["avg_yield"])
    lo     = float(row["min_yield"])
    hi     = float(row["max_yield"])

    # Deviation from average (as fraction)
    deviation = abs(quantity_kg - avg) / avg if avg > 0 else 1.0

    if deviation <= 0.20:
        return 100
    elif deviation <= 0.40:
        return 75
    elif lo <= quantity_kg <= hi:
        return 50
    else:
        return 10


def _fetch_regional_data(crop: str, region: str) -> dict | None:
    query = text("""
        SELECT avg_yield, min_yield, max_yield
        FROM regional_yields
        WHERE crop = :crop
          AND LOWER(region) = :region
        LIMIT 1
    """)
    try:
        with engine.connect() as conn:
            result = conn.execute(query, {"crop": crop, "region": region})
            row = result.mappings().fetchone()
            return dict(row) if row else None
    except SQLAlchemyError as e:
        print(f"[regional_check] DB error: {e}")
        return None