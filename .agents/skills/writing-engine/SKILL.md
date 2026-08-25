---
name: writing-engine
description: Writing engine for visa documents (SOP, LOE, Motivation Letter, Gap Explanation, Study Plan, Personal Statement). Use when the user asks to generate, draft, revise, score, or critique a visa document.
---

## Overview
The Antigravity Writing Engine is a pure, manifest-driven document generation pipeline supporting:
* **Family A** (Narrative: SOP, Personal Statement, Motivation Letter): Pipeline: `Draft -> Critic -> [Edit if needed, single pass only] -> Relint -> done`.
* **Family D** (Issue-Explanation: LOE, Gap Explanation): Pipeline: `Draft -> Critic -> Relint -> done` (No Edit).

## Key Files & Modules
* [orchestrator.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/orchestrator.py) - Main entrypoint dispatching requests.
* [loader.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/knowledge/loader.py) - Loads manifests with `extends` inheritance.
* [prompt_builder.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/knowledge/prompt_builder.py) - Generates dynamic system prompts.
* [claude_client.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/knowledge/claude_client.py) - Drafts/Edits via Claude Sonnet API.
* [gemini_client.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/knowledge/gemini_client.py) - Critiques via Gemini Flash.
* [relint.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/knowledge/relint.py) - Post-Draft/Edit banned-phrase check.
* [family_a.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/families/family_a.py) - Family A handler.
* [family_d.py](file:///d:/Demo_project/Pr-01/Backend/sop-backend-python/families/family_d.py) - Family D handler.

## Smoke Testing
To run the E2E smoke test verifying all components for both Family A and Family D:
```bash
python test_run.py
```
