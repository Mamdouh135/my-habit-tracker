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
  const { token, userProfile } = useContext(AuthContext);
  const [displayAvatar, setDisplayAvatar] = useState('');

  const dataUriToBlobUrl = uri => {
    try {
      const byteString = atob(uri.split(',')[1]);
      const mimeString = uri.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      return URL.createObjectURL(blob);
    } catch {
      return uri;
    }
  };

  useEffect(() => {
    if (userProfile && userProfile.avatar) {
      if (userProfile.avatar.startsWith('data:')) {
        setDisplayAvatar(dataUriToBlobUrl(userProfile.avatar));
      } else {
        setDisplayAvatar(userProfile.avatar);
      }
    } else {
      setDisplayAvatar('');
    }
  }, [userProfile]);
  const [page, setPage] = useState('home');
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('dark') === 'true';
    } catch { return false; }
  });
  const [authInitial, setAuthInitial] = useState(null); // 'register' | 'login' | null
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGetStartedFlag, setShowGetStartedFlag] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showProfile, setShowProfile] = useState(() => {
    try {
      return localStorage.getItem('showProfile') === 'true';
    } catch { return false; }
  });

  const toggleProfile = (v) => {
    setShowProfile(v);
    try { localStorage.setItem('showProfile', v); } catch {}
  };
  const contactRef = useRef(null);

  // hero section visibility (persistent per user)
  const [heroVisible, setHeroVisible] = useState(() => {
    try {
      return localStorage.getItem('hideHero') !== 'true';
    } catch { return true; }
  });

  const hideHero = () => {
    setHeroVisible(false);
    try { localStorage.setItem('hideHero', 'true'); } catch {}
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

  // Close profile drawer when user logs out
  useEffect(() => {
    if (!token) {
      toggleProfile(false);
    }
  }, [token]);

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
          {token && (
            <>
              <span className="header-username">{userProfile.name || ''}</span>
              <button className="header-profile-btn" onClick={() => toggleProfile(true)} title="Profile" aria-label="Profile">
                <img src={displayAvatar || userProfile.avatar || 'https://via.placeholder.com/32?text=?'} alt="profile" className="header-profile-avatar" />
              </button>
            </>
          )}
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
