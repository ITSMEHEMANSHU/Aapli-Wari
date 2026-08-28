-- Engagement tables and RBAC route registrations for the UUID-based application schema.
CREATE TABLE IF NOT EXISTS public.likes (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, content_id)
);
CREATE INDEX IF NOT EXISTS ix_likes_content_id ON public.likes (content_id);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(trim(text)) > 0),
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_comments_content_id ON public.comments (content_id);
CREATE INDEX IF NOT EXISTS ix_comments_parent_id ON public.comments (parent_id);

CREATE TABLE IF NOT EXISTS public.shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_shares_content_id ON public.shares (content_id);

CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_downloads_content_id ON public.downloads (content_id);

INSERT INTO public.permissions (name) VALUES ('engagement') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.route_permissions (method, route_path, permission_id, requires_auth, is_active)
SELECT route.method, route.path, permissions.id, route.requires_auth, TRUE
FROM (VALUES
    ('POST', '/engagement/content/{content_id}/like', TRUE),
    ('GET', '/engagement/content/{content_id}/comments', FALSE),
    ('POST', '/engagement/content/{content_id}/comments', TRUE),
    ('DELETE', '/engagement/comment/{comment_id}', TRUE),
    ('POST', '/engagement/content/{content_id}/share', FALSE),
    ('GET', '/engagement/content/{content_id}/download', FALSE)
) AS route(method, path, requires_auth)
CROSS JOIN public.permissions AS permissions
WHERE permissions.name = 'engagement'
ON CONFLICT (method, route_path) DO UPDATE SET
    permission_id = EXCLUDED.permission_id,
    requires_auth = EXCLUDED.requires_auth,
    is_active = TRUE;
