import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('safesphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (user && user.token) {
        try {
          const res = await API.get('/auth/me');
          if (res.success && res.data) {
            const updated = { ...user, ...res.data };
            setUser(updated);
            localStorage.setItem('safesphere_user', JSON.stringify(updated));
          }
        } catch (err) {
          console.warn('[AuthContext] Session validation failed:', err.message);
          if (err.message.includes('authorized') || err.message.includes('expired')) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('safesphere_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, phone, password, role = 'user') => {
    const res = await API.post('/auth/register', { name, email, phone, password, role });
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const verifyOTP = async (email, otpCode) => {
    const res = await API.post('/auth/verify-otp', { email, otpCode });
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('safesphere_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.message || 'OTP verification failed');
  };

  const forgotPassword = async (email) => {
    const res = await API.post('/auth/forgot-password', { email });
    if (res.success) {
      return res.data;
    }
    throw new Error(res.message || 'Forgot password request failed');
  };

  const resetPassword = async (email, otpCode, newPassword) => {
    const res = await API.post('/auth/reset-password', { email, otpCode, newPassword });
    if (res.success) {
      return res;
    }
    throw new Error(res.message || 'Password reset failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safesphere_user');
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('safesphere_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOTP,
        forgotPassword,
        resetPassword,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
