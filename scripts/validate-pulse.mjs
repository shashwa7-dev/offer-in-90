// Validates public/pulse.json (the weekly Interview pulse). Exits non-zero on any problem.
import { readFileSync, existsSync } from 'node:fs';

const errors = [];
let pulse;
try { pulse = JSON.parse(readFileSync('public/pulse.json', 'utf8')); } catch (e) { console.error('pulse.json is not valid JSON:', e.message); process.exit(1); }
if (!Array.isArray(pulse.weeks)) { console.error('pulse.json needs a "weeks" array'); process.exit(1); }
if (pulse.weeks.length > 8) errors.push('keep at most 8 weeks');
const weeksSeen = pulse.weeks.map(w => w.weekOf); if (new Set(weeksSeen).size !== weeksSeen.length) errors.push('each week may appear only once: update the existing report instead of adding another');

// Citations should come from this week's collected posts or be real https pages.
const collected = existsSync('.engine/interview-posts.json') ? new Set(JSON.parse(readFileSync('.engine/interview-posts.json', 'utf8')).posts.map(p => p.url)) : null;
const words = s => (s || '').split(/\s+/).filter(Boolean).length;

pulse.weeks.forEach((w, wi) => {
  const at = `weeks[${wi}] (${w.weekOf})`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(w.weekOf || '')) errors.push(`${at}: weekOf must be YYYY-MM-DD`);
  if (Number.isNaN(Date.parse(w.generatedAt))) errors.push(`${at}: generatedAt must be an ISO timestamp`);
  if (!w.headline || words(w.headline) > 60) errors.push(`${at}: headline required, ≤ 60 words`);
  if (!Array.isArray(w.companies) || w.companies.length > 18) errors.push(`${at}: companies must be an array (≤ 18)`);
  (w.companies || []).forEach((c, ci) => {
    const cat = `${at}.companies[${ci}] (${c.company})`;
    if (!c.company) errors.push(`${cat}: company required`);
    if (!Number.isInteger(c.reports) || c.reports < 1) errors.push(`${cat}: reports must be a positive integer`);
    if (!['high', 'medium', 'low'].includes(c.confidence)) errors.push(`${cat}: confidence must be high|medium|low`);
    if (!c.loop || words(c.loop) > 70) errors.push(`${cat}: loop required, ≤ ~60 words`);
    if (!c.prep || words(c.prep) > 45) errors.push(`${cat}: prep required, one sentence`);
    if (!Array.isArray(c.questions) || c.questions.length > 6) errors.push(`${cat}: questions must be an array (≤ 6)`);
    if (!Array.isArray(c.changes)) errors.push(`${cat}: changes must be an array`);
    if (!Array.isArray(c.citations) || !c.citations.length || c.citations.some(u => !/^https:\/\//.test(u))) errors.push(`${cat}: at least one https citation required`);
    if (c.confidence === 'high' && c.reports < 4 && !(c.citations || []).some(u => !/leetcode\.com|reddit\.com|linkedin\.com|x\.com|twitter\.com/.test(u))) errors.push(`${cat}: high confidence needs 4+ reports or an official/press source`);
    if (wi === 0 && collected) {
      const fromPosts = (c.citations || []).filter(u => /leetcode\.com\/discuss|reddit\.com\/r\//.test(u));
      const unknown = fromPosts.filter(u => !collected.has(u));
      if (unknown.length) errors.push(`${cat}: these LeetCode/Reddit citations are not in this week's collected posts: ${unknown.join(', ')}`);
    }
  });
});

if (errors.length) { console.error(`pulse.json has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`); process.exit(1); }
console.log(`pulse.json OK: ${pulse.weeks.length} week(s).`);
