from app.utils.supabase_client import supabase

print("⚡ Checking available tables in your Supabase database...")

potential_tables = ["generations", "sop_generations", "generated_sops", "sops", "profiles", "sop_evaluations"]

for table in potential_tables:
    try:
        res = supabase.table(table).select("*").limit(1).execute()
        print(f"✅ Table '{table}' exists and is accessible!")
    except Exception as e:
        err_msg = str(e)
        if "PGRST205" in err_msg or "Could not find the table" in err_msg:
            print(f"❌ Table '{table}' does NOT exist.")
        else:
            print(f"⚠️ Table '{table}' exists but returned error: {err_msg[:100]}...")
