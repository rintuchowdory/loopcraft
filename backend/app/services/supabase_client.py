import os

from supabase import create_client

url = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", ""))
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))

supabase = create_client(url, key)
