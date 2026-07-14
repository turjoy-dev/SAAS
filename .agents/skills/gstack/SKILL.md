---
name: gstack
description: Router and repository management skill. Triggers on requests to run gstack operations, gbrain, gbrain search, setup-gbrain, autoplan, or gstack browse. Use when indexing, searching, or planning in this workspace. Do NOT trigger for generic search requests unrelated to gbrain.
---

## Overview
gstack is an agentic repository management tool suite featuring semantic code search, cross-session memory caching (gbrain), QA browser automation (gstack browse), and autonomous planning/review tools.

## Key Actions

### 1. Setup GBrain
To set up or reconfigure the semantic code index and cross-session memory for the workspace, run:
```bash
/setup-gbrain
```
This command initializes the local PGLite database or connects to a remote Supabase pooler instance.

### 2. Semantic Code Search
To perform a semantic search across the codebase (which is superior to exact-match grep):
```bash
gbrain search "<your query here>"
```
Examples:
- `gbrain search "how does auth token validation work"`
- `gbrain search "route handler for visa validation"`

### 3. Autoplan Execution
Runs automated engineering and context reviews on a given task before starting implementation:
```bash
/autoplan <task_description>
```

### 4. QA Browser Automation (Dogfooding)
To launch the headless chromium browser for QA page inspection, cookie setup, or dogfooding:
```bash
gstack browse
```

## Failure Modes & Recovery
* If the command `gbrain` is not found, verify that GStack is installed in your home directory (`~/.claude/skills/gstack` or local checkout) and that GStack's `bin/` directory is in your `PATH`.
* If a Supabase connection fails, check that `GBRAIN_DATABASE_URL` is set correctly in your environment and that your network allows connections to Supabase.
