import React, { useState, useEffect, useContext } from 'react';
import { useLanguage } from './LanguageContext';
import { AuthContext } from './AuthContext';

const Routines = () => {
  const { t, language } = useLanguage();
  const { token } = useContext(AuthContext);
  const [routines, setRoutines] = useState([]);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    time: '08:00',
    category: 'morning',
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  });
  const [showForm, setShowForm] = useState(false);

  // Load routines from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('routines');
    if (saved) {
      setRoutines(JSON.parse(saved));
    }
  }, []);

  // Save routines to localStorage
  useEffect(() => {
    localStorage.setItem('routines', JSON.stringify(routines));
  }, [routines]);

  const dayNames = language === 'ar' 
    ? { mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة', sat: 'السبت', sun: 'الأحد' }
    : { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

  const categories = [
    { id: 'morning', icon: '🌅', label: language === 'ar' ? 'صباحي' : 'Morning' },
    { id: 'afternoon', icon: '☀️', label: language === 'ar' ? 'ظهيرة' : 'Afternoon' },
    { id: 'evening', icon: '🌆', label: language === 'ar' ? 'مسائي' : 'Evening' },
    { id: 'night', icon: '🌙', label: language === 'ar' ? 'ليلي' : 'Night' }
  ];

  const getCurrentDay = () => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date().getDay()];
  };

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  const addRoutine = () => {
    if (!newRoutine.name.trim()) return;
    
    const routine = {
      id: Date.now(),
      ...newRoutine,
      completedDates: []
    };
    
    setRoutines([...routines, routine]);
    setNewRoutine({
      name: '',
      time: '08:00',
      category: 'morning',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    });
    setShowForm(false);
  };

  const deleteRoutine = (id) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const toggleDay = (day) => {
    setNewRoutine(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const toggleComplete = (routineId) => {
    const today = getTodayKey();
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        const isCompleted = r.completedDates.includes(today);
        return {
          ...r,
          completedDates: isCompleted 
            ? r.completedDates.filter(d => d !== today)
            : [...r.completedDates, today]
        };
      }
      return r;
    }));
  };

  const isCompletedToday = (routine) => {
    return routine.completedDates.includes(getTodayKey());
  };

  const isScheduledToday = (routine) => {
    return routine.days.includes(getCurrentDay());
  };

  const todayRoutines = routines.filter(isScheduledToday);
  const completedCount = todayRoutines.filter(isCompletedToday).length;

  const groupedRoutines = categories.map(cat => ({
    ...cat,
    routines: todayRoutines.filter(r => r.category === cat.id).sort((a, b) => a.time.localeCompare(b.time))
  })).filter(cat => cat.routines.length > 0);

  if (!token) {
    return (
      <div className="routines-container">
        <div className="routines-login-prompt">
          <span className="routines-icon">📅</span>
          <p>{language === 'ar' ? 'سجل الدخول لإدارة روتينك' : 'Login to manage your routines'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="routines-container">
      <div className="routines-header">
        <h2>
          <span className="routines-icon">📅</span>
          {t('planRoutines')}
        </h2>
        <div className="routines-progress">
          <span>{completedCount}/{todayRoutines.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${todayRoutines.length ? (completedCount/todayRoutines.length)*100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Routine Button */}
      <button className="add-routine-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? '✕' : '+'} {showForm ? t('cancel') : t('addRoutine')}
      </button>

      {/* Add Routine Form */}
      {showForm && (
        <div className="routine-form">
          <input
            type="text"
            placeholder={t('routineName')}
            value={newRoutine.name}
            onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
            className="routine-input"
          />
          
          <div className="form-row">
            <label>{t('time')}</label>
            <input
              type="time"
              value={newRoutine.time}
              onChange={(e) => setNewRoutine({ ...newRoutine, time: e.target.value })}
              className="time-input"
            />
          </div>

          <div className="form-row">
            <label>{t('category')}</label>
            <div className="category-selector">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-btn ${newRoutine.category === cat.id ? 'active' : ''}`}
                  onClick={() => setNewRoutine({ ...newRoutine, category: cat.id })}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>{t('repeatOn')}</label>
            <div className="days-selector">
              {Object.entries(dayNames).map(([key, label]) => (
                <button
                  key={key}
                  className={`day-btn ${newRoutine.days.includes(key) ? 'active' : ''}`}
                  onClick={() => toggleDay(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button className="save-routine-btn" onClick={addRoutine}>
            {t('save')}
          </button>
        </div>
      )}

      {/* Today's Routines */}
      <div className="today-label">
        {t('todaysRoutines')} - {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>

      {groupedRoutines.length === 0 ? (
        <div className="no-routines">
          <span>📝</span>
          <p>{t('noRoutinesToday')}</p>
        </div>
      ) : (
        groupedRoutines.map(group => (
          <div key={group.id} className="routine-group">
            <div className="group-header">
              {group.icon} {group.label}
            </div>
            {group.routines.map(routine => (
              <div 
                key={routine.id} 
                className={`routine-item ${isCompletedToday(routine) ? 'completed' : ''}`}
              >
                <button 
                  className="routine-check"
                  onClick={() => toggleComplete(routine.id)}
                >
                  {isCompletedToday(routine) ? '✓' : '○'}
                </button>
                <div className="routine-info">
                  <span className="routine-name">{routine.name}</span>
                  <span className="routine-time">{routine.time}</span>
                </div>
                <button 
                  className="routine-delete"
                  onClick={() => deleteRoutine(routine.id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ))
      )}

      {/* All Routines Overview */}
      {routines.length > 0 && (
        <div className="all-routines-section">
          <h3>{t('allRoutines')}</h3>
          {routines.map(routine => (
            <div key={routine.id} className="routine-overview-item">
              <span className="routine-name">{routine.name}</span>
              <span className="routine-schedule">
                {routine.days.map(d => dayNames[d]).join(', ')} @ {routine.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Routines;
