import React from 'react';
import { useLanguage } from './LanguageContext';

export default function Hero({ contactRef, setPage, token, setAuthInitial, showGetStarted, openTutorial, onDismiss }) {
  const { t } = useLanguage();
  
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
            <button className="hero-dismiss" onClick={onDismiss} title={t('hideSection')} aria-label={t('hideSection')}>✖</button>
          )}
          <h1>{t('heroTitle')}</h1>
          <p className="hero-sub">{t('heroSub')}</p>
          <div className="hero-ctas">
            {showGetStarted && (
              <button className="hero-cta-primary" onClick={handlePrimary}>{t('getStarted')}</button>
            )}
            <button className="hero-cta-secondary" onClick={handleSecondary}>{t('learnMore')}</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="card-sample">
            <div className="card-title">{t('todayRoutine')}</div>
            <ul className="card-list">
              <li>{t('morningMeditation')}</li>
              <li>{t('read20Pages')}</li>
              <li>{t('exercise20Min')}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
