# Project Constitution

## Core Principles

### I. Spec-Driven Development (SDD)
- Every feature must begin with a clear, unambiguous specification (`spec.md`) capturing user stories, acceptance scenarios, and priority levels.
- Technical execution is guided by an explicit technical implementation plan (`plan.md`) and a granular task checklist (`tasks.md`).

### II. Modular Architecture
- Maintain clean separation of concerns across Backend (`/Backend`), Frontend (`/Front`), and support services.
- Each module and service must be self-contained, documented, and independently testable.

### III. Code Quality & Standards
- Code must be clean, readable, robust, and free from placeholder or unhandled edge cases.
- Follow test-driven verification and linting prior to declaring tasks complete.

### IV. Environment & Security
- Never hardcode secrets, credentials, or private API keys in code files.
- Store environment variables strictly in `.env` or system environment settings.
