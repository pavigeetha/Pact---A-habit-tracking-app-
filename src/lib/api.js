const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`

function getToken() {
  return localStorage.getItem('pact_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('pact_token', token)
  else localStorage.removeItem('pact_token')
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  auth: {
    register: (body) => apiFetch('/auth/register', { method: 'POST', body }),
    login: (body) => apiFetch('/auth/login', { method: 'POST', body }),
    me: () => apiFetch('/auth/me'),
  },
  dashboard: () => apiFetch('/dashboard'),
  groups: {
    list: () => apiFetch('/groups'),
    get: (id) => apiFetch(`/groups/${id}`),
    create: (body) => apiFetch('/groups', { method: 'POST', body }),
    join: (code) => apiFetch('/groups/join', { method: 'POST', body: { code } }),
  },
  habits: {
    log: (habitId, body) => apiFetch(`/habits/${habitId}/log`, { method: 'POST', body }),
    vote: (logId, decision) => apiFetch(`/habits/logs/${logId}/vote`, { method: 'POST', body: { decision } }),
  },
  profile: () => apiFetch('/profile'),
  notifications: {
    list: () => apiFetch('/notifications'),
    dismiss: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  },
}
