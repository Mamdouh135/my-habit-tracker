import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from './AuthContext';
import LoginRegister from './LoginRegister';
import Habits from './Habits';
import AboutMe from './AboutMe';
import ContactMe from './ContactMe';
import Hero from './Hero';
import Tutorial from './Tutorial';
function App() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState('home');
  const [dark, setDark] = useState(false);
  const [authInitial, setAuthInitial] = useState(null); // 'register' | 'login' | null
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGetStartedFlag, setShowGetStartedFlag] = useState(false);
  const contactRef = useRef(null);

  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  // Reflect localStorage flag into React state and auto-open tutorial after first login
  React.useEffect(() => {
    const sync = async () => {
      if (!token) {
        setShowGetStartedFlag(false);
        return;
      }
      // server-side check wins; fall back to localStorage when server is unavailable
      try {
        const res = await getMe(token);
        const serverSeen = !!res.data?.tutorialSeen;
        if (serverSeen) {
          localStorage.setItem('tutorialSeen', 'true');
          localStorage.removeItem('showGetStarted');
          setShowGetStartedFlag(false);
          return;
        }
      } catch (e) {
        // ignore and fall back to localStorage
      }

      const shouldShow = !!(localStorage.getItem('showGetStarted') === 'true' && localStorage.getItem('tutorialSeen') !== 'true');
      setShowGetStartedFlag(shouldShow);
      if (shouldShow) setShowTutorial(true);
    };
    sync();
  }, [token]);

  const handleScrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="layout">
      <header className="site-header">
        <div className="header-logo">🌱</div>
        <div className="header-title">Habit Tracker SaaS</div>
        <div className="header-subtitle">Track your habits, grow your life</div>
        <button className="header-contact-btn" onClick={handleScrollToContact}>Contact Me</button>
      </header>
      <Hero
        contactRef={contactRef}
        setPage={setPage}
        token={token}
        setAuthInitial={setAuthInitial}
        showGetStarted={showGetStartedFlag}
        openTutorial={() => setShowTutorial(true)}
      />
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
          {page === 'about' ? <AboutMe /> : (token ? <Habits /> : <LoginRegister initial={authInitial} />)}
          {/* ContactMe at end of landing page */}
          <div ref={contactRef} id="contact-section">
            <ContactMe />
          </div>
        </main>
        {/* Render tutorial at root level so it truly pops up above everything */}
          <Tutorial visible={showTutorial} onClose={() => setShowTutorial(false)} token={token} />
      </div>
      <footer className="site-footer">
        &copy; {new Date().getFullYear()} Habit Tracker SaaS. All rights reserved. | Created by Mamdouh
      </footer>
    </div>
  );
}

export default App;
