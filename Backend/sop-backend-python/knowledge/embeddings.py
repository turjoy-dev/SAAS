"""
Embedding helper module for cross-user duplicate detection.
Uses sentence-transformers (all-MiniLM-L6-v2) for 384-dimensional dense text embeddings.
Loaded ONCE at module load — never per request.
"""

import logging
import time

logger = logging.getLogger(__name__)

_model = None
_model_loaded = False

def _init_model():
    global _model, _model_loaded
    if _model_loaded:
        return
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Initializing sentence-transformers (all-MiniLM-L6-v2)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        _model_loaded = True
        logger.info("sentence-transformers model loaded successfully.")
    except Exception as e:
        logger.warning(f"Failed to load sentence-transformers model: {e}. Fallback to null embedding.")
        _model = None
        _model_loaded = True

def get_embedding(text: str) -> list[float]:
    """
    Computes 384-dimensional float vector for input text.
    Measures and logs embedding generation latency.
    """
    if not text or not text.strip():
        return [0.0] * 384
        
    _init_model()
    
    start_time = time.perf_counter()
    if _model is not None:
        try:
            vec = _model.encode(text, convert_to_numpy=True).tolist()
            latency_ms = (time.perf_counter() - start_time) * 1000
            logger.info(f"Generated 384d embedding in {latency_ms:.2f}ms")
            return vec
        except Exception as e:
            logger.warning(f"Error encoding text embedding: {e}")
            
    # Mock fallback embedding for environments without sentence-transformers
    import hashlib
    h = hashlib.sha256(text.encode("utf-8")).digest()
    mock_vec = [(float(b) / 255.0) - 0.5 for b in h]
    # Tile to 384 dimensions
    mock_384 = (mock_vec * 12)[:384]
    return mock_384

def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Computes cosine similarity between two 384d vectors."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = sum(a * a for a in vec1) ** 0.5
    norm_b = sum(b * b for b in vec2) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
