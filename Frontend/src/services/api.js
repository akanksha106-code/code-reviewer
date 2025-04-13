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

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userInfo.token;

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

// Auth service
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
      const response = await api.post('/auth/login', { email, password });
      
      // Save user info to local storage if login is successful
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },
  
  updateProfile: async (userData) => {
    return await api.put('/auth/profile', userData);
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