// Daily tech + AI news from public APIs, filtered for quality. No AI, no keys.
// Writes public/news.json: up to 8 reads a day, kept for 14 days.
// Usage: node scripts/fetch-news.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const MAX_PER_DAY = 8;
const KEEP_DAYS = 14;
const UA = { 'user-agent': 'offer-in-90 news (github.com/shashwa7-dev/offer-in-90)' };
const now = Date.now(), H = 3600e3;
const today = new Date(now + 5.5 * H).toISOString().slice(0, 10); // IST date

// Topic filter: keep engineering + AI, drop gossip/politics/finance noise.
const AI = /\b(ai|a\.i\.|llms?|gpt|claude|gemini|openai|anthropic|deepmind|mistral|llama|qwen|deepseek|model|agents?|agentic|rag|transformer|neural|machine learning|ml|inference|fine-?tun\w*|embedding|prompt|mcp|copilot|cursor|diffusion)\b/i;
const DEV = /\b(javascript|typescript|react|next\.?js|node\.?js|deno|bun|vite|webpack|turbopack|css|html|dom|browsers?|chrome|chromium|firefox|safari|webkit|web ?(platform|app|apps|dev|development|standards?|components?|perf\w*)|wasm|webassembly|webgpu|frontend|front-end|ui|ux|design systems?|accessibility|a11y|apis?|graphql|rest|grpc|websockets?|postgres(ql)?|sqlite|redis|kafka|databases?|kubernetes|docker|serverless|edge|cdn|cache|caching|latency|performance|scal(e|ing|ability)|distributed|system design|architecture|outage|postmortem|incident|http\/?\d?|tls|dns|oauth|auth\w*|xss|csrf|supply[- ]chain|npm|vulnerabilit\w+|cve-\d+|github|git|devtools|typescript|compilers?|engineering|engineers?)\b/i;
const NOISE = /\b(bubble|brain fry|burnout|hot take)\b|\b(affair|divorce|dating|election|trump|biden|senate|congress|politic\w*|war|gaza|ukraine|israel|stock price|shares (rose|fell)|ipo|bitcoin price|lawsuit over|murder|celebrity|sex|nsfw|obituary|dies at)\b/i;
const topicOf = t => (AI.test(t) ? 'ai' : DEV.test(t) ? 'dev' : null);

async function getJSON(url) {
  try { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) }); return r.ok ? await r.json() : null; }
  catch { return null; }
}
async function getText(url) {
  try { const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) }); return r.ok ? await r.text() : null; }
  catch { return null; }
}

// 1. Hacker News via Algolia: last 24 h, 150+ points.
async function hackerNews() {
  const since = Math.floor((now - 24 * H) / 1000);
  const q = new URLSearchParams({ tags: 'story', numericFilters: `created_at_i>${since},points>150`, hitsPerPage: '60' });
  const d = await getJSON(`https://hn.algolia.com/api/v1/search?${q}`);
  return (d?.hits || []).map(h => ({
    title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, discussUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
    source: 'Hacker News', points: h.points, comments: h.num_comments, publishedAt: h.created_at, weight: h.points,
  }));
}
// 2. Lobsters: tagged, last 36 h, score 12+.
async function lobsters() {
  const d = await getJSON('https://lobste.rs/t/ai,javascript,web,programming,security,performance,distributed.json');
  return (d || []).filter(s => now - Date.parse(s.created_at) < 36 * H && s.score >= 12).map(s => ({
    title: s.title, url: s.url || s.comments_url, discussUrl: s.comments_url, source: 'Lobsters', points: s.score, comments: s.comment_count,
    publishedAt: s.created_at, weight: s.score * 8, topicHint: s.tags.includes('ai') ? 'ai' : s.tags.some(t => ['javascript', 'web'].includes(t)) ? 'dev' : undefined,
  }));
}
// 3. Hugging Face Daily Papers: 15+ upvotes, top 2.
async function papers() {
  const d = await getJSON('https://huggingface.co/api/daily_papers?limit=50');
  return (d || []).filter(p => (p.paper?.upvotes || 0) >= 15 && now - Date.parse(p.publishedAt || p.paper.publishedAt) < 72 * H)
    .sort((a, b) => b.paper.upvotes - a.paper.upvotes).slice(0, 2).map(p => ({
      title: p.paper.title, url: `https://huggingface.co/papers/${p.paper.id}`, discussUrl: `https://huggingface.co/papers/${p.paper.id}`,
      source: 'HF Papers', points: p.paper.upvotes, comments: p.numComments ?? 0, publishedAt: p.publishedAt, weight: p.paper.upvotes * 10, topicHint: 'research',
    }));
}
// 4. dev.to: top frontend posts of the last 2 days, 40+ reactions.
async function devto() {
  const tags = ['react', 'javascript', 'webdev', 'ai'];
  const lists = await Promise.all(tags.map(t => getJSON(`https://dev.to/api/articles?tag=${t}&top=2&per_page=10`)));
  return lists.flat().filter(a => a && a.positive_reactions_count >= 40).map(a => ({
    title: a.title, url: a.url, discussUrl: a.url, source: 'dev.to', points: a.positive_reactions_count, comments: a.comments_count,
    publishedAt: a.published_at, weight: a.positive_reactions_count * 2,
  }));
}
// 5. Simon Willison (long-form entries only): a reliable AI-engineering voice.
async function simon() {
  const xml = await getText('https://simonwillison.net/atom/entries/');
  if (!xml) return [];
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => {
    const e = m[1], title = (e.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1], url = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1], at = (e.match(/<published>([^<]+)<\/published>/) || [])[1];
    return { title: title?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim(), url, discussUrl: url, source: 'Simon Willison', points: 0, comments: 0, publishedAt: at, weight: 400, topicHint: 'ai' };
  }).filter(x => x.title && x.url && now - Date.parse(x.publishedAt) < 36 * H).slice(0, 1);
}

const all = (await Promise.all([hackerNews(), lobsters(), papers(), devto(), simon()])).flat();
const seenUrls = new Set(), picked = [];
const norm = u => u.replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, '');
for (const it of all.sort((a, b) => b.weight - a.weight)) {
  if (!it.title || NOISE.test(it.title)) continue;
  if (it.source === 'Hacker News' && it.comments > it.points * 1.1) continue; // mostly argument, little news
  const category = it.topicHint === 'research' ? 'research' : it.topicHint === 'ai' ? 'ai' : it.topicHint === 'dev' ? 'dev' : topicOf(`${it.title} ${it.url}`);
  if (!category) continue;
  const key = norm(it.url);
  if (seenUrls.has(key)) continue;
  seenUrls.add(key);
  picked.push({ id: `${today}-${picked.length + 1}`, title: it.title, url: it.url, discussUrl: it.discussUrl, source: it.source, points: it.points, comments: it.comments, publishedAt: it.publishedAt, category });
}
// Balance: at most 4 AI, 4 dev, 2 research, 8 total.
const caps = { ai: 4, dev: 4, research: 2 }, count = { ai: 0, dev: 0, research: 0 };
const todays = picked.filter(p => count[p.category]++ < caps[p.category]).slice(0, MAX_PER_DAY);

const file = 'public/news.json';
const prev = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { days: {} };
const days = { ...prev.days, [today]: todays };
const keep = Object.keys(days).sort().reverse().slice(0, KEEP_DAYS);
writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), days: Object.fromEntries(keep.map(d => [d, days[d]])) }, null, 1) + '\n');
console.log(`${today}: ${todays.length} reads from ${all.length} candidates`);
todays.forEach(t => console.log(`  [${t.category}] ${t.source} ${t.points} · ${t.title}`));
