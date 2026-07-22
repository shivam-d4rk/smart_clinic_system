import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 1. Core Auth Context Instance initialize karein
const AuthContext = createContext(null);

// Backend API Base Configuration setup trigger
export const API = axios.create({
  baseURL: 'https://smart-clinic-backend-adym.onrender.com/api',
});

// ⚡ AXIOS INTERCEPTOR: Har request me Bearer Token attach karega (Cross-origin fix)
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

  // 2. Auto-login check jab user page refresh kare (localStorage restoration)
  useEffect(() => {
    const restoreUserSession = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("[AUTH-CHECK] Failed to restore session from storage:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUserSession();
  }, []);

  // 3. User Register (Signup) Function
  const signup = async (userData) => {
    try {
      const response = await API.post('/auth/signup', userData);
      if (response.data.success) {
        const { token, user: registeredUser } = response.data.data || response.data;
        
        // Save to LocalStorage to retain login state on refresh
        if (token) localStorage.setItem('token', token);
        if (registeredUser) {
          localStorage.setItem('user', JSON.stringify(registeredUser));
          setUser(registeredUser);
        }

        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup ke dauran koi takleef hui' 
      };
    }
  };

  // 4. User Login Function
  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      
      if (response.data.success || response.data.token) {
        // Backend Response structure standard handling
        const token = response.data.token || response.data.data?.token;
        const loggedInUser = response.data.user || response.data.data?.user || response.data.data;

        if (token) {
          localStorage.setItem('token', token);
        }
        
        if (loggedInUser) {
          localStorage.setItem('user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
        }

        return { 
          success: true, 
          role: loggedInUser?.role 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Email or password is invalid!' 
      };
    }
  };

  // 5. User Logout Function
  const logout = async () => {
    try {
      console.log("[DEBUG-AUTH] Initializing global sign-out engine...");
      await API.post('/auth/logout', {}); 
    } catch (err) {
      console.warn("[AUTH WARNING] Backend session cleanup skipped:", err);
    } finally {
      // Clear persistent browser storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      console.log("[DEBUG-AUTH] Frontend token cache destroyed safely.");
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// Custom Hook banayein taaki baar baar useContext na likhna pade
export const useAuth = () => useContext(AuthContext);