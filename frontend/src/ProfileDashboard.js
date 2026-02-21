import React, { useState, useEffect } from 'react';
import { getHabits, getCompletions } from './api';
import './ProfileDashboard.css';

export default function ProfileDashboard({ visible, onClose, token }) {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(false);

  // fetch habits and their completions when drawer opens
  useEffect(() => {
    if (!visible || !token) return;
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
  }, [visible, token]);

  // derive history entries
  const historyEntries = habits.map(h => {
    const done = completions[h.id];
    return `${h.name} - ${done ? 'Completed' : 'Pending'}`;
  });

  const badges = [
    { key: '7day', title: '7-Day Warrior', rule: hs => hs.filter(h => completions[h.id]).length >= 7 },
    { key: '30day', title: '30-Day Streak', rule: hs => hs.filter(h => completions[h.id]).length >= 30 }
  ];

  return (
    <div className={`profile-drawer${visible ? ' open' : ''}`}>      
      <header className="profile-header">
        <div className="profile-title">Your Profile</div>
        <button className="profile-close" onClick={onClose} aria-label="Close profile">×</button>
      </header>
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
        <div className="history-list">
          {loading ? <div>Loading...</div> : (
            historyEntries.length === 0 ? (
              <div className="history-empty">No habits yet.</div>
            ) : (
              historyEntries.map((h, idx) => (
                <div key={idx} className="history-item">
                  {h}
                </div>
              ))
            )
          )}
        </div>
      </section>
    </div>
  );
}
