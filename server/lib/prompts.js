/**
 * Prompt template registry.
 *
 * Templates live in prompts/templates.json so they can be edited without
 * touching code (and so an admin UI can read/write them at runtime).
 *
 * Each template owns its own:
 *  - system prompt
 *  - temperature / maxTokens
 *  - allowed tools (the Agent loop ignores tools not in this list,
 *    so we can ship a strict data-analyst mode and a relaxed coach mode
 *    without forking code paths)
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'prompts', 'templates.json');

function loadAll() {
  const raw = fs.readFileSync(FILE, 'utf8');
  return JSON.parse(raw);
}

function getTemplate(id = 'luna_default') {
  const all = loadAll();
  return all.templates[id] || all.templates.luna_default;
}

function listTemplates() {
  const all = loadAll();
  return Object.values(all.templates).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    temperature: t.temperature,
    maxTokens: t.maxTokens,
    tools: t.tools,
  }));
}

function saveTemplate(id, patch) {
  const all = loadAll();
  if (!all.templates[id]) throw new Error(`unknown template: ${id}`);
  all.templates[id] = { ...all.templates[id], ...patch, id };
  all.updatedAt = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
  return all.templates[id];
}

module.exports = { loadAll, getTemplate, listTemplates, saveTemplate };
