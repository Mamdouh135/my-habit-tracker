import React, { useState, useEffect, useContext } from 'react';
import { getHabits, addHabit, deleteHabit, completeHabit, getCompletions } from './api';
import { AuthContext } from './AuthContext';
import { useLanguage } from './LanguageContext';


export default function Habits() {
  const { token, logout, userProfile } = useContext(AuthContext);
  const { t } = useLanguage();
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [error, setError] = useState('');
  const [completions, setCompletions] = useState({});
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!token) return;
    getHabits(token).then(res => setHabits(res.data));
  }, [token]);

  const handleAdd = async () => {
    if (!newHabit) return;
    try {
      await addHabit(token, newHabit);
      setNewHabit('');
      const res = await getHabits(token);
      setHabits(res.data);
      window.dispatchEvent(new Event('habitUpdated'));
    } catch (e) {
      setError(t('addError'));
    }
  };


  const handleDelete = async (id) => {
    const habit = habits.find(h => h.id === id);
    // server will log deletion
    await deleteHabit(token, id);
    setHabits(habits.filter(h => h.id !== id));
    window.dispatchEvent(new Event('habitUpdated'));
  };

  const handleComplete = async (id) => {
    await completeHabit(token, id, today);
    const habit = habits.find(h => h.id === id);
    // server will log completion
    setCompletions({ ...completions, [id]: true });
    // notify other components (e.g. profile drawer) about update
    window.dispatchEvent(new Event('habitUpdated'));
  };

  const fetchCompletions = async (id) => {
    const res = await getCompletions(token, id);
    setCompletions(c => ({ ...c, [id]: res.data.some(d => d.date === today) }));
  };

  useEffect(() => {
    habits.forEach(h => fetchCompletions(h.id));
    // eslint-disable-next-line
  }, [habits]);

  useEffect(() => {
    // whenever habits change we should refresh history too
    window.dispatchEvent(new Event('habitUpdated'));
  }, [habits]);

  const displayedHabits = habits;

  return (
    <div>
      <h2>{t('yourHabits')}</h2>
      <button className="logout-btn" onClick={logout}>{t('logout')}</button>
      <div className="add-habit-row">
        <input
          className="add-habit-input"
          placeholder={t('newHabit')}
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
        />
        <button className="add-habit-btn" onClick={handleAdd}>{t('add')}</button>
      </div>
      {error && <div className="error">{error}</div>}
      <ul>
        {displayedHabits.map(habit => (
          <li key={habit.id} className="habit-item">
            <span className="habit-name">{habit.name}</span>
            <div className="habit-actions">
              <button className="habit-delete-btn" onClick={() => handleDelete(habit.id)} title={t('delete')}><span role="img" aria-label="delete">🗑️</span> {t('delete')}</button>
              <button className="habit-complete-btn" onClick={() => handleComplete(habit.id)} disabled={completions[habit.id]} title={t('completed')}><span role="img" aria-label="done">✅</span> {t('completed')}</button>
              {completions[habit.id] && <span className="habit-done" title={t('completed')}>✔️</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
