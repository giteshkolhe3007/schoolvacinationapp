import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    },
})

// Add a response interceptor to handle common errors
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  

// Auth services
export const authService = {
    login: (username, password) => api.post("/api/auth/login", { username, password }),
}

// Student services
export const studentService = {
    getAll: (params) => api.get("/api/students", { params }),
    getById: (id) => api.get(`/api/students/${id}`),
    create: (data) => api.post("/api/students", data),
    update: (id, data) => api.put(`/api/students/${id}`, data),
    delete: (id) => api.delete(`/api/students/${id}`),
    import: (formData) =>
        api.post("/api/students/import", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
    vaccinate: (id, driveId) => api.post(`/api/students/${id}/vaccinate`, { driveId }),
}

// Vaccination drive services
export const driveService = {
    getAll: (params) => api.get("/api/drives", { params }),
    getById: (id) => api.get(`/api/drives/${id}`),
    create: (data) => {
        console.log("Creating drive with data:", data)
        return api.post("/api/drives", data)
    },
    update: (id, data) => api.put(`/api/drives/${id}`, data),
    delete: (id) => api.delete(`/api/drives/${id}`),
    cancel: (id) => api.patch(`/api/drives/${id}/cancel`),
    complete: (id) => api.patch(`/api/drives/${id}/complete`),
    getStudents: (id, params) => api.get(`/api/drives/${id}/students`, { params }),
}

// Dashboard and report services
export const reportService = {
    getDashboardStats: () => api.get("/api/dashboard"),
    generateReport: (params) => api.get("/api/reports", { params }),
    getClassStats: () => api.get("/api/reports/class-stats"),
    getVaccineStats: () => api.get("/api/reports/vaccines"),
    getAvailableVaccines: () => api.get("/api/reports/available-vaccines"),
}

export default api
