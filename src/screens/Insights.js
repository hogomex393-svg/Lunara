import React from 'react';
import { CYCLE_PHASES } from '../data';

export default function Insights({ navigate, animKey, totalLogs }) {
  const moodData = [
    { day: 'Mon', happy: 70, anxious: 20 },
    { day: 'Tue', happy: 50, anxious: 40 },
    { day: 'Wed', happy: 60, anxious: 30 },
    { day: 'Thu', happy: 40, anxious: 55 },
    { day: 'Fri', happy: 30, anxious: 65 },
    { day: 'Sat', happy: 55, anxious: 35 },
    { day: 'Sun', happy: 65, anxious: 25 },
  ];

  return (
    <div className="insights screen-enter" key={animKey}>
      <h2 className="insights-title">Your Insights</h2>

      {/* Mood Trend Chart */}
      <div className="chart-card">
        <div className="chart-title">Mood Trends This Week</div>
        <div className="bar-chart">
          {moodData.map((d, i) => (
            <div key={d.day} className="bar-col">
              <div
                className="bar"
                style={{ height: `${d.happy}%`, background: 'var(--pink-200)' }}
              />
              <div
                className="bar"
                style={{ height: `${d.anxious}%`, background: 'var(--lavender-200)' }}
              />
              <span className="bar-label">{d.day}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center' }}>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--pink-200)' }} /> Happy
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--lavender-200)' }} /> Anxious
          </div>
        </div>
      </div>

      {/* Pattern */}
      <div className="pattern-card">
        <div className="pattern-title">🔍 Pattern Detected</div>
        <div className="pattern-text">
          <span className="pattern-highlight">Anxiety tends to increase</span> during your
          luteal phase (days 17–28). This is common — progesterone shifts can affect mood.
          Consider calming activities during this time.
        </div>
      </div>

      {/* Cycle vs Emotion */}
      <div className="chart-card">
        <div className="chart-title">Cycle vs. Emotion</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {CYCLE_PHASES.map((phase) => (
            <div key={phase.name} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 60, borderRadius: 8,
                background: `linear-gradient(to top, ${phase.color}80, ${phase.color}20)`,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: 4, marginBottom: 6,
              }}>
                <span style={{ fontSize: 18 }}>{phase.icon}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{phase.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Accumulation */}
      <div
        className="pattern-card"
        style={{ background: 'linear-gradient(135deg, var(--beige-100), var(--sage-100))' }}
      >
        <div className="pattern-title">📈 Data Accumulation</div>
        <div className="pattern-text">
          You've logged <span className="pattern-highlight">{Math.max(totalLogs, 3)} days</span> so
          far. Keep logging to unlock deeper insights about your unique patterns. After 3 cycles,
          we can predict mood shifts with better accuracy.
        </div>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 8 }}
        onClick={() => navigate('advice')}
      >
        View Personalized Advice →
      </button>
    </div>
  );
}
