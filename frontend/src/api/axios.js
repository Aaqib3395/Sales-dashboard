import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry && err.response?.data?.code === 'TOKEN_EXPIRED') {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem('accessToken', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updatePreferences = (data) => api.put('/auth/preferences', data);

// Dashboard
export const getDashboardKPIs = (params) => api.get('/dashboard/kpis', { params });
export const getDashboardTrend = (params) => api.get('/dashboard/trend', { params });
export const getDashboardPipeline = () => api.get('/dashboard/pipeline');
export const getDashboardLeaderboard = (params) => api.get('/dashboard/leaderboard', { params });

// Employees
export const getEmployees = (params) => api.get('/employees', { params });
export const getEmployeePerformance = (params) => api.get('/employees/performance', { params });
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const getEmployeeStats = (id, params) => api.get(`/employees/${id}/stats`, { params });
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Sales
export const getSales = (params) => api.get('/sales', { params });
export const getKanban = (params) => api.get('/sales/kanban', { params });
export const createSale = (data) => api.post('/sales', data);
export const updateSale = (id, data) => api.put(`/sales/${id}`, data);
export const updateSaleStatus = (id, status) => api.patch(`/sales/${id}/status`, { status });
export const deleteSale = (id) => api.delete(`/sales/${id}`);
export const getExportData = (params) => api.get('/sales/export', { params });

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

// Analytics
export const getAnalyticsForecast = () => api.get('/analytics/forecast');
export const getAnalyticsGrowth = () => api.get('/analytics/growth');
export const getAnalyticsWinLoss = () => api.get('/analytics/win-loss');
export const getAnalyticsDealSize = () => api.get('/analytics/deal-size');
export const getAnalyticsHeatmap = () => api.get('/analytics/heatmap');
export const getAnalyticsCycleLength = () => api.get('/analytics/cycle-length');

// Clients
export const getClients = (params) => api.get('/clients', { params });
export const getClient = (id) => api.get(`/clients/${id}`);
export const createClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

// Goals
export const getGoals = (params) => api.get('/goals', { params });
export const getGoalHistory = (employeeId) => api.get(`/goals/history/${employeeId}`);
export const createGoal = (data) => api.post('/goals', data);
export const createGoalsBulk = (data) => api.post('/goals/bulk', data);

// Activities
export const getActivities = (params) => api.get('/activities', { params });

// Users (Admin)
export const getUsers = () => api.get('/users');
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role });
export const updateUserTeam = (id, team) => api.put(`/users/${id}/team`, { team });
export const updateUserStatus = (id, isActive) => api.put(`/users/${id}/status`, { isActive });

export default api;
