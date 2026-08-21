"""
services/detection_service.py
AI Investor Fraud & Impersonation Detection Platform

Main detection orchestrator.

This module:
  1. Inspects the incoming content type and content
  2. Routes to the correct analysis function
  3. Returns a standardised result dict

⚠️  MOCK / RULE-BASED IMPLEMENTATION
    The analysis functions below use heuristic rules and pattern matching,
    NOT real ML models. They are clearly labelled so you can drop in real
    model calls later without changing any caller or route code.

    To connect a real model, replace the body of the relevant
    _analyse_*() function while keeping its signature and return shape.

Standard result format returned by all public functions:
    {
        "detection_type":  str,    # what analysis ran
        "risk_score":      float,  # 0–100
        "confidence_score":float,  # 0.0–1.0
        "is_fraud":        bool,
        "severity":        str,    # 'low' | 'medium' | 'high' | 'critical'
        "prediction":      str,    # 'DEEPFAKE' | 'IMPERSONATION' | 'SUSPICIOUS' | ...
        "analysis_result": dict,   # engine-specific detail (JSONB in DB)
        "model_name":      str,
        "model_version":   str,
    }
"""

from __future__ import annotations

import re
import urllib.parse
from typing import Any

from services.risk_service import get_severity, normalize_score

# ---------------------------------------------------------------------------
# Detection type constants
# ---------------------------------------------------------------------------

