import api, { unwrap, unwrapList } from '../lib/axios';

const createCrudService = (basePath) => ({
  list: async (params) => unwrapList(await api.get(basePath, { params })),
  get: async (id) => unwrap(await api.get(`${basePath}/${id}`)),
  create: async (data) => unwrap(await api.post(basePath, data)),
  update: async (id, data) => unwrap(await api.patch(`${basePath}/${id}`, data)),
  delete: async (id) => unwrap(await api.delete(`${basePath}/${id}`)),
  updateStatus: async (id, statusData) => unwrap(await api.patch(`${basePath}/${id}/status`, statusData)),
});

export const usersService = {
  ...createCrudService('/users'),
  updateUserStatus: async (id, status) => unwrap(await api.patch(`/users/${id}/status`, { status })),
};

export const rolesService = {
  ...createCrudService('/roles'),
  getPermissions: async (id) => unwrap(await api.get(`/roles/${id}/permissions`)),
  updatePermissions: async (id, permissionIds) => unwrap(await api.put(`/roles/${id}/permissions`, { permissionIds })),
};

export const permissionsService = {
  list: async (params) => unwrap(await api.get('/permissions', { params })),
  grouped: async () => unwrap(await api.get('/permissions/grouped')),
};

export const settingsService = {
  list: async () => unwrap(await api.get('/settings')),
  get: async (key) => unwrap(await api.get(`/settings/${key}`)),
  update: async (key, data) => unwrap(await api.patch(`/settings/${key}`, data)),
};

export const auditLogsService = {
  list: async (params) => unwrapList(await api.get('/audit-logs', { params })),
};

export const platformsService = {
  ...createCrudService('/platforms'),
  updateActive: async (id, isActive) => unwrap(await api.patch(`/platforms/${id}/status`, { isActive })),
};

export const boardsService = createCrudService('/boards');
export const campaignsService = createCrudService('/campaigns');
export const taskTypesService = {
  ...createCrudService('/task-types'),
  updateActive: async (id, isActive) => unwrap(await api.patch(`/task-types/${id}/status`, { isActive })),
};

export const postLinksService = {
  ...createCrudService('/post-links'),
  reorder: async (data) => unwrap(await api.patch('/post-links/reorder', data)),
};

export const teamsService = {
  ...createCrudService('/teams'),
  updateActive: async (id, isActive) => unwrap(await api.patch(`/teams/${id}/status`, { isActive })),
  getMembers: async (teamId) => unwrap(await api.get(`/teams/${teamId}/members`)),
  addMembers: async (teamId, data) => unwrap(await api.post(`/teams/${teamId}/members`, data)),
  updateMember: async (id, data) => unwrap(await api.patch(`/team-members/${id}`, data)),
  removeMember: async (id) => unwrap(await api.delete(`/team-members/${id}`)),
};

export const assignmentsService = {
  list: async (params) => unwrapList(await api.get('/task-assignments', { params })),
  get: async (id) => unwrap(await api.get(`/task-assignments/${id}`)),
  create: async (data) => unwrap(await api.post('/task-assignments', data)),
  start: async (id) => unwrap(await api.patch(`/task-assignments/${id}/start`)),
  submit: async (id, data) => unwrap(await api.patch(`/task-assignments/${id}/submit`, data)),
  approve: async (id) => unwrap(await api.patch(`/task-assignments/${id}/approve`)),
  reject: async (id, data) => unwrap(await api.patch(`/task-assignments/${id}/reject`, data)),
  cancel: async (id) => unwrap(await api.patch(`/task-assignments/${id}/cancel`)),
  getActivity: async (id) => unwrap(await api.get(`/task-assignments/${id}/activity`)),
};

export const commentSuggestionsService = {
  ...createCrudService('/comment-suggestions'),
  bulkCreate: async (data) => unwrap(await api.post('/comment-suggestions/bulk', data)),
  generateManualSet: async (data) => unwrap(await api.post('/comment-suggestions/generate-manual-set', data)),
  updateActive: async (id, isActive) => unwrap(await api.patch(`/comment-suggestions/${id}/status`, { isActive })),
};

export const proofsService = {
  list: async (params) => unwrapList(await api.get('/proofs', { params })),
  get: async (id) => unwrap(await api.get(`/proofs/${id}`)),
  create: async (formData) => unwrap(await api.post('/proofs', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  approve: async (id) => unwrap(await api.patch(`/proofs/${id}/approve`)),
  reject: async (id, data) => unwrap(await api.patch(`/proofs/${id}/reject`, data)),
  delete: async (id) => unwrap(await api.delete(`/proofs/${id}`)),
};

export const dashboardService = {
  getStats: async () => unwrap(await api.get('/dashboard/stats')),
  getBoardStats: async (boardId) => unwrap(await api.get(`/dashboard/boards/${boardId}/stats`)),
};

export const workspaceService = {
  getOverview: async () => unwrap(await api.get('/workspace/overview')),
  getBoardKanban: async (boardId) => unwrap(await api.get(`/workspace/boards/${boardId}/kanban`)),
  getCampaignKanban: async (campaignId) => unwrap(await api.get(`/workspace/campaigns/${campaignId}/kanban`)),
  getMyWork: async () => unwrap(await api.get('/workspace/my-work')),
  getReviewQueue: async () => unwrap(await api.get('/workspace/reviews/queue')),
};

const downloadCsv = async (path, params, filename) => {
  const response = await api.get(path, { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const reportsService = {
  getOverview: async () => unwrap(await api.get('/reports/overview')),
  getCampaigns: async (params) => unwrap(await api.get('/reports/campaigns', { params })),
  getTeams: async (params) => unwrap(await api.get('/reports/teams', { params })),
  getMembers: async (params) => unwrap(await api.get('/reports/members', { params })),
  getTasks: async (params) => unwrap(await api.get('/reports/tasks', { params })),
  getActivity: async (params) => unwrap(await api.get('/reports/activity', { params })),
  exportCampaigns: (params, filename) => downloadCsv('/reports/campaigns/export', params, filename),
  exportTeams: (params, filename) => downloadCsv('/reports/teams/export', params, filename),
  exportMembers: (params, filename) => downloadCsv('/reports/members/export', params, filename),
  exportTasks: (params, filename) => downloadCsv('/reports/tasks/export', params, filename),
  exportActivity: (params, filename) => downloadCsv('/reports/activity/export', params, filename),
};

export const notificationsService = {
  list: async (params) => unwrapList(await api.get('/notifications', { params })),
  getUnreadCount: async () => unwrap(await api.get('/notifications/unread-count')),
  markAsRead: async (id) => unwrap(await api.patch(`/notifications/${id}/read`)),
  markAllAsRead: async () => unwrap(await api.patch('/notifications/mark-all-read')),
  delete: async (id) => unwrap(await api.delete(`/notifications/${id}`)),
};

export const tasksService = {
  ...createCrudService('/tasks'),
  getActivity: async (taskId) => unwrap(await api.get(`/tasks/${taskId}/activity`)),
  getAvailableMembers: async (taskId) => unwrap(await api.get(`/tasks/${taskId}/available-members`)),
  assignTeamMembers: async (taskId, data) => unwrap(await api.post(`/tasks/${taskId}/assign-team-members`, data)),
  getAvailableCommentSuggestions: async (taskId) => unwrap(await api.get(`/tasks/${taskId}/available-comment-suggestions`)),
};
