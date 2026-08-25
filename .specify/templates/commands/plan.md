---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
handoffs:
  - label: Create Tasks
    agent: speckit.tasks
    prompt: Break the plan into tasks
    send: true
---

## User Input

```text
$ARGUMENTS
```

## Outline

1. Identify active feature directory from `.specify/feature.json` or `specs/` list.
2. Read `specs/<feature>/spec.md` and `.specify/memory/constitution.md`.
3. Fill out `.specify/templates/plan-template.md` and save to `specs/<feature>/plan.md`.
4. Document technical stack, project layout decisions, data models, and verification steps.
