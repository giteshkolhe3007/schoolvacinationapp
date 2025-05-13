import api from './api.service';

const DriveService = {
  getAllDrives: async (params) => {
    const response = await api.get('/api/drives', { params });
    return response.data;
  },

  getDriveById: async (id) => {
    const response = await api.get(`/api/drives/${id}`);
    return response.data;
  },

  createDrive: async (driveData) => {
    const response = await api.post('/api/drives', driveData);
    return response.data;
  },

  updateDrive: async (id, driveData) => {
    const response = await api.put(`/api/drives/${id}`, driveData);
    return response.data;
  },

  cancelDrive: async (id) => {
    const response = await api.patch(`/api/drives/${id}/cancel`);
    return response.data;
  },

  completeDrive: async (id) => {
    const response = await api.patch(`/api/drives/${id}/complete`);
    return response.data;
  },

  getDriveStudents: async (id, params) => {
    const response = await api.get(`/api/drives/${id}/students`, { params });
    return response.data;
  }
};

export default DriveService;