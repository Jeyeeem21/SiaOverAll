import axios from 'axios';

// Create axios instance - pointing to Node.js API server
const api = axios.create({
  baseURL: 'http://localhost:3002/api',
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login would be handled by AuthContext
      localStorage.removeItem('token');
      // Note: Actual redirect should be handled by the component using this service
    }

    // Handle validation errors (422)
    if (error.response && error.response.status === 422) {
      // Return the error so components can display validation messages
      return Promise.reject(error.response.data);
    }

    // Handle other errors
    return Promise.reject(
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    );
  }
);

export default api;