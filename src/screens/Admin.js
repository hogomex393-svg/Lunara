/**
 * Admin — internal AI ops dashboard.
 *
 * Three tabs:
 *   1. Templates   — view & edit Prompt templates (system / temperature / tools).
 *                    Saved server-side to prompts/templates.json.
 *   2. Calls       — recent /api/chat call audit log with token usage, latency,
 *                    tools invoked, status.
 *   3. Usage       — token consumption aggregated by day (used to spot
 *                    regressions or token-hungry templates).
 *
 * Auth: a bearer password (env ADMIN_PASSWORD). Stored in localStorage after
 * first successful call so reloads don't ask again.
 */
import React, { useState, useEffect } from 'react';
import {
  adminListTemplates,
  adminSaveTemplate,
  adminGetCalls,
  adminGetUsage,
} from '../api';

const PW_KEY = 'lunara_admin_pw';

function PasswordGate({ onAuth }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const tryLogin = async () => {
    setErr('');
    try {
      await adminListTemplates(pw);
      localStorage.setItem(PW_KEY, pw);
      onAuth(pw);
    } catch (e) {
      setErr('Unauthorized — check ADMIN_PASSWORD in server/.env');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 360, margin: '60px auto' }}>
      <h2 style={{ marginBottom: 12 }}>🔒 Lunara Admin</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
        Internal AI ops dashboard — Prompt templates, call audit log, token usage.
      </p>
      <input
        className="text-input"
        type="password"
        placeholder="Admin password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
        style={{ width: '100%', padding: 12, marginBottom: 12 }}
      />
      <button className="btn-primary" onClick={tryLogin} style={{ width: '100%' }}>
        Enter
      </button>
      {err && <div style={{ color: '#C04040', marginTop: 12, fontSize: 13 }}>{err}</div>}
    </div>
  );
}

function TemplatesTab({ pw }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [system, setSystem] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(400);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    adminListTemplates(pw).then((r) => {
      setTemplates(r.templates);
      if (r.templates.length) pickTemplate(r.templates[0].id);
    });
  }, [pw]);

  const pickTemplate = async (id) => {
    const all = await adminListTemplates(pw);
    setTemplates(all.templates);
    // We need the full template (with system field) — fetch single
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/api/admin/templates/${id}`,
      { headers: { Authorization: `Bearer ${pw}` } }
    );
    const tpl = await res.json();
    setSelected(tpl);
    setSystem(tpl.system);
    setTemperature(tpl.temperature);
    setMaxTokens(tpl.maxTokens);
  };

  const save = async () => {
    if (!selected) return;
    await adminSaveTemplate(pw, selected.id, { system, temperature: Number(temperature), maxTokens: Number(maxTokens) });
    setSavedMsg('✓ Saved');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>
          Templates ({templates.length})
        </div>
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => pickTemplate(t.id)}
            style={{
              padding: 10,
              cursor: 'pointer',
              borderRadius: 6,
              marginBottom: 4,
              background: selected?.id === t.id ? '#F9D4E2' : '#FFF8F8',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{t.id}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px' }}>{selected.name}</h3>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{selected.description}</div>

          <label style={{ fontSize: 12, fontWeight: 600 }}>System prompt</label>
          <textarea
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            style={{ width: '100%', minHeight: 160, padding: 10, marginTop: 4, fontFamily: 'monospace', fontSize: 12 }}
          />

          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Temperature</label>
              <input
                type="number" step="0.1" min="0" max="2"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                style={{ width: 100, padding: 6, marginTop: 4, display: 'block' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Max tokens</label>
              <input
                type="number" step="50" min="50" max="2000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                style={{ width: 100, padding: 6, marginTop: 4, display: 'block' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Tools allowed</label>
              <div style={{ marginTop: 6, fontSize: 11, color: '#666' }}>
                {selected.tools?.join(', ') || '(none — pure prompt)'}
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={save} style={{ marginTop: 16 }}>
            Save changes
          </button>
          {savedMsg && <span style={{ marginLeft: 12, color: '#7BC67E' }}>{savedMsg}</span>}
        </div>
      )}
    </div>
  );
}

function CallsTab({ pw }) {
  const [calls, setCalls] = useState([]);
  useEffect(() => {
    adminGetCalls(pw, 100).then((r) => setCalls(r.calls));
  }, [pw]);

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9D4E2', textAlign: 'left' }}>
            <th style={{ padding: 6 }}>Time</th>
            <th style={{ padding: 6 }}>Template</th>
            <th style={{ padding: 6 }}>Model</th>
            <th style={{ padding: 6 }}>Tokens</th>
            <th style={{ padding: 6 }}>Latency</th>
            <th style={{ padding: 6 }}>Tools</th>
            <th style={{ padding: 6 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #F0E0E0' }}>
              <td style={{ padding: 6 }}>
                {new Date(c.created_at).toLocaleTimeString()}
              </td>
              <td style={{ padding: 6 }}>{c.template_id}</td>
              <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 11 }}>
                {c.model?.split('/').pop()}
              </td>
              <td style={{ padding: 6 }}>{c.total_tokens}</td>
              <td style={{ padding: 6 }}>{c.latency_ms}ms</td>
              <td style={{ padding: 6, fontSize: 11 }}>
                {c.tools_used_json ? JSON.parse(c.tools_used_json).join(', ') : '—'}
              </td>
              <td style={{ padding: 6, color: c.status === 'ok' ? '#7BC67E' : '#C04040' }}>
                {c.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!calls.length && (
        <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>
          No calls yet — chat with Luna to populate this log.
        </div>
      )}
    </div>
  );
}

function UsageTab({ pw }) {
  const [usage, setUsage] = useState([]);
  useEffect(() => {
    adminGetUsage(pw, 14).then((r) => setUsage(r.usage));
  }, [pw]);

  const maxTokens = Math.max(1, ...usage.map((u) => u.tokens || 0));

  return (
    <div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
        Token usage over the past 14 days
      </div>
      {!usage.length && <div style={{ color: '#888' }}>No usage data yet.</div>}
      {usage.map((u) => (
        <div key={u.day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 80, fontSize: 11, color: '#666' }}>{u.day}</div>
          <div
            style={{
              height: 16,
              background: '#F9D4E2',
              width: `${(u.tokens / maxTokens) * 240}px`,
              borderRadius: 3,
              minWidth: 4,
            }}
          />
          <div style={{ fontSize: 11, color: '#666' }}>
            {u.tokens} tokens · {u.calls} calls
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [pw, setPw] = useState(() => localStorage.getItem(PW_KEY) || null);
  const [tab, setTab] = useState('templates');

  if (!pw) return <PasswordGate onAuth={setPw} />;

  const tabs = [
    { id: 'templates', label: '📝 Prompt Templates' },
    { id: 'calls', label: '📒 Call Log' },
    { id: 'usage', label: '📊 Token Usage' },
  ];

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: '0 auto', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>🌸 Lunara · Admin</h2>
        <button
          onClick={() => { localStorage.removeItem(PW_KEY); setPw(null); }}
          style={{ background: 'none', border: '1px solid #E8D5D5', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
        >
          Sign out
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #F0E0E0' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: tab === t.id ? '#F9D4E2' : 'transparent',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: '#FFF', padding: 16, borderRadius: 8, border: '1px solid #F0E0E0' }}>
        {tab === 'templates' && <TemplatesTab pw={pw} />}
        {tab === 'calls' && <CallsTab pw={pw} />}
        {tab === 'usage' && <UsageTab pw={pw} />}
      </div>
    </div>
  );
}
