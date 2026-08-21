"""
routes/cases.py
AI Investor Fraud & Impersonation Detection Platform

Endpoints for fraud_cases — investigation-level tracking on top of detection_cases.

    GET   /api/cases                — List all fraud cases
    GET   /api/cases/{case_id}      — Get a single fraud case with full detail
    POST  /api/cases                — Create a new fraud case
    PATCH /api/cases/{case_id}      — Update case (status / priority / notes / assigned_to)
"""

from __future__ import annotations

import datetime
import re
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from database.db import get_client

router = APIRouter(prefix="/api/cases", tags=["Cases"])


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class CreateCaseRequest(BaseModel):
    detection_case_id: str = Field(
        ...,
        description="UUID of the detection_case this investigation case is for.",
    )
    priority: str = Field(
        "medium",
        description="low | medium | high | critical",
    )
    assigned_to: Optional[str] = Field(
        None,
        description="UUID of the investigator/analyst user.",
    )
    investigation_notes: Optional[str] = Field(
        None,
        description="Initial notes for the investigator.",
    )


class UpdateCaseRequest(BaseModel):
    status: Optional[str] = Field(
        None,
        description="open | investigating | escalated | resolved | closed",
    )
    priority: Optional[str] = Field(
        None,
        description="low | medium | high | critical",
    )
    assigned_to: Optional[str] = Field(
        None,
        description="UUID of the investigator to assign (or reassign).",
    )
    investigation_notes: Optional[str] = Field(
        None,
        description="Additional investigation notes (appended to existing).",
    )


# ---------------------------------------------------------------------------
# GET /api/cases
# ---------------------------------------------------------------------------

