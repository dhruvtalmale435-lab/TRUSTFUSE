"""
routes/detect.py
AI Investor Fraud & Impersonation Detection Platform

Endpoints:
    POST /api/detect          — Submit content for fraud analysis
    GET  /api/detect/{id}     — Retrieve a detection case with full detail
"""

from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from database.db import (
    create_detection_case,
    update_detection_case,
    add_evidence,
    create_alert,
    save_impersonation_check,
    get_detection_case_full,
    list_detection_cases,
)
from services.detection_service import run_detection
from services.risk_service import (
    requires_alert,
    alert_type_for_prediction,
    alert_severity_for_score,
    get_risk_level,
)
from services.impersonation_service import check_impersonation

router = APIRouter(prefix="/api/detect", tags=["Detection"])


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class DetectRequest(BaseModel):
    """Payload for POST /api/detect"""

    source_type: str = Field(
        ...,
        description="Type of content: url | text | chat | video | audio | app",
        examples=["url"],
    )
    content: str = Field(
        ...,
        description=(
            "The content to analyse. "
            "For url/text/chat: the raw string. "
            "For video/audio: the Supabase Storage path after upload."
        ),
        examples=["https://sebi-invest-portal.xyz/register"],
    )
    user_id: Optional[str] = Field(
        None,
        description="UUID of the submitting user (optional for anonymous reports).",
    )
    filename: Optional[str] = Field(
        None,
        description="Original filename (for binary evidence).",
    )
    # Extra metadata passed through to the detection engine
    claimed_name: Optional[str] = Field(
        None,
        description="Name the suspect claimed to represent (for text/chat).",
    )
    claimed_org: Optional[str] = Field(
        None,
        description="Organisation the suspect claimed (for text/chat).",
    )


class DetectResponse(BaseModel):
    success: bool
    message: str
    data: dict[str, Any]


# ---------------------------------------------------------------------------
# POST /api/detect
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=DetectResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit content for fraud analysis",
)
def submit_detection(req: DetectRequest) -> DetectResponse:
    """
    Full detection pipeline:

    1. Create a detection_case row (status = 'pending')
    2. Store evidence metadata
    3. Run the appropriate detection engine (mock or real)
    4. Write ML results back to detection_case
    5. Auto-generate alert if risk score is high enough
    6. Run impersonation check for text/chat submissions
    7. Return a frontend-ready JSON response
    """
    try:
        # ── Step 1: Create the case ──────────────────────────────────────
        case = create_detection_case(
            source_type=req.source_type,
            user_id=req.user_id,
        )
        case_id: str = case["id"]

        # ── Step 2: Store evidence ───────────────────────────────────────
        evidence_type_map = {
            "video": "video_file",
            "audio": "audio_file",
            "url":   "url",
            "text":  "text_document",
            "chat":  "chat_message",
            "app":   "app_url",
        }
        ev_type = evidence_type_map.get(req.source_type.lower(), "text_document")
        add_evidence(
            evidence_type=ev_type,
            file_path_or_content=req.content,
            detection_case_id=case_id,
            filename=req.filename,
        )

        # ── Step 3: Run detection ────────────────────────────────────────
        metadata: dict[str, Any] = {}
        if req.filename:
            metadata["filename"] = req.filename
        if req.claimed_name:
            metadata["claimed_name"] = req.claimed_name
        if req.claimed_org:
            metadata["claimed_org"] = req.claimed_org

        detection = run_detection(
            source_type=req.source_type,
            content=req.content,
            metadata=metadata,
        )

        risk_score       = detection["risk_score"]
        confidence_score = detection["confidence_score"]
        prediction       = detection["prediction"]
        risk_level       = get_risk_level(risk_score)
        summary          = _build_summary(prediction, risk_score, req.source_type)
        status_val       = "flagged" if risk_score >= 60 else "processed"

        # ── Step 4: Write ML results ─────────────────────────────────────
        update_detection_case(
            case_id=case_id,
            prediction=prediction,
            confidence_score=confidence_score,
            risk_score=risk_score,
            risk_level=risk_level,
            status=status_val,
            summary=summary,
        )

        # ── Step 5: Alert if high risk ───────────────────────────────────
        alert_generated = False
        alert_id: Optional[str] = None
        if requires_alert(risk_score):
            alert = create_alert(
                detection_case_id=case_id,
                alert_type=alert_type_for_prediction(prediction),
                severity=alert_severity_for_score(risk_score),
                message=summary,
            )
            alert_id        = alert["id"]
            alert_generated = True

        # ── Step 6: Impersonation check for text/chat ────────────────────
        impersonation_result: Optional[dict[str, Any]] = None
        if req.source_type.lower() in ("text", "chat") and req.claimed_name:
            imp = check_impersonation(
                claimed_name=req.claimed_name,
                claimed_org=req.claimed_org,
            )
            impersonation_result = imp

            # Persist impersonation check in DB
            if imp["is_suspicious"]:
                save_impersonation_check(
                    detection_case_id=case_id,
                    impersonation_score=imp["suspicion_score"],
                    urgency_score=min(risk_score / 100, 1.0),
                    prediction="IMPERSONATION" if imp["similarity_score"] >= 0.75 else "SUSPICIOUS",
                    flags={
                        "matched_entity": imp["matched_entity"].get("entity_name") if imp["matched_entity"] else None,
                        "similarity_score": imp["similarity_score"],
                    },
                    claimed_name=req.claimed_name,
                )

        return DetectResponse(
            success=True,
            message="Fraud analysis completed successfully.",
            data={
                "case_id":             case_id,
                "prediction":          prediction,
                "risk_score":          risk_score,
                "confidence_score":    confidence_score,
                "risk_level":          risk_level,
                "severity":            detection["severity"],
                "is_fraud":            detection["is_fraud"],
                "summary":             summary,
                "alert_generated":     alert_generated,
                "alert_id":            alert_id,
                "detection_type":      detection["detection_type"],
                "model_name":          detection["model_name"],
                "analysis_result":     detection["analysis_result"],
                "impersonation_check": impersonation_result,
            },
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "Detection failed due to an internal error.",
                "error":   str(exc),
            },
        ) from exc


