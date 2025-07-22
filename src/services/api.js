import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://edulearnbackend.onrender.com';

// Debug logging for API URL
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ERR_NAME_NOT_RESOLVED') {
      toast.error('Cannot connect to server. Please check if backend is deployed correctly.');
      console.error('Backend URL not reachable:', API_BASE_URL);
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check your connection and backend URL.');
    } else {
      toast.error('Something went wrong!');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/users/login', credentials),
  register: (userData) => api.post('/users/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Courses API
export const coursesAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getInstructorCourses: () => api.get('/courses/instructor'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Enrollment API
export const enrollmentAPI = {
  enrollInCourse: (courseId) => api.post('/enrollments', { courseId }),
  getEnrolledCourses: () => api.get('/enrollments/user'),
  getEnrollmentStatus: (courseId) => api.get(`/enrollments/course/${courseId}`),
  markLessonComplete: (courseId, lessonId) => api.put(`/enrollments/course/${courseId}/lesson`, { lessonId }),
  updateProgress: (courseId, progress) => api.put(`/enrollments/course/${courseId}/progress`, { progress }),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getAllCourses: () => api.get('/admin/courses'),
  getStats: () => api.get('/admin/stats'),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  updateUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

// Resources API
export const resourcesAPI = {
  getByCourse: (courseId) => api.get(`/resources/course/${courseId}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Certificate API
export const certificateAPI = {
  generateCertificate: (courseId) => api.post(`/certificates/course/${courseId}`),
  getCertificate: (courseId) => api.get(`/certificates/course/${courseId}`),
  getUserCertificates: () => api.get('/certificates/user'),
};

// Rating API
export const ratingAPI = {
  addRating: (courseId, data) => api.post(`/ratings/course/${courseId}`, data),
  getCourseRatings: (courseId, params) => api.get(`/ratings/course/${courseId}`, { params }),
  getUserRating: (courseId) => api.get(`/ratings/course/${courseId}/user`),
  deleteRating: (courseId) => api.delete(`/ratings/course/${courseId}`),
};

// Analytics API
export const analyticsAPI = {
  getInstructorAnalytics: () => api.get('/analytics/instructor'),
  getCourseAnalytics: (courseId) => api.get(`/analytics/course/${courseId}`),
  getAdminAnalytics: () => api.get('/analytics/admin'),
};

export default api;