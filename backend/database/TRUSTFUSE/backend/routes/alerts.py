"""
routes/alerts.py
AI Investor Fraud & Impersonation Detection Platform

Endpoints:
    GET   /api/alerts           — All alerts (paginated)
    GET   /api/alerts/unread    — Unread alerts only
    PATCH /api/alerts/{id}/read — Mark a single alert as read
"""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, status

from database.db import (
    list_unread_alerts,
    mark_alert_read,
    get_client,
)

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


# ---------------------------------------------------------------------------
# GET /api/alerts/unread  — must be registered BEFORE /{alert_id}
# ---------------------------------------------------------------------------

@router.get(
    "/unread",
    summary="Get all unread alerts (newest first)",
)
def get_unread_alerts(limit: int = 20) -> dict[str, Any]:
    """
    Return unread alerts ordered by most recent first.
    Used for the notification badge and alert feed in the dashboard.
    """
    try:
        alerts = list_unread_alerts(limit=limit)
        return {
            "success": True,
            "message": f"{len(alerts)} unread alert(s) found.",
            "data":    alerts,
            "count":   len(alerts),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc


# ---------------------------------------------------------------------------
# GET /api/alerts
# ---------------------------------------------------------------------------

@router.get(
    "",
    summary="Get all alerts with optional filters",
)
def get_alerts(
    severity: Optional[str]   = None,
    is_read: Optional[bool]   = None,
    limit: int                = 50,
) -> dict[str, Any]:
    """
    Retrieve alerts with optional severity and read-status filters.
    Results are ordered: CRITICAL first, then by recency.
    """
    try:
        client = get_client()
        q = (
            client.table("alerts")
            .select("*, detection_cases(source_type, prediction, risk_score, risk_level)")
            .order("created_at", desc=True)
            .limit(limit)
        )

        if severity is not None:
            q = q.eq("severity", severity.upper())
        if is_read is not None:
            q = q.eq("is_read", is_read)

        resp = q.execute()
        alerts = resp.data or []

        return {
            "success": True,
            "message": f"{len(alerts)} alert(s) retrieved.",
            "data":    alerts,
            "count":   len(alerts),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc


# ---------------------------------------------------------------------------
# PATCH /api/alerts/{alert_id}/read
# ---------------------------------------------------------------------------

@router.patch(
    "/{alert_id}/read",
    summary="Mark an alert as read",
)
def read_alert(alert_id: str) -> dict[str, Any]:
    """
    Mark a single alert as read (is_read = TRUE).
    Idempotent — safe to call multiple times.
    """
    try:
        updated = mark_alert_read(alert_id)
        return {
            "success": True,
            "message": "Alert marked as read.",
            "data":    updated,
        }
    except IndexError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": f"Alert not found: {alert_id}",
                "error":   {},
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc
