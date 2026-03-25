const API_URL = import.meta.env.VITE_API_URL || '/api'

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
    create: (body) => apiFetch('/habits', { method: 'POST', body }),
    addToGroup: (groupId, body) => apiFetch(`/habits/group/${groupId}`, { method: 'POST', body }),
    log: (habitId, body) => apiFetch(`/habits/${habitId}/log`, { method: 'POST', body }),
    vote: (logId, decision) => apiFetch(`/habits/logs/${logId}/vote`, { method: 'POST', body: { decision } }),
  },
  clubs: {
    list: (params) => apiFetch(`/clubs${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (id) => apiFetch(`/clubs/${id}`),
    create: (body) => apiFetch('/clubs', { method: 'POST', body }),
    join: (id) => apiFetch(`/clubs/${id}/join`, { method: 'POST' }),
    leave: (id) => apiFetch(`/clubs/${id}/leave`, { method: 'DELETE' }),
    createChallenge: (id, body) => apiFetch(`/clubs/${id}/challenges`, { method: 'POST', body }),
    joinChallenge: (challengeId) => apiFetch(`/clubs/challenges/${challengeId}/join`, { method: 'POST' }),
    completeChallenge: (challengeId) => apiFetch(`/clubs/challenges/${challengeId}/complete`, { method: 'PUT' }),
  },
  ai: {
    ask: (clubId, message) => apiFetch(`/ai/clubs/${clubId}/ask`, { method: 'POST', body: { message } }),
    suggestions: (clubId) => apiFetch(`/ai/clubs/${clubId}/suggestions`),
  },
  leaderboard: {
    groups: () => apiFetch('/leaderboard/groups'),
  },
  profile: () => apiFetch('/profile'),
  notifications: {
    list: () => apiFetch('/notifications'),
    dismiss: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  },
}
