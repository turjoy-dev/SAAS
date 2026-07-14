---
name: bugsink
description: Self-hosted sentry-compatible bugsink error tracking. Triggers on bugsink, BUGSINK_DSN, configure bugsink, or Sentry error logs. Do NOT use for live debugging (handled by pippy-debugger-backend).
---

## Overview
Bugsink is a self-hosted Sentry-compatible error tracking tool. The backend integrates with Bugsink using the standard `sentry-sdk` Python client configured with a `BUGSINK_DSN`.

## Setup & Configuration

### 1. Environment Variable
Add the `BUGSINK_DSN` variable to your env files:
```env
BUGSINK_DSN=http://your-bugsink-key@localhost:8002/1
```

> [!WARNING]
> `BUGSINK_DSN` is currently duplicated across two environment files in this project:
> 1. Workspace Root: [d:/Demo_project/Pr-01/.env](file:///d:/Demo_project/Pr-01/.env)
> 2. Python Backend Root: [d:/Demo_project/Pr-01/Backend/sop-backend-python/.env](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/.env)
> 
> Both files **must** be updated simultaneously if the DSN key ever rotates.

### 2. Code Integration
Initialize Sentry/Bugsink SDK in the main FastAPI application (`main.py`):
```python
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastAPIIntegration

# Initialize Sentry/Bugsink error tracking
BUGSINK_DSN = os.getenv("BUGSINK_DSN") or os.getenv("SENTRY_DSN")
if BUGSINK_DSN:
    sentry_sdk.init(
        dsn=BUGSINK_DSN,
        integrations=[FastAPIIntegration()],
        traces_sample_rate=1.0,
    )
```

## Verification
To verify that errors are being reported successfully to your Bugsink instance:
1. Raise a test exception inside one of your FastAPI routes:
```python
@app.get("/api/test-error")
async def trigger_error():
    division_by_zero = 1 / 0
```
2. Call the endpoint (`curl http://localhost:5000/api/test-error`) and check your local Bugsink dashboard at `http://localhost:8002` to confirm the exception is recorded.
