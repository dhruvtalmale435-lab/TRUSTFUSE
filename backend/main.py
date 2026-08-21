"""
main.py — TRUSTFUSE Backend Integration Layer
==============================================
FastAPI application entry point.

Responsibilities:
  - Initialise the FastAPI app with metadata and CORS.
  - Register all routers.
  - Provide /health endpoint.
  - Validate critical configuration at startup.
  - Provide clean error responses (no secrets or tracebacks exposed).

Start the server:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000

Environment variables (see .env.example):
    SUPABASE_URL, SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY
    DATASET_SOURCE, DATASET_MODULE_PATH
    BACKEND_HOST, BACKEND_PORT
    CORS_ORIGINS
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Load .env from this directory
# ---------------------------------------------------------------------------
_here = Path(__file__).parent.resolve()
load_dotenv(dotenv_path=_here / ".env", override=False)

# ---------------------------------------------------------------------------
# Logging — configure before anything else imports the logger
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("trustfuse")

# ---------------------------------------------------------------------------
# Local imports (after .env is loaded)
# ---------------------------------------------------------------------------
from database.supabase_client import is_configured   # noqa: E402
from routes.dataset_routes import router as dataset_router  # noqa: E402

# ---------------------------------------------------------------------------
# Application metadata
# ---------------------------------------------------------------------------
app = FastAPI(
    title="TRUSTFUSE API",
    description=(
        "AI-Based Investor Fraud & Impersonation Detection — "
        "Backend integration layer connecting the dataset module, "
        "Supabase PostgreSQL, and REST APIs for the React frontend."
    ),
    version="1.0.0",
    contact={
        "name": "TRUSTFUSE Hackathon Team",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",          # Swagger UI
    redoc_url="/redoc",        # ReDoc
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS — allow the configured frontend origins
# ---------------------------------------------------------------------------
_raw_origins: str = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173",
)
CORS_ORIGINS: List[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

logger.info("CORS enabled for origins: %s", CORS_ORIGINS)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(dataset_router)

# ---------------------------------------------------------------------------
# Startup event — validate configuration
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("=" * 60)
    logger.info("  TRUSTFUSE Backend starting up")
    logger.info("=" * 60)

    # ── Check Supabase config ─────────────────────────────────────────────
    if is_configured():
        logger.info("  Supabase   : ✓ configured")
    else:
        logger.warning(
            "  Supabase   : ✗ NOT configured — "
            "set SUPABASE_URL and SUPABASE_KEY in .env. "
            "Sync endpoints will return 503 until configured."
        )

    # ── Check dataset module path ─────────────────────────────────────────
    default_path = str(_here.parent / "dataset")
    dataset_path = os.environ.get("DATASET_MODULE_PATH", default_path)
    if Path(dataset_path).exists():
        logger.info("  Dataset    : ✓ found at %s", dataset_path)
    else:
        logger.warning(
            "  Dataset    : ✗ NOT found at '%s'. "
            "Set DATASET_MODULE_PATH env var to the correct path.",
            dataset_path,
        )

    # ── Log dataset source ────────────────────────────────────────────────
    src = os.environ.get("DATASET_SOURCE", "ALL")
    logger.info("  Source     : %s", src)
    logger.info("=" * 60)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Returns service health status and configuration summary.",
)
async def health_check() -> JSONResponse:
    """
    GET /health

    Always returns HTTP 200. Use the `supabase_configured` field to
    check whether database connectivity is expected to work.
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "healthy",
            "supabase_configured": is_configured(),
            "dataset_source": os.environ.get("DATASET_SOURCE", "ALL"),
        },
    )


# ---------------------------------------------------------------------------
# Global exception handler — never expose internal errors to clients
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method,
        request.url.path,
        exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An internal server error occurred. Please try again later.",
        },
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "success": False,
            "error": f"Endpoint not found: {request.method} {request.url.path}",
        },
    )


# ---------------------------------------------------------------------------
# Dev server entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    host = os.environ.get("BACKEND_HOST", "0.0.0.0")
    port = int(os.environ.get("BACKEND_PORT", "8000"))

    logger.info("Starting TRUSTFUSE backend at http://%s:%d", host, port)
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
    )
