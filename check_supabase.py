import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app.core.supabase import supabase

response = supabase.auth.admin.get_user_by_id('55a8f049-9cdd-41cd-b78a-ae891fdaad6e')
print(response)

print("\nListing all Supabase users:")
users = supabase.auth.admin.list_users()
for u in users.users:
    print(f"ID={u.id}, Email={u.email}")
