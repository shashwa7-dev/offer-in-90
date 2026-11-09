// Checks every URL in the curriculum. No AI involved. Writes .engine/link-report.json for the refresh engine.
// Usage: node scripts/check-links.mjs
import { readFileSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';

const sources = ['src/lib/plan-data.js', 'src/lib/engine.ts'];
const urls = [...new Set(sources.flatMap(f => readFileSync(f, 'utf8').match(/https?:\/\/[^\s'"`)<>\]]+/g) || []))]
  .map(u => u.replace(/[.,;]+$/, ''))
  .filter(u => !u.includes('${') && !u.includes('…'));

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000) });
      if (r.ok) return { url, status: r.status, finalUrl: r.url !== url ? r.url : undefined, verdict: 'ok' };
      if (method === 'GET') return { url, status: r.status, verdict: [401, 403, 429, 999].includes(r.status) ? 'blocked' : 'broken' };
    } catch (e) {
      if (method === 'GET') return { url, status: 0, error: String(e.cause?.code || e.name), verdict: 'broken' };
    }
  }
}

const results = [];
const queue = [...urls];
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) results.push(await check(queue.shift())); }));

const broken = results.filter(r => r.verdict === 'broken');
const moved = results.filter(r => r.verdict === 'ok' && r.finalUrl && new URL(r.finalUrl).pathname !== new URL(r.url).pathname);
mkdirSync('.engine', { recursive: true });
writeFileSync('.engine/link-report.json', JSON.stringify({ checkedAt: new Date().toISOString(), total: results.length, broken, moved, blocked: results.filter(r => r.verdict === 'blocked').map(r => r.url) }, null, 2));
console.log(`Checked ${results.length} links: ${broken.length} broken, ${moved.length} moved, ${results.filter(r => r.verdict === 'blocked').length} blocked bots.`);
broken.forEach(b => console.log(`  BROKEN ${b.status || b.error} ${b.url}`));
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `broken=${broken.length + moved.length}\n`);
