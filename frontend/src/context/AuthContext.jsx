import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API = axios.create({
  baseURL: 'https://smart-clinic-backend-adym.onrender.com/api',
});

// Interceptor: Har request me Bearer token attach karega
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-Restore session on Refresh
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser && savedUser !== 'undefined') {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session restore error:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login Function
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      
      console.log("[LOGIN RESPONSE RECEIVED]:", response.data);

      if (response.data.success || response.data.token) {
        // Safe Token & User extract from updated authController
        const token = response.data.token || response.data.data?.token;
        const userData = response.data.user || response.data.data;

        if (token) {
          localStorage.setItem('token', token);
          console.log("[AUTH CONTEXT] Token saved successfully to localStorage");
        } else {
          console.error("[AUTH CONTEXT ERROR] Token field is missing in API response!");
        }

        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }

        return { success: true, role: userData?.role };
      } else {
        return { success: false, message: response.data.message || 'Login failed!' };
      }
    } catch (error) {
      console.error("[LOGIN API FAULT]:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed! Please check credentials.' 
      };
    }
  };

  // Signup Function
  const signup = async (userData) => {
    try {
      const response = await API.post('/auth/signup', userData);
      if (response.data.success) {
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Signup failed!' };
      }
    } catch (error) {
      console.error("[SIGNUP API FAULT]:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed! Please try again.' 
      };
    }
  };

  // Logout Function
  const logout = async () => {
    try {
      await API.post('/auth/logout', {});
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);