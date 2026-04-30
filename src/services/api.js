import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ndambuki.alwaysdata.net/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('collabx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — skip auth routes to avoid redirect loop on bad credentials
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('collabx_token');
      localStorage.removeItem('collabx_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Reusable error message helper — handles API errors, timeouts, and unknowns
export const getErrorMessage = (err, fallback = 'Something went wrong.') => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  return fallback;
};

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Users
// NOTE: /users/ needs trailing slash — Flask blueprint registers '/' under /api/users.
// Without it Flask redirects to /users/ which breaks CORS preflight.
// Specific sub-routes (/suggestions, /talent/:t, /:id) are fine without trailing slash.
export const usersAPI = {
  getUsers: (params) => api.get('/users/', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  getSuggestions: () => api.get('/users/suggestions'),
  getUsersByTalent: (talent, params) => api.get(`/users/talent/${talent}`, { params }),
  getOnlineUsers: () => api.get('/users/online'),
};

// Teams
// NOTE: /teams/ needs trailing slash — Flask blueprint registers '/' and '/' (POST)
// under the /api/teams prefix. Same redirect-kills-CORS issue as /dashboard/.
export const teamsAPI = {
  createTeam: (data) => api.post('/teams/', data),
  getTeams: (params) => api.get('/teams/', { params }),
  getMyTeams: () => api.get('/teams/my'),
  getTeamById: (id) => api.get(`/teams/${id}`),
  inviteUser: (teamId, data) => api.post(`/teams/${teamId}/invite`, data),
  respondToInvitation: (inviteId, status) => api.put(`/teams/invitations/${inviteId}/respond`, { status }),
  getMyInvitations: () => api.get('/teams/invitations'),
};

// Messages
export const messagesAPI = {
  getTeamMessages: (teamId, params) => api.get(`/messages/team/${teamId}`, { params }),
  sendTeamMessage: (teamId, data) => api.post(`/messages/team/${teamId}`, data),
  getDirectMessages: (userId) => api.get(`/messages/direct/${userId}`),
  sendDirectMessage: (userId, data) => api.post(`/messages/direct/${userId}`, data),
  getConversations: () => api.get('/messages/conversations'),
};

// Dashboard
// NOTE: /dashboard/ needs the trailing slash because the Flask blueprint
// registers the route as '/' under the /api/dashboard prefix. Without it,
// Flask issues a redirect which breaks CORS preflight requests.
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard/'),
  getNotifications: () => api.get('/dashboard/notifications'),
  markNotificationsRead: () => api.put('/dashboard/notifications/read'),
  deleteNotification: (id) => api.delete('/dashboard/notifications/delete', { data: { id } }),
  clearAllNotifications: () => api.delete('/dashboard/notifications/delete', {
    data: {},
    headers: { 'Content-Type': 'application/json' },
  }),
};

export default api;