@router.get("", summary="List all fraud cases with optional filters")
def list_cases(
    status: Optional[str]    = None,
    priority: Optional[str]  = None,
    assigned_to: Optional[str] = None,
    limit: int               = 50,
) -> dict[str, Any]:
    """
    Return fraud cases joined with detection_case summary and assigned investigator.
    Most recently opened cases first.
    """
    try:
        client = get_client()
        q = (
            client.table("fraud_cases")
            .select(
                "*, "
                "detection_cases(source_type, prediction, risk_score, risk_level, summary, created_at), "
                "users!fraud_cases_assigned_to_fkey(name, email)"
            )
            .order("opened_at", desc=True)
            .limit(limit)
        )

        if status:
            q = q.eq("status", status)
        if priority:
            q = q.eq("priority", priority)
        if assigned_to:
            q = q.eq("assigned_to", assigned_to)

        resp = q.execute()
        cases = resp.data or []

        return {
            "success": True,
            "message": f"{len(cases)} case(s) retrieved.",
            "data":    cases,
            "count":   len(cases),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc


# ---------------------------------------------------------------------------
# GET /api/cases/{case_id}
# ---------------------------------------------------------------------------

@router.get("/{case_id}", summary="Get a single fraud case with full detail")
def get_case(case_id: str) -> dict[str, Any]:
    """
    Return a fraud case with:
    - Joined detection_case (source, prediction, risk)
    - Assigned investigator info
    - Audit log entries for this case
    """
    try:
        client = get_client()

        case_resp = (
            client.table("fraud_cases")
            .select(
                "*, "
                "detection_cases(*, evidence(*), alerts(*), impersonation_checks(*)), "
                "users!fraud_cases_assigned_to_fkey(name, email, role)"
            )
            .eq("id", case_id)
            .execute()
        )

        if not case_resp.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "message": f"Fraud case not found: {case_id}",
                    "error":   {},
                },
            )

        # Fetch audit log for this case
        audit_resp = (
            client.table("audit_logs")
            .select("*")
            .eq("resource_type", "fraud_cases")
            .eq("resource_id", case_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "message": "Fraud case retrieved.",
            "data": {
                "case":      case_resp.data[0],
                "audit_log": audit_resp.data or [],
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc


# ---------------------------------------------------------------------------
# POST /api/cases
# ---------------------------------------------------------------------------

@router.post("", status_code=status.HTTP_201_CREATED, summary="Create a new fraud case")
def create_case(req: CreateCaseRequest) -> dict[str, Any]:
    """
    Open a new investigation case for a detection_case.

    Generates a human-readable case_number (CASE-YYYY-NNNN),
    inserts the fraud_case row, and writes an audit log entry.
    """
    try:
        client = get_client()

        # Generate case number: CASE-2026-0001
        year = datetime.datetime.now().year
        # Count existing cases this year to get the next sequence number
        count_resp = (
            client.table("fraud_cases")
            .select("id", count="exact")
            .like("case_number", f"CASE-{year}-%")
            .execute()
        )
        seq = (count_resp.count or 0) + 1
        case_number = f"CASE-{year}-{seq:04d}"

        # Build insert payload
        payload: dict[str, Any] = {
            "detection_case_id":  req.detection_case_id,
            "case_number":        case_number,
            "priority":           req.priority,
            "status":             "open",
        }
        if req.assigned_to:
            payload["assigned_to"] = req.assigned_to
        if req.investigation_notes:
            payload["investigation_notes"] = req.investigation_notes

        insert_resp = client.table("fraud_cases").insert(payload).execute()

        if not insert_resp.data:
            raise ValueError("Insert returned no data.")

        new_case = insert_resp.data[0]
        case_id  = new_case["id"]

        # Write audit log
        _write_audit(
            client=client,
            action="case_created",
            resource_type="fraud_cases",
            resource_id=case_id,
            new_data=new_case,
        )

        return {
            "success": True,
            "message": f"Fraud case {case_number} created successfully.",
            "data":    new_case,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc


# ---------------------------------------------------------------------------
# PATCH /api/cases/{case_id}
# ---------------------------------------------------------------------------

@router.patch("/{case_id}", summary="Update a fraud case")
def update_case(case_id: str, req: UpdateCaseRequest) -> dict[str, Any]:
    """
    Update status, priority, assigned investigator, or notes.
    Only supplied fields are updated; others remain unchanged.
    Automatically sets closed_at when status is 'closed' or 'resolved'.
    Writes an audit log entry for each change.
    """
    try:
        client = get_client()

        # Fetch current state for audit log
        current_resp = (
            client.table("fraud_cases").select("*").eq("id", case_id).execute()
        )
        if not current_resp.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "message": f"Fraud case not found: {case_id}",
                    "error":   {},
                },
            )
        old_data = current_resp.data[0]

        # Build update payload — only include explicitly provided fields
        payload: dict[str, Any] = {"updated_at": "now()"}

        if req.status is not None:
            payload["status"] = req.status
            if req.status in ("closed", "resolved"):
                payload["closed_at"] = datetime.datetime.utcnow().isoformat()
        if req.priority is not None:
            payload["priority"] = req.priority
        if req.assigned_to is not None:
            payload["assigned_to"] = req.assigned_to
        if req.investigation_notes is not None:
            # Append to existing notes rather than replace
            existing_notes = old_data.get("investigation_notes") or ""
            separator      = "\n\n" if existing_notes else ""
            payload["investigation_notes"] = existing_notes + separator + req.investigation_notes

        update_resp = (
            client.table("fraud_cases")
            .update(payload)
            .eq("id", case_id)
            .execute()
        )

        if not update_resp.data:
            raise ValueError("Update returned no data.")

        new_data = update_resp.data[0]

        # Write audit log
        _write_audit(
            client=client,
            action="case_updated",
            resource_type="fraud_cases",
            resource_id=case_id,
            old_data=old_data,
            new_data=new_data,
        )

        return {
            "success": True,
            "message": f"Fraud case updated: {new_data.get('case_number', case_id)}.",
            "data":    new_data,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _write_audit(
    client: Any,
    action: str,
    resource_type: str,
    resource_id: str,
    new_data: Optional[dict] = None,
    old_data: Optional[dict] = None,
    user_id: Optional[str]   = None,
) -> None:
    """Write a single audit log entry. Failures are silently swallowed
    so they never cause the main operation to fail."""
    try:
        payload: dict[str, Any] = {
            "action":        action,
            "resource_type": resource_type,
            "resource_id":   resource_id,
        }
        if user_id:
            payload["user_id"] = user_id
        if old_data:
            payload["old_data"] = old_data
        if new_data:
            payload["new_data"] = new_data
        client.table("audit_logs").insert(payload).execute()
    except Exception:
        pass  # Audit log failure should never block the main operation
