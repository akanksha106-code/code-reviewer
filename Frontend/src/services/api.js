import axios from 'axios';
import config from '../config/environment';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
  withCredentials: true
});

// Add connection validation
const validateConnection = async () => {
  try {
    await api.get('/health');
    console.log('Backend connection established');
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error.message);
    return false;
  }
};

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

// Add response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });

    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        if (error.response?.status === 500) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          return await axios(error.config);
        }
        break;
      } catch (retryError) {
        error = retryError;
      }
    }
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

// Add connection validation to services
export const connectionService = {
  validateConnection,
  getHealth: () => api.get('/health')
};

export default api;