import api from './api.service';

const StudentService = {
  getAllStudents: async (params) => {
    const response = await api.get('/api/students', { params });
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/api/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await api.post('/api/students', studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await api.put(`/api/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/api/students/${id}`);
    return response.data;
  },

  importStudents: async (formData) => {
    const response = await api.post('/api/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  vaccinateStudent: async (id, driveId) => {
    const response = await api.post(`/api/students/${id}/vaccinate`, { driveId });
    return response.data;
  }
};

export default StudentService;