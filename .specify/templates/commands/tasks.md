---
description: Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts.
handoffs:
  - label: Implement Project
    agent: speckit.implement
    prompt: Start the implementation in phases
    send: true
---

## User Input

```text
$ARGUMENTS
```

## Outline

1. Load `specs/<feature>/spec.md` and `specs/<feature>/plan.md`.
2. Break down implementation into phases:
   - Phase 1: Setup & Infrastructure
   - Phase 2: Foundational Prerequisites
   - Phase 3: User Story 1 (P1 MVP)
   - Phase 4: User Story 2+ (P2, P3)
   - Phase 5: Verification & Polish
3. Save task checklist to `specs/<feature>/tasks.md`.
