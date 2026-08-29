-- Allow authenticated content owners/admins to replace an uploaded file.
INSERT INTO public.route_permissions (method, route_path, permission_id, requires_auth, is_active)
VALUES (
    'PUT',
    '/content/{content_id}/file',
    (SELECT permission_id FROM public.route_permissions WHERE route_path = '/users/me' LIMIT 1),
    TRUE,
    TRUE
)
ON CONFLICT (method, route_path)
DO UPDATE SET
    requires_auth = TRUE,
    is_active = TRUE;
