import api from './api.service';

const DashboardService = {
  getDashboardStats: async () => {
    const response = await api.get('/api/dashboard');
    return response.data;
  },

  generateReport: async (params) => {
    const response = await api.get('/api/dashboard/report', { params });
    return response.data;
  }
};

export default DashboardService;