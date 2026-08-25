import logging
import asyncio
from typing import Tuple, List, Optional
import httpx
from app import config
from app.db.supabase_client import get_supabase

logger = logging.getLogger("visawrite.vector_dedup")


async def get_embedding_vector(text: str) -> Optional[List[float]]:
    """Generates true 1536-dim embedding via Gemini text-embedding-004 REST API.
    
    Eliminates PyTorch/sentence-transformers memory overhead (~500MB saved).
    """
    if not config.GEMINI_API_KEY:
        logger.warning("[VectorDedup] GEMINI_API_KEY missing. Embedding generation skipped.")
        return None
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={config.GEMINI_API_KEY}"
        payload = {
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": text[:2500]}]},
            "outputDimensionality": 1536
        }
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["embedding"]["values"]
            else:
                logger.error(f"[VectorDedup] Gemini embedding API returned {resp.status_code}: {resp.text}")
                return None
    except Exception as e:
        logger.error(f"[VectorDedup] Failed to generate embedding: {e}", exc_info=True)
        return None


class VectorDedupService:
    def __init__(self, threshold: float = 0.92):
        self.threshold = threshold

    async def check_duplicate(self, draft_text: str, country: str = "", doc_type: str = "") -> Tuple[bool, float, bool]:
        """Performs async cosine similarity deduplication check against Supabase pgvector.

        Returns:
            (is_duplicate, similarity_score, dedup_check_failed)
        """
        try:
            query_embedding = await get_embedding_vector(draft_text)
            if not query_embedding:
                return False, 0.0, True

            supabase = get_supabase()

            # Execute blocking Supabase I/O in a separate thread pool
            def _sync_rpc():
                return supabase.rpc("match_similar_generations", {
                    "query_embedding": query_embedding,
                    "match_country": country,
                    "match_doc_type": doc_type,
                    "match_threshold": self.threshold,
                    "match_count": 1
                }).execute()

            rpc_res = await asyncio.to_thread(_sync_rpc)

            if rpc_res.data and len(rpc_res.data) > 0:
                top_match = rpc_res.data[0]
                similarity = float(top_match.get("similarity", 0.0))
                if similarity >= self.threshold:
                    return True, similarity, False

            return False, 0.0, False
        except Exception as e:
            logger.error(f"[VectorDedup] RPC duplicate check failed: {e}", exc_info=True)
            return False, 0.0, True


vector_dedup_service = VectorDedupService()
