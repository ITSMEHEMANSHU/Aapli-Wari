const API_URL = 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || `Request failed with status ${response.status}`
    );
  }

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

  channel: (id) =>
    request(`/channels/${id}`),

  myChannelMemberships: () =>
  request('/channels/my-memberships'),

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
};



