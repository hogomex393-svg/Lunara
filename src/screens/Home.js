import React from 'react';
import { MOODS, SYMPTOMS } from '../data';

export default function Home({
  navigate, animKey, today, cycleDay, nextPeriod,
  loggedDays, todayKey, totalLogs,
  setSelectedDate, setCurrentLog, setLogSaved,
}) {
  const hasLoggedToday = !!loggedDays[todayKey];

  const openLog = () => {
    setSelectedDate(today);
    setCurrentLog({ moods: [], symptoms: [], notes: '' });
    setLogSaved(false);
    navigate('log');
  };

  return (
    <div className="home screen-enter" key={animKey}>
      {/* Header */}
      <div className="home-header">
        <div>
          <div className="home-greeting">
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'},
          </div>
          <div className="home-name">Luna</div>
        </div>
        <button className="home-avatar" onClick={() => navigate('profile')}>🌙</button>
      </div>

      {/* Cycle Ring */}
      <div className="cycle-ring-card">
        <div className="cycle-ring">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="80" cy="80" r="70" fill="none" stroke="url(#grad)" strokeWidth="8"
              strokeDasharray={`${(cycleDay / 28) * 440} 440`} strokeLinecap="round"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--pink-300)" />
                <stop offset="100%" stopColor="var(--lavender-300)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="cycle-ring-inner">
            <div className="cycle-day">{cycleDay}</div>
            <div className="cycle-label">Day of 28</div>
          </div>
        </div>
        <div className="cycle-phase">Luteal Phase 🍂</div>
        <div className="cycle-prediction">Next period predicted: {nextPeriod}</div>
      </div>

      {/* Notification */}
      <div className="notification-card">
        <div className="notification-icon">🔔</div>
        <div>
          <div className="notification-text">
            <strong>Your period may start soon.</strong>
          </div>
          <div className="notification-suggestion">
            💡 Stock up on essentials and try some gentle yoga
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {[
          { icon: '📝', label: 'Log Today', bg: 'var(--pink-100)', action: openLog },
          { icon: '📅', label: 'Calendar', bg: 'var(--lavender-100)', action: () => navigate('calendar') },
          { icon: '📊', label: 'Insights', bg: 'var(--beige-100)', action: () => navigate('insights') },
          { icon: '💬', label: 'Community', bg: 'var(--sage-100)', action: () => navigate('community') },
        ].map(({ icon, label, bg, action }) => (
          <button key={label} className="quick-action" onClick={action}>
            <div className="quick-action-icon" style={{ background: bg }}>{icon}</div>
            <span className="quick-action-label">{label}</span>
          </button>
        ))}
      </div>

      {/* Today's Log or CTA */}
      {hasLoggedToday ? (
        <div className="mood-summary-card">
          <div className="card-title">Today's Log ✨</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {loggedDays[todayKey].moods.map((m) => {
              const mood = MOODS.find((x) => x.id === m);
              return (
                <span key={m} style={{
                  background: mood?.color, padding: '4px 10px',
                  borderRadius: 12, fontSize: 13,
                }}>
                  {mood?.emoji} {mood?.label}
                </span>
              );
            })}
          </div>
          {loggedDays[todayKey].symptoms.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Symptoms: {loggedDays[todayKey].symptoms
                .map((s) => SYMPTOMS.find((x) => x.id === s)?.label)
                .join(', ')}
            </div>
          )}
        </div>
      ) : (
        <div className="mood-summary-card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={openLog}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
          <div className="card-title">How are you feeling today?</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Tap to log your mood and symptoms
          </div>
        </div>
      )}

      {/* Weekly Mood */}
      <div className="mood-summary-card">
        <div className="card-title">This Week</div>
        <div className="mood-week">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
            const dayKey = `2026-4-${today.getDate() - today.getDay() + i + 1}`;
            const log = loggedDays[dayKey];
            const moodId = log?.moods?.[0];
            const mood = MOODS.find((m) => m.id === moodId);
            const isPast = i < today.getDay() - 1;
            return (
              <div key={d} className="mood-day-col">
                <span className="mood-day-label">{d}</span>
                <div
                  className={`mood-day-dot ${!mood ? 'empty' : ''}`}
                  style={mood ? { background: mood.color } : {}}
                >
                  {mood ? mood.emoji : isPast ? '·' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight Preview */}
      {totalLogs >= 1 && (
        <div
          className="insight-preview"
          onClick={() => navigate('insights')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card-title" style={{ marginBottom: 8 }}>💡 Pattern Detected</div>
          <div className="insight-text">
            <span className="insight-pattern">
              "You tend to feel more anxious before your period"
            </span>{' '}
            — based on your recent logs. Tap for full insights.
          </div>
        </div>
      )}
    </div>
  );
}
