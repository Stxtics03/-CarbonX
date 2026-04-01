"""
carbon_calc.py
Calculates carbon credits earned from a verified crop submission.

Formula basis:
  - Sustainable farming practices sequester ~0.3–1.0 tCO2e per tonne of crop
  - We use crop-specific emission factors from IPCC Tier 1 guidelines
  - 1 carbon credit = 1 tonne CO2 equivalent (tCO2e)
"""

# Emission factor: tonnes CO2e sequestered per tonne of crop harvested
# Source: IPCC Tier 1 defaults + ICRISAT estimates for Indian smallholders
EMISSION_FACTORS: dict[str, float] = {
    "rice":       0.45,   # methane from paddy fields partially offsets
    "wheat":      0.55,
    "maize":      0.60,
    "corn":       0.60,
    "sorghum":    0.65,
    "jowar":      0.65,
    "bajra":      0.65,
    "millet":     0.65,
    "sugarcane":  0.30,
    "cotton":     0.50,
    "soybean":    0.70,
    "groundnut":  0.55,
    "mustard":    0.58,
    "sunflower":  0.55,
    "potato":     0.35,
    "onion":      0.30,
    "tomato":     0.30,
    "chilli":     0.40,
    "turmeric":   0.50,
    "ginger":     0.50,
    "banana":     0.35,
    "mango":      0.45,
    "coconut":    0.40,
    "arhar":      0.72,
    "tur":        0.72,
    "moong":      0.68,
    "urad":       0.68,
    "chana":      0.70,
    "gram":       0.70,
    "lentil":     0.68,
    "masoor":     0.68,
}

DEFAULT_FACTOR = 0.50   # fallback for unknown crops

# Minimum confidence before applying full credit (below this → scaled down)
MIN_CONFIDENCE_FULL = 80


def calculate_credits(
    crop: str,
    quantity_kg: float,
    confidence_score: int,
) -> dict:
    """
    Calculate carbon credits for a verified submission.

    Args:
        crop:             crop type string (lowercase)
        quantity_kg:      harvested quantity in kilograms
        confidence_score: final AI confidence score (0–100)

    Returns:
        {
            "credits": int,            # whole credits to mint
            "credits_exact": float,    # before rounding
            "emission_factor": float,
            "calculation_note": str,
        }
    """
    if quantity_kg <= 0:
        return _zero_result("Zero or negative quantity")

    if confidence_score < 50:
        return _zero_result("Confidence too low to issue credits")

    factor = EMISSION_FACTORS.get(crop.lower() if crop else "", DEFAULT_FACTOR)

    # Convert kg → tonnes
    quantity_tonnes = quantity_kg / 1000.0

    # Raw credits (tCO2e)
    raw_credits = quantity_tonnes * factor

    # Scale by confidence if below threshold
    if confidence_score < MIN_CONFIDENCE_FULL:
        scale = confidence_score / MIN_CONFIDENCE_FULL
        raw_credits *= scale
        note = (
            f"Credits scaled to {scale:.0%} due to confidence score {confidence_score}/100"
        )
    else:
        note = f"Full credits issued at confidence {confidence_score}/100"

    whole_credits = max(0, int(raw_credits))   # floor to whole credits

    return {
        "credits":          whole_credits,
        "credits_exact":    round(raw_credits, 4),
        "emission_factor":  factor,
        "calculation_note": note,
    }


def _zero_result(reason: str) -> dict:
    return {
        "credits":          0,
        "credits_exact":    0.0,
        "emission_factor":  0.0,
        "calculation_note": reason,
    }