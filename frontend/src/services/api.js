const API_URL = 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const isFormData = options.body instanceof FormData;

  const query =
    options.params && Object.keys(options.params).length > 0
      ? `?${new URLSearchParams(options.params).toString()}`
      : '';

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = `${API_URL}${endpoint}${query}`;
  console.log(`[API] ${options.method || 'GET'} ${fullUrl}`, options.params || '');

  let response;
  try {
    response = await fetch(fullUrl, { ...options, headers });
  } catch (networkErr) {
    console.error(`[API] Network error on ${endpoint}:`, networkErr);
    throw networkErr;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(`[API] ${response.status} ${endpoint}`, data);
    throw new Error(data?.detail || `Request failed with status ${response.status}`);
  }

  console.log(`[API] ${response.status} ${endpoint}`, data);
  return data;
}

export const api = {
  // =========================
  // Authentication
  // =========================
  login: (data) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  signup: (data) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  registerPalkhiPramukh: (data) =>
    request('/auth/register-palkhi-pramukh', { method: 'POST', body: JSON.stringify(data) }),

  applyContributor: (data) =>
    request('/auth/apply-contributor', { method: 'POST', body: JSON.stringify(data) }),

  applyPalkhiPramukh: (data) =>
    request('/auth/apply-palkhi-pramukh', { method: 'POST', body: JSON.stringify(data) }),

  roles: () => request('/auth/roles'),
  me: () => request('/auth/me'),

  // =========================
  // User Profile
  // =========================
  profile: () => request('/users/me'),
  updateProfile: (data) =>
    request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  getMyPermissions: () => request('/users/me/permissions'),

  // =========================
  // RBAC test
  // =========================
  userAccess: () => request('/rbac-test/user'),
  contributorAccess: () => request('/rbac-test/contributor'),
  palkhiAccess: () => request('/rbac-test/palkhi-pramukh'),
  adminAccess: () => request('/rbac-test/admin'),

  // =========================
  // Palkhi
  // =========================
  createPalkhi: (data) =>
    request('/channels/palkhis', { method: 'POST', body: JSON.stringify(data) }),

  myPalkhi: () => request('/channels/palkhis/me'),

  // =========================
  // Channels
  // =========================
  channels: (params = {}) => request('/channels', { params }),

  channel: (id) => request(`/channels/${id}`),

  createChannel: (data) =>
    request('/channels', { method: 'POST', body: JSON.stringify(data) }),

  updateChannel: (id, data) =>
    request(`/channels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  changeChannelStatus: (id, newStatus) =>
    request(`/channels/${id}/status`, {
      method: 'PATCH',
      params: { new_status: newStatus },
    }),

  // =========================
  // Channel Posts
  // =========================
  channelPosts: (channelId) => request(`/channels/${channelId}/posts`),

  createChannelPost: (channelId, messageOrData) => {
    const payload = typeof messageOrData === 'string'
      ? { message: messageOrData }
      : (messageOrData && typeof messageOrData.message === 'string' ? { message: messageOrData.message } : messageOrData);
    return request(`/channels/${channelId}/posts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // =========================
  // Announcements
  // =========================
  createAnnouncement: (channelId, data) =>
    request(`/channels/${channelId}/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // =========================
  // Emergency Contact
  // =========================
  updateEmergencyContact: (channelId, data) =>
    request(`/channels/${channelId}/emergency-contact`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // =========================
  // Follow / Unfollow
  // =========================
  followChannel: (channelId) =>
    request(`/channels/${channelId}/follow`, { method: 'POST' }),

  unfollowChannel: (channelId) =>
    request(`/channels/${channelId}/follow`, { method: 'DELETE' }),

  getFollowStatus: (channelId) =>
    request(`/channels/${channelId}/follow-status`),

  getFollowStatusBatch: (channelIds) =>
    request('/channels/follow-status-batch', { params: { ids: channelIds.join(',') } }),

  // =========================
  // Contributors
  // =========================
  channelContributors: (channelId) =>
    request(`/channels/${channelId}/contributors`),

  addChannelContributor: (channelId, userId) =>
    request(`/channels/${channelId}/contributors`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),

  removeChannelContributor: (channelId, userId) =>
    request(`/channels/${channelId}/contributors/${userId}`, { method: 'DELETE' }),

  // =========================
  // Join Requests
  // =========================
  joinChannel: (channelId) =>
    request(`/channels/${channelId}/join-request`, { method: 'POST' }),

  myJoinRequest: (channelId) =>
    request(`/channels/${channelId}/join-request/me`),

  myJoinRequests: () => request('/channels/my-join-requests'),

  channelJoinRequests: (channelId) =>
    request(`/channels/${channelId}/join-requests`),

  decideJoinRequest: (channelId, requestId, action) =>
    request(`/channels/${channelId}/join-requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),

  // =========================
  // Channel Memberships
  // =========================
  myChannelMemberships: () => request('/channels/my-memberships'),

  // =========================
  // Content
  // =========================
  content: (id) => request(`/content/${id}`),
  getContent: (id) => request(`/content/${id}`),
  contentList: (params = {}) => request('/content/', { params }),
  contentSuggestions: (q) => request('/content/suggestions', { params: { q, limit: 6 } }),
  getMyContributions: () => request('/content/my/contributions'),
  uploadContent: (body) => request('/content/upload', { method: 'POST', body }),
  updateContent: (id, data) => request(`/content/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  replaceContentFile: (id, body) => request(`/content/${id}/file`, { method: 'PUT', body }),
  deleteContent: (id) => request(`/content/${id}`, { method: 'DELETE' }),

  // =========================
  // Engagement
  // =========================
  likeContent: (id) => request(`/engagement/content/${id}/like`, { method: 'POST' }),
  saveContent: (id) => request(`/content/${id}/save`, { method: 'POST' }),
  getComments: (id, skip = 0, limit = 20) =>
    request(`/engagement/content/${id}/comments`, { params: { skip, limit } }),
  addComment: (id, text, parentId = null) =>
    request(`/engagement/content/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, parent_id: parentId }),
    }),
  deleteComment: (commentId) =>
    request(`/engagement/comment/${commentId}`, { method: 'DELETE' }),
  trackShare: (id, platform = null) =>
    request(`/engagement/content/${id}/share`, { method: 'POST', body: JSON.stringify({ platform }) }),
  trackDownload: (id) => request(`/engagement/content/${id}/download`),

  // =========================
  // Chat
  // =========================
  chat: (data) => request('/chat/', { method: 'POST', body: JSON.stringify(data) }),

  // =========================
  // Shorts (Aapla Theva)
  // =========================
  shorts: (params = {}) => request('/shorts/', { params }),
  short: (id) => request(`/shorts/${id}`),

  // =========================
  // Amenities (Map)
  // =========================
  getAmenities: (params = {}) => request('/amenities', { params }),
  addAmenity: (data) => request('/amenities', { method: 'POST', body: JSON.stringify(data) }),
  deleteAmenity: (id) => request(`/amenities/${id}`, { method: 'DELETE' }),
  getPalkhiLocations: () => request('/palkhis/live-locations'),

  // =========================
  // Search
  // =========================
  search: (params) => request('/search/', { params }),

  // =========================
  // Admin
  // =========================
  users: (params = {}) => request('/admin/users', { params }),
  updateUserRole: (userId, role) =>
    request(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  updateUserStatus: (userId, isActive) =>
    request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    }),
  getAdminStats: () => request('/admin/stats'),
};

export default api;
