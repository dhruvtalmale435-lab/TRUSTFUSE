"""
services/risk_service.py
AI Investor Fraud & Impersonation Detection Platform

Centralised risk classification and scoring utilities.

Thresholds:
    0  – 29  → low
    30 – 59  → medium
    60 – 79  → high
    80 – 100 → critical

All thresholds are module-level constants so they can be tuned
without hunting through business logic.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Configurable thresholds
# ---------------------------------------------------------------------------

THRESHOLD_LOW      = 30   # score < 30  → "low"
THRESHOLD_MEDIUM   = 60   # score < 60  → "medium"
THRESHOLD_HIGH     = 80   # score < 80  → "high"
                          # score >= 80 → "critical"

ALERT_MINIMUM_SCORE = 60  # scores at or above this level trigger an alert


# ---------------------------------------------------------------------------
# Core classification functions
# ---------------------------------------------------------------------------

def get_severity(score: float) -> str:
    """
    Map a numeric risk score (0-100) to a severity label.

    Args:
        score: Float between 0 and 100.

    Returns:
        'low' | 'medium' | 'high' | 'critical'
    """
    score = _clamp(score)
    if score < THRESHOLD_LOW:
        return "low"
    if score < THRESHOLD_MEDIUM:
        return "medium"
    if score < THRESHOLD_HIGH:
        return "high"
    return "critical"


def get_risk_level(score: float) -> str:
    """
    Alias for get_severity() that returns uppercase labels matching the DB schema.

    Returns:
        'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    """
    return get_severity(score).upper()


def requires_alert(score: float) -> bool:
    """
    Return True if the score is high enough to auto-generate an alert.

    Args:
        score: Float 0-100.
    """
    return _clamp(score) >= ALERT_MINIMUM_SCORE


def normalize_score(raw: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    """
    Normalise an arbitrary score from [min_val, max_val] to [0, 100].

    Useful when individual ML engines return values on different scales.

    Args:
        raw:     The raw score from a model.
        min_val: Minimum possible value of the raw score (default 0.0).
        max_val: Maximum possible value of the raw score (default 1.0).

    Returns:
        Float in [0.0, 100.0].
    """
    if max_val == min_val:
        return 0.0
    normalised = (raw - min_val) / (max_val - min_val) * 100
    return round(_clamp(normalised, lo=0.0, hi=100.0), 2)


def compute_weighted_score(scores: dict[str, float], weights: dict[str, float]) -> float:
    """
    Compute a weighted average of multiple engine scores.

    Only engines that appear in both dicts are included.
    Weights are re-normalised so they always sum to 1.0.

    Args:
        scores:  { engine_name: score_0_to_100, ... }
        weights: { engine_name: weight_0_to_1,  ... }

    Returns:
        Weighted average score in [0.0, 100.0].

    Example:
        scores  = {"deepfake": 87.4, "impersonation": 79.5}
        weights = {"deepfake": 0.55, "impersonation": 0.45}
        → 83.95
    """
    total_weight = 0.0
    weighted_sum = 0.0

    for engine, score in scores.items():
        w = weights.get(engine, 0.0)
        if w > 0:
            weighted_sum += score * w
            total_weight += w

    if total_weight == 0:
        return 0.0

    return round(weighted_sum / total_weight, 2)


def alert_type_for_prediction(prediction: str) -> str:
    """
    Map an ML prediction label to the correct alert_type enum value.

    Args:
        prediction: e.g. 'DEEPFAKE', 'IMPERSONATION', 'SUSPICIOUS'

    Returns:
        One of the valid alert_type values from the DB schema.
    """
    mapping = {
        "DEEPFAKE":      "DEEPFAKE_DETECTED",
        "IMPERSONATION": "IMPERSONATION_DETECTED",
        "SUSPICIOUS":    "SUSPICIOUS_ACTIVITY",
        "SAFE":          "HIGH_RISK_CONTENT",   # shouldn't happen; fallback
    }
    return mapping.get(prediction.upper(), "HIGH_RISK_CONTENT")


def alert_severity_for_score(score: float) -> str:
    """
    Map a risk score to the alert severity string used in the DB.

    Returns:
        'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    """
    return get_risk_level(score)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    """Clamp value to [lo, hi]."""
    return max(lo, min(hi, float(value)))
