import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const EXPIRY_KEY = 'auth_expiry';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Load user from localStorage on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        const expiry = localStorage.getItem(EXPIRY_KEY);
        
        if (token && storedUser && expiry) {
          console.log('Found stored authentication data');
          
          // Check if token is expired
          if (Date.now() > parseInt(expiry)) {
            console.log('Token expired, attempting refresh');
            try {
              // Try to refresh the token
              const refreshResponse = await authService.refreshToken(token);
              
              // Update storage with new token
              persistAuth(
                refreshResponse.data.token, 
                refreshResponse.data.user, 
                refreshResponse.data.expiresIn
              );
              
              setUser(refreshResponse.data.user);
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              clearAuth();
            }
          } else {
            // Token is still valid
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
        } else {
          // No stored auth data found
          clearAuth();
        }
      } catch (err) {
        console.error('Error loading user:', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Helper to persist auth data consistently
  const persistAuth = (token, userData, expiresIn) => {
    if (!token || !userData) return;
    
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
      
      console.log('Authentication data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  // Clear auth data on logout or errors
  const clearAuth = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(EXPIRY_KEY);
      
      setUser(null);
      setIsAuthenticated(false);
      console.log('Authentication data cleared');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      const { token, user, expiresIn } = response.data;
      
      persistAuth(token, user, expiresIn);
      
      setUser(user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setAuthError(null);
    try {
      setLoading(true);
      const response = await authService.register(username, email, password);
      
      const { token, user, expiresIn } = response.data;
      
      persistAuth(token, user, expiresIn);
      
      setUser(user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      console.error('Registration error:', err);
      setAuthError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        authError,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;