# ---------------------------------------------------------------------------
# GET /api/detect/{report_id}
# ---------------------------------------------------------------------------

@router.get(
    "/{report_id}",
    response_model=DetectResponse,
    summary="Get a detection case with all related data",
)
def get_detection(report_id: str) -> DetectResponse:
    """
    Retrieve a single detection case and all its related records:
    evidence, alerts, impersonation_check.
    """
    try:
        full = get_detection_case_full(report_id)
        return DetectResponse(
            success=True,
            message="Detection case retrieved.",
            data=full,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": f"Detection case not found: {report_id}",
                "error":   {},
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "Failed to retrieve detection case.",
                "error":   str(exc),
            },
        ) from exc


# ---------------------------------------------------------------------------
# GET /api/detect  (list with optional filters)
# ---------------------------------------------------------------------------

@router.get(
    "",
    summary="List detection cases with optional filters",
)
def list_detections(
    status: Optional[str]     = None,
    risk_level: Optional[str] = None,
    prediction: Optional[str] = None,
    user_id: Optional[str]    = None,
    limit: int                = 50,
) -> dict[str, Any]:
    try:
        cases = list_detection_cases(
            status=status,
            risk_level=risk_level,
            prediction=prediction,
            user_id=user_id,
            limit=limit,
        )
        return {
            "success": True,
            "message": f"Retrieved {len(cases)} detection case(s).",
            "data":    cases,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": str(exc), "error": {}},
        ) from exc


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _build_summary(prediction: str, risk_score: float, source_type: str) -> str:
    templates = {
        "DEEPFAKE":      f"AI-generated deepfake content detected in {source_type} submission. Risk score: {risk_score:.1f}/100.",
        "IMPERSONATION": f"Impersonation of a financial entity detected. Risk score: {risk_score:.1f}/100.",
        "SUSPICIOUS":    f"Suspicious {source_type} content identified. Risk score: {risk_score:.1f}/100. Manual review recommended.",
        "SAFE":          f"No significant fraud indicators detected in {source_type} submission. Risk score: {risk_score:.1f}/100.",
        "AUTHENTIC":     f"Content verified as authentic. Risk score: {risk_score:.1f}/100.",
    }
    return templates.get(prediction, f"Analysis complete. Prediction: {prediction}. Risk score: {risk_score:.1f}/100.")
