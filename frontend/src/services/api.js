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
    throw new Error(data?.detail || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  signup: (data) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  roles: () => request('/auth/roles'),
  me: () => request('/auth/me'),
  profile: () => request('/users/me'),

  updateProfile: (data) => request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  userAccess: () => request('/rbac-test/user'),
  contributorAccess: () => request('/rbac-test/contributor'),
  palkhiAccess: () => request('/rbac-test/palkhi-pramukh'),
  adminAccess: () => request('/rbac-test/admin'),
};
