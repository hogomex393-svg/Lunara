import React, { useState } from 'react';
import { ONBOARDING_QUESTIONS } from '../data';

export default function Profile({ navigate, animKey, answers, setAnswers, totalLogs }) {
  const [editingField, setEditingField] = useState(null);

  const getQuestion = (id) => ONBOARDING_QUESTIONS.find((q) => q.id === id);

  const formatAnswer = (id) => {
    const val = answers[id];
    if (!val || (Array.isArray(val) && val.length === 0)) return '—';
    if (Array.isArray(val)) return val.join(', ');
    if (id === 'lastPeriodStart') {
      return new Date(val + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    if (id === 'privacyConcern') return `${val} / 5`;
    return val;
  };

  const toggleMultiEdit = (id, opt) => {
    setAnswers((a) => {
      const current = Array.isArray(a[id]) ? a[id] : [];
      if (current.includes(opt)) {
        return { ...a, [id]: current.filter((x) => x !== opt) };
      }
      return { ...a, [id]: [...current, opt] };
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const renderEditModal = () => {
    if (!editingField) return null;
    const q = getQuestion(editingField);
    if (!q) return null;

    return (
      <div className="report-modal" onClick={() => setEditingField(null)}>
        <div
          className="report-sheet"
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="edit-modal-title">{q.question}</div>
          {q.type === 'date' ? (
            <div style={{ padding: '8px 0 16px' }}>
              <div className="date-wrapper">
                <input
                  type="date"
                  lang="en-US"
                  className="date-input"
                  max={today}
                  value={answers[editingField] || ''}
                  onChange={(e) => {
                    setAnswers((a) => ({ ...a, [editingField]: e.target.value }));
                    setEditingField(null);
                  }}
                />
                {!answers[editingField] && (
                  <span className="date-placeholder-overlay">YYYY / MM / DD</span>
                )}
              </div>
            </div>
          ) : (
            <div>
              {q.options.map((opt) => {
                const isSelected = q.multiSelect
                  ? Array.isArray(answers[editingField]) &&
                    answers[editingField].includes(opt)
                  : answers[editingField] === opt;
                return (
                  <button
                    key={opt}
                    className="report-option"
                    style={{
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? 'var(--pink-500)' : 'var(--text-primary)',
                    }}
                    onClick={() => {
                      if (q.multiSelect) {
                        toggleMultiEdit(editingField, opt);
                      } else {
                        setAnswers((a) => ({ ...a, [editingField]: opt }));
                        setEditingField(null);
                      }
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
              {q.multiSelect && (
                <button
                  className="btn-primary"
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={() => setEditingField(null)}
                >
                  Done
                </button>
              )}
            </div>
          )}
          <button
            className="report-cancel"
            onClick={() => setEditingField(null)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const Field = ({ label, id, editable = true }) => (
    <div className="profile-field">
      <span className="profile-field-label" style={{ flexShrink: 0 }}>{label}</span>
      <span
        className="profile-field-value"
        style={{
          flex: 1,
          textAlign: 'right',
          paddingRight: editable ? 8 : 0,
          fontSize: 13,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 160,
        }}
      >
        {formatAnswer(id)}
      </span>
      {editable && (
        <button
          className="profile-field-edit"
          style={{ flexShrink: 0 }}
          onClick={() => setEditingField(id)}
        >
          Edit
        </button>
      )}
    </div>
  );

  return (
    <div className="profile screen-enter" key={animKey}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="back-btn" onClick={() => navigate('home')}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Profile</h2>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-large">🌙</div>
        <div className="profile-name">Luna</div>
        <div className="profile-joined">Member since May 2026</div>
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Personal Info</div>
        <Field label="Age Range" id="age" />
        <Field label="Identity" id="identity" />
        <Field label="Last Period Start" id="lastPeriodStart" />
        <Field label="Pain Level" id="pain" />
        <Field label="Medication" id="medication" />
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Cycle Health</div>
        <Field label="Cycle" id="regularity" />
        <Field label="Main Purpose" id="mainPurpose" />
        <Field label="Exam Habit" id="examHabit" />
        <div className="profile-field">
          <span className="profile-field-label">Days Logged</span>
          <span className="profile-field-value">{totalLogs}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Current Phase</span>
          <span className="profile-field-value">Luteal 🍂</span>
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-title">App Preferences</div>
        <Field label="Helpful Features" id="helpfulFeatures" />
        <Field label="Record Frequency" id="recordFrequency" />
        <Field label="Safety Features" id="safetyFeatures" />
        <Field label="Recording Style" id="recordDesign" />
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Privacy</div>
        <Field label="Privacy Concern" id="privacyConcern" />
        <div className="profile-field">
          <span className="profile-field-label">Community Posts</span>
          <span className="profile-field-value">Anonymous</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Data Sharing</span>
          <span className="profile-field-value">Off</span>
        </div>
      </div>

      {renderEditModal()}
    </div>
  );
}
