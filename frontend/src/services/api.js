const API_URL = 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const isFormData = options.body instanceof FormData;
  const query = options.params
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
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signup: (data) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  roles: () => request('/auth/roles'),

  me: () => request('/auth/me'),

  profile: () => request('/users/me'),

  updateProfile: (data) =>
    request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // =========================
  // RBAC test
  // =========================

  userAccess: () => request('/rbac-test/user'),

  contributorAccess: () =>
    request('/rbac-test/contributor'),

  palkhiAccess: () =>
    request('/rbac-test/palkhi-pramukh'),

  adminAccess: () =>
    request('/rbac-test/admin'),

  // =========================
  // Palkhi & Channels
  // =========================
  myPalkhi: () =>
  request('/channels/palkhis/me'),

  channels: () =>
    request('/channels'),

  myChannelMemberships: () =>
  request('/channels/my-memberships'),

  myJoinRequests: () =>
  request('/channels/my-join-requests'),

  channel: (id) =>
    request(`/channels/${id}`),

  channelPosts: (channelId) =>
    request(`/channels/${channelId}/posts`),

  createChannelPost: (channelId, message) =>
    request(`/channels/${channelId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  createChannel: (data) =>
    request('/channels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateChannel: (id, data) =>
    request(`/channels/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // =========================
  // Contributors
  // =========================

  joinChannel: (channelId) =>
  request(`/channels/${channelId}/join-request`, {
    method: 'POST',
  }),

myJoinRequest: (channelId) =>
  request(`/channels/${channelId}/join-request/me`),

channelJoinRequests: (channelId) =>
  request(`/channels/${channelId}/join-requests`),

decideJoinRequest: (channelId, requestId, action) =>
  request(
    `/channels/${channelId}/join-requests/${requestId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        action,
      }),
    }
  ),

  channelContributors: (channelId) =>
    request(`/channels/${channelId}/contributors`),

  addChannelContributor: (channelId, userId) =>
    request(`/channels/${channelId}/contributors`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
      }),
    }),

    

  removeChannelContributor: (channelId, userId) =>
    request(
      `/channels/${channelId}/contributors/${userId}`,
      {
        method: 'DELETE',
      }
    ),
    
    search: (params) =>
  request('/search/', { params }),

    content: (id) => request(`/content/${id}`),

    contentList: (params = {}) => request('/content/', { params }),

    contentSuggestions: (q) => request('/content/suggestions', { params: { q, limit: 6 } }),

    uploadContent: (body) => request('/content/upload', {
      method: 'POST',
      body,
    }),

    updateContent: (id, data) => request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

    deleteContent: (id) => request(`/content/${id}`, {
      method: 'DELETE',
    }),

    likeContent: (id) => request(`/engagement/content/${id}/like`, {
      method: 'POST',
    }),

    saveContent: (id) => request(`/content/${id}/save`, {
      method: 'POST',
    }),

    getComments: (id, skip = 0, limit = 20) =>
      request(`/engagement/content/${id}/comments`, { params: { skip, limit } }),

    addComment: (id, text, parentId = null) => request(`/engagement/content/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text, parent_id: parentId }),
    }),

    deleteComment: (commentId) => request(`/engagement/comment/${commentId}`, {
      method: 'DELETE',
    }),

    trackShare: (id, platform = null) => request(`/engagement/content/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    }),

  
    trackDownload: (id) => request(`/engagement/content/${id}/download`),

    chat: (data) =>
  request('/chat/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // =========================
// Shorts (Aapla Theva)
// =========================

shorts: (params = {}) =>
  request('/shorts/', { params }),

short: (id) =>
  request(`/shorts/${id}`),

};

  export default api;



