"""
main.py
AI Investor Fraud & Impersonation Detection Platform

FastAPI application entry point.

Run with:
    cd backend/
    uvicorn main:app --reload --port 8000

API docs available at:
    http://localhost:8000/docs        (Swagger UI)
    http://localhost:8000/redoc       (ReDoc)
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load .env before any other imports that read env vars
load_dotenv("database/.env")
load_dotenv(".env")  # also check the project root

from routes.detect import router as detect_router
from routes.cases  import router as cases_router
from routes.alerts import router as alerts_router
from database.supabase_client import test_connection

# ---------------------------------------------------------------------------
# CORS configuration
# ---------------------------------------------------------------------------
# Set ALLOWED_ORIGINS in database/.env as a comma-separated list:
#   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
# Leave blank (or do not set) to allow ALL origins during development.

_origins_env = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS: list[str] = (
    [o.strip() for o in _origins_env.split(",") if o.strip()]
    if _origins_env
    else ["*"]  # development default — restrict in production
)


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Test DB connectivity on startup and log the result."""
    connected = test_connection()
    if connected:
        print("✅  Supabase connection: OK")
    else:
        print("⚠️   Supabase connection: FAILED — check SUPABASE_URL and SUPABASE_KEY in .env")
    yield
    # No teardown needed for Supabase (HTTP-based client)


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Investor Fraud & Impersonation Detection API",
    description=(
        "Backend API for detecting AI/deepfake fraud, impersonation of financial "
        "intermediaries, fake platforms, and suspicious URLs targeting retail investors."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(detect_router)
app.include_router(cases_router)
app.include_router(alerts_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Health"], summary="Health check")
def health_check() -> dict[str, Any]:
    """
    Returns the API and database status.
    Used by load balancers, monitoring tools, and the frontend startup check.
    """
    db_ok = test_connection()
    return JSONResponse(
        status_code=200 if db_ok else 503,
        content={
            "status":   "healthy" if db_ok else "degraded",
            "database": "connected" if db_ok else "unreachable",
            "version":  "1.0.0",
        },
    )


# ---------------------------------------------------------------------------
# Root redirect
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {
        "message": "AI Investor Fraud Detection API",
        "docs":    "/docs",
        "health":  "/health",
    }
