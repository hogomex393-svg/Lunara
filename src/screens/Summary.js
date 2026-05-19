import React from 'react';

export default function Summary({ navigate, answers }) {
  const pain = answers.pain || '';
  const reg = answers.regularity || '';
  const age = answers.age || '—';
  const identity = answers.identity || '—';
  const lastPeriod = answers.lastPeriodStart
    ? new Date(answers.lastPeriodStart + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const regDisplay = reg && reg !== 'Prefer not to answer' ? reg.toLowerCase() : 'your own';
  const painDisplay = pain && pain !== 'Prefer not to answer' ? pain.toLowerCase() : 'manageable';

  return (
    <div className="summary-screen">
      <div className="summary-icon">🌸</div>
      <h2 className="summary-title">Welcome to Lunara</h2>
      <p className="summary-text">
        Based on your answers, here's your personalised summary:
      </p>
      <div className="summary-card">
        <div className="summary-card-row">
          <span className="summary-card-label">Age Range</span>
          <span className="summary-card-value">{age}</span>
        </div>
        <div className="summary-card-row">
          <span className="summary-card-label">Cycle</span>
          <span className="summary-card-value">{reg || '—'}</span>
        </div>
        <div className="summary-card-row">
          <span className="summary-card-label">Pain Level</span>
          <span className="summary-card-value">{pain || '—'}</span>
        </div>
        <div className="summary-card-row">
          <span className="summary-card-label">Identity</span>
          <span className="summary-card-value">{identity}</span>
        </div>
        <div className="summary-card-row">
          <span className="summary-card-label">Last Period</span>
          <span className="summary-card-value">{lastPeriod}</span>
        </div>
      </div>
      <p
        className="summary-text"
        style={{ fontStyle: 'italic', color: 'var(--pink-500)' }}
      >
        "Your cycle appears {regDisplay} with {painDisplay} symptoms.
        We'll tailor your experience accordingly."
      </p>
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 16 }}
        onClick={() => navigate('home')}
      >
        Get Started
      </button>
    </div>
  );
}
