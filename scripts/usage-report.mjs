// Prints a Markdown usage report for one Claude Code run (from `claude -p --output-format json`).
// Usage: node scripts/usage-report.mjs .engine/ai-result.json
import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2];
if (!file || !existsSync(file)) { console.log('### AI step\nNo result file (the AI step did not run).'); process.exit(0); }
let r;
try { r = JSON.parse(readFileSync(file, 'utf8')); } catch { console.log('### AI step\nThe result file could not be read (the run may have been cut off by the timeout).'); process.exit(0); }

const n = x => (x || 0).toLocaleString('en-US');
const models = Object.entries(r.modelUsage || {});
const sum = k => models.reduce((a, [, m]) => a + (m[k] || 0), 0);
const budget = process.env.ENGINE_BUDGET_USD;
const why = {
  success: 'finished normally',
  error_max_budget_usd: `stopped: reached the budget cap ($${budget})`,
  error_max_turns: `stopped: reached the step limit (${process.env.ENGINE_MAX_TURNS})`,
}[r.subtype] || `stopped: ${r.subtype || 'unknown'}`;

console.log(`### AI step usage
| | |
|---|---|
| Result | ${why} |
| Model | ${models.map(([m]) => m).join(', ') || 'n/a'} |
| Steps | ${r.num_turns ?? 'n/a'} |
| Input tokens (new / cached read / cache write) | ${n(sum('inputTokens'))} / ${n(sum('cacheReadInputTokens'))} / ${n(sum('cacheCreationInputTokens'))} |
| Output tokens (incl. thinking) | ${n(sum('outputTokens'))} (${n(sum('thinkingTokens'))} thinking) |
| Web searches | ${n(sum('webSearchRequests'))} |
| Equivalent cost (list price) | $${(r.total_cost_usd || 0).toFixed(2)} of $${budget} cap |
| Time | ${Math.round((r.duration_ms || 0) / 1000)} s |
`);
