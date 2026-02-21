import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // include username for storage key
  const [userProfile, setUserProfile] = useState({ id: '', name: '', avatar: '', username: '' });

  // helper to stash locally by username
  const saveLocalProfile = (profile) => {
    if (profile.username) {
      try { localStorage.setItem('profile_' + profile.username, JSON.stringify(profile)); } catch {}
    }
  };

  // when auth state changes: load cached then fetch server
  useEffect(() => {
    if (token) {
      // load profile from storage based on username if known
      if (userProfile.username) {
        const saved = localStorage.getItem('profile_' + userProfile.username);
        if (saved) {
          try { setUserProfile(JSON.parse(saved)); } catch {}
        }
      }
      // then refresh from server
      import('./api').then(({ getProfile }) => {
        getProfile(token).then(res => {
          const prof = {
            id: res.data.id || '',
            name: res.data.name || '',
            avatar: res.data.avatar || '',
            username: res.data.username || ''
          };
          setUserProfile(prof);
          saveLocalProfile(prof);
        }).catch(() => {
          // ignore failures
        });
      });
    } else {
      setUserProfile({ name: '', avatar: '', username: '' });
    }
  }, [token]);

  const login = (newToken, profile) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (profile) {
      // ensure we copy id/username etc.
      const prof = { ...profile };
      setUserProfile(prof);
      saveLocalProfile(prof);
    }
    // always fetch again to be safe
    import('./api').then(({ getProfile }) => {
      getProfile(newToken).then(res => {
        const prof = {
          id: res.data.id || '',
          name: res.data.name || '',
          avatar: res.data.avatar || '',
          username: res.data.username || ''
        };
        setUserProfile(prof);
        saveLocalProfile(prof);
      }).catch(() => {});
    });
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUserProfile({ name: '', avatar: '', username: '' });
  };

  const updateProfile = (profile) => {
    // keep username the same
    const updated = { ...userProfile, ...profile };
    setUserProfile(updated);
    saveLocalProfile(updated);
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
