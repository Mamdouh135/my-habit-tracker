import React, { useState, useEffect, useContext, useRef } from 'react';
import ReactDOM from 'react-dom';
import { getHabits, getCompletions, getLogs } from './api';
import { AuthContext } from './AuthContext';
import { useLanguage } from './LanguageContext';
import './ProfileDashboard.css';

export default function ProfileDashboard({ visible, onClose, token }) {
  const { t } = useLanguage();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const { updateProfile, userProfile, logout } = useContext(AuthContext);

  // load log entries from server
  const loadLogs = async () => {
    if (!token) return;
    try {
      const res = await getLogs(token);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };
  const removeHistoryAt = idx => {
    // editing server logs not supported; keep client-only editing for now
    const h = [...logs];
    h.splice(idx,1);
    setLogs(h);
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
    if (visible && token) {
      fetchData();
      loadLogs();
    }
  }, [visible, token]);

  // refresh whenever habits are updated elsewhere
  useEffect(() => {
    const handler = () => {
      if (visible) {
        fetchData();
        loadLogs();
      }
    };
    window.addEventListener('habitUpdated', handler);
    return () => window.removeEventListener('habitUpdated', handler);
  }, [visible, token]);


  const badges = [
    { key: '7day', title: t('badge7day'), rule: hs => hs.filter(h => completions[h.id]).length >= 7 },
    { key: '30day', title: t('badge30day'), rule: hs => hs.filter(h => completions[h.id]).length >= 30 }
  ];

  const [nameInput, setNameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  // helper to convert data uri -> blob URL
  const dataUriToBlobUrl = (uri) => {
    try {
      const byteString = atob(uri.split(',')[1]);
      const mimeString = uri.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      return URL.createObjectURL(blob);
    } catch {
      return uri; // fallback
    }
  };

  // when profile opens populate inputs
  useEffect(() => {
    if (visible && userProfile) {
      setNameInput(userProfile.name || '');
      setAvatarInput(userProfile.avatar || '');
      setAvatarFile(null);
    }
  }, [visible, userProfile]);

  // keep preview synced
  useEffect(() => {
    if (avatarInput) {
      if (avatarInput.startsWith('data:')) {
        setAvatarPreview(dataUriToBlobUrl(avatarInput));
      } else {
        setAvatarPreview(avatarInput);
      }
    } else {
      setAvatarPreview('');
    }
  }, [avatarInput]);

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

  const drawerContent = (
    <>
      {visible && <div className="profile-overlay" onClick={onClose}></div>}
      <div className={`profile-drawer${visible ? ' open' : ''}`}>      
        <header className="profile-header">
          <div className="profile-title">{t('yourProfile')}</div>
          <button className="profile-close" onClick={onClose} aria-label={t('close')}>×</button>
        </header>
      <section className="profile-settings">
        <h3>{t('account')}</h3>
        <label>
          {t('name')}:
          <input type="text" value={nameInput} onChange={e=>setNameInput(e.target.value)} />
        </label>
          <div className="avatar-control">
          <img
            src={avatarPreview || 'https://via.placeholder.com/80?text=?'}
            alt={t('avatarPreview')}
            className="avatar-preview-large"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title={t('changeAvatar')}
          />
          <button
            type="button"
            className="avatar-change-btn"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            aria-label={t('changeAvatar')}
          >✎</button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <button className="profile-save-btn" onClick={saveProfile}>{t('save')}</button>
      </section>
      <section className="profile-badges">
        <h3>{t('badges')}</h3>
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
        <h3>{t('recentHistory')}</h3>
        <div className="history-list">
          {loading ? <div>{t('loading')}</div> : (
            logs.length === 0 ? (
              <div className="history-empty">{t('noHistory')}</div>
            ) : (
              logs.slice(0, 5).map((h, idx) => (
                <div key={idx} className="history-item">
                  {h.action} {h.habitName ? `(${h.habitName})` : ''}
                </div>
              ))
            )
          )}
        </div>
        {logs.length > 5 && (
          <button className="view-all-history-btn" onClick={() => setShowFullHistory(true)}>
            {t('viewAll')} ({logs.length})
          </button>
        )}
      </section>
      
      <button className="profile-logout-btn" onClick={() => { logout(); onClose(); }}>
        {t('logout')}
      </button>
    </div>
    </>
  );

  // Full History Modal - rendered via portal to center on page
  const historyModal = showFullHistory && ReactDOM.createPortal(
    <div className="history-modal-overlay" onClick={() => setShowFullHistory(false)}>
      <div className="history-modal" onClick={e => e.stopPropagation()}>
        <div className="history-modal-header">
          <h3>{t('history')}</h3>
          <button className="history-modal-close" onClick={() => setShowFullHistory(false)}>✖</button>
        </div>
        <div className="history-modal-actions">
          <button className="edit-history-toggle" onClick={() => setEditMode(m => !m)}>
            {editMode ? t('done') : t('editHistory')}
          </button>
        </div>
        <div className="history-modal-list">
          {logs.map((h, idx) => (
            <div key={idx} className="history-item">
              {h.action} {h.habitName ? `(${h.habitName})` : ''}
              {editMode && (
                <button className="history-delete-btn" onClick={() => removeHistoryAt(idx)}>✖</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {drawerContent}
      {historyModal}
    </>
  );
}
