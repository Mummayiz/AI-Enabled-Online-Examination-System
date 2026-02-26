import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  registerStudent: (data) => api.post('/auth/register/student', data),
  registerAdmin: (data) => api.post('/auth/register/admin', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Admin API
export const adminAPI = {
  getExams: () => api.get('/admin/exams'),
  getExam: (id) => api.get(`/admin/exams/${id}`),
  createExam: (data) => api.post('/admin/exams', data),
  updateExam: (id, data) => api.put(`/admin/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`),
  addQuestion: (examId, data) => api.post(`/admin/exams/${examId}/questions`, data),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getExamAnalytics: (examId) => api.get(`/admin/exams/${examId}/analytics`),
};

// Student API
export const studentAPI = {
  getExams: () => api.get('/student/exams'),
  startExam: (examId) => api.post(`/student/exams/${examId}/start`),
  submitExam: (sessionId, data) => api.post(`/student/sessions/${sessionId}/submit`, data),
  getResults: () => api.get('/student/results'),
  getResultDetail: (resultId) => api.get(`/student/results/${resultId}`),
};

// Violations API
export const violationsAPI = {
  logViolation: (data) => api.post('/violations', data),
  getSessionViolations: (sessionId) => api.get(`/violations/session/${sessionId}`),
};

// Results API
export const resultsAPI = {
  getAllResults: () => api.get('/results'),
  getResult: (id) => api.get(`/results/${id}`),
};

export default api;
