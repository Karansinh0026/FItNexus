import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = '/api';
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Add request interceptor to include JWT token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await axios.post('/token/refresh/', {
              refresh: refreshToken
            });
            localStorage.setItem('access_token', response.data.access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username, password });
      const response = await axios.post('/login/', {
        username,
        password
      });
      console.log('Login response:', response.data);
      
      const { user, tokens } = response.data;
      console.log('Storing tokens:', { access: tokens.access ? 'exists' : 'none', refresh: tokens.refresh ? 'exists' : 'none' });
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      setUser(user);
      
      console.log('User set:', user);
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || error.response?.data?.non_field_errors?.[0] || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/register/', userData);
      const { user, tokens } = response.data;
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      setUser(user);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      
      // Handle different types of validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle field-specific errors
        if (errorData.password) {
          throw new Error(`Password: ${errorData.password.join(', ')}`);
        }
        if (errorData.username) {
          throw new Error(`Username: ${errorData.username.join(', ')}`);
        }
        if (errorData.email) {
          throw new Error(`Email: ${errorData.email.join(', ')}`);
        }
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors.join(', '));
        }
        
        // Handle general error message
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        
        // If no specific error format, show the raw data
        throw new Error(JSON.stringify(errorData));
      }
      
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await axios.post('/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Checking auth with token:', token ? 'exists' : 'none');
      
      if (token) {
        const response = await axios.get('/profile/');
        console.log('Profile response:', response.data);
        setUser(response.data);
      } else {
        console.log('No token found, user not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
