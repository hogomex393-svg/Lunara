import React from 'react';
import { MOODS, SYMPTOMS } from '../data';

export default function DailyLog({
  navigate, animKey, selectedDate, currentLog, setCurrentLog,
  logSaved, setLogSaved, setLoggedDays, prevScreen,
}) {
  const dateStr = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : 'Today';

  const goBack = () => navigate(prevScreen === 'calendar' ? 'calendar' : 'home');

  if (logSaved) {
    return (
      <div className="daily-log screen-enter" key={animKey}>
        <div className="log-header">
          <button className="back-btn" onClick={() => navigate('home')}>←</button>
          <h2 className="log-date">{dateStr}</h2>
        </div>
        <div className="log-saved">
          <div className="log-saved-icon">✨</div>
          <div className="log-saved-text">Logged!</div>
          <div className="log-saved-sub">Your entry has been saved</div>
          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentLog.moods.map((m) => {
              const mood = MOODS.find((x) => x.id === m);
              return (
                <span key={m} style={{
                  background: mood?.color, padding: '6px 12px',
                  borderRadius: 14, fontSize: 13,
                }}>
                  {mood?.emoji} {mood?.label}
                </span>
              );
            })}
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: 24, width: '100%' }}
            onClick={() => navigate('home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-log screen-enter" key={animKey}>
      <div className="log-header">
        <button className="back-btn" onClick={goBack}>←</button>
        <h2 className="log-date">{dateStr}</h2>
      </div>

      {/* Moods */}
      <div className="log-section" style={{ animationDelay: '0.05s' }}>
        <div className="log-section-title">How are you feeling?</div>
        <div className="mood-grid">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              className={`mood-chip ${currentLog.moods.includes(mood.id) ? 'selected' : ''}`}
              style={currentLog.moods.includes(mood.id) ? { background: mood.color } : {}}
              onClick={() => {
                setCurrentLog((l) => ({
                  ...l,
                  moods: l.moods.includes(mood.id)
                    ? l.moods.filter((m) => m !== mood.id)
                    : [...l.moods, mood.id],
                }));
              }}
            >
              <span className="mood-chip-emoji">{mood.emoji}</span>
              <span className="mood-chip-label">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms */}
      <div className="log-section" style={{ animationDelay: '0.15s' }}>
        <div className="log-section-title">Any symptoms?</div>
        <div className="symptom-grid">
          {SYMPTOMS.map((sym) => (
            <button
              key={sym.id}
              className={`symptom-chip ${currentLog.symptoms.includes(sym.id) ? 'selected' : ''}`}
              onClick={() => {
                setCurrentLog((l) => ({
                  ...l,
                  symptoms: l.symptoms.includes(sym.id)
                    ? l.symptoms.filter((s) => s !== sym.id)
                    : [...l.symptoms, sym.id],
                }));
              }}
            >
              <span>{sym.icon}</span> {sym.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="log-section" style={{ animationDelay: '0.25s' }}>
        <div className="log-section-title">Notes (optional)</div>
        <textarea
          className="notes-input"
          placeholder="Anything else you'd like to note..."
          value={currentLog.notes}
          onChange={(e) => setCurrentLog((l) => ({ ...l, notes: e.target.value }))}
        />
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 8 }}
        onClick={() => {
          if (selectedDate) {
            const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
            setLoggedDays((d) => ({ ...d, [key]: { ...currentLog } }));
          }
          setLogSaved(true);
        }}
      >
        Save Entry
      </button>
    </div>
  );
}
