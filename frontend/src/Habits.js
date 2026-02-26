import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHabits, addHabit, deleteHabit, completeHabit, getCompletions } from './api';
import { AuthContext } from './AuthContext';
import { useLanguage } from './LanguageContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};


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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>{t('yourHabits')}</h2>
      <motion.button 
        className="logout-btn" 
        onClick={logout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {t('logout')}
      </motion.button>
      <div className="add-habit-row">
        <motion.input
          className="add-habit-input"
          placeholder={t('newHabit')}
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          whileFocus={{ scale: 1.02 }}
        />
        <motion.button 
          className="add-habit-btn" 
          onClick={handleAdd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('add')}
        </motion.button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {displayedHabits.map(habit => (
            <motion.li 
              key={habit.id} 
              className="habit-item"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              layout
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <span className="habit-name">{habit.name}</span>
              <div className="habit-actions">
                <motion.button 
                  className="habit-delete-btn" 
                  onClick={() => handleDelete(habit.id)} 
                  title={t('delete')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span role="img" aria-label="delete">🗑️</span> {t('delete')}
                </motion.button>
                <motion.button 
                  className="habit-complete-btn" 
                  onClick={() => handleComplete(habit.id)} 
                  disabled={completions[habit.id]} 
                  title={t('completed')}
                  whileHover={{ scale: completions[habit.id] ? 1 : 1.1 }}
                  whileTap={{ scale: completions[habit.id] ? 1 : 0.9 }}
                >
                  <span role="img" aria-label="done">✅</span> {t('completed')}
                </motion.button>
                <AnimatePresence>
                  {completions[habit.id] && (
                    <motion.span 
                      className="habit-done" 
                      title={t('completed')}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      ✔️
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  );
}
