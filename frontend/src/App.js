import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from './AuthContext';
import LoginRegister from './LoginRegister';
import Habits from './Habits';
import AboutMe from './AboutMe';
import ContactMe from './ContactMe';
import Tutorial from './Tutorial';
import { getMe, resetTutorial } from './api';
function App() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState('home');
  const [dark, setDark] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialSeen, setTutorialSeen] = useState(!!localStorage.getItem('tutorialSeen'));
  const contactRef = useRef(null);

  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  // Sync server/local tutorialSeen state and show the initial 'Get Started' prompt bubble (NOT auto-opening tutorial)
  React.useEffect(() => {
    const sync = async () => {
      if (!token) {
        const seenLocal = localStorage.getItem('tutorialSeen') === 'true';
        setTutorialSeen(seenLocal);
        return;
      }

      try {
        const res = await getMe(token);
        const serverSeen = !!res.data?.tutorialSeen;
        if (serverSeen) {
          localStorage.setItem('tutorialSeen', 'true');
          setTutorialSeen(true);
          return;
        }
      } catch (e) {
        // server unavailable, fall back to localStorage
      }

      const seenLocal = localStorage.getItem('tutorialSeen') === 'true';
      setTutorialSeen(seenLocal);
      // do NOT auto-open tutorial; instead show the top-left prompt bubble (render logic uses `tutorialSeen`)
    };
    sync();
  }, [token]);

  const handleScrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const promptVisible = !!(token && !tutorialSeen); // first-time login prompt

  return (
    <div id="layout" className={promptVisible ? 'tutorial-prompt-active' : ''}>
      <header className="site-header">
        <div className="header-logo">🌱</div>
        <div className="header-title">Habit Tracker SaaS</div>
        <div className="header-subtitle">Track your habits, grow your life</div>
        <button className="header-contact-btn" onClick={handleScrollToContact}>Contact Me</button>
      </header>
      {/* Centered Get Started prompt for first-time logged-in users */}
      {promptVisible && (
        <div className="getstarted-center" role="dialog" aria-modal="true">
          <div className="getstarted-card">
            <h2>Welcome — Get Started</h2>
            <p className="muted">A short walkthrough will show how to add and complete habits.</p>
            <div className="getstarted-actions">
              <button className="getstarted-btn" onClick={() => setShowTutorial(true)}>Get Started</button>
            </div>
          </div>
        </div>
      )}

      {/* replay bubble — shown after tutorial was seen so user can re-open it */}
      {token && tutorialSeen && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <button
            className={`tutorial-replay replay`}
            title={'Show tutorial'}
            aria-label={'Show tutorial'}
            onClick={() => setShowTutorial(true)}
          >
            🛈
          </button>
          <button className="tutorial-reset" onClick={async () => { try { await resetTutorial(token); localStorage.removeItem('tutorialSeen'); setTutorialSeen(false); } catch(e){ /* ignore */ } }} title="Reset tutorial">Reset</button>
        </div>
      )}
      <div className="main-wrapper">
        <aside className="sidebar">
          <div className="sidebar-title">Navigation</div>
          <button className={`sidebar-link${page==='home'?' active':''}`} onClick={() => setPage('home')}>Home</button>
          <button className={`sidebar-link${page==='about'?' active':''}`} onClick={() => setPage('about')}>About Me</button>
          <button className="sidebar-dark-toggle" onClick={() => setDark(d => !d)}>
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </aside>
        <main className="main-content">
          {page === 'about' ? <AboutMe /> : (token ? <Habits /> : <LoginRegister />)}
          {/* ContactMe at end of landing page */}
          <div ref={contactRef} id="contact-section">
            <ContactMe />
          </div>
        </main>
        {/* Render tutorial at root level so it truly pops up above everything */}
          <Tutorial visible={showTutorial} onClose={() => { setShowTutorial(false); setTutorialSeen(true); }} token={token} />
      </div>
      <footer className="site-footer">
        &copy; {new Date().getFullYear()} Habit Tracker SaaS. All rights reserved. | Created by Mamdouh
      </footer>
    </div>
  );
}

export default App;
