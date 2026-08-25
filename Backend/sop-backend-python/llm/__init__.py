from app import config

if getattr(config, "USE_MOCK_LLM", False):
    from app.utils.mock_llm import mock_llm
    class MockClientWrapper:
        def __init__(self, target):
            self.target = target
        def __getattr__(self, name):
            if name in ("draft", "edit", "critique"):
                return getattr(mock_llm, name)
            return getattr(self.target, name)
    
    from knowledge import groq_client as real_groq_client
    from knowledge import gemini_client as real_gemini_client
    groq_client = MockClientWrapper(real_groq_client)
    gemini_client = MockClientWrapper(real_gemini_client)
else:
    from knowledge import groq_client
    from knowledge import gemini_client
