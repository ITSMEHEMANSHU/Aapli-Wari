-- Add route_permission for POST /auth/register-palkhi-pramukh as public route (requires_auth = false)

INSERT INTO public.route_permissions (id, method, route_path, permission_id, requires_auth, is_active)
SELECT 
    gen_random_uuid(),
    'POST',
    '/auth/register-palkhi-pramukh',
    p.id,
    FALSE,
    TRUE
FROM public.permissions p
WHERE p.name = 'public_access'
ON CONFLICT (method, route_path)
DO UPDATE SET
    permission_id = EXCLUDED.permission_id,
    requires_auth = FALSE,
    is_active = TRUE;
