import React, { useState, useEffect, useContext } from 'react';
import { getHabits, addHabit, deleteHabit, completeHabit, getCompletions } from './api';
import { AuthContext } from './AuthContext';

export default function Habits() {
  const { token, logout } = useContext(AuthContext);
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
    } catch (e) {
      setError('Could not add habit');
    }
  };

  const handleDelete = async (id) => {
    await deleteHabit(token, id);
    setHabits(habits.filter(h => h.id !== id));
  };

  const handleComplete = async (id) => {
    await completeHabit(token, id, today);
    setCompletions({ ...completions, [id]: true });
  };

  const fetchCompletions = async (id) => {
    const res = await getCompletions(token, id);
    setCompletions(c => ({ ...c, [id]: res.data.some(d => d.date === today) }));
  };

  useEffect(() => {
    habits.forEach(h => fetchCompletions(h.id));
    // eslint-disable-next-line
  }, [habits]);

  return (
    <div>
      <h2>Your Habits</h2>
      <button onClick={logout}>Logout</button>
      <div>
        <input placeholder="New habit" value={newHabit} onChange={e => setNewHabit(e.target.value)} />
        <button onClick={handleAdd}>Add</button>
      </div>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {habits.map(habit => (
          <li key={habit.id}>
            {habit.name}
            <button onClick={() => handleDelete(habit.id)}>Delete</button>
            <button onClick={() => handleComplete(habit.id)} disabled={completions[habit.id]}>Mark as done today</button>
            {completions[habit.id] && <span>✔️</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
