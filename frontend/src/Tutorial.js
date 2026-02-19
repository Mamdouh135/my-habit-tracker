import React, { useState, useEffect, useRef } from 'react';
import { setTutorialSeen } from './api';

// Helper: find element with retry
function findElement(selector, attempts = 12, interval = 120) {
  return new Promise(resolve => {
    let i = 0;
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      i += 1;
      if (i >= attempts) return resolve(null);
      setTimeout(tick, interval);
    };
    tick();
  });
}

export default function Tutorial({ visible, onClose, token, setPage }) {
  const [step, setStep] = useState(0);
  const [pointer, setPointer] = useState(null); // {top,left,width,height,placement}
  const finishBtnRef = useRef(null);

  const interactiveSteps = [
    {
      title: 'Welcome',
      body: 'This quick interactive tour shows how to add and complete habits.'
    },
    {
      title: 'Add a Habit',
      body: 'Type a short habit name in this field.',
      selector: '.add-habit-input',
      placement: 'right',
      page: 'home'
    },
    {
      title: 'Save the Habit',
      body: 'Click the Add button to save your habit.',
      selector: '.add-habit-btn',
      placement: 'bottom',
      page: 'home'
    },
    {
      title: 'Mark Complete',
      body: 'Tap the mark-as-done button to record a completion for today.',
      selector: '.habit-complete-btn',
      placement: 'left',
      page: 'home'
    }
  ];

  useEffect(() => {
    if (visible) {
      setStep(0);
      setPointer(null);
      document.body.style.overflow = 'hidden';
      setTimeout(() => finishBtnRef.current?.focus(), 120);
      return () => { document.body.style.overflow = ''; };
    }
  }, [visible]);

  // when step changes, if it has a selector, try to locate and position the pointer/highlight
  useEffect(() => {
    if (!visible) return;
    const s = interactiveSteps[step];
    let cancelled = false;

    (async () => {
      setPointer(null);
      if (s?.page && setPage) setPage(s.page);
      if (!s?.selector) return;
      const el = await findElement(s.selector);
      if (!el || cancelled) return;
      // scroll into view then compute rect
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      await new Promise(r => setTimeout(r, 200));
      const rect = el.getBoundingClientRect();
      const pointerBox = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        placement: s.placement || 'top'
      };
      setPointer(pointerBox);
    })();

    return () => { cancelled = true; };
  }, [step, visible]);

  if (!visible) return null;

  const steps = interactiveSteps;

  const finish = async () => {
    try {
      localStorage.setItem('tutorialSeen', 'true');
      if (token) {
        try { await setTutorialSeen(token); } catch (e) {}
      }
    } catch (e) {}
    onClose();
  };

  const s = steps[step];

  return (
    <>
      <div className="tutorial-overlay" role="dialog" aria-modal="true">
        {pointer && (
          <>
            <div
              className="tutorial-highlight"
              style={{
                top: pointer.top - 8,
                left: pointer.left - 8,
                width: pointer.width + 16,
                height: pointer.height + 16
              }}
            />
            <div
              className={`tutorial-pointer tutorial-pointer-${pointer.placement}`}
              style={{
                top: (pointer.placement === 'bottom') ? (pointer.top + pointer.height + 12) : (pointer.top - 12),
                left: pointer.left + pointer.width / 2
              }}
            >
              <div className="tutorial-pointer-label">{s.title}</div>
            </div>
          </>
        )}

        <div className="tutorial-card" role="document" style={{ zIndex: 13000 }}>
          <div className="tutorial-header">
            <div className="tutorial-step">Step {step + 1} / {steps.length}</div>
            <button className="tutorial-skip" onClick={finish}>Skip</button>
          </div>
          <h3 className="tutorial-title">{s.title}</h3>
          <p className="tutorial-body">{s.body}</p>
          <div className="tutorial-actions">
            <button disabled={step === 0} onClick={() => setStep(x => Math.max(0, x - 1))}>Back</button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(x => Math.min(steps.length - 1, x + 1))}>Next</button>
            ) : (
              <button ref={finishBtnRef} className="finish" onClick={finish}>Finish</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
