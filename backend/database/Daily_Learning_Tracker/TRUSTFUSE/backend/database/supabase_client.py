"""
supabase_client.py — Reusable Supabase client
AI Investor Fraud & Impersonation Detection Platform

Usage:
    from database.supabase_client import supabase
    # or
    from database.supabase_client import get_supabase

Environment variables (set in database/.env):
    SUPABASE_URL  — your Supabase project URL
    SUPABASE_KEY  — your anon or service-role key
"""

from __future__ import annotations

import os
from typing import Optional

from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from the current working directory or any parent.
# Works whether you run from backend/ or backend/database/.
load_dotenv()

# ---------------------------------------------------------------------------
# Private singleton
# ---------------------------------------------------------------------------

_client: Optional[Client] = None


def get_supabase() -> Client:
    """
    Return a singleton Supabase client.

    The client is created on the first call and reused on every subsequent
    call (lazy-initialisation).

    Raises:
        RuntimeError: If SUPABASE_URL or SUPABASE_KEY is not set.
    """
    global _client

    if _client is None:
        url: str = os.getenv("SUPABASE_URL", "")
        key: str = os.getenv("SUPABASE_KEY", "")

        if not url:
            raise RuntimeError(
                "SUPABASE_URL is not set. "
                "Copy database/.env.example to database/.env "
                "and fill in your Supabase project URL."
            )
        if not key:
            raise RuntimeError(
                "SUPABASE_KEY is not set. "
                "Copy database/.env.example to database/.env "
                "and fill in your Supabase anon/service-role key."
            )

        _client = create_client(url, key)

    return _client


# ---------------------------------------------------------------------------
# Module-level alias — allows `from database.supabase_client import supabase`
# Note: this is a function reference, not the client object itself.
#       Use get_supabase() if you need the client at import time.
# ---------------------------------------------------------------------------

supabase = get_supabase


def test_connection() -> bool:
    """
    Simple connectivity check. Returns True if Supabase responds, False otherwise.
    Useful for the /health endpoint.
    """
    try:
        client = get_supabase()
        # Lightweight query: count rows in users table (no data transfer)
        client.table("users").select("id", count="exact").limit(1).execute()
        return True
    except Exception:
        return False
