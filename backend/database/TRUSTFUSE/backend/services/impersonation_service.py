"""
services/impersonation_service.py
AI Investor Fraud & Impersonation Detection Platform

Compares suspected impersonation names against the legitimate_entities table
using string-similarity techniques.

Current implementation: difflib.SequenceMatcher (no external ML dependency).
Architecture is modular — swap in an NLP model or embedding-based approach
by replacing _compute_similarity() without changing any caller.
"""

from __future__ import annotations

import difflib
import re
from typing import Any, Optional

from database.supabase_client import get_supabase

# ---------------------------------------------------------------------------
# Thresholds (tune without touching business logic)
# ---------------------------------------------------------------------------

SUSPICION_HIGH_THRESHOLD   = 0.75   # similarity >= 0.75 → high suspicion
SUSPICION_MEDIUM_THRESHOLD = 0.50   # similarity >= 0.50 → medium suspicion


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def check_impersonation(
    claimed_name: str,
    claimed_org: Optional[str] = None,
) -> dict[str, Any]:
    """
    Compare a claimed name / organisation against all verified legitimate entities.

    Args:
        claimed_name: Name the suspect claimed to represent,
                      e.g. "Rakesh Sharma from Motilal Oswal".
        claimed_org:  Optional explicit organisation name to compare.

    Returns:
        {
            "matched_entity":   dict | None,   # best matching entity row
            "similarity_score": float,          # 0.0 – 1.0
            "suspicion_score":  float,          # 0.0 – 1.0
            "is_suspicious":    bool,
            "recommendation":   str,
        }
    """
    entities = _fetch_entities()

    if not entities:
        return _no_match_result("No legitimate entities in database to compare against.")

    # Build a combined query string from the inputs
    query = _normalise(f"{claimed_name} {claimed_org or ''}")

    best_match: Optional[dict[str, Any]] = None
    best_similarity: float = 0.0

    for entity in entities:
        # Compare against entity_name and any alias strings we can construct
        candidate_strings = _build_candidate_strings(entity)
        for candidate in candidate_strings:
            sim = _compute_similarity(query, _normalise(candidate))
            if sim > best_similarity:
                best_similarity = sim
                best_match = entity

    suspicion_score = _similarity_to_suspicion(best_similarity)
    is_suspicious   = best_similarity >= SUSPICION_MEDIUM_THRESHOLD
    recommendation  = _build_recommendation(best_match, best_similarity, is_suspicious)

    return {
        "matched_entity":   best_match,
        "similarity_score": round(best_similarity, 4),
        "suspicion_score":  round(suspicion_score, 4),
        "is_suspicious":    is_suspicious,
        "recommendation":   recommendation,
    }


def batch_check(names: list[str]) -> list[dict[str, Any]]:
    """
    Run impersonation checks for multiple names.
    Fetches the entity list once and reuses it.

    Args:
        names: List of claimed name strings.

    Returns:
        List of result dicts in the same order as input names.
    """
    entities = _fetch_entities()
    return [_single_check_with_entities(name, entities) for name in names]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _fetch_entities() -> list[dict[str, Any]]:
    """Fetch all verified legitimate entities from the DB."""
    try:
        resp = (
            get_supabase()()
            .table("legitimate_entities")
            .select("*")
            .eq("verified", True)
            .execute()
        )
        return resp.data or []
    except Exception:
        # If DB is unavailable, return empty list — callers handle the empty case.
        return []


def _single_check_with_entities(
    claimed_name: str,
    entities: list[dict[str, Any]],
) -> dict[str, Any]:
    """Same as check_impersonation() but uses a pre-fetched entity list."""
    if not entities:
        return _no_match_result("No legitimate entities in database.")

    query = _normalise(claimed_name)
    best_match: Optional[dict[str, Any]] = None
    best_similarity: float = 0.0

    for entity in entities:
        for candidate in _build_candidate_strings(entity):
            sim = _compute_similarity(query, _normalise(candidate))
            if sim > best_similarity:
                best_similarity = sim
                best_match = entity

    suspicion_score = _similarity_to_suspicion(best_similarity)
    is_suspicious   = best_similarity >= SUSPICION_MEDIUM_THRESHOLD
    recommendation  = _build_recommendation(best_match, best_similarity, is_suspicious)

    return {
        "matched_entity":   best_match,
        "similarity_score": round(best_similarity, 4),
        "suspicion_score":  round(suspicion_score, 4),
        "is_suspicious":    is_suspicious,
        "recommendation":   recommendation,
    }


def _build_candidate_strings(entity: dict[str, Any]) -> list[str]:
    """Build a list of strings to compare against from a single entity row."""
    candidates = [entity.get("entity_name", "")]
    # Also compare against website domain (stripped of protocol)
    website = entity.get("official_website", "")
    if website:
        domain = re.sub(r"https?://", "", website).split("/")[0]
        candidates.append(domain)
    return [c for c in candidates if c]


def _compute_similarity(a: str, b: str) -> float:
    """
    Compute normalised string similarity between two strings.

    Currently uses difflib.SequenceMatcher (ratio 0.0 – 1.0).
    Replace this function with an embedding-based approach for higher accuracy.
    """
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()


def _normalise(text: str) -> str:
    """Lower-case, remove punctuation, collapse whitespace."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _similarity_to_suspicion(similarity: float) -> float:
    """
    Convert a raw similarity score to a suspicion score.

    High similarity to a legitimate entity name = high suspicion of impersonation.
    Perfect match (1.0) → suspicion 1.0; zero match (0.0) → suspicion 0.0.
    """
    return similarity  # linear mapping for now; apply a curve if needed


def _build_recommendation(
    matched_entity: Optional[dict[str, Any]],
    similarity: float,
    is_suspicious: bool,
) -> str:
    if not is_suspicious or matched_entity is None:
        return (
            "No strong match with known legitimate entities. "
            "Proceed with standard verification."
        )

    name = matched_entity.get("entity_name", "a known financial entity")
    website = matched_entity.get("official_website", "their official website")
    pct = round(similarity * 100, 1)

    if similarity >= SUSPICION_HIGH_THRESHOLD:
        return (
            f"HIGH suspicion: claimed name is {pct}% similar to '{name}'. "
            f"This is a likely impersonation attempt. "
            f"Verify the entity at {website} before taking any action."
        )
    return (
        f"MEDIUM suspicion: claimed name is {pct}% similar to '{name}'. "
        f"Independent verification recommended at {website}."
    )


def _no_match_result(reason: str) -> dict[str, Any]:
    return {
        "matched_entity":   None,
        "similarity_score": 0.0,
        "suspicion_score":  0.0,
        "is_suspicious":    False,
        "recommendation":   reason,
    }
