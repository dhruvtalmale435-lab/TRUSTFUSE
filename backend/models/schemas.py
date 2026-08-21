"""
schemas.py — TRUSTFUSE Backend
================================
Pydantic data models for the entire backend integration layer.

These models are used for:
  - Request/response validation in route handlers
  - Type-safe data passing between service and route layers
  - OpenAPI documentation auto-generation (FastAPI)

Models defined here:
  - GroundTruth          — enum for REAL / DEEPFAKE
  - DatasetSource        — enum for known dataset sources
  - DatasetRecord        — a single dataset metadata record
  - DatasetStats         — aggregate statistics across all records
  - SyncResult           — result summary from a sync operation
  - ApiResponse[T]       — generic wrapper for all API responses
  - ErrorResponse        — standard error shape
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Generic, List, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class GroundTruth(str, Enum):
    """Normalised ground-truth label. Only two valid values."""
    REAL = "REAL"
    DEEPFAKE = "DEEPFAKE"


class DatasetSource(str, Enum):
    """Known dataset sources supported by the dataset module."""
    DFDC = "DFDC"
    FACEFORENSICS = "FaceForensics++"
    UNKNOWN = "UNKNOWN"


# ---------------------------------------------------------------------------
# Core data models
# ---------------------------------------------------------------------------

class DatasetRecord(BaseModel):
    """
    A single dataset metadata record — mirrors both:
      - The standardised dict returned by DatasetLoader.load()
      - The row shape stored in the dataset_records Supabase table

    The actual video file is NOT included; only references/metadata.
    """

    # Database fields
    id: Optional[UUID] = Field(default=None, description="Supabase row UUID")
    filename: str = Field(..., description="Video filename, e.g. 'aabnnvogTV.mp4'")
    dataset_source: str = Field(..., description="DFDC | FaceForensics++ | UNKNOWN")
    ground_truth: GroundTruth = Field(..., description="REAL or DEEPFAKE")

    # Optional relationship / split fields
    original_filename: Optional[str] = Field(
        default=None,
        description="For DFDC DEEPFAKE records, the source (REAL) filename"
    )
    split: Optional[str] = Field(
        default=None,
        description="Dataset split: train | val | test"
    )
    manipulation_method: Optional[str] = Field(
        default=None,
        description="FF++ manipulation method (Deepfakes, FaceSwap, …) or None for DFDC"
    )

    # Availability (checked when dataset module loads the file)
    file_exists: bool = Field(
        default=True,
        description="True if the .mp4 was present on disk during last sync"
    )

    # Timestamps (from Supabase; absent when sourced from local dataset)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)

    class Config:
        # Allow construction from ORM-like dict (Supabase response rows)
        from_attributes = True


class DatasetRecordLocal(BaseModel):
    """
    Lightweight record shape as returned by the dataset module loader
    (no UUID / timestamps — those come from Supabase after upsert).
    Used internally by dataset_service.py before DB interaction.
    """
    filename: str
    video_path: str
    ground_truth: str
    original_filename: Optional[str] = None
    split: Optional[str] = None
    manipulation_method: Optional[str] = None
    mask_path: Optional[str] = None
    file_exists: bool = True
    dataset_source: str = "UNKNOWN"


# ---------------------------------------------------------------------------
# Statistics model
# ---------------------------------------------------------------------------

class DatasetStats(BaseModel):
    """
    Aggregate statistics returned by GET /api/dataset/stats.
    Computed from local dataset loader (not DB) for real-time accuracy.
    """
    total_records: int = Field(..., description="Total records across all sources")
    real_count: int = Field(..., description="Records with ground_truth == REAL")
    deepfake_count: int = Field(..., description="Records with ground_truth == DEEPFAKE")
    available_files: int = Field(..., description="Records where file_exists == True")
    missing_files: int = Field(..., description="Records where file_exists == False")
    dfdc_count: int = Field(default=0, description="Records from DFDC source")
    ff_count: int = Field(default=0, description="Records from FaceForensics++ source")
    dataset_source: str = Field(
        default="ALL",
        description="Source filter used: DFDC | FF | ALL"
    )


# ---------------------------------------------------------------------------
# Sync result model
# ---------------------------------------------------------------------------

class SyncResult(BaseModel):
    """
    Result returned by POST /api/dataset/sync.
    Reports what happened during dataset ↔ Supabase synchronisation.
    """
    total_processed: int = Field(..., description="Total records read from dataset module")
    inserted: int = Field(..., description="New records inserted into Supabase")
    updated: int = Field(..., description="Existing records updated in Supabase")
    skipped: int = Field(default=0, description="Records skipped (no change needed)")
    failed: int = Field(default=0, description="Records that caused errors during upsert")
    errors: List[str] = Field(
        default_factory=list,
        description="Error messages for failed records (filenames only, no secrets)"
    )


# ---------------------------------------------------------------------------
# Generic API response wrapper
# ---------------------------------------------------------------------------

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """
    Standard wrapper for all API responses.

    Success:  {"success": true,  "data": <T>}
    Error:    {"success": false, "error": "Human-readable message"}

    The `error` field is never present on success.
    The `data` field is never present on error.
    """
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        """Construct a successful response."""
        return cls(success=True, data=data)

    @classmethod
    def fail(cls, message: str) -> "ApiResponse":
        """Construct an error response."""
        return cls(success=False, error=message)


# ---------------------------------------------------------------------------
# Health check model
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    """Response shape for GET /health."""
    status: str = "healthy"
    supabase_configured: bool = Field(
        ...,
        description="True if Supabase env vars are present (does not test connectivity)"
    )
    dataset_source: str = Field(
        ...,
        description="Configured DATASET_SOURCE env var"
    )
