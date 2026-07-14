from supabase import create_client, Client
from app import config

if not config.SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set in the configuration.")

# Public client
supabase: Client = create_client(config.SUPABASE_URL, config.SUPABASE_ANON_KEY or config.SUPABASE_SERVICE_KEY)

# Admin/Service client to bypass RLS for background log updates
supabase_admin: Client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY or config.SUPABASE_ANON_KEY)
