# Project Rules

## LLM Fallback Chain Constraints
- **Allowed Fallback Chain:** The fallback chain for generation/critic/editing is strictly **Groq → Gemini**, and nothing else.
- **Unauthorized Models:** Do not add a third provider (such as Anthropic, OpenAI, or any other API-key based service) to any generation or criticism stage without explicit sign-off. Adding unauthorized paid/free APIs violates the cost-sensitive/no-paid-API-for-MVP decision and risks 401/rate-limit crashes in production.
