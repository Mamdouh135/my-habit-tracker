import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from './AuthContext';
import LoginRegister from './LoginRegister';
import Habits from './Habits';
import AboutMe from './AboutMe';
import ContactMe from './ContactMe';
import Hero from './Hero';
function App() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState('home');
  const [dark, setDark] = useState(false);
  const contactRef = useRef(null);

  React.useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

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
      <Hero contactRef={contactRef} setPage={setPage} token={token} />
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
      </div>
      <footer className="site-footer">
        &copy; {new Date().getFullYear()} Habit Tracker SaaS. All rights reserved. | Created by Mamdouh
      </footer>
    </div>
  );
}

export default App;
