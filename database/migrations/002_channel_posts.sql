-- Text-only posts for channel conversations.
-- Run after the channels and users tables exist.

CREATE TABLE IF NOT EXISTS public.channel_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL CHECK (length(btrim(message)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS channel_posts_channel_created_idx
    ON public.channel_posts (channel_id, created_at);

-- Existing channel attachments are already channel-approved content.
UPDATE public.contents
SET status = 'published',
    verified = TRUE
WHERE channel_id IS NOT NULL;

ALTER TABLE public.channel_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS channel_posts_select_authenticated ON public.channel_posts;
CREATE POLICY channel_posts_select_authenticated
    ON public.channel_posts FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS channel_posts_insert_contributors ON public.channel_posts;
CREATE POLICY channel_posts_insert_contributors
    ON public.channel_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.channel_contributors cc
            WHERE cc.channel_id = channel_posts.channel_id
              AND cc.user_id = auth.uid()
        )
    );

DROP TRIGGER IF EXISTS set_channel_posts_updated_at ON public.channel_posts;
CREATE OR REPLACE FUNCTION public.set_channel_posts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_channel_posts_updated_at
    BEFORE UPDATE ON public.channel_posts
    FOR EACH ROW EXECUTE FUNCTION public.set_channel_posts_updated_at();

-- Add these rows to the existing route permission seed/configuration.
INSERT INTO public.route_permissions
    (method, route_path, permission_id, requires_auth, is_active)
SELECT mapping.method, mapping.route_path, p.id, TRUE, TRUE
FROM (VALUES
    ('GET',  '/channels/{channel_id}/posts', 'view_channel'),
    ('POST', '/channels/{channel_id}/posts', 'contribute')
) AS mapping(method, route_path, permission_name)
JOIN public.permissions p ON p.name = mapping.permission_name
ON CONFLICT (method, route_path)
DO UPDATE SET
    permission_id = EXCLUDED.permission_id,
    requires_auth = TRUE,
    is_active = TRUE;