"""
dataset_service.py — TRUSTFUSE Backend Integration Layer
=========================================================
Bridge between the existing dataset module (c:\\dataset) and
the Supabase PostgreSQL database.

This service is the ONLY layer that:
  1. Imports from the dataset module.
  2. Writes dataset metadata to Supabase.
  3. Is called by route handlers.

Responsibilities:
  - get_all_records()       — load records from local dataset module
  - get_record_by_filename()— find one record (local → DB fallback)
  - get_stats()             — compute aggregate statistics
  - sync_to_supabase()      — upsert all local records to Supabase
  - get_db_records()        — read records from Supabase DB

Dataset module import strategy:
  The dataset module lives at c:\\dataset (an independent project).
  It is not a pip-installed package, so we inject its directory into
  sys.path at import time.  The DATASET_MODULE_PATH env var can
  override the default path for different deployment environments.

Rules:
  - NEVER perform ML inference here.
  - NEVER expose Supabase keys or internal paths in return values.
  - NEVER store video binary data in the database.
"""

from __future__ import annotations

import os
import sys
import logging
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load .env from backend root
# ---------------------------------------------------------------------------
_backend_root = Path(__file__).parent.parent.resolve()
load_dotenv(dotenv_path=_backend_root / ".env", override=False)

# ---------------------------------------------------------------------------
# Inject dataset module path into sys.path
# ---------------------------------------------------------------------------
_DEFAULT_DATASET_MODULE_PATH = str(Path(__file__).parent.parent.parent / "dataset")
DATASET_MODULE_PATH: str = os.environ.get(
    "DATASET_MODULE_PATH", _DEFAULT_DATASET_MODULE_PATH
)

if DATASET_MODULE_PATH not in sys.path:
    sys.path.insert(0, DATASET_MODULE_PATH)

# ---------------------------------------------------------------------------
# Import dataset module components
# These imports will succeed once DATASET_MODULE_PATH is on sys.path.
# ---------------------------------------------------------------------------
try:
    from dataset_loader import DatasetLoader      # noqa: E402
    from dataset_validator import DatasetValidator  # noqa: E402
    _DATASET_MODULE_AVAILABLE = True
except ImportError as _import_err:
    _DATASET_MODULE_AVAILABLE = False
    _DATASET_IMPORT_ERROR = str(_import_err)

# ---------------------------------------------------------------------------
# Import database client
# ---------------------------------------------------------------------------
from database.supabase_client import get_client, is_configured  # noqa: E402
from models.schemas import (  # noqa: E402
    DatasetRecord,
    DatasetRecordLocal,
    DatasetStats,
    SyncResult,
    GroundTruth,
)

# ---------------------------------------------------------------------------
# Logger
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
TABLE_NAME = "dataset_records"
DATASET_SOURCE_ENV: str = os.environ.get("DATASET_SOURCE", "ALL").upper()
VALID_SOURCES = {"DFDC", "FF", "ALL"}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _check_dataset_available() -> None:
    """Raise RuntimeError if dataset module could not be imported."""
    if not _DATASET_MODULE_AVAILABLE:
        raise RuntimeError(
            f"Dataset module is not available at '{DATASET_MODULE_PATH}'. "
            f"Set the DATASET_MODULE_PATH env var or ensure the dataset "
            f"module exists there. Import error: {_DATASET_IMPORT_ERROR}"
        )


def _normalise_source(source: Optional[str]) -> str:
    """Validate and normalise source string."""
    s = (source or DATASET_SOURCE_ENV).upper()
    if s not in VALID_SOURCES:
        raise ValueError(f"Invalid dataset source '{s}'. Choose: DFDC, FF, ALL")
    return s


def _raw_to_schema(raw: dict) -> DatasetRecord:
    """
    Convert a raw record dict from DatasetLoader to a DatasetRecord model.
    Safely coerces ground_truth to the GroundTruth enum.
    """
    gt_raw = str(raw.get("ground_truth", "")).upper()
    try:
        ground_truth = GroundTruth(gt_raw)
    except ValueError:
        # Unexpected label — mark as UNKNOWN by defaulting to REAL to avoid
        # constraint violation; log a warning for transparency.
        logger.warning(
            "Unexpected ground_truth value '%s' for '%s'; defaulting to REAL.",
            gt_raw,
            raw.get("filename"),
        )
        ground_truth = GroundTruth.REAL

    return DatasetRecord(
        filename=raw["filename"],
        dataset_source=raw.get("dataset_source", "UNKNOWN"),
        ground_truth=ground_truth,
        original_filename=raw.get("original_filename"),
        split=raw.get("split"),
        manipulation_method=raw.get("manipulation_method"),
        file_exists=bool(raw.get("file_exists", True)),
    )


