import os
from supabase import create_client

url = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", ""))
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))


class _UnconfiguredSupabase:
    """Stand-in used when Supabase env vars aren't set, so importing this
    module never crashes the app. Only raises if a route actually tries
    to use Supabase (challenges/snippets/conversations)."""
    def __getattr__(self, name):
        raise RuntimeError(
            "Supabase is not configured on this deployment "
            "(missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
        )


supabase = create_client(url, key) if url and key else _UnconfiguredSupabase()
