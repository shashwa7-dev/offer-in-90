// Validates public/updates.json before it is committed. Exits non-zero on any problem.
// Usage: node scripts/validate-updates.mjs [--max-new-per-run 8]
import { readFileSync } from 'node:fs';

const KINDS = ['new', 'outdated', 'changed'];
const PRIO = ['must', 'should', 'fyi'];
const AREAS = ['dsa', 'fe', 'mc', 'proj', 'sd', 'ux', 'beh', 'fde', 'ai', 'market', 'interview'];
const errors = [];
let feed;
try { feed = JSON.parse(readFileSync('public/updates.json', 'utf8')); } catch (e) { console.error('updates.json is not valid JSON:', e.message); process.exit(1); }

if (typeof feed.generatedAt !== 'string' || Number.isNaN(Date.parse(feed.generatedAt))) errors.push('generatedAt must be an ISO timestamp');
if (!Array.isArray(feed.items)) errors.push('items must be an array');
const ids = new Set();
for (const [i, u] of (feed.items || []).entries()) {
  const at = `items[${i}] (${u?.id})`;
  if (!u.id || !/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(u.id)) errors.push(`${at}: id must look like 2026-11-15-short-slug`);
  if (ids.has(u.id)) errors.push(`${at}: duplicate id`); ids.add(u.id);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(u.date || '')) errors.push(`${at}: date must be YYYY-MM-DD`);
  if (!KINDS.includes(u.kind)) errors.push(`${at}: kind must be one of ${KINDS}`);
  if (!PRIO.includes(u.priority)) errors.push(`${at}: priority must be one of ${PRIO}`);
  if (!AREAS.includes(u.area)) errors.push(`${at}: area must be one of ${AREAS}`);
  if (!u.title || u.title.length > 140) errors.push(`${at}: title required, max 140 chars`);
  if (!u.why || u.why.length > 400) errors.push(`${at}: why required, max 400 chars`);
  for (const k of ['url', 'replacementUrl']) if (u[k] && !/^https:\/\//.test(u[k])) errors.push(`${at}: ${k} must be https`);
  if (!Array.isArray(u.sources) || !u.sources.length || u.sources.some(s => !/^https:\/\//.test(s))) errors.push(`${at}: at least one https source required`);
  if ((u.kind === 'outdated' || u.kind === 'changed') && !u.target) errors.push(`${at}: outdated/changed items need a target ("url:…" or a task id)`);
  if (u.scheduleOn && !/^\d{4}-\d{2}-\d{2}$/.test(u.scheduleOn)) errors.push(`${at}: scheduleOn must be YYYY-MM-DD`);
}
if ((feed.items || []).length > 300) errors.push('keep at most 300 items; drop the oldest fyi items');

if (errors.length) { console.error(`updates.json has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`updates.json OK: ${feed.items.length} items.`);
