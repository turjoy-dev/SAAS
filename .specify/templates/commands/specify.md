---
description: Create or update the feature specification from a natural language feature description.
handoffs:
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a plan for the spec. I am building with...
---

## User Input

```text
$ARGUMENTS
```

## Outline

1. Generate a short feature name (2-4 words, action-noun format e.g. `user-auth`, `photo-gallery`).
2. Create feature directory `specs/NNN-<short-name>` (e.g. `specs/001-photo-gallery`).
3. Copy `.specify/templates/spec-template.md` to `specs/NNN-<short-name>/spec.md`.
4. Populate `spec.md` with prioritized user stories (P1, P2, P3), clear acceptance scenarios, and independent test criteria.
5. Save active feature location to `.specify/feature.json`:
   ```json
   {
     "feature_directory": "specs/NNN-<short-name>"
   }
   ```
