import React from 'react';
import { ONBOARDING_QUESTIONS } from '../data';

export default function Onboarding({ step, setStep, answers, setAnswers }) {
  const q = ONBOARDING_QUESTIONS[step];
  const selected = answers[q.id];

  const toggleMulti = (opt) => {
    setAnswers((a) => {
      const current = Array.isArray(a[q.id]) ? a[q.id] : [];
      if (current.includes(opt)) {
        return { ...a, [q.id]: current.filter((x) => x !== opt) };
      }
      return { ...a, [q.id]: [...current, opt] };
    });
  };

  const isMultiSelected = (opt) =>
    Array.isArray(selected) && selected.includes(opt);

  const today = new Date().toISOString().split('T')[0];

  const renderOptions = () => {
    if (q.type === 'date') {
      return (
        <div className="onboarding-date-picker">
          <div className="date-wrapper">
            <input
              type="date"
              lang="en-US"
              className="date-input"
              max={today}
              value={selected || ''}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
              }
            />
            {!selected && (
              <span className="date-placeholder-overlay">YYYY / MM / DD</span>
            )}
          </div>
          {selected && (
            <div className="date-selected-label">
              {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="onboarding-options">
        {q.options.map((opt) => {
          const isSelected = q.multiSelect ? isMultiSelected(opt) : selected === opt;
          return (
            <button
              key={opt}
              className={`option-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (q.multiSelect) {
                  toggleMulti(opt);
                } else {
                  setAnswers((a) => ({ ...a, [q.id]: opt }));
                }
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const handleSkip = () => {
    setAnswers((a) => ({
      ...a,
      [q.id]: q.multiSelect ? [] : q.type === 'date' ? '' : 'Prefer not to answer',
    }));
    setStep((s) => s + 1);
  };

  return (
    <div className="onboarding">
      <div className="onboarding-progress">
        {ONBOARDING_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`progress-dot ${i < step ? 'done' : ''} ${
              i === step ? 'active' : ''
            }`}
          />
        ))}
      </div>
      <div className="onboarding-step">
        Step {step + 1} of {ONBOARDING_QUESTIONS.length}
        {q.multiSelect && (
          <span className="multi-hint"> · select all that apply</span>
        )}
      </div>
      <h2 className="onboarding-question">{q.question}</h2>
      <p className="onboarding-subtitle">{q.subtitle}</p>
      {renderOptions()}
      <button className="skip-btn" onClick={handleSkip}>
        {q.type === 'date' ? 'Skip for now' : 'Prefer not to answer'}
      </button>
      <div className="nav-btns">
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        <button className="btn-primary" onClick={() => setStep((s) => s + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
