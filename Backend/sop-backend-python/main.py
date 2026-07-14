import os
from pathlib import Path
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import uuid
from datetime import datetime, timezone
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastAPIIntegration
from dotenv import load_dotenv

# Load env variables
env_path = Path(__file__).resolve().parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

from app.db.supabase_client import get_supabase as get_supabase_client
from app.routes import sop, dashboard

# Initialize Sentry/Bugsink error tracking
BUGSINK_DSN = os.getenv("BUGSINK_DSN") or os.getenv("SENTRY_DSN")
if BUGSINK_DSN:
    sentry_sdk.init(
        dsn=BUGSINK_DSN,
        integrations=[FastAPIIntegration()],
        traces_sample_rate=1.0,
    )

app = FastAPI(
    title="VisaWrite SOP Backend (FastAPI)",
    description="Python/FastAPI port of the modular 7-layer SOP writing and scoring engine",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to match your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sop.router, prefix="/sop", tags=["sop"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_id = str(uuid.uuid4())
    tb = traceback.format_exc()

    try:
        supabase = get_supabase_client()
        supabase.table("generation_errors").insert({
            # NOTE: table has no "generation_id" value available at this point
            # (a request-level error may happen before any generation exists).
            # If generation_id is NOT NULL in the DB, this insert will still fail —
            # verify nullability and ALTER TABLE if needed.
            "stage": str(request.url.path),          # was "endpoint" — column doesn't exist
            "error_detail": str(exc)[:2000],           # was "error_message" — column doesn't exist
            "raw_payload": {                           # was "traceback" — column doesn't exist; folded into jsonb
                "error_id": error_id,
                "traceback": tb[:5000],
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception:
        print(f"[CRITICAL] Failed to log error {error_id}: {tb}")

    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "error_id": error_id},
    )

@app.get("/api/test-error")
async def trigger_error():
    division_by_zero = 1 / 0

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)