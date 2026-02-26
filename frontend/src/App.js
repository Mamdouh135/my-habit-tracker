import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from './AuthContext';
import { useLanguage } from './LanguageContext';
import LoginRegister from './LoginRegister';
import Habits from './Habits';
import AboutMe from './AboutMe';
import ContactMe from './ContactMe';
import Tutorial from './Tutorial';
import ProfileDashboard from './ProfileDashboard';
import Routines from './Routines';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};
function App() {
  const { token, userProfile } = useContext(AuthContext);
  const { language, toggleLanguage, t } = useLanguage();
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleProfile = (v) => {
    setShowProfile(v);
    try { localStorage.setItem('showProfile', v); } catch {}
  };
  const contactRef = useRef(null);


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
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Menu">
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
          <div className="header-logo">🌱</div>
          <button className="header-contact-btn" onClick={handleScrollToContact}>{t('contactMe')}</button>
        </div>
        <div className="header-center">
          <div className="header-title">{t('habitTracker')}</div>
          <div className="header-subtitle">{t('subtitle')}</div>
        </div>
        <div className="header-right">
          <button className="lang-toggle-btn" onClick={toggleLanguage} title={t('language')}>
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
          {token && (
            <>
              <span className="header-username">{userProfile.name || ''}</span>
              <button className="header-profile-btn" onClick={() => toggleProfile(true)} title={t('profile')} aria-label={t('profile')}>
                <img src={displayAvatar || userProfile.avatar || 'https://via.placeholder.com/32?text=?'} alt="profile" className="header-profile-avatar" />
              </button>
            </>
          )}
        </div>
      </header>
      <div className="main-wrapper">
        {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
        <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <button className="sidebar-close-btn" onClick={() => setMobileMenuOpen(false)}>✕</button>
          <div className="sidebar-title">{t('navigation')}</div>
          <button className={`sidebar-link${page==='home'?' active':''}`} onClick={() => { setPage('home'); setMobileMenuOpen(false); }}>{t('home')}</button>
          <button className={`sidebar-link${page==='routines'?' active':''}`} onClick={() => { setPage('routines'); setMobileMenuOpen(false); }}>{t('routines')}</button>
          <button className={`sidebar-link${page==='about'?' active':''}`} onClick={() => { setPage('about'); setMobileMenuOpen(false); }}>{t('aboutMe')}</button>
          <button className="sidebar-dark-toggle" onClick={() => setDark(d => !d)}>
            {dark ? t('lightMode') : t('darkMode')}
          </button>
        </aside>
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={page + (token ? '-auth' : '-noauth')}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              {page === 'about' ? <AboutMe /> : page === 'routines' ? <Routines /> : (token ? <Habits /> : <LoginRegister initial={authInitial} />)}
            </motion.div>
          </AnimatePresence>
          

          {/* ContactMe at end of landing page */}
          <motion.div 
            ref={contactRef} 
            id="contact-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <ContactMe />
          </motion.div>
        </main>
        {/* Render tutorial at root level so it truly pops up above everything */}
        <Tutorial visible={showTutorial} onClose={() => setShowTutorial(false)} />
        <ProfileDashboard visible={showProfile} onClose={() => toggleProfile(false)} token={token} />
      </div>
      {/* Help button to re-open tutorial (always visible when logged in) */}
      <AnimatePresence>
        {token && !showTutorial && (
          <motion.button
            className="tutorial-help-btn"
            onClick={() => setShowTutorial(true)}
            title={t('showTutorial')}
            aria-label={t('showTutorial')}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ?
          </motion.button>
        )}
      </AnimatePresence>
      <footer className="site-footer">
        &copy; {new Date().getFullYear()} {t('footer')}
      </footer>
      
      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="back-to-top-button visible"
            onClick={handleBackToTop}
            aria-label={t('backToTop')}
            title={t('backToTop')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