def _build_upsert_payload(record: DatasetRecord) -> dict:
    """Build the dict sent to Supabase during upsert — excludes DB-managed fields."""
    return {
        "filename": record.filename,
        "dataset_source": record.dataset_source,
        "ground_truth": record.ground_truth.value,
        "original_filename": record.original_filename,
        "split": record.split,
        "manipulation_method": record.manipulation_method,
        "file_exists": record.file_exists,
    }


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

def get_all_records(
    label: Optional[str] = None,
    limit: Optional[int] = None,
    source: Optional[str] = None,
) -> List[DatasetRecord]:
    """
    Load dataset records from the local dataset module.

    Parameters
    ----------
    label : str, optional
        Filter by ground truth: "REAL" or "DEEPFAKE". None = all.
    limit : int, optional
        Maximum records to return.
    source : str, optional
        Dataset source override: "DFDC", "FF", or "ALL".
        Defaults to the DATASET_SOURCE env var.

    Returns
    -------
    list[DatasetRecord]

    Raises
    ------
    RuntimeError
        If the dataset module is not available.
    ValueError
        If label or source is invalid.
    """
    _check_dataset_available()

    src = _normalise_source(source)

    # Validate label
    filter_label = "ALL"
    if label:
        label_upper = label.upper()
        if label_upper not in ("REAL", "DEEPFAKE", "ALL"):
            raise ValueError(
                f"Invalid label '{label}'. Must be one of: REAL, DEEPFAKE, ALL."
            )
        filter_label = label_upper

    try:
        loader = DatasetLoader(source=src)
        raw_records = loader.load(
            filter_label=filter_label,
            max_records=limit,
            shuffle=False,
        )
    except FileNotFoundError as exc:
        logger.warning("Dataset files missing: %s", exc)
        return []
    except Exception as exc:
        logger.error("Failed to load dataset records: %s", exc, exc_info=True)
        raise RuntimeError(f"Dataset module error: {exc}") from exc

    return [_raw_to_schema(r) for r in raw_records]


def get_record_by_filename(filename: str) -> Optional[DatasetRecord]:
    """
    Find a dataset record by exact filename.

    Search strategy:
      1. Try the local dataset module first (fastest, always current).
      2. If not found locally, fall back to Supabase DB query.

    Parameters
    ----------
    filename : str
        Exact video filename, e.g. "aabnnvogTV.mp4".

    Returns
    -------
    DatasetRecord or None
    """
    # ── 1. Search local dataset ───────────────────────────────────────────
    if _DATASET_MODULE_AVAILABLE:
        try:
            loader = DatasetLoader(source=_normalise_source(None))
            all_raw = loader.load(filter_label="ALL", shuffle=False)
            for r in all_raw:
                if r.get("filename") == filename:
                    return _raw_to_schema(r)
        except Exception as exc:
            logger.warning(
                "Local dataset search failed, falling back to DB: %s", exc
            )

    # ── 2. Fall back to Supabase ──────────────────────────────────────────
    if not is_configured():
        return None

    try:
        db = get_client()
        resp = (
            db.table(TABLE_NAME)
            .select("*")
            .eq("filename", filename)
            .limit(1)
            .execute()
        )
        rows = resp.data or []
        if rows:
            return DatasetRecord(**rows[0])
    except Exception as exc:
        logger.error("DB fallback lookup failed for '%s': %s", filename, exc)

    return None


def get_stats(source: Optional[str] = None) -> DatasetStats:
    """
    Compute dataset statistics from the local dataset module.

    Falls back to zero-filled stats if the dataset module is unavailable.

    Parameters
    ----------
    source : str, optional
        Dataset source: "DFDC", "FF", or "ALL".

    Returns
    -------
    DatasetStats
    """
    src = _normalise_source(source)

    if not _DATASET_MODULE_AVAILABLE:
        logger.warning("Dataset module unavailable; returning empty stats.")
        return DatasetStats(
            total_records=0,
            real_count=0,
            deepfake_count=0,
            available_files=0,
            missing_files=0,
            dfdc_count=0,
            ff_count=0,
            dataset_source=src,
        )

    try:
        loader = DatasetLoader(source=src)
        all_raw = loader.load(filter_label="ALL", shuffle=False)
    except Exception as exc:
        logger.error("Failed to load records for stats: %s", exc, exc_info=True)
        raise RuntimeError(f"Dataset module error: {exc}") from exc

    total = len(all_raw)
    real = sum(1 for r in all_raw if r.get("ground_truth") == "REAL")
    deepfake = sum(1 for r in all_raw if r.get("ground_truth") == "DEEPFAKE")
    available = sum(1 for r in all_raw if r.get("file_exists", False))
    missing = total - available
    dfdc = sum(1 for r in all_raw if r.get("dataset_source") == "DFDC")
    ff = sum(1 for r in all_raw if r.get("dataset_source") == "FaceForensics++")

    return DatasetStats(
        total_records=total,
        real_count=real,
        deepfake_count=deepfake,
        available_files=available,
        missing_files=missing,
        dfdc_count=dfdc,
        ff_count=ff,
        dataset_source=src,
    )


