"""
Single Supabase client instance for the backend.

Uses the SERVICE_ROLE key, which bypasses Row Level Security entirely.
This is intentional: the backend is a trusted context, but it means
YOUR CODE is now responsible for ownership checks that RLS would
otherwise enforce automatically.

Rule of thumb: every query that touches applicants/fact_sheets/generations
must filter by the requesting user's applicant_id — never trust a
generation_id or applicant_id passed in from the client without
verifying it belongs to the authenticated user first.
"""

import os
from pathlib import Path
from functools import lru_cache
from supabase import create_client, Client
from dotenv import load_dotenv

# .env lives at Pr-01/.env — two levels up from this file
# (Pr-01/Backend/sop-backend-python/app/db/supabase_client.py)
env_path = Path(__file__).resolve().parents[4] / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. "
        "Check your .env file."
    )


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """
    Returns a cached singleton Supabase client.
    lru_cache ensures we don't create a new client on every call —
    the underlying httpx connection pool gets reused.
    """
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def verify_applicant_ownership(applicant_id: str, user_id: str) -> bool:
    """
    Since the backend uses service_role (bypasses RLS), this is the
    manual check that replaces what RLS would have done automatically.
    Call this before any operation on applicant-scoped data where the
    applicant_id came from client input rather than derived server-side.
    """
    supabase = get_supabase()
    result = (
        supabase.table("applicants")
        .select("id")
        .eq("id", applicant_id)
        .eq("user_id", user_id)
        .execute()
    )
    return len(result.data) > 0
