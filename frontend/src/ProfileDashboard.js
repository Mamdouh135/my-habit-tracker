import React, { useState, useEffect, useContext, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <AnimatePresence>
      {visible && (
        <>
          <motion.div 
            className="profile-overlay" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className="profile-drawer open"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >      
            <header className="profile-header">
              <div className="profile-title">{t('yourProfile')}</div>
              <motion.button 
                className="profile-close" 
                onClick={onClose} 
                aria-label={t('close')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
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
          <motion.button
            type="button"
            className="avatar-change-btn"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            aria-label={t('changeAvatar')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >✎</motion.button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <motion.button 
          className="profile-save-btn" 
          onClick={saveProfile}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t('save')}
        </motion.button>
      </section>
      <section className="profile-badges">
        <h3>{t('badges')}</h3>
        <div className="badge-grid">
          {badges.map(b => {
            const unlocked = b.rule(habits);
            return (
              <motion.div 
                key={b.key} 
                className={`badge${unlocked ? ' unlocked' : ''}`}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >                
                <span className="badge-icon">{unlocked ? '🏅' : '🔒'}</span>
                <span className="badge-title">{b.title}</span>
              </motion.div>
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
          <motion.button 
            className="view-all-history-btn" 
            onClick={() => setShowFullHistory(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('viewAll')} ({logs.length})
          </motion.button>
        )}
      </section>
      
      <motion.button 
        className="profile-logout-btn" 
        onClick={() => { logout(); onClose(); }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('logout')}
      </motion.button>
    </motion.div>
    </>
      )}
    </AnimatePresence>
  );

  // Full History Modal - rendered via portal to center on page
  const historyModal = showFullHistory && ReactDOM.createPortal(
    <motion.div 
      className="history-modal-overlay" 
      onClick={() => setShowFullHistory(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="history-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="history-modal-header">
          <h3>{t('history')}</h3>
          <motion.button 
            className="history-modal-close" 
            onClick={() => setShowFullHistory(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✖
          </motion.button>
        </div>
        <div className="history-modal-actions">
          <motion.button 
            className="edit-history-toggle" 
            onClick={() => setEditMode(m => !m)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {editMode ? t('done') : t('editHistory')}
          </motion.button>
        </div>
        <div className="history-modal-list">
          {logs.map((h, idx) => (
            <motion.div 
              key={idx} 
              className="history-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              {h.action} {h.habitName ? `(${h.habitName})` : ''}
              {editMode && (
                <motion.button 
                  className="history-delete-btn" 
                  onClick={() => removeHistoryAt(idx)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✖
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );

  return (
    <>
      {drawerContent}
      {historyModal}
    </>
  );
}
