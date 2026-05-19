/**
 * Lunara API client.
 *
 * Centralises all calls to the BFF (server/) so screens never speak HTTP
 * directly. Lets us swap the base URL via env (dev vs deployed) and gives
 * a single seam for retries, error toast handling, etc.
 */

// Auto-detect the BFF base URL:
//   - If REACT_APP_API_BASE is set at build time, honour it (escape hatch).
//   - If we're served from CRA's dev server on :3000, the BFF is on :3001.
//   - Otherwise (single-service deploy, e.g. Render), use relative paths so
//     /api/chat hits the same origin we were served from.
function detectBase() {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return 'http://localhost:3001';
  }
  return '';
}
const BASE = detectBase();

// For the prototype every session uses the same user id — onboarding fills in
// the actual profile. In production this would be the authenticated user id.
export const DEMO_USER_ID = 'demo-user';

async function jsonFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Chat ───────────────────────────────────────────────────────────
export function chat({ userId = DEMO_USER_ID, message, templateId, useContext = true }) {
  return jsonFetch('/api/chat', {
    method: 'POST',
    body: { userId, message, templateId, useContext },
  });
}

export function getChatHistory(userId = DEMO_USER_ID) {
  return jsonFetch(`/api/chat/history?userId=${encodeURIComponent(userId)}`);
}

// ─── Logs ───────────────────────────────────────────────────────────
export function saveDailyLog({ userId = DEMO_USER_ID, logDate, moods, symptoms, notes }) {
  return jsonFetch('/api/logs', {
    method: 'POST',
    body: { userId, logDate, moods, symptoms, notes },
  });
}

export function getRecentLogs({ userId = DEMO_USER_ID, days = 30 } = {}) {
  return jsonFetch(`/api/logs?userId=${encodeURIComponent(userId)}&days=${days}`);
}

// ─── Profile ────────────────────────────────────────────────────────
export function saveProfile({ userId = DEMO_USER_ID, profile }) {
  return jsonFetch('/api/profile', { method: 'POST', body: { userId, profile } });
}

// ─── Admin ──────────────────────────────────────────────────────────
function adminHeaders(password) {
  return { Authorization: `Bearer ${password}` };
}

export function adminListTemplates(password) {
  return jsonFetch('/api/admin/templates', { headers: adminHeaders(password) });
}

export function adminSaveTemplate(password, id, patch) {
  return jsonFetch(`/api/admin/templates/${id}`, {
    method: 'POST',
    headers: adminHeaders(password),
    body: patch,
  });
}

export function adminGetCalls(password, limit = 100) {
  return jsonFetch(`/api/admin/calls?limit=${limit}`, { headers: adminHeaders(password) });
}

export function adminGetUsage(password, days = 14) {
  return jsonFetch(`/api/admin/usage?days=${days}`, { headers: adminHeaders(password) });
}

// Health check used by AIChat to detect if BFF is reachable
export async function bffHealthy() {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
