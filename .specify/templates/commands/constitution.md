---
description: Create or update the project constitution from interactive or provided principle inputs.
handoffs:
  - label: Build Specification
    agent: speckit.specify
    prompt: Implement the feature specification based on the updated constitution. I want to build...
---

## User Input

```text
$ARGUMENTS
```

## Outline

You are updating the project constitution at `.specify/memory/constitution.md`.

1. Review provided principles or instructions.
2. Ensure principles define non-negotiable architectural constraints, quality expectations, and governance rules.
3. Update `.specify/memory/constitution.md` with structured Markdown headers.
