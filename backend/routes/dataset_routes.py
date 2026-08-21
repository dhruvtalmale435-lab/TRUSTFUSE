"""
dataset_routes.py — TRUSTFUSE Backend
=======================================
FastAPI router for all dataset-related API endpoints.

Prefix: /api/dataset

Endpoints:
  GET  /api/dataset/records                — all dataset records (with optional filters)
  GET  /api/dataset/records/{filename}     — single record by filename
  GET  /api/dataset/stats                  — aggregate statistics
  POST /api/dataset/sync                   — sync local dataset → Supabase
  GET  /api/dataset/validate               — run dataset validator
  GET  /api/dataset/db/records             — records from Supabase DB (post-sync)

All responses follow the standard ApiResponse shape:
  Success: {"success": true,  "data": <payload>}
  Error:   {"success": false, "error": "Human-readable message"}

Security rules:
  - Supabase keys NEVER appear in any response.
  - Internal file paths are included only in dataset records (not secrets).
  - /sync is admin-only by intent — protect with auth in production.
"""

from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import JSONResponse

import services.dataset_service as svc
from models.schemas import (
    ApiResponse,
    DatasetRecord,
    DatasetStats,
    SyncResult,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/api/dataset",
    tags=["Dataset"],
)


# ---------------------------------------------------------------------------
# Helper: build JSON responses
# ---------------------------------------------------------------------------

def _ok(data) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"success": True, "data": data},
    )


def _created(data) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"success": True, "data": data},
    )


def _error(message: str, http_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR) -> JSONResponse:
    return JSONResponse(
        status_code=http_status,
        content={"success": False, "error": message},
    )


def _serialise_record(record: DatasetRecord) -> dict:
    """Convert a DatasetRecord to a JSON-safe dict."""
    return record.model_dump(mode="json")


# ---------------------------------------------------------------------------
# GET /api/dataset/records
# ---------------------------------------------------------------------------

