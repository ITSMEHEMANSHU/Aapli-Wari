-- Keep the live Supabase schema aligned with the application models.
-- Run this only after the existing tables have been created.

ALTER TABLE public.users
ALTER COLUMN role_id DROP NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'route_permissions_method_route_path_key'
    ) THEN
        ALTER TABLE public.route_permissions
        DROP CONSTRAINT route_permissions_method_route_path_key;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS channel_join_requests_pending_unique
ON public.channel_join_requests (channel_id, user_id)
WHERE status = 'pending';