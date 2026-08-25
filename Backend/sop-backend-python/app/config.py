import os
import sys
from dotenv import load_dotenv

from pathlib import Path

# Load env file from the parent/root directory and backend root
env_backend = Path(__file__).resolve().parent.parent / ".env"
env_root = Path(__file__).resolve().parents[2] / ".env"
if env_root.exists():
    load_dotenv(dotenv_path=env_root)
if env_backend.exists():
    load_dotenv(dotenv_path=env_backend)

# Supabase Configurations
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Groq Configurations
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_KEY_2 = os.getenv("GROQ_API_KEY_2", "")
GROQ_GENERATOR_MODEL = os.getenv("GROQ_GENERATOR_MODEL", "llama-3.3-70b-versatile")
GROQ_CHECKER_MODEL = os.getenv("GROQ_CHECKER_MODEL", "llama-3.1-8b-instant")

# Gemini Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_SCORING_MODEL = os.getenv("GEMINI_SCORING_MODEL", "gemini-flash-latest")
GEMINI_DRAFT_MODEL = os.getenv("GEMINI_DRAFT_MODEL", "gemini-flash-latest")

# Anthropic Polish Configurations (Feature-flagged)
ENABLE_CLAUDE_POLISH = os.getenv("ENABLE_CLAUDE_POLISH", "false").lower() in ("true", "1", "yes")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_POLISH_MODEL = os.getenv("CLAUDE_POLISH_MODEL", "claude-sonnet-4-6")

# Environment & Security Flags
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
IS_PRODUCTION = ENVIRONMENT in ("production", "prod")
ALLOW_MOCK_AUTH = os.getenv("ALLOW_MOCK_AUTH", "false").lower() in ("true", "1", "yes")

# Mock LLM Mode
USE_MOCK_LLM = os.getenv("USE_MOCK_LLM", "false").lower() == "true"
if "--real" in sys.argv:
    USE_MOCK_LLM = False

