import os
import sys
import json
import uuid
from pathlib import Path
from dotenv import load_dotenv

# Automatically load backend .env file
backend_env = Path(__file__).resolve().parents[1] / "Backend" / "sop-backend-python" / ".env"
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
load_dotenv()

from supabase import create_client

def main():
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("ERROR: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) environment variables must be set.", file=sys.stderr)
        sys.exit(1)

    supabase = create_client(supabase_url, supabase_key)

    country = "australia"
    doc_type = "sop"

    # Create a 384-dimensional unit vector
    # Normalized vector where sum of squares equals 1.0
    dim = 384
    val = (1.0 / dim) ** 0.5
    base_embedding = [val] * dim
    
    # Query embedding nearly identical (dot product / cosine similarity ~ 0.999+)
    query_embedding = [val * 0.999 if i % 2 == 0 else val * 1.001 for i in range(dim)]
    # Normalize query embedding
    norm = sum(x**2 for x in query_embedding) ** 0.5
    query_embedding = [x / norm for x in query_embedding]

    gen_id = str(uuid.uuid4())
    version_id = str(uuid.uuid4())

    try:
        # 1. Insert parent generation row
        gen_res = supabase.table("generations").insert({
            "id": gen_id,
            "country": country,
            "doc_type": doc_type,
            "status": "completed"
        }).execute()

        # 2. Insert child generation version with embedding vector
        ver_res = supabase.table("generation_versions").insert({
            "id": version_id,
            "generation_id": gen_id,
            "version_n": 1,
            "content": "Test draft statement content for dedup verification.",
            "embedding": base_embedding
        }).execute()

        # 3. Call match_similar_generations RPC
        rpc_res = supabase.rpc("match_similar_generations", {
            "query_embedding": query_embedding,
            "match_country": country,
            "match_doc_type": doc_type,
            "match_threshold": 0.92,
            "match_count": 1
        }).execute()

        # Print raw response to stdout
        print(json.dumps(rpc_res.data, indent=2))

        # Check if any returned match has similarity >= 0.92
        matched = False
        if rpc_res.data:
            for item in rpc_res.data:
                if item.get("similarity", 0) >= 0.92:
                    matched = True
                    break

        if matched:
            sys.exit(0)
        else:
            sys.exit(1)

    except Exception as e:
        print(f"RPC Execution Error: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        # Cleanup inserted test rows
        try:
            supabase.table("generation_versions").delete().eq("id", version_id).execute()
            supabase.table("generations").delete().eq("id", gen_id).execute()
        except Exception:
            pass

if __name__ == "__main__":
    main()
