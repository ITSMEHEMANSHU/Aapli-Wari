-- Register the trailing-slash FastAPI search route as a public endpoint.

INSERT INTO public.permissions (name)
VALUES ('explore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.route_permissions
    (method, route_path, permission_id, requires_auth, is_active)
SELECT 'GET', '/search/', id, FALSE, TRUE
FROM public.permissions
WHERE name = 'explore'
ON CONFLICT (method, route_path)
DO UPDATE SET
    permission_id = EXCLUDED.permission_id,
    requires_auth = FALSE,
    is_active = TRUE;