import os
from pathlib import Path
import uvicorn
from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import traceback
import uuid
from datetime import datetime, timezone
import sentry_sdk
from dotenv import load_dotenv

# Load env variables
env_path = Path(__file__).resolve().parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

from app.db.supabase_client import get_supabase as get_supabase_client
from app.routes import sop, dashboard, applicants, admin, coupons
from app.auth.dependencies import require_role
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.limiter import limiter

# Initialize Sentry/Bugsink error tracking
BUGSINK_DSN = os.getenv("BUGSINK_DSN") or os.getenv("SENTRY_DSN")
if BUGSINK_DSN:
    sentry_sdk.init(
        dsn=BUGSINK_DSN,
        traces_sample_rate=1.0,
    )


app = FastAPI(
    title="VisaWrite SOP Backend (FastAPI)",
    description="Python/FastAPI port of the modular 7-layer SOP writing and scoring engine",
    version="1.0.0"
)

# Attach slowapi limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configurations
from app.config import IS_PRODUCTION
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if IS_PRODUCTION and not allowed_origins_env:
    raise RuntimeError("CRITICAL CONFIG ERROR: ALLOWED_ORIGINS environment variable must be set in production mode.")

if allowed_origins_env:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    origins = ["http://localhost:3000", "http://localhost:5000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5 MB Request Body Size Limit Middleware (DoS prevention)
MAX_REQUEST_SIZE_BYTES = 5 * 1024 * 1024

@app.middleware("http")
async def limit_payload_size_middleware(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_REQUEST_SIZE_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Payload too large. Maximum allowed size is 5 MB."}
                )
        except ValueError:
            pass
    return await call_next(request)

app.include_router(sop.router, prefix="/sop", tags=["sop"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(applicants.router, prefix="/applicants", tags=["applicants"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(coupons.router, prefix="/coupons", tags=["coupons"])

@app.on_event("startup")
def startup_health_checks():
    from app import config
    if not config.GROQ_API_KEY and not config.GEMINI_API_KEY:
        print("⚠️ WARNING: Neither GROQ_API_KEY nor GEMINI_API_KEY is configured. LLM services will run in mock mode.")
    if not config.GEMINI_API_KEY:
        print("⚠️ WARNING: GEMINI_API_KEY is missing. Async text-embedding-004 deduplication vectors will be disabled.")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_id = str(uuid.uuid4())
    tb = traceback.format_exc()

    try:
        supabase = get_supabase_client()
        error_row = {
            "stage": str(request.url.path),
            "error_detail": str(exc)[:2000],
            "raw_payload": {
                "error_id": error_id,
                "traceback": tb[:5000],
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        # Propagate generation_id from the route if available (set via request.state)
        gen_id = getattr(request.state, "generation_id", None)
        if gen_id:
            error_row["generation_id"] = gen_id
        supabase.table("generation_errors").insert(error_row).execute()
    except Exception:
        print(f"[CRITICAL] Failed to log error {error_id}: {tb}")

    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "error_id": error_id},
    )

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)