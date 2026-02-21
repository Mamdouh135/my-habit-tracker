import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState({ name: '', avatar: '' });

  // load profile from storage when token changes
  useEffect(() => {
    if (token) {
      const saved = localStorage.getItem('profile_' + token);
      if (saved) {
        try {
          setUserProfile(JSON.parse(saved));
        } catch {}
      } else {
        setUserProfile({ name: '', avatar: '' });
      }
    } else {
      setUserProfile({ name: '', avatar: '' });
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    // profile loading handled by effect
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUserProfile({ name: '', avatar: '' });
  };

  const updateProfile = (profile) => {
    setUserProfile(profile);
    if (token) {
      localStorage.setItem('profile_' + token, JSON.stringify(profile));
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, userProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
