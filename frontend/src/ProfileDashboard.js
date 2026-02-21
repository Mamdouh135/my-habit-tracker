import React, { useState, useEffect, useContext } from 'react';
import { getHabits, getCompletions } from './api';
import { AuthContext } from './AuthContext';
import './ProfileDashboard.css';

export default function ProfileDashboard({ visible, onClose, token }) {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const loadHistory = () => {
    const json = localStorage.getItem('habitHistory');
    try { setHistory(json ? JSON.parse(json) : []); } catch { setHistory([]); }
  };
  const removeHistoryAt = idx => {
    const h = [...history];
    h.splice(idx,1);
    localStorage.setItem('habitHistory', JSON.stringify(h));
    setHistory(h);
  };

  // fetch habits and their completions when drawer opens or on explicit refresh
  const fetchData = () => {
    if (!token) return;
    setLoading(true);
    getHabits(token)
      .then(res => {
        setHabits(res.data || []);
        return res.data || [];
      })
      .then(async hs => {
        const compMap = {};
        for (let h of hs) {
          try {
            const r = await getCompletions(token, h.id);
            compMap[h.id] = r.data.length > 0;
          } catch {}        
        }
        setCompletions(compMap);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (visible) {
      fetchData();
      loadHistory();
    }
  }, [visible, token]);

  // refresh whenever habits are updated elsewhere
  useEffect(() => {
    const handler = () => {
      if (visible) fetchData();
    };
    window.addEventListener('habitUpdated', handler);
    return () => window.removeEventListener('habitUpdated', handler);
  }, [visible, token]);

  // (no derived entries any more) history comes from localStorage

  const badges = [
    { key: '7day', title: '7-Day Warrior', rule: hs => hs.filter(h => completions[h.id]).length >= 7 },
    { key: '30day', title: '30-Day Streak', rule: hs => hs.filter(h => completions[h.id]).length >= 30 }
  ];

  const { updateProfile, userProfile } = useContext(AuthContext);

  const [nameInput, setNameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  // when profile opens populate inputs
  useEffect(() => {
    if (visible && userProfile) {
      setNameInput(userProfile.name || '');
      setAvatarInput(userProfile.avatar || '');
      setAvatarFile(null);
    }
  }, [visible, userProfile]);

  // convert file to base64 string
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarInput(reader.result);
      };
      reader.readAsDataURL(file);
      setAvatarFile(file);
    }
  };

  const saveProfile = () => {
    updateProfile({ name: nameInput, avatar: avatarInput });
  };

  return (
    <div className={`profile-drawer${visible ? ' open' : ''}`}>      
      <header className="profile-header">
        <div className="profile-title">Your Profile</div>
        <button className="profile-close" onClick={onClose} aria-label="Close profile">×</button>
      </header>
      <section className="profile-settings">
        <h3>Account</h3>
        <label>
          Name:
          <input type="text" value={nameInput} onChange={e=>setNameInput(e.target.value)} />
        </label>
        <label>
          Change avatar:
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        <label>
          Avatar URL (or data URI):
          <input type="text" value={avatarInput} onChange={e=>setAvatarInput(e.target.value)} />
        </label>
        {avatarInput && (
          <div className="avatar-preview">
            <img src={avatarInput} alt="avatar preview" style={{width:'64px',height:'64px',borderRadius:'50%'}} />
          </div>
        )}
        <button className="profile-save-btn" onClick={saveProfile}>Save</button>
      </section>
      <section className="profile-badges">
        <h3>Success Badges</h3>
        <div className="badge-grid">
          {badges.map(b => {
            const unlocked = b.rule(habits);
            return (
              <div key={b.key} className={`badge${unlocked ? ' unlocked' : ''}`}>                
                <span className="badge-icon">{unlocked ? '🏅' : '🔒'}</span>
                <span className="badge-title">{b.title}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="profile-history">
        <h3>History</h3>
        <button className="edit-history-toggle" onClick={() => setEditMode(m => !m)}>
          {editMode ? 'Done' : 'Edit History'}
        </button>
        <div className="history-list">
          {loading ? <div>Loading...</div> : (
            history.length === 0 ? (
              <div className="history-empty">No entries.</div>
            ) : (
              history.map((h, idx) => (
                <div key={idx} className="history-item">
                  {h}
                  {editMode && (
                    <button className="history-delete-btn" onClick={() => removeHistoryAt(idx)}>✖</button>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </section>
    </div>
  );
}
