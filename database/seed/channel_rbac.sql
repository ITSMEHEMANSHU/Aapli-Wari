-- Channel and Palkhi permissions and route mappings.
-- Run after roles, permissions, and route_permissions exist.

INSERT INTO public.permissions (name)
VALUES
    ('create_palkhi'),
    ('manage_channel'),
    ('manage_channel_contributors'),
    ('view_channel'),
    ('verify_channel'),
    ('contribute'),
    ('manage_palkhi')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'palkhi_pramukh'
  AND p.name IN (
      'create_palkhi',
      'manage_channel',
      'manage_channel_contributors',
      'manage_palkhi'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
  AND p.name IN ('verify_channel', 'manage_channel', 'manage_palkhi')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('user', 'contributor', 'palkhi_pramukh', 'admin')
  AND p.name = 'view_channel'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'contributor'
  AND p.name = 'contribute'
ON CONFLICT DO NOTHING;

INSERT INTO public.route_permissions
    (method, route_path, permission_id, requires_auth, is_active)
SELECT mapping.method, mapping.route_path, p.id, TRUE, TRUE
FROM (VALUES
    ('POST',   '/channels/palkhis',                                'create_palkhi'),
    ('GET',    '/channels/palkhis/me',                             'create_palkhi'),
    ('POST',   '/channels',                                        'manage_channel'),
    ('GET',    '/channels',                                        'view_channel'),
    ('GET',    '/channels/my-memberships',                         'view_channel'),
    ('GET',    '/channels/my-join-requests',                       'contribute'),
    ('GET',    '/channels/{channel_id}',                            'view_channel'),
    ('PATCH',  '/channels/{channel_id}',                            'manage_channel'),
    ('PATCH',  '/channels/{channel_id}/status',                     'manage_channel'),
    ('POST',   '/channels/{channel_id}/join-request',               'contribute'),
    ('GET',    '/channels/{channel_id}/join-request/me',            'contribute'),
    ('GET',    '/channels/{channel_id}/join-requests',              'manage_palkhi'),
    ('PATCH',  '/channels/{channel_id}/join-requests/{request_id}',  'manage_palkhi'),
    ('GET',    '/channels/{channel_id}/contributors',               'view_channel'),
    ('POST',   '/channels/{channel_id}/contributors',               'manage_channel_contributors'),
    ('DELETE', '/channels/{channel_id}/contributors/{user_id}',     'manage_channel_contributors')
) AS mapping(method, route_path, permission_name)
JOIN public.permissions p ON p.name = mapping.permission_name
ON CONFLICT (method, route_path)
DO UPDATE SET
    permission_id = EXCLUDED.permission_id,
    requires_auth = TRUE,
    is_active = TRUE;
