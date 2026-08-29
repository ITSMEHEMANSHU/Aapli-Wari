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
    ('manage_palkhi'),
    ('explore')
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
    ('DELETE', '/channels/{channel_id}/contributors/{user_id}',     'manage_channel_contributors'),
    ('GET',    '/channels/{channel_id}/posts',                       'view_channel'),
    ('POST',   '/channels/{channel_id}/posts',                       'contribute'),
    ('GET',    '/channels/{channel_id}/follow-status',               'view_channel'),
    ('POST',   '/channels/{channel_id}/follow',                      'view_channel'),
    ('DELETE', '/channels/{channel_id}/follow',                      'view_channel'),
    ('POST',   '/channels/{channel_id}/announcements',               'manage_channel'),
    ('PATCH',  '/channels/{channel_id}/emergency-contact',            'manage_channel'),
    ('GET',    '/admin/stats',                                        'manage_palkhi'),
    ('GET',    '/admin/users',                                        'manage_palkhi'),
    ('PATCH',  '/admin/users/{user_id}/role',                         'manage_palkhi'),
    ('PATCH',  '/admin/users/{user_id}/status',                       'manage_palkhi'),
    ('GET',    '/admin/content',                                      'manage_palkhi'),
    ('DELETE', '/admin/content/{content_id}',                         'manage_palkhi'),
    ('GET',    '/admin/channels',                                     'manage_palkhi'),
    ('PATCH',  '/admin/channels/{channel_id}/status',                 'manage_palkhi')
    ,('GET',    '/content/',                                        'view_channel')
    ,('POST',   '/content/upload',                                  'contribute')
) AS mapping(method, route_path, permission_name)
JOIN public.permissions p ON p.name = mapping.permission_name
ON CONFLICT (method, route_path)
DO UPDATE SET
    permission_id = EXCLUDED.permission_id,
    requires_auth = TRUE,
    is_active = TRUE;

  INSERT INTO public.route_permissions
    (method, route_path, permission_id, requires_auth, is_active)
  SELECT 'GET', '/search/', p.id, FALSE, TRUE
  FROM public.permissions p
  WHERE p.name = 'explore'
  ON CONFLICT (method, route_path)
  DO UPDATE SET
    permission_id = EXCLUDED.permission_id,
    requires_auth = FALSE,
    is_active = TRUE;
