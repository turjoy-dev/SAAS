---
name: pippy-debugger-backend
description: Pippy FastAPI python code debugging assistant. Triggers on requests to run pippy, start debugger backend, get pippy's suggestions, or query the /debug endpoint. Do NOT use for generic python triage or bugsink configurations.
---

## Overview
Pippy Debugger Backend is a FastAPI application that uses the `gemma-3-27b-it` model via `google_genai` to analyze Python code snippets and return debugging suggestions (with optional kid-friendly context mode).

## Setup & Configuration

### 1. Installing Dependencies
Install dependencies from the repository's root directory:
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Add your Google API key to `.env` in `pippy-debugger-backend/`:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Running the Server
Start the Uvicorn FastAPI server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Interaction

### Endpoint: `POST /debug`
* **Query Parameters**:
  - `code` (string): The Python code snippet to debug.
  - `context` (boolean): `true` to enable kid-friendly context explanations, `false` for standard debugging suggestions.

* **Example Invocation**:
```bash
curl -X POST "http://localhost:8000/debug?code=def+add(a,b):+return+a-b&context=false"
```

* **Example Response**:
```json
{
  "answer": "The function name is 'add' but it subtracts 'b' from 'a' instead of adding them."
}
```