@router.get(
    "/records",
    summary="Get dataset records",
    description=(
        "Returns dataset records loaded from the local dataset module. "
        "Optionally filter by ground-truth label and limit the result count."
    ),
    response_description="List of dataset metadata records",
)
def get_records(
    label: Optional[str] = Query(
        default=None,
        description="Filter by label: REAL or DEEPFAKE",
        pattern="^(REAL|DEEPFAKE|real|deepfake)$",
    ),
    limit: Optional[int] = Query(
        default=None,
        ge=1,
        le=10_000,
        description="Maximum number of records to return",
    ),
    source: Optional[str] = Query(
        default=None,
        description="Dataset source: DFDC | FF | ALL",
        pattern="^(DFDC|FF|ALL|dfdc|ff|all)$",
    ),
) -> JSONResponse:
    try:
        records = svc.get_all_records(
            label=label,
            limit=limit,
            source=source,
        )
        return _ok([_serialise_record(r) for r in records])

    except ValueError as exc:
        return _error(str(exc), status.HTTP_400_BAD_REQUEST)
    except RuntimeError as exc:
        logger.error("get_records failed: %s", exc)
        return _error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.error("Unexpected error in get_records: %s", exc, exc_info=True)
        return _error("An unexpected error occurred.", status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# GET /api/dataset/records/{filename}
# ---------------------------------------------------------------------------

@router.get(
    "/records/{filename:path}",
    summary="Get a dataset record by filename",
    description=(
        "Returns a single dataset metadata record matching the provided filename. "
        "Searches the local dataset module first, then falls back to Supabase."
    ),
    response_description="A single dataset metadata record",
)
def get_record_by_filename(filename: str) -> JSONResponse:
    if not filename or not filename.strip():
        return _error("Filename is required.", status.HTTP_400_BAD_REQUEST)

    try:
        record = svc.get_record_by_filename(filename.strip())

        if record is None:
            return _error(
                f"Dataset record not found: '{filename}'",
                status.HTTP_404_NOT_FOUND,
            )

        return _ok(_serialise_record(record))

    except RuntimeError as exc:
        logger.error("get_record_by_filename failed: %s", exc)
        return _error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.error("Unexpected error in get_record_by_filename: %s", exc, exc_info=True)
        return _error("An unexpected error occurred.", status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# GET /api/dataset/stats
# ---------------------------------------------------------------------------

@router.get(
    "/stats",
    summary="Get dataset statistics",
    description=(
        "Returns aggregate statistics across all dataset records: total count, "
        "real/deepfake split, available vs missing files, and per-source counts."
    ),
    response_description="Dataset statistics object",
)
def get_stats(
    source: Optional[str] = Query(
        default=None,
        description="Dataset source: DFDC | FF | ALL",
        pattern="^(DFDC|FF|ALL|dfdc|ff|all)$",
    ),
) -> JSONResponse:
    try:
        stats = svc.get_stats(source=source)
        return _ok(stats.model_dump(mode="json"))

    except ValueError as exc:
        return _error(str(exc), status.HTTP_400_BAD_REQUEST)
    except RuntimeError as exc:
        logger.error("get_stats failed: %s", exc)
        return _error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.error("Unexpected error in get_stats: %s", exc, exc_info=True)
        return _error("An unexpected error occurred.", status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# POST /api/dataset/sync
# ---------------------------------------------------------------------------

@router.post(
    "/sync",
    summary="Sync local dataset metadata to Supabase",
    description=(
        "Reads all records from the local dataset module and upserts them into "
        "the Supabase dataset_records table. "
        "Existing records (matched by filename) are updated; new ones are inserted. "
        "Returns a synchronisation summary. "
        "**Admin use only** — protect this endpoint with authentication in production."
    ),
    response_description="Synchronisation result summary",
    status_code=status.HTTP_200_OK,
)
def sync_dataset(
    source: Optional[str] = Query(
        default=None,
        description="Dataset source to sync: DFDC | FF | ALL",
        pattern="^(DFDC|FF|ALL|dfdc|ff|all)$",
    ),
) -> JSONResponse:
    try:
        result = svc.sync_to_supabase(source=source)

        # Return 200 even if some records failed — the summary tells the full story.
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"success": True, "data": result.model_dump(mode="json")},
        )

    except ValueError as exc:
        return _error(str(exc), status.HTTP_400_BAD_REQUEST)
    except RuntimeError as exc:
        # RuntimeError covers: dataset unavailable, Supabase not configured, etc.
        logger.error("sync_dataset failed: %s", exc)
        return _error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.error("Unexpected error in sync_dataset: %s", exc, exc_info=True)
        return _error("An unexpected error occurred.", status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# GET /api/dataset/validate
# ---------------------------------------------------------------------------

@router.get(
    "/validate",
    summary="Validate local dataset structure",
    description=(
        "Runs the dataset module validator and returns the combined validation report. "
        "Checks that required directories and metadata files exist. "
        "Does NOT check Supabase."
    ),
    response_description="Validation report from the dataset module",
)
def validate_dataset(
    source: Optional[str] = Query(
        default=None,
        description="Dataset source: DFDC | FF | ALL",
        pattern="^(DFDC|FF|ALL|dfdc|ff|all)$",
    ),
) -> JSONResponse:
    try:
        report = svc.validate_dataset(source=source)
        return _ok(report)

    except ValueError as exc:
        return _error(str(exc), status.HTTP_400_BAD_REQUEST)
    except RuntimeError as exc:
        logger.error("validate_dataset failed: %s", exc)
        return _error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.error("Unexpected error in validate_dataset: %s", exc, exc_info=True)
        return _error("An unexpected error occurred.", status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# GET /api/dataset/db/records  (Supabase DB view)
# ---------------------------------------------------------------------------

@router.get(
    "/db/records",
    summary="Get synced records from Supabase",
    description=(
        "Returns dataset records stored in the Supabase database (post-sync). "
        "Unlike /records, this queries the DB rather than the local dataset module. "
        "Requires Supabase to be configured."
    ),
    response_description="List of synced records from Supabase",
)
def get_db_records(
    label: Optional[str] = Query(
        default=None,
        description="Filter by label: REAL or DEEPFAKE",
        pattern="^(REAL|DEEPFAKE|real|deepfake)$",
    ),
    limit: Optional[int] = Query(
        default=50,
        ge=1,
        le=10_000,
        description="Maximum number of records to return",
    ),
) -> JSONResponse:
    try:
        records = svc.get_db_records(label=label, limit=limit)
        return _ok([_serialise_record(r) for r in records])

    except ValueError as exc:
        return _error(str(exc), status.HTTP_400_BAD_REQUEST)
    except RuntimeError as exc:
        logger.error("get_db_records failed: %s", exc)
        return _error(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as exc:
        logger.error("Unexpected error in get_db_records: %s", exc, exc_info=True)
        return _error("An unexpected error occurred.", status.HTTP_500_INTERNAL_SERVER_ERROR)
