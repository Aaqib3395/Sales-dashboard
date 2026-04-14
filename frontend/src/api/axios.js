import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data?.error || err.message);
    return Promise.reject(err);
  }
);

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

export default api;
