import React from 'react';
import { useLanguage } from './LanguageContext';
import './App.css';

export default function AboutMe() {
  const { t } = useLanguage();
  
  return (
    <div className="app-container">
      <h1>{t('aboutMeTitle')}</h1>
      <p><strong>{t('nameLabel')}</strong> Mamdouh</p>
      <p><strong>{t('position')}</strong> {t('positionValue')}</p>
      <p><strong>{t('education')}</strong> {t('educationValue')}</p>
      <p>{t('aboutMeDesc')}</p>
    </div>
  );
}
