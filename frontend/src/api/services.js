import api from './axios';

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/api/auth/register', { name, email, password, role }),
};

export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  getById: (id) => api.get(`/api/users/${id}`),
  updateProfile: (data) => api.put('/api/users/profile', data),
  changePassword: (data) => api.put('/api/users/password', data),
  getDashboard: () => api.get('/api/users/dashboard'),
  getStudents: () => api.get('/api/users/students'),
  getClients: () => api.get('/api/users/clients'),
  uploadAvatar: (formData) => api.post('/api/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const projectAPI = {
  getAll: (search) => api.get('/api/projects', { params: { search } }),
  getById: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects', data),
  getMyClientProjects: () => api.get('/api/projects/my/client'),
  getMyStudentProjects: () => api.get('/api/projects/my/student'),
  assignStudent: (projectId, bidId) => api.post(`/api/projects/${projectId}/assign/${bidId}`),
  complete: (projectId) => api.post(`/api/projects/${projectId}/complete`),
  getStats: () => api.get('/api/projects/stats'),
};

export const bidAPI = {
  place: (data) => api.post('/api/bids', data),
  getForProject: (projectId) => api.get(`/api/bids/project/${projectId}`),
  getMy: () => api.get('/api/bids/my'),
};

export const paymentAPI = {
  initiate: (data) => api.post('/api/payments/initiate', data),
  release: (paymentId) => api.post(`/api/payments/${paymentId}/release`),
  getMy: () => api.get('/api/payments/my'),
};

export const submissionAPI = {
  submit: (formData) => api.post('/api/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getForProject: (projectId) => api.get(`/api/submissions/project/${projectId}`),
  review: (id, status, feedback) => api.put(`/api/submissions/${id}/review`, null, { params: { status, feedback } }),
};

export const messageAPI = {
  send: (data) => api.post('/api/messages', data),
  getConversation: (otherId) => api.get(`/api/messages/conversation/${otherId}`),
  getPartners: () => api.get('/api/messages/partners'),
  getUnreadCount: () => api.get('/api/messages/unread'),
};

export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  markAllRead: () => api.put('/api/notifications/read-all'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
};

export const reviewAPI = {
  create: (data) => api.post('/api/reviews', data),
  getForUser: (userId) => api.get(`/api/reviews/user/${userId}`),
};

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
  toggleUser: (id) => api.put(`/api/admin/users/${id}/toggle`),
  getProjects: () => api.get('/api/admin/projects'),
  getPayments: () => api.get('/api/admin/payments'),
};
