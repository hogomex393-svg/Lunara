/**
 * Evaluation harness.
 *
 * Runs every case in test-cases.json against three template configurations:
 *   1. luna_no_context   — baseline, no business context, no tools
 *   2. luna_default      — full context injection + tools enabled
 *   3. luna_coach        — coach persona + tools (for emotional / advice cases)
 *
 * Captures: reply, tools called, latency, tokens. Writes a markdown report
 * to evals/RESULTS.md so we have something concrete to put in the case study
 * PDF and to point reviewers at on GitHub.
 *
 * Usage:
 *   # Make sure server/.env has OPENROUTER_API_KEY set
 *   node server/evals/run.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');

const db = require('../lib/db');
const prompts = require('../lib/prompts');
const { runAgent } = require('../lib/llm');
const { buildContext } = require('../lib/context');

const CASES = require('./test-cases.json').cases;
const VARIANTS = ['luna_no_context', 'luna_default', 'luna_coach'];
const USER_ID = 'eval-user';

function seedFixtureData() {
  // Give the eval user a realistic profile + 14 days of recent logs so the
  // tools have something interesting to read.
  db.upsertUser(USER_ID, {
    age: '18–35',
    regularity: 'Regular',
    pain: 'Moderate pain',
    lastPeriodStart: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 18);
      return d.toISOString().slice(0, 10);
    })(),
  });
  const today = new Date();
  const moodsBank = [['tired'], ['anxious', 'tired'], ['happy'], ['calm'], ['irritable', 'tired']];
  const symptomsBank = [['cramps'], ['headache'], [], ['cramps', 'bloating'], ['fatigue'], []];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    db.saveDailyLog({
      userId: USER_ID,
      logDate: d.toISOString().slice(0, 10),
      moods: moodsBank[i % moodsBank.length],
      symptoms: symptomsBank[i % symptomsBank.length],
      notes: '',
    });
  }
}

async function runCase(variantId, c) {
  const template = prompts.getTemplate(variantId);
  const useContext = variantId !== 'luna_no_context';
  const systemContext = useContext ? buildContext(USER_ID) : '';
  try {
    const result = await runAgent({
      template,
      systemContext,
      history: [],
      userMessage: c.input,
      ctx: { userId: USER_ID },
    });
    return { ok: true, ...result };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function main() {
  db.init();
  seedFixtureData();

  const results = {};
  for (const variant of VARIANTS) {
    results[variant] = [];
    for (const c of CASES) {
      process.stdout.write(`[${variant}] ${c.id} ... `);
      const r = await runCase(variant, c);
      results[variant].push({ caseId: c.id, ...r });
      console.log(r.ok ? `ok (${r.latencyMs}ms, tools=${r.toolsUsed?.join('|') || '—'})` : `FAIL: ${r.error}`);
    }
  }

  // ─── Write markdown report ───────────────────────────────────────
  const lines = [];
  lines.push('# Lunara Prompt Evaluation Results\n');
  lines.push(`Generated: ${new Date().toISOString()}\n`);
  lines.push(`Cases: ${CASES.length}. Variants: ${VARIANTS.join(', ')}.\n`);
  lines.push('## Summary\n');
  lines.push('| Variant | Cases | Avg tokens | Avg latency | % using tools |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const v of VARIANTS) {
    const rs = results[v].filter((r) => r.ok);
    const avgTok = rs.length ? Math.round(rs.reduce((a, r) => a + (r.usage?.totalTokens || 0), 0) / rs.length) : 0;
    const avgLat = rs.length ? Math.round(rs.reduce((a, r) => a + (r.latencyMs || 0), 0) / rs.length) : 0;
    const pctTools = rs.length ? Math.round((rs.filter((r) => r.toolsUsed?.length).length / rs.length) * 100) : 0;
    lines.push(`| \`${v}\` | ${rs.length}/${CASES.length} | ${avgTok} | ${avgLat}ms | ${pctTools}% |`);
  }
  lines.push('\n## Per-case comparison\n');

  for (const c of CASES) {
    lines.push(`### \`${c.id}\` — ${c.category}\n`);
    lines.push(`**Input:** ${c.input}`);
    lines.push(`**Expects:** ${c.expects.join('; ')}\n`);
    for (const v of VARIANTS) {
      const r = results[v].find((x) => x.caseId === c.id);
      lines.push(`<details><summary><code>${v}</code> — tools=[${r?.toolsUsed?.join(', ') || '—'}] tokens=${r?.usage?.totalTokens || 0}</summary>\n`);
      lines.push('\n> ' + (r?.reply || r?.error || '(no output)').replace(/\n/g, '\n> '));
      lines.push('\n</details>\n');
    }
  }

  const out = path.join(__dirname, 'RESULTS.md');
  fs.writeFileSync(out, lines.join('\n'));
  console.log('\nWrote', out);
}

main().catch((e) => { console.error(e); process.exit(1); });
