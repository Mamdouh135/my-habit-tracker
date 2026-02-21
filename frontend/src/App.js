import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import LoginRegister from './LoginRegister';
import Habits from './Habits';
import AboutMe from './AboutMe';
import ContactMe from './ContactMe';
import Hero from './Hero';
import Tutorial from './Tutorial';
import ProfileDashboard from './ProfileDashboard';
function App() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState('home');
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('dark') === 'true';
  });
  const [authInitial, setAuthInitial] = useState(null); // 'register' | 'login' | null
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGetStartedFlag, setShowGetStartedFlag] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showProfile, setShowProfile] = useState(() => {
    return localStorage.getItem('showProfile') === 'true';
  });

  const toggleProfile = (v) => {
    setShowProfile(v);
    localStorage.setItem('showProfile', v);
  };
  const contactRef = useRef(null);

  // hero section visibility (persistent per user)
  const [heroVisible, setHeroVisible] = useState(() => {
    return localStorage.getItem('hideHero') !== 'true';
  });

  const hideHero = () => {
    setHeroVisible(false);
    localStorage.setItem('hideHero', 'true');
  };

  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem('dark', dark); } catch {};
  }, [dark]);

  // Back to Top button scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset;
      setShowBackToTop(scrollPosition > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reflect localStorage flag into React state and auto-open tutorial after first login
  React.useEffect(() => {
    const shouldShow = !!(token && localStorage.getItem('showGetStarted') === 'true' && localStorage.getItem('tutorialSeen') !== 'true');
    setShowGetStartedFlag(shouldShow);
    
    // Check for immediate tutorial trigger (set during registration)
    const autoShow = localStorage.getItem('autoShowTutorial') === 'true';
    if (token && (shouldShow || autoShow)) {
      // Small delay to ensure Habits component renders first
      setTimeout(() => {
        setShowTutorial(true);
        localStorage.removeItem('autoShowTutorial');
      }, 600);
    }
  }, [token]);

  const handleScrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div id="layout">
      <header className="site-header">
        <div className="header-left">
          <div className="header-logo">🌱</div>
          <button className="header-contact-btn" onClick={handleScrollToContact}>Contact Me</button>
        </div>
        <div className="header-center">
          <div className="header-title">Habit Tracker SaaS</div>
          <div className="header-subtitle">Track your habits, grow your life</div>
        </div>
        <div className="header-right">
          <button className="header-profile-btn" onClick={() => toggleProfile(true)} title="Profile" aria-label="Profile">
            <img src="https://i.pravatar.cc/32?u=habit-tracker" alt="profile" className="header-profile-avatar" />
          </button>
        </div>
      </header>
      {heroVisible && (
        <Hero
          contactRef={contactRef}
          setPage={setPage}
          token={token}
          setAuthInitial={setAuthInitial}
          showGetStarted={showGetStartedFlag}
          openTutorial={() => setShowTutorial(true)}
          onDismiss={hideHero}
        />
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
          {page === 'about' ? <AboutMe /> : (token ? <Habits /> : <LoginRegister initial={authInitial} />)}
          

          {/* ContactMe at end of landing page */}
          <div ref={contactRef} id="contact-section">
            <ContactMe />
          </div>
        </main>
        {/* Render tutorial at root level so it truly pops up above everything */}
        <Tutorial visible={showTutorial} onClose={() => setShowTutorial(false)} />
        <ProfileDashboard visible={showProfile} onClose={() => toggleProfile(false)} token={token} />
      </div>
      {/* Help button to re-open tutorial (always visible when logged in) */}
      {token && !showTutorial && (
        <button
          className="tutorial-help-btn"
          onClick={() => setShowTutorial(true)}
          title="Show tutorial"
          aria-label="Show tutorial"
        >
          ?
        </button>
      )}
      <footer className="site-footer">
        &copy; {new Date().getFullYear()} Habit Tracker SaaS. All rights reserved. | Created by Mamdouh
      </footer>
      
      {/* Back to Top Button */}
      <button
        className={`back-to-top-button ${showBackToTop ? 'visible' : 'hidden'}`}
        onClick={handleBackToTop}
        aria-label="Back to top"
        title="Back to top"
      >
        ↑
      </button>
    </div>
  );
}

export default App;
