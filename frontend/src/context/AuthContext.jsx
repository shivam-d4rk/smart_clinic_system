import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// 1. Core Auth Context Instance initialize karein
const AuthContext = createContext(null);

// Backend API Base Configuration setup trigger
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true // Http-only cookies ko dynamic transfer karne ke liye compulsory hai
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Auto-login check jab user page refresh kare
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Profile verification check
        const response = await API.get('/auth/me'); 
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log("[AUTH-CHECK] No active session found.");
        setUser(null); // Valid session na milne par session trace drop karein
      } finally {
        setLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  // 3. User Register (Signup) Function
  const signup = async (userData) => {
    try {
      const response = await API.post('/auth/signup', userData);
      if (response.data.success) {
        setUser(response.data.data);
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
      if (response.data.success) {
        setUser(response.data.data);
        return { success: true, role: response.data.data.role };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Galat email ya password' 
      };
    }
  };

  // 5. User Logout Function
  const logout = async () => {
    try {
      console.log("[DEBUG-AUTH] Initializing global sign-out engine...");
      // Backend API ko session destroy karne ke liye call karein
      await API.post('/auth/logout', {}); 
    } catch (err) {
      console.warn("[AUTH WARNING] Backend session already expired or unreachable:", err);
    } finally {
      setUser(null);
      // Clear all browser cookies manually to break token loops
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      console.log("[DEBUG-AUTH] Frontend token cache destroyed safely.");
      window.location.href = '/';
    }
  };

  // 🌟 FIX: Jo aap bhool gaye the - Provider ke sath values return karna compulsory hai!
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// Custom Hook banayein taaki baar baar useContext na likhna pade
export const useAuth = () => useContext(AuthContext);