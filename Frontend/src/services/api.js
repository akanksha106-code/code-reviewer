import axios from 'axios';

// Configure API base URL from environment variables or use a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create an instance of axios with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get stored token
const getStoredToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage with error handling
    const token = getStoredToken();

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    
    // Network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      error.isNetworkError = true;
      error.userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized errors
    if (error.response.status === 401 && !originalRequest._retry) {
      // If the token is expired and we're not already retrying
      if (error.response.data.message === 'Token expired') {
        originalRequest._retry = true;
        
        // Try to refresh token logic would go here
        // For now just clear auth and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login'; 
      }
      
      // Otherwise just clear auth and redirect to login
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/login';
      }
    }
    
    // Enhance error with more useful information for UI
    error.userMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
    
    return Promise.reject(error);
  }
);

// Auth service with improved methods
export const authService = {
  register: async (username, email, password) => {
    try {
      return await api.post('/auth/register', { username, email, password });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (email, password) => {
    try {
      return await api.post('/auth/login', { email, password });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  refreshToken: async (token) => {
    try {
      return await api.post('/auth/refresh-token', { token });
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },
  
  logout: () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_expiry');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
  
  getCurrentUser: () => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  isAuthenticated: () => {
    try {
      return !!localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }
};

// Reviews service
export const reviewService = {
  getReviews: async () => {
    try {
      return await api.get('/reviews');
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },
  
  getReview: async (id) => {
    return await api.get(`/reviews/${id}`);
  },
  
  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  },
  
  updateReview: async (id, reviewData) => {
    return await api.put(`/reviews/${id}`, reviewData);
  },
  
  deleteReview: async (id) => {
    return await api.delete(`/reviews/${id}`);
  }
};

// AI service
export const aiService = {
  getCodeReview: async (code, options = {}) => {
    try {
      console.log(`Requesting code review: ${code.length} chars, language: ${options.language || 'javascript'}`);
      
      const response = await api.post('/ai/review', { 
        code,
        language: options.language || 'javascript',
        reviewStyle: options.reviewStyle || 'detailed'
      });
      
      if (!response.data || !response.data.review) {
        throw new Error('Invalid response from AI service');
      }
      
      return response.data;
    } catch (error) {
      // Add a flag if it's a timeout error
      if (error.response?.status === 408) {
        error.isTimeout = true;
      }
      
      // Enhance error with user-friendly messages
      if (error.response?.status === 503) {
        error.userMessage = 'AI service is temporarily unavailable. Please try again later.';
      }
      
      if (error.response?.status === 429) {
        error.userMessage = 'API rate limit exceeded. Please wait a moment and try again.';
      }
      
      console.error('AI service error:', error);
      throw error;
    }
  },
  
  checkAIStatus: async () => {
    try {
      const response = await api.get('/ai/health');
      return {
        available: response.data.status === 'operational',
        info: response.data
      };
    } catch (error) {
      console.error('AI status check error:', error);
      return { available: false, error: error.message };
    }
  }
};

// Health check service
export const healthService = {
  check: async () => {
    try {
      const response = await api.get('/health/check');
      return response.data.available;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  },
  
  getStatus: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }
};

export default api;