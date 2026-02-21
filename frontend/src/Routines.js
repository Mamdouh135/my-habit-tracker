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
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, -1 = last week, etc.
  const [showHistory, setShowHistory] = useState(false);

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

  const dayOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const categories = [
    { id: 'morning', icon: '🌅', label: language === 'ar' ? 'صباحي' : 'Morning' },
    { id: 'afternoon', icon: '☀️', label: language === 'ar' ? 'ظهيرة' : 'Afternoon' },
    { id: 'evening', icon: '🌆', label: language === 'ar' ? 'مسائي' : 'Evening' },
    { id: 'night', icon: '🌙', label: language === 'ar' ? 'ليلي' : 'Night' }
  ];

  const getCurrentDay = () => {
    return dayOrder[new Date().getDay()];
  };

  const getTodayKey = () => new Date().toISOString().split('T')[0];

  // Get the start of a week (Sunday)
  const getWeekStart = (weeksAgo = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek - (weeksAgo * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  // Get all dates in a week
  const getWeekDates = (weeksAgo = 0) => {
    const start = getWeekStart(weeksAgo);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        dayKey: dayOrder[date.getDay()],
        dayName: dayNames[dayOrder[date.getDay()]],
        isToday: date.toISOString().split('T')[0] === getTodayKey(),
        isPast: date < new Date(getTodayKey())
      });
    }
    return dates;
  };

  // Calculate weekly percentage for a routine
  const calculateWeeklyPercentage = (routine, weeksAgo = 0) => {
    const weekDates = getWeekDates(weeksAgo);
    const scheduledDays = weekDates.filter(d => routine.days.includes(d.dayKey) && (d.isPast || d.isToday));
    if (scheduledDays.length === 0) return null;
    
    const completedDays = scheduledDays.filter(d => routine.completedDates.includes(d.date));
    return {
      completed: completedDays.length,
      total: scheduledDays.length,
      percentage: Math.round((completedDays.length / scheduledDays.length) * 100)
    };
  };

  // Check if routine was completed on a specific date
  const isCompletedOnDate = (routine, dateKey) => {
    return routine.completedDates.includes(dateKey);
  };

  // Toggle completion for a specific date
  const toggleCompleteForDate = (routineId, dateKey) => {
    setRoutines(routines.map(r => {
      if (r.id === routineId) {
        const isCompleted = r.completedDates.includes(dateKey);
        return {
          ...r,
          completedDates: isCompleted 
            ? r.completedDates.filter(d => d !== dateKey)
            : [...r.completedDates, dateKey]
        };
      }
      return r;
    }));
  };

  const addRoutine = () => {
    if (!newRoutine.name.trim()) return;
    
    const routine = {
      id: Date.now(),
      ...newRoutine,
      completedDates: [],
      createdAt: getTodayKey()
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
    toggleCompleteForDate(routineId, getTodayKey());
  };

  const isCompletedToday = (routine) => {
    return routine.completedDates.includes(getTodayKey());
  };

  const isScheduledToday = (routine) => {
    return routine.days.includes(getCurrentDay());
  };

  // Get overall weekly stats
  const getWeeklyStats = (weeksAgo = 0) => {
    let totalScheduled = 0;
    let totalCompleted = 0;
    
    routines.forEach(routine => {
      const stats = calculateWeeklyPercentage(routine, weeksAgo);
      if (stats) {
        totalScheduled += stats.total;
        totalCompleted += stats.completed;
      }
    });
    
    return {
      completed: totalCompleted,
      total: totalScheduled,
      percentage: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
    };
  };

  const todayRoutines = routines.filter(isScheduledToday);
  const completedCount = todayRoutines.filter(isCompletedToday).length;
  const weekDates = getWeekDates(selectedWeek);
  const weeklyStats = getWeeklyStats(selectedWeek);

  const groupedRoutines = categories.map(cat => ({
    ...cat,
    routines: todayRoutines.filter(r => r.category === cat.id).sort((a, b) => a.time.localeCompare(b.time))
  })).filter(cat => cat.routines.length > 0);

  // Format week range for display
  const formatWeekRange = (weeksAgo) => {
    const start = getWeekStart(weeksAgo);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`;
  };

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

      {/* Action Buttons */}
      <div className="routine-actions">
        <button className="add-routine-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+'} {showForm ? t('cancel') : t('addRoutine')}
        </button>
        <button 
          className={`history-toggle-btn ${showHistory ? 'active' : ''}`} 
          onClick={() => setShowHistory(!showHistory)}
        >
          📊 {t('weeklyTracking')}
        </button>
      </div>

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

      {/* Weekly Tracking Section */}
      {showHistory && routines.length > 0 && (
        <div className="weekly-tracking-section">
          <div className="week-navigation">
            <button 
              className="week-nav-btn"
              onClick={() => setSelectedWeek(prev => prev - 1)}
            >
              ←
            </button>
            <span className="week-label">
              {selectedWeek === 0 
                ? (language === 'ar' ? 'هذا الأسبوع' : 'This Week')
                : selectedWeek === -1 
                  ? (language === 'ar' ? 'الأسبوع الماضي' : 'Last Week')
                  : formatWeekRange(selectedWeek)
              }
            </span>
            <button 
              className="week-nav-btn"
              onClick={() => setSelectedWeek(prev => Math.min(prev + 1, 0))}
              disabled={selectedWeek >= 0}
            >
              →
            </button>
          </div>

          {/* Overall Weekly Stats */}
          <div className="weekly-overall-stats">
            <div className="stat-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle-progress"
                  strokeDasharray={`${weeklyStats.percentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="stat-percentage">{weeklyStats.percentage}%</div>
            </div>
            <div className="stat-info">
              <div className="stat-title">{language === 'ar' ? 'نسبة الإنجاز الأسبوعية' : 'Weekly Completion'}</div>
              <div className="stat-detail">
                {weeklyStats.completed}/{weeklyStats.total} {language === 'ar' ? 'مهام' : 'tasks'}
              </div>
            </div>
          </div>

          {/* Weekly Calendar Grid */}
          <div className="weekly-calendar">
            <div className="calendar-header">
              {weekDates.map(d => (
                <div key={d.date} className={`calendar-day-header ${d.isToday ? 'today' : ''}`}>
                  <span className="day-name">{d.dayName}</span>
                  <span className="day-date">{new Date(d.date).getDate()}</span>
                </div>
              ))}
            </div>
            
            {routines.map(routine => {
              const stats = calculateWeeklyPercentage(routine, selectedWeek);
              return (
                <div key={routine.id} className="calendar-row">
                  <div className="routine-label">
                    <span className="routine-name">{routine.name}</span>
                    {stats && (
                      <span className={`routine-percentage ${stats.percentage >= 80 ? 'good' : stats.percentage >= 50 ? 'fair' : 'low'}`}>
                        {stats.percentage}%
                      </span>
                    )}
                  </div>
                  <div className="calendar-cells">
                    {weekDates.map(d => {
                      const isScheduled = routine.days.includes(d.dayKey);
                      const isCompleted = isCompletedOnDate(routine, d.date);
                      const canToggle = d.isPast || d.isToday;
                      
                      return (
                        <div 
                          key={d.date} 
                          className={`calendar-cell ${isScheduled ? 'scheduled' : 'not-scheduled'} ${isCompleted ? 'completed' : ''} ${d.isToday ? 'today' : ''} ${canToggle ? 'clickable' : ''}`}
                          onClick={() => isScheduled && canToggle && toggleCompleteForDate(routine.id, d.date)}
                          title={isScheduled ? (isCompleted ? (language === 'ar' ? 'مكتمل' : 'Completed') : (language === 'ar' ? 'غير مكتمل' : 'Not completed')) : (language === 'ar' ? 'غير مجدول' : 'Not scheduled')}
                        >
                          {isScheduled && (isCompleted ? '✓' : '○')}
                          {!isScheduled && '·'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Individual Routine Stats */}
          <div className="routine-stats-list">
            <h4>{language === 'ar' ? 'إحصائيات الروتين' : 'Routine Statistics'}</h4>
            {routines.map(routine => {
              const stats = calculateWeeklyPercentage(routine, selectedWeek);
              if (!stats) return null;
              
              return (
                <div key={routine.id} className="routine-stat-item">
                  <div className="stat-routine-info">
                    <span className="stat-routine-name">{routine.name}</span>
                    <span className="stat-routine-schedule">
                      {routine.days.map(d => dayNames[d]).join(', ')}
                    </span>
                  </div>
                  <div className="stat-routine-progress">
                    <div className="mini-progress-bar">
                      <div 
                        className={`mini-progress-fill ${stats.percentage >= 80 ? 'good' : stats.percentage >= 50 ? 'fair' : 'low'}`}
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <span className="stat-routine-percentage">{stats.completed}/{stats.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
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
          {routines.map(routine => {
            const currentWeekStats = calculateWeeklyPercentage(routine, 0);
            return (
              <div key={routine.id} className="routine-overview-item">
                <div className="routine-overview-main">
                  <span className="routine-name">{routine.name}</span>
                  <span className="routine-schedule">
                    {routine.days.map(d => dayNames[d]).join(', ')} @ {routine.time}
                  </span>
                </div>
                {currentWeekStats && (
                  <div className={`routine-week-badge ${currentWeekStats.percentage >= 80 ? 'good' : currentWeekStats.percentage >= 50 ? 'fair' : 'low'}`}>
                    {currentWeekStats.percentage}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Routines;
