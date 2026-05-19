/**
 * Context builder.
 *
 * Before calling the LLM we enrich the system prompt with a short, structured
 * snapshot of the user's actual state:
 *   - profile (onboarding answers, summarised)
 *   - current cycle phase (derived from lastPeriodStart + cycle length)
 *   - recent 7-day mood/symptom log frequencies
 *
 * This is the "half-agent" trick: the model doesn't need to call a tool to
 * see common context — it's already in the system message. Tool calls are
 * reserved for follow-up drill-downs (longer windows, raw data, etc).
 */
const db = require('./db');

const CYCLE_LENGTH = 28;
const PERIOD_LENGTH = 5;

function cyclePhase(lastPeriodStart, today = new Date()) {
  if (!lastPeriodStart) return { phase: 'unknown', cycleDay: null };
  const start = new Date(lastPeriodStart + 'T00:00:00');
  const diffDays = Math.floor((today - start) / 86400000);
  const cycleDay = ((diffDays % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH + 1;

  let phase;
  if (cycleDay <= PERIOD_LENGTH) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulatory';
  else phase = 'luteal';

  return { phase, cycleDay };
}

function summariseLogs(logs) {
  const moodCounts = {};
  const symptomCounts = {};
  for (const log of logs) {
    for (const m of log.moods) moodCounts[m] = (moodCounts[m] || 0) + 1;
    for (const s of log.symptoms) symptomCounts[s] = (symptomCounts[s] || 0) + 1;
  }
  const top = (obj) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${k}(${v})`)
      .join(', ');
  return {
    days: logs.length,
    topMoods: top(moodCounts) || 'none',
    topSymptoms: top(symptomCounts) || 'none',
  };
}

function buildContext(userId) {
  const user = db.getUser(userId);
  const recentLogs = db.getRecentLogs(userId, 7);
  const profile = user?.profile || {};
  const { phase, cycleDay } = cyclePhase(profile.lastPeriodStart);
  const logSummary = summariseLogs(recentLogs);

  // Compact, deterministic, machine-style — leaves room for the user message
  return [
    `# User context`,
    `- Profile: age=${profile.age || '?'}, regularity=${profile.regularity || '?'}, pain=${profile.pain || '?'}`,
    `- Cycle: day ${cycleDay ?? '?'} of ~${CYCLE_LENGTH}, phase = ${phase}`,
    `- Last 7 days: ${logSummary.days} logs, top moods = [${logSummary.topMoods}], top symptoms = [${logSummary.topSymptoms}]`,
    ``,
    `Use this context to ground your reply. If the user asks about patterns or a longer window, call the appropriate tool.`,
  ].join('\n');
}

module.exports = { buildContext, cyclePhase, summariseLogs };
