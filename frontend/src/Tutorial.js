import React, { useState, useEffect, useRef } from 'react';
import { setTutorialSeen } from './api';

export default function Tutorial({ visible, onClose, token }) {
  const [step, setStep] = useState(0);
  const finishBtnRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setStep(0);
      // focus the primary action for visibility / accessibility
      setTimeout(() => finishBtnRef.current?.focus(), 120);
      // prevent body scroll while visible
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [visible]);

  if (!visible) return null;

  const steps = [
    {
      title: 'Welcome',
      body: 'This quick tour will show you how to create and complete habits in three simple steps.'
    },
    {
      title: 'Add a Habit',
      body: 'Use the "Add" input to create a new habit. Keep entries short and actionable.'
    },
    {
      title: 'Mark Complete',
      body: 'Tap "Mark as done" to log a completion for today — celebrate small wins!'
    }
  ];

  const finish = async () => {
    try {
      // persist locally
      localStorage.setItem('tutorialSeen', 'true');
      localStorage.removeItem('showGetStarted');
      // persist server-side when authenticated
      if (token) {
        try { await setTutorialSeen(token); } catch (e) { /* ignore server errors */ }
      }
    } catch (e) {}
    onClose();
  };

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true">
      <div className="tutorial-card" role="document">
        <div className="tutorial-header">
          <div className="tutorial-step">Step {step + 1} / {steps.length}</div>
          <button className="tutorial-skip" onClick={finish}>Skip</button>
        </div>
        <h3 className="tutorial-title">{steps[step].title}</h3>
        <p className="tutorial-body">{steps[step].body}</p>
        <div className="tutorial-actions">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}>Next</button>
          ) : (
            <button ref={finishBtnRef} className="finish" onClick={finish}>Finish</button>
          )}
        </div>
      </div>
    </div>
  );
}
