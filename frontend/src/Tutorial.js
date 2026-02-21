import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function Tutorial({ visible, onClose }) {
  const [step, setStep] = useState(0);
  const [highlight, setHighlight] = useState(null);
  const retryCountRef = useRef(0);
  const currentTargetRef = useRef(null);

  // Steps: user must perform each action to advance
  const steps = [
    {
      title: 'Type a Habit',
      body: 'Type a habit in the input box below. Try "Brush your teeth" as a suggestion!',
      selector: '.add-habit-input',
      waitFor: 'input',
      placement: 'bottom'
    },
    {
      title: 'Add the Habit',
      body: 'Click the "Add" button to save your habit.',
      selector: '.add-habit-btn',
      waitFor: 'habitAdded',
      placement: 'bottom'
    },
    {
      title: 'Mark as Done',
      body: 'Click "Mark as done" to complete the habit for today.',
      selector: '.habit-complete-btn',
      waitFor: 'habitCompleted',
      placement: 'top'
    },
    {
      title: 'Delete the Habit',
      body: 'Click "Delete" to remove the habit.',
      selector: '.habit-delete-btn',
      waitFor: 'habitDeleted',
      placement: 'top'
    }
  ];

  const finish = useCallback(() => {
    // Remove highlight class from any element
    if (currentTargetRef.current) {
      currentTargetRef.current.classList.remove('tutorial-target-active');
      currentTargetRef.current = null;
    }
    try {
      localStorage.setItem('tutorialSeen', 'true');
      localStorage.removeItem('showGetStarted');
    } catch (e) {}
    onClose();
  }, [onClose]);

  // Add highlight class to target element and update position
  const highlightElement = useCallback((el, placement) => {
    // Remove from previous element
    if (currentTargetRef.current && currentTargetRef.current !== el) {
      currentTargetRef.current.classList.remove('tutorial-target-active');
    }
    
    if (el) {
      el.classList.add('tutorial-target-active');
      currentTargetRef.current = el;
      
      const rect = el.getBoundingClientRect();
      setHighlight({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        placement: placement || 'bottom'
      });
    }
  }, []);

  // Recalculate highlight position (for scroll/resize)
  const recalculateHighlight = useCallback((currentStep) => {
    const s = steps[currentStep];
    if (!s?.selector) return;
    const el = document.querySelector(s.selector);
    if (!el) return;
    highlightElement(el, s.placement);
  }, [steps, highlightElement]);

  // Position highlight box around the target element (with retry and scroll)
  const updateHighlight = useCallback((currentStep) => {
    const s = steps[currentStep];
    if (!s?.selector) {
      setHighlight(null);
      return;
    }
    const el = document.querySelector(s.selector);
    if (!el) {
      // Retry up to 15 times with 150ms delay
      if (retryCountRef.current < 15) {
        retryCountRef.current++;
        setTimeout(() => updateHighlight(currentStep), 150);
      }
      return;
    }
    retryCountRef.current = 0;
    
    // Scroll into view then highlight
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    
    setTimeout(() => {
      highlightElement(el, s.placement);
    }, 250);
  }, [steps, highlightElement]);

  // Watch for user completing the current step's action
  useEffect(() => {
    if (!visible) return;

    const s = steps[step];
    if (!s) return;

    let observer = null;
    let intervalId = null;
    let initialHabitCount = document.querySelectorAll('ul li').length;

    const advanceStep = () => {
      if (step < steps.length - 1) {
        setStep(prev => prev + 1);
      } else {
        finish();
      }
    };

    const checkCondition = () => {
      switch (s.waitFor) {
        case 'input': {
          const input = document.querySelector('.add-habit-input');
          if (input && input.value.trim().length > 0) {
            advanceStep();
            return true;
          }
          break;
        }
        case 'habitAdded': {
          const currentCount = document.querySelectorAll('ul li').length;
          if (currentCount > initialHabitCount) {
            advanceStep();
            return true;
          }
          break;
        }
        case 'habitCompleted': {
          const doneIndicator = document.querySelector('.habit-done');
          if (doneIndicator) {
            advanceStep();
            return true;
          }
          break;
        }
        case 'habitDeleted': {
          const currentCount = document.querySelectorAll('ul li').length;
          if (currentCount < initialHabitCount || (initialHabitCount > 0 && currentCount === 0)) {
            finish();
            return true;
          }
          break;
        }
        default:
          break;
      }
      return false;
    };

    // Use MutationObserver for immediate DOM change detection
    observer = new MutationObserver(() => {
      checkCondition();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    // Poll for input changes (MutationObserver doesn't catch input value changes well)
    if (s.waitFor === 'input') {
      intervalId = setInterval(checkCondition, 100);
    }

    return () => {
      if (observer) observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, [visible, step, finish, steps]);

  // Update highlight when step changes
  useEffect(() => {
    if (visible) {
      retryCountRef.current = 0;
      updateHighlight(step);
      
      const handleUpdate = () => recalculateHighlight(step);
      window.addEventListener('scroll', handleUpdate);
      window.addEventListener('resize', handleUpdate);
      return () => {
        window.removeEventListener('scroll', handleUpdate);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [visible, step, updateHighlight, recalculateHighlight]);

  // Reset step when opening, cleanup when closing
  useEffect(() => {
    if (visible) {
      setStep(0);
      setHighlight(null);
      retryCountRef.current = 0;
    } else {
      if (currentTargetRef.current) {
        currentTargetRef.current.classList.remove('tutorial-target-active');
        currentTargetRef.current = null;
      }
    }
  }, [visible]);

  if (!visible) return null;

  const s = steps[step];

  // Calculate card position - smart positioning to never go off screen
  const cardWidth = 300;
  const cardHeight = 160;
  const padding = 20;
  
  let cardStyle = {
    position: 'fixed',
    zIndex: 100001,
    width: cardWidth + 'px'
  };
  
  if (highlight) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Calculate available space in each direction
    const spaceAbove = highlight.top - padding;
    const spaceBelow = vh - (highlight.top + highlight.height) - padding;
    const spaceLeft = highlight.left - padding;
    const spaceRight = vw - (highlight.left + highlight.width) - padding;
    
    // Determine best position based on available space
    let bestPosition = 'below'; // default
    
    if (spaceBelow >= cardHeight + 20) {
      bestPosition = 'below';
    } else if (spaceAbove >= cardHeight + 20) {
      bestPosition = 'above';
    } else if (spaceRight >= cardWidth + 20) {
      bestPosition = 'right';
    } else if (spaceLeft >= cardWidth + 20) {
      bestPosition = 'left';
    } else {
      // Fallback: position at top-left corner of viewport
      bestPosition = 'corner';
    }
    
    switch (bestPosition) {
      case 'below':
        cardStyle.top = highlight.top + highlight.height + 20;
        cardStyle.left = Math.max(padding, Math.min(highlight.left, vw - cardWidth - padding));
        break;
      case 'above':
        cardStyle.top = highlight.top - cardHeight - 20;
        cardStyle.left = Math.max(padding, Math.min(highlight.left, vw - cardWidth - padding));
        break;
      case 'right':
        cardStyle.top = Math.max(padding, Math.min(highlight.top, vh - cardHeight - padding));
        cardStyle.left = highlight.left + highlight.width + 20;
        break;
      case 'left':
        cardStyle.top = Math.max(padding, Math.min(highlight.top, vh - cardHeight - padding));
        cardStyle.left = highlight.left - cardWidth - 20;
        break;
      case 'corner':
      default:
        cardStyle.top = padding;
        cardStyle.left = padding;
        break;
    }
  } else {
    // Center the card if no highlight yet
    cardStyle.top = '50%';
    cardStyle.left = '50%';
    cardStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <>
      {/* Light overlay that allows interaction */}
      <div className="tutorial-overlay-light" />

      {/* Highlight box around target element */}
      {highlight && (
        <div
          className="tutorial-highlight"
          style={{
            top: highlight.top - 6,
            left: highlight.left - 6,
            width: highlight.width + 12,
            height: highlight.height + 12
          }}
        />
      )}

      {/* Instruction card */}
      <div
        className="tutorial-card tutorial-card--floating"
        role="dialog"
        aria-modal="false"
        style={cardStyle}
      >
        <div className="tutorial-header">
          <div className="tutorial-step">Step {step + 1} / {steps.length}</div>
          <button className="tutorial-skip" onClick={finish}>Skip</button>
        </div>
        <h3 className="tutorial-title">{s.title}</h3>
        <p className="tutorial-body">{s.body}</p>
      </div>
    </>
  );
}
