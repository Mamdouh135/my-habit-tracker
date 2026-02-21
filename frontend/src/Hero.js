import React from 'react';

export default function Hero({ contactRef, setPage, token, setAuthInitial, showGetStarted, openTutorial, onDismiss }) {
  const handlePrimary = () => {
    // If user is logged-in and this is the first time, open the tutorial
    if (token && showGetStarted) {
      if (openTutorial) openTutorial();
      return;
    }

    // Otherwise behave like before: unauthenticated -> open register; authenticated -> go to app
    if (!token) {
      if (setAuthInitial) setAuthInitial('register');
      setPage('home');
      return;
    }
    setPage('home');
  };

  const handleSecondary = () => setPage('about');

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-copy">
          {onDismiss && (
            <button className="hero-dismiss" onClick={onDismiss} title="Hide this section forever" aria-label="Hide hero section">✖</button>
          )}
          <h1>Build better habits. Live intentionally.</h1>
          <p className="hero-sub">A focused habit tracker with secure auth, effortless tracking, and a clean, futuristic interface designed to help you ship small wins every day.</p>
          <div className="hero-ctas">
            {showGetStarted && (
              <button className="hero-cta-primary" onClick={handlePrimary}>Get Started</button>
            )}
            <button className="hero-cta-secondary" onClick={handleSecondary}>Learn More</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="card-sample">
            <div className="card-title">Today's routine</div>
            <ul className="card-list">
              <li>🧘 Morning meditation</li>
              <li>📚 Read 20 pages</li>
              <li>🏃 Exercise 20 min</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
