import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState({ name: '', avatar: '' });

  // helper to stash locally
  const saveLocalProfile = (profile, tkn) => {
    if (tkn) {
      try { localStorage.setItem('profile_' + tkn, JSON.stringify(profile)); } catch {}
    }
  };

  // fetch profile from server when token changes (or load saved)
  useEffect(() => {
    if (token) {
      // first load from storage so UI has something
      const saved = localStorage.getItem('profile_' + token);
      if (saved) {
        try {
          setUserProfile(JSON.parse(saved));
        } catch {}
      }
      // then try to refresh from server
      import('./api').then(({ getProfile }) => {
        getProfile(token).then(res => {
          const prof = { name: res.data.name || '', avatar: res.data.avatar || '' };
          setUserProfile(prof);
          saveLocalProfile(prof, token);
        }).catch(() => {
          // ignore
        });
      });
    } else {
      setUserProfile({ name: '', avatar: '' });
    }
  }, [token]);

  const login = (newToken, profile) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (profile) {
      setUserProfile(profile);
      saveLocalProfile(profile, newToken);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUserProfile({ name: '', avatar: '' });
  };

  const updateProfile = (profile) => {
    setUserProfile(profile);
    saveLocalProfile(profile, token);
    // send to back if logged in
    if (token) {
      import('./api').then(({ updateProfile }) => {
        updateProfile(token, profile).catch(() => {});
      });
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, userProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
