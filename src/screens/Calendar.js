import React from 'react';
import { MOODS, CYCLE_PHASES } from '../data';

export default function Calendar({
  navigate, animKey, today, loggedDays,
  setSelectedDate, setCurrentLog, setLogSaved,
  lastPeriodStart,
}) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute which days in this month belong to each cycle phase
  const computeCycleDays = () => {
    if (!lastPeriodStart) {
      return { periodDays: [1, 2, 3, 4, 5], ovulationDays: [14, 15], predictedDays: [16, 17, 18, 19, 20] };
    }
    const lastStart = new Date(lastPeriodStart + 'T00:00:00');
    const periodDays = [], ovulationDays = [], predictedDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const diffDays = Math.floor((date - lastStart) / 86400000);
      if (diffDays < 0) continue;
      const cycleDay = (diffDays % 28) + 1;
      if (cycleDay <= 5) periodDays.push(day);
      else if (cycleDay >= 13 && cycleDay <= 15) ovulationDays.push(day);
      else if (cycleDay >= 26) predictedDays.push(day);
    }
    return { periodDays, ovulationDays, predictedDays };
  };

  const { periodDays, ovulationDays, predictedDays } = computeCycleDays();

  return (
    <div className="calendar screen-enter" key={animKey}>
      <div className="calendar-header">
        <h2 className="calendar-month">{monthName}</h2>
      </div>

      <div className="calendar-grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
        {Array.from({ length: firstDayOfWeek }, (_, i) => (
          <div key={`e${i}`} className="calendar-day empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          const isPeriod = periodDays.includes(day);
          const isPredicted = predictedDays.includes(day);
          const isOvulation = ovulationDays.includes(day);
          const dayKey = `${year}-${month}-${day}`;
          const log = loggedDays[dayKey];
          const moodEmoji = log?.moods?.[0]
            ? MOODS.find((m) => m.id === log.moods[0])?.emoji
            : null;

          let classes = 'calendar-day';
          if (isToday) classes += ' today';
          if (isPeriod) classes += ' period';
          if (isPredicted) classes += ' predicted';
          if (isOvulation) classes += ' ovulation';

          return (
            <button
              key={day}
              className={classes}
              onClick={() => {
                setSelectedDate(new Date(year, month, day));
                setCurrentLog(log || { moods: [], symptoms: [], notes: '' });
                setLogSaved(false);
                navigate('log');
              }}
            >
              <span>{day}</span>
              {moodEmoji && <span className="calendar-day-mood">{moodEmoji}</span>}
              {log?.symptoms?.length > 0 && (
                <span className="calendar-day-mood" style={{ fontSize: 8 }}>•</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--pink-200)' }} /> Period
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--lavender-100)' }} /> Ovulation
        </div>
        <div className="legend-item">
          <div
            className="legend-dot"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, var(--pink-100) 2px, var(--pink-100) 4px)',
            }}
          /> Predicted
        </div>
      </div>

      {/* Cycle Phases */}
      <div style={{ marginTop: 20 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>Cycle Phases</div>
        {CYCLE_PHASES.map((phase) => (
          <div key={phase.name} className="phase-card">
            <div className="phase-icon" style={{ background: phase.color + '40' }}>
              {phase.icon}
            </div>
            <div>
              <div className="phase-name">{phase.name}</div>
              <div className="phase-days">{phase.days}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
