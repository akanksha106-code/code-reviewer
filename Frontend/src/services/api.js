import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

// API services
export const authService = {
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile')
};

export const reviewService = {
  getReviews: () => api.get('/reviews'),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  saveReview: (codeData) => api.post('/reviews', codeData),
  deleteReview: (id) => api.delete(`/reviews/${id}`)
};

export const aiService = {
  getCodeReview: (code, reviewStyle = 'concise') => api.post('/ai/get-review', { code, reviewStyle })
};

export default api;