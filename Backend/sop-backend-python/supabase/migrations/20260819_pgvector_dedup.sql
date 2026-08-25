-- ==============================================================================
-- Migration: Supabase pgvector Setup for Cross-User Duplicate Detection
-- ==============================================================================

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add 1536-dimensional vector embedding column to generation_versions table
ALTER TABLE generation_versions 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create HNSW Index for fast Cosine Similarity matching
-- HNSW (Hierarchical Navigable Small World) provides superior query throughput over IVFFlat
CREATE INDEX IF NOT EXISTS idx_generation_versions_embedding_hnsw 
ON generation_versions 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Define RPC function for vector similarity matching with country & doc_type scoping
CREATE OR REPLACE FUNCTION match_similar_generations(
    query_embedding vector(1536),
    match_country text DEFAULT '',
    match_doc_type text DEFAULT '',
    match_threshold float DEFAULT 0.92,
    match_count int DEFAULT 1
)
RETURNS TABLE (
    generation_id uuid,
    version_id uuid,
    similarity float,
    country text,
    doc_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gv.generation_id,
        gv.id AS version_id,
        (1 - (gv.embedding <=> query_embedding))::float AS similarity,
        g.country,
        g.doc_type
    FROM generation_versions gv
    JOIN generations g ON gv.generation_id = g.id
    WHERE gv.embedding IS NOT NULL
      AND (match_country = '' OR g.country = match_country)
      AND (match_doc_type = '' OR g.doc_type = match_doc_type)
      AND (1 - (gv.embedding <=> query_embedding)) >= match_threshold
    ORDER BY gv.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 5. Grant permissions to authenticated and service_role
GRANT EXECUTE ON FUNCTION match_similar_generations(vector(1536), text, text, float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_similar_generations(vector(1536), text, text, float, int) TO service_role;
