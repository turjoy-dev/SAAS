# VisaWrite — AI-Powered Visa Document Generation SaaS

VisaWrite is an enterprise-grade AI SaaS platform for international students and visa applicants. It generates, scores, and formats compliance-checked visa documents—including Statements of Purpose (SOP), Genuine Student (GS) Statements, Letters of Explanation (LOE), Gap Explanations, Study Plans, Motivation Letters, and Personal Statements.

---

## 🌟 Key Features

- **7 Document Generator Interfaces**:
  - Statement of Purpose (SOP)
  - Genuine Student (GS Statement for Australian Visa Subclass 500)
  - Motivation Letter
  - Letter of Explanation (LOE)
  - Gap Explanation
  - Study Plan
  - Personal Statement
- **Banglish & Multilingual Processing**: Direct intake of free-text in Romanized Bengali (e.g. *"Ami 2 bochor job korsi karon..."*) translated into formal visa English with zero factual loss.
- **Anti-Hallucination Negative Constraints**: Enforces `<forbidden_topics>` guards to prevent inventing unmentioned visa refusals, dependants, or financial assets.
- **Resilient Multi-Tier LLM Fallback**: Primary Groq (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) $\rightarrow$ Secondary Gemini Flash (`gemini-2.5-flash`), backed by `tenacity` exponential backoff and circuit breaker state tracking.
- **Async Vector Similarity Deduplication**: Google Gemini `text-embedding-004` (1536-dim) REST API integration with Supabase `pgvector` HNSW cosine similarity search.
- **Tiptap Rich Text Editor**: Embedded rich text surface with an audit trail saving versioned edits (`PUT /sop/generations/{id}`).
- **Formatted Exporters**: Download ready-to-submit `.docx` Word documents and `.pdf` files.
- **Production Container Architecture**: Docker multi-stage build with GTK3/Cairo/Pango C-libraries (`libffi8` Debian 12) and security non-root account (`appuser`).

---

## 🏗️ Architecture Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Tiptap, Lucide Icons, Recharts
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic, SlowAPI Rate Limiter, Tenacity, Sentry/Bugsink
- **Database & Storage**: Supabase PostgreSQL, pgvector (HNSW Indexing), Row Level Security
- **LLM Pipeline**: Groq Llama 3.3 70B & 8B, Google Gemini Flash, Gemini `text-embedding-004`
- **Containerization**: Docker, Docker Compose

---

## 🚀 Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` in the backend directory:

```bash
cd Backend/sop-backend-python
cp .env.example .env
```

Fill in your API credentials:
```ini
ENVIRONMENT=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
GROQ_API_KEY=gsk_your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Run Backend Locally

```bash
cd Backend/sop-backend-python
.\venv\Scripts\python.exe main.py
```
*(Server will start on `http://localhost:5000`)*

### 3. Run Frontend Locally

```bash
cd Front/visawrite-app
npm install
npm run dev
```
*(App will start on `http://localhost:3000`)*

---

## 🐳 Production Container Deployment

To run in production using Docker:

1. Execute DDL Migration in Supabase SQL Editor:
```sql
-- See Backend/sop-backend-python/supabase/migrations/20260819_pgvector_dedup.sql
```

2. Build & Launch Docker Container:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🛡️ Security & Privacy

- All API keys and secrets are loaded strictly via environment variables.
- `.env` files are ignored in `.gitignore` and never committed to version control.
- Cross-user deduplication search returns strictly boolean match signals without exposing raw document text or applicant metadata across users.