DETECTION_URL         = "url_analysis"
DETECTION_DEEPFAKE    = "deepfake_detection"
DETECTION_TEXT        = "text_analysis"
DETECTION_IMPERSONATION = "impersonation_detection"
DETECTION_APP         = "app_analysis"
DETECTION_IMAGE       = "image_analysis"
DETECTION_AUDIO       = "audio_analysis"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_detection(
    source_type: str,
    content: str,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Run the appropriate detection analysis based on source type.

    Args:
        source_type: 'url' | 'text' | 'chat' | 'video' | 'audio' | 'app'
        content:     The raw content to analyse (URL string, message text,
                     Storage path, etc.)
        metadata:    Optional extra context (e.g. claimed_name, filename).

    Returns:
        Standard result dict (see module docstring).
    """
    metadata = metadata or {}

    router = {
        "url":   _analyse_url,
        "text":  _analyse_text,
        "chat":  _analyse_text,       # same engine for chat text
        "video": _analyse_video,
        "audio": _analyse_audio,
        "app":   _analyse_app,
    }

    handler = router.get(source_type.lower(), _analyse_generic)
    return handler(content, metadata)


# ---------------------------------------------------------------------------
# URL Analysis  ── MOCK (replace with VirusTotal / SEBI TRIP API)
# ---------------------------------------------------------------------------

# High-risk keywords that appear in known scam domains
_SCAM_KEYWORDS = [
    "invest", "profit", "return", "sebi", "nse", "bse", "trading",
    "earn", "guaranteed", "vip", "premium", "signal", "tips", "fund",
]

_SUSPICIOUS_TLDS = {".xyz", ".top", ".click", ".loan", ".win", ".site", ".info"}


def _analyse_url(url: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """
    ⚠️  MOCK — heuristic URL risk scoring.
    Replace with a real threat-intel API call (e.g. VirusTotal, Safe Browsing).
    """
    score = 0.0
    flags: dict[str, Any] = {}

    try:
        parsed = urllib.parse.urlparse(url if url.startswith("http") else f"http://{url}")
        domain = parsed.netloc or url
        tld    = "." + domain.split(".")[-1] if "." in domain else ""

        # No HTTPS → +15
        if not url.startswith("https"):
            score += 15
            flags["no_https"] = True

        # Suspicious TLD → +25
        if tld in _SUSPICIOUS_TLDS:
            score += 25
            flags["suspicious_tld"] = tld

        # High-risk keywords in domain → +5 each (max +30)
        kw_hits = [kw for kw in _SCAM_KEYWORDS if kw in domain.lower()]
        kw_score = min(len(kw_hits) * 5, 30)
        score += kw_score
        if kw_hits:
            flags["scam_keywords_in_domain"] = kw_hits

        # Very long domain → +10
        if len(domain) > 30:
            score += 10
            flags["long_domain"] = True

        # Numeric-heavy domain → +10
        digit_ratio = sum(c.isdigit() for c in domain) / max(len(domain), 1)
        if digit_ratio > 0.3:
            score += 10
            flags["numeric_heavy_domain"] = True

        # IP address instead of domain → +20
        if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
            score += 20
            flags["ip_address_url"] = True

        flags["domain"]  = domain
        flags["tld"]     = tld
        flags["is_https"] = url.startswith("https")

    except Exception as exc:
        flags["parse_error"] = str(exc)
        score = 40  # default medium risk when URL can't be parsed

    score = min(score, 100)
    severity = get_severity(score)
    is_fraud = score >= 60

    return _build_result(
        detection_type  = DETECTION_URL,
        risk_score      = score,
        confidence_score= _score_to_confidence(score),
        is_fraud        = is_fraud,
        severity        = severity,
        prediction      = "SUSPICIOUS" if is_fraud else "SAFE",
        analysis_result = flags,
        model_name      = "URLHeuristics-v1",
        model_version   = "1.0.0-mock",
    )


# ---------------------------------------------------------------------------
# Text / Chat Analysis  ── MOCK (replace with FinancialScamBERT or similar)
# ---------------------------------------------------------------------------

_SCAM_PHRASES = [
    "guaranteed return", "guaranteed profit", "no risk", "100% safe",
    "limited slots", "limited offer", "exclusive offer", "double your money",
    "invest now", "act fast", "urgent", "time sensitive", "sebi registered",
    "rbi approved", "certified advisor", "insider tip", "sure shot",
    "whatsapp me", "telegram channel", "send upi", "pay now",
    "wire transfer", "bitcoin", "crypto profit", "nfo alert",
    "free tips", "jackpot", "get rich", "passive income",
]


def _analyse_text(text: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """
    ⚠️  MOCK — keyword and pattern-based scam text detection.
    Replace with a transformer-based NLP model for production.
    """
    text_lower = text.lower()
    matched_phrases: list[str] = []
    score = 0.0

    for phrase in _SCAM_PHRASES:
        if phrase in text_lower:
            matched_phrases.append(phrase)
            score += 8  # +8 per matched phrase

    # Cap at 95 (leave room for real model score)
    score = min(score, 95)

    # Urgency signals → extra +10
    urgency_patterns = [r"\b(now|today|hurry|last chance|don.t wait)\b"]
    for pattern in urgency_patterns:
        if re.search(pattern, text_lower):
            score = min(score + 10, 100)
            break

    # Claimed identity → check impersonation
    claimed_name = metadata.get("claimed_name")
    impersonation_hint: dict[str, Any] = {}
    if claimed_name:
        # Lightweight local check — full check done in impersonation_service
        impersonation_hint["claimed_name"] = claimed_name

    severity = get_severity(score)
    is_fraud = score >= 40  # lower threshold for text — more false negatives are costly

    return _build_result(
        detection_type  = DETECTION_TEXT,
        risk_score      = score,
        confidence_score= _score_to_confidence(score),
        is_fraud        = is_fraud,
        severity        = severity,
        prediction      = "SUSPICIOUS" if is_fraud else "SAFE",
        analysis_result = {
            "matched_phrases":    matched_phrases,
            "match_count":        len(matched_phrases),
            "urgency_detected":   score >= 70,
            "impersonation_hint": impersonation_hint,
        },
        model_name    = "KeywordScamDetector-v1",
        model_version = "1.0.0-mock",
    )


# ---------------------------------------------------------------------------
# Video / Deepfake Analysis  ── MOCK (replace with EfficientNet / TimeSformer)
# ---------------------------------------------------------------------------

def _analyse_video(content: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """
    ⚠️  MOCK — returns a simulated deepfake score based on filename hints.
    Replace with a real deepfake detection model (e.g. EfficientNet-B4).

    `content` is the Supabase Storage path to the video file.
    """
    filename = metadata.get("filename", content).lower()

    # Simulate different scores based on filename keywords (demo purposes only)
    if any(kw in filename for kw in ["fake", "deep", "synthetic", "clone"]):
        risk_score = 88.0
        prediction = "DEEPFAKE"
        confidence = 0.88
    elif any(kw in filename for kw in ["official", "real", "authentic", "sebi"]):
        risk_score = 8.0
        prediction = "AUTHENTIC"
        confidence = 0.97
    else:
        risk_score = 45.0
        prediction = "SUSPICIOUS"
        confidence = 0.60

    is_fraud = risk_score >= 60
    severity = get_severity(risk_score)

    return _build_result(
        detection_type  = DETECTION_DEEPFAKE,
        risk_score      = risk_score,
        confidence_score= confidence,
        is_fraud        = is_fraud,
        severity        = severity,
        prediction      = prediction,
        analysis_result = {
            "storage_path":         content,
            "mock_warning":         "Real model not connected. This is a simulated result.",
            "simulated_based_on":   "filename_keywords",
        },
        model_name    = "DeepfakeDetector-MOCK",
        model_version = "0.0.1-mock",
    )


# ---------------------------------------------------------------------------
# Audio Analysis  ── MOCK (replace with Wav2Vec2 / RawNet3)
# ---------------------------------------------------------------------------

def _analyse_audio(content: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """
    ⚠️  MOCK — simulated audio deepfake detection.
    Replace with a real voice-synthesis detection model.
    """
    filename = metadata.get("filename", content).lower()

    if any(kw in filename for kw in ["fake", "synthetic", "clone", "vish"]):
        risk_score = 82.0
        prediction = "DEEPFAKE"
        confidence = 0.84
    else:
        risk_score = 30.0
        prediction = "SUSPICIOUS"
        confidence = 0.55

    is_fraud = risk_score >= 60
    severity = get_severity(risk_score)

    return _build_result(
        detection_type  = DETECTION_AUDIO,
        risk_score      = risk_score,
        confidence_score= confidence,
        is_fraud        = is_fraud,
        severity        = severity,
        prediction      = prediction,
        analysis_result = {
            "storage_path": content,
            "mock_warning": "Real model not connected. This is a simulated result.",
        },
        model_name    = "AudioDeepfakeDetector-MOCK",
        model_version = "0.0.1-mock",
    )


# ---------------------------------------------------------------------------
# App / APK Analysis  ── MOCK
# ---------------------------------------------------------------------------

_SUSPICIOUS_APP_KEYWORDS = [
    "invest", "trade", "profit", "earn", "binary", "forex",
    "option", "crypto", "nfo", "fund",
]


def _analyse_app(content: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """
    ⚠️  MOCK — heuristic app/APK name analysis.
    Replace with static analysis (MobSF) or store listing checks.
    """
    app_name = metadata.get("app_name", content).lower()
    hits = [kw for kw in _SUSPICIOUS_APP_KEYWORDS if kw in app_name]
    score = min(len(hits) * 15, 80)

    # Unofficial domain / no Play Store listing → +20
    if content.startswith("http") and "play.google.com" not in content:
        score = min(score + 20, 100)

    severity = get_severity(score)
    is_fraud = score >= 50

    return _build_result(
        detection_type  = DETECTION_APP,
        risk_score      = score,
        confidence_score= _score_to_confidence(score),
        is_fraud        = is_fraud,
        severity        = severity,
        prediction      = "SUSPICIOUS" if is_fraud else "SAFE",
        analysis_result = {
            "app_name_keywords": hits,
            "sideload_risk":     not content.startswith("https://play.google.com"),
            "mock_warning":      "Real APK analysis not connected.",
        },
        model_name    = "AppHeuristics-v1",
        model_version = "1.0.0-mock",
    )


# ---------------------------------------------------------------------------
# Generic fallback
# ---------------------------------------------------------------------------

def _analyse_generic(content: str, metadata: dict[str, Any]) -> dict[str, Any]:
    """Fallback for unknown source types."""
    return _build_result(
        detection_type  = DETECTION_TEXT,
        risk_score      = 30.0,
        confidence_score= 0.30,
        is_fraud        = False,
        severity        = "medium",
        prediction      = "SUSPICIOUS",
        analysis_result = {"note": "Unknown source type — default medium-risk assigned."},
        model_name      = "Fallback-v1",
        model_version   = "1.0.0-mock",
    )


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _build_result(
    detection_type:   str,
    risk_score:       float,
    confidence_score: float,
    is_fraud:         bool,
    severity:         str,
    prediction:       str,
    analysis_result:  dict[str, Any],
    model_name:       str,
    model_version:    str,
) -> dict[str, Any]:
    return {
        "detection_type":   detection_type,
        "risk_score":       round(risk_score, 2),
        "confidence_score": round(confidence_score, 4),
        "is_fraud":         is_fraud,
        "severity":         severity,
        "prediction":       prediction,
        "analysis_result":  analysis_result,
        "model_name":       model_name,
        "model_version":    model_version,
    }


def _score_to_confidence(score: float) -> float:
    """Convert a 0-100 risk score to a 0.0-1.0 confidence value."""
    return round(score / 100.0, 4)