def sync_to_supabase(source: Optional[str] = None) -> SyncResult:
    """
    Synchronise local dataset metadata with Supabase dataset_records table.

    Flow:
      dataset module → load all records → upsert each → return summary

    Upsert logic (ON CONFLICT filename):
      - New filename → INSERT (inserted += 1)
      - Existing filename with changed data → UPDATE (updated += 1)
      - Any error per-record → failed += 1 (with error message)

    Parameters
    ----------
    source : str, optional
        "DFDC", "FF", or "ALL".

    Returns
    -------
    SyncResult

    Raises
    ------
    RuntimeError
        If the dataset module is unavailable or Supabase is not configured.
    """
    _check_dataset_available()

    if not is_configured():
        raise RuntimeError(
            "Supabase is not configured. "
            "Set SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env."
        )

    src = _normalise_source(source)

    # ── Load all records from dataset module ──────────────────────────────
    try:
        loader = DatasetLoader(source=src)
        all_raw = loader.load(filter_label="ALL", shuffle=False)
    except FileNotFoundError as exc:
        logger.warning("Dataset files missing during sync: %s", exc)
        return SyncResult(
            total_processed=0,
            inserted=0,
            updated=0,
            skipped=0,
            failed=0,
            errors=[f"Dataset files not found: {exc}"],
        )
    except Exception as exc:
        raise RuntimeError(f"Dataset module error during sync: {exc}") from exc

    total = len(all_raw)
    inserted = 0
    updated = 0
    failed = 0
    errors: List[str] = []

    db = get_client()

    # ── Fetch all existing filenames from DB in one query ─────────────────
    try:
        existing_resp = db.table(TABLE_NAME).select("filename, updated_at").execute()
        existing_filenames: set[str] = {
            row["filename"] for row in (existing_resp.data or [])
        }
    except Exception as exc:
        raise RuntimeError(
            f"Failed to fetch existing records from Supabase: {exc}"
        ) from exc

    # ── Upsert each record ────────────────────────────────────────────────
    for raw in all_raw:
        try:
            record = _raw_to_schema(raw)
            payload = _build_upsert_payload(record)

            (
                db.table(TABLE_NAME)
                .upsert(payload, on_conflict="filename")
                .execute()
            )

            if record.filename in existing_filenames:
                updated += 1
            else:
                inserted += 1

        except Exception as exc:
            failed += 1
            filename = raw.get("filename", "<unknown>")
            err_msg = f"Failed to upsert '{filename}': {type(exc).__name__}"
            errors.append(err_msg)
            logger.error("%s — detail: %s", err_msg, exc, exc_info=True)

    logger.info(
        "Sync complete: total=%d inserted=%d updated=%d failed=%d",
        total, inserted, updated, failed,
    )

    return SyncResult(
        total_processed=total,
        inserted=inserted,
        updated=updated,
        skipped=0,
        failed=failed,
        errors=errors,
    )


def get_db_records(
    label: Optional[str] = None,
    limit: Optional[int] = None,
) -> List[DatasetRecord]:
    """
    Read dataset records directly from the Supabase database.

    Unlike get_all_records(), this queries the DB rather than the
    local dataset module.  Use this when you want to see what has
    been synced, rather than what's currently on disk.

    Parameters
    ----------
    label : str, optional
        "REAL" or "DEEPFAKE". None = all.
    limit : int, optional
        Max rows to return.

    Returns
    -------
    list[DatasetRecord]
    """
    if not is_configured():
        raise RuntimeError(
            "Supabase is not configured. Cannot query database."
        )

    db = get_client()
    query = db.table(TABLE_NAME).select("*").order("created_at", desc=True)

    if label:
        label_upper = label.upper()
        if label_upper not in ("REAL", "DEEPFAKE"):
            raise ValueError(
                f"Invalid label '{label}'. Must be REAL or DEEPFAKE."
            )
        query = query.eq("ground_truth", label_upper)

    if limit and limit > 0:
        query = query.limit(limit)

    try:
        resp = query.execute()
        rows = resp.data or []
        return [DatasetRecord(**row) for row in rows]
    except Exception as exc:
        logger.error("DB records query failed: %s", exc, exc_info=True)
        raise RuntimeError(f"Database query failed: {exc}") from exc


def validate_dataset(source: Optional[str] = None) -> dict:
    """
    Run the dataset validator and return its combined report.

    Parameters
    ----------
    source : str, optional
        "DFDC", "FF", or "ALL".

    Returns
    -------
    dict — Combined validation report from DatasetValidator.validate()
    """
    _check_dataset_available()
    src = _normalise_source(source)
    try:
        validator = DatasetValidator(source=src)
        return validator.validate(verbose=False)
    except Exception as exc:
        logger.error("Dataset validation failed: %s", exc, exc_info=True)
        raise RuntimeError(f"Dataset validation error: {exc}") from exc
