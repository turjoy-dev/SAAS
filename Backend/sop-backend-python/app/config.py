import os
from dotenv import load_dotenv

# Load env file from the parent/root directory or backend root
load_dotenv(override=True)

# Supabase Configurations
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Groq Configurations
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_GENERATOR_MODEL = os.getenv("GROQ_GENERATOR_MODEL", "llama-3.3-70b-versatile")
GROQ_CHECKER_MODEL = os.getenv("GROQ_CHECKER_MODEL", "llama-3.1-8b-instant")

# Gemini Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_SCORING_MODEL = os.getenv("GEMINI_SCORING_MODEL", "gemini-flash-latest")
GEMINI_DRAFT_MODEL = os.getenv("GEMINI_DRAFT_MODEL", "gemini-flash-latest")
GEMINI_POLISH_MODEL = os.getenv("GEMINI_POLISH_MODEL", "gemini-pro-latest")

# Anthropic Configurations
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
DRAFTER_MODEL = os.getenv("DRAFTER_MODEL", "claude-sonnet-4-6")
CRITIC_MODEL = os.getenv("CRITIC_MODEL", GEMINI_SCORING_MODEL)

# Orchestrator Configurations
MAX_REVISIONS = int(os.getenv("MAX_REVISIONS", "2"))
PASS_THRESHOLD = int(os.getenv("PASS_THRESHOLD", "75"))
FALLBACK_ON_MAX_REVISIONS = "best_scoring"
