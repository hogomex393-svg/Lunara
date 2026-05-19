import React from 'react';

const ADVICE_CARDS = [
  {
    icon: '🥗', bg: 'var(--sage-100)', title: 'Diet & Nutrition',
    text: 'During your luteal phase, increase magnesium-rich foods like dark chocolate, nuts, and leafy greens. They can help reduce cramps and mood swings.',
  },
  {
    icon: '💜', bg: 'var(--lavender-100)', title: 'Emotional Wellness',
    text: 'Your logs show increased anxiety pre-period. Try box breathing (4-4-4-4) or a 10-minute guided meditation before bed.',
  },
  {
    icon: '🧘', bg: 'var(--pink-100)', title: 'Movement',
    text: 'Gentle yoga and walking are ideal during your current phase. Save high-intensity workouts for your follicular phase when energy peaks.',
  },
  {
    icon: '😴', bg: 'var(--beige-100)', title: 'Sleep Hygiene',
    text: 'Hormonal shifts can disrupt sleep. Keep your room cool, limit caffeine after 2pm, and try a warm bath before bed.',
  },
  {
    icon: '💧', bg: 'var(--lavender-100)', title: 'Hydration',
    text: 'Aim for 8+ glasses of water daily. During menstruation, you may need even more to offset fluid loss.',
  },
];

export default function Advice({ navigate, animKey, answers }) {
  return (
    <div className="advice screen-enter" key={animKey}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <button className="back-btn" onClick={() => navigate('insights')}>←</button>
        <div>
          <h2 className="advice-title">For You</h2>
          <p className="advice-subtitle">Personalized for your cycle and patterns</p>
        </div>
      </div>

      <div style={{
        padding: '10px 14px', background: 'var(--pink-100)',
        borderRadius: 'var(--radius-md)', marginBottom: 16,
        fontSize: 13, color: 'var(--text-secondary)',
      }}>
        🌸 Based on: Luteal Phase · Age {answers.age || '23–27'} · {answers.pain || 'Mild'} pain
      </div>

      {ADVICE_CARDS.map((card, i) => (
        <div key={i} className="advice-card">
          <div className="advice-card-header">
            <div className="advice-card-icon" style={{ background: card.bg }}>{card.icon}</div>
            <div className="advice-card-title">{card.title}</div>
          </div>
          <div className="advice-card-text">{card.text}</div>
        </div>
      ))}
    </div>
  );
}
