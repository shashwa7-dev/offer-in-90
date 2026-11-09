// Weekly: interview-experience threads about top companies, ranked by engagement (upvotes, comments, views).
// Sources: LeetCode Discuss (public GraphQL the site uses) + Reddit (official API, only when keys are set). No AI.
// Writes:
//   public/interview-threads.json  → ranked threads per company for the app (titles + links + counts, no post text)
//   .engine/interview-posts.json   → same posts with excerpts, for the weekly AI pulse (not committed)
// Usage: node scripts/collect-interviews.mjs   (optional env: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET)
import { mkdirSync, writeFileSync } from 'node:fs';

const WINDOW_DAYS = 14, TOP_PER_COMPANY = 6;
const now = Date.now(), since = now - WINDOW_DAYS * 864e5;
const wait = ms => new Promise(r => setTimeout(r, ms));

// [name, group, title regex, search keyword]
const COMPANIES = [
  ['Google', 'Big tech', /\b(google|alphabet)\b/i, 'google'], ['Meta', 'Big tech', /\b(meta|facebook)\b/i, 'meta'],
  ['Microsoft', 'Big tech', /\b(microsoft|msft)\b/i, 'microsoft'], ['Amazon', 'Big tech', /\b(amazon|aws)\b/i, 'amazon'],
  ['Apple', 'Big tech', /\bapple\b/i, 'apple'], ['Netflix', 'Big tech', /\bnetflix\b/i, 'netflix'], ['Nvidia', 'Big tech', /\bnvidia\b/i, 'nvidia'],
  ['Uber', 'Big tech', /\buber\b/i, 'uber'], ['Airbnb', 'Big tech', /\bairbnb\b/i, 'airbnb'], ['Stripe', 'Big tech', /\bstripe\b/i, 'stripe'],
  ['Atlassian', 'Big tech', /\batlassian\b/i, 'atlassian'], ['Adobe', 'Big tech', /\badobe\b/i, 'adobe'], ['LinkedIn', 'Big tech', /\blinkedin\b/i, 'linkedin'],
  ['Salesforce', 'Big tech', /\bsalesforce\b/i, 'salesforce'], ['Oracle', 'Big tech', /\boracle\b/i, 'oracle'], ['Intuit', 'Big tech', /\bintuit\b/i, 'intuit'],
  ['PayPal', 'Big tech', /\bpaypal\b/i, 'paypal'], ['Walmart', 'Big tech', /\bwalmart\b/i, 'walmart'], ['Rippling', 'Big tech', /\brippling\b/i, 'rippling'],
  ['Coinbase', 'Big tech', /\bcoinbase\b/i, 'coinbase'], ['Snowflake', 'Big tech', /\bsnowflake\b/i, 'snowflake'],
  ['OpenAI', 'AI & FDE', /\bopen ?ai\b/i, 'openai'], ['Anthropic', 'AI & FDE', /\banthropic\b/i, 'anthropic'], ['Google DeepMind', 'AI & FDE', /\bdeepmind\b/i, 'deepmind'],
  ['Databricks', 'AI & FDE', /\bdatabricks\b/i, 'databricks'], ['Palantir', 'AI & FDE', /\bpalantir\b/i, 'palantir'], ['Scale AI', 'AI & FDE', /\bscale ?ai\b/i, 'scale ai'],
  ['Flipkart', 'India product', /\bflipkart\b/i, 'flipkart'], ['Swiggy', 'India product', /\bswiggy\b/i, 'swiggy'], ['Zomato / Eternal', 'India product', /\b(zomato|eternal|blinkit)\b/i, 'zomato'],
  ['Zepto', 'India product', /\bzepto\b/i, 'zepto'], ['Razorpay', 'India product', /\brazorpay\b/i, 'razorpay'], ['PhonePe', 'India product', /\bphone ?pe\b/i, 'phonepe'],
  ['CRED', 'India product', /\bcred\b/i, 'cred'], ['Meesho', 'India product', /\bmeesho\b/i, 'meesho'], ['Myntra', 'India product', /\bmyntra\b/i, 'myntra'],
  ['Paytm', 'India product', /\bpaytm\b/i, 'paytm'], ['Groww', 'India product', /\bgroww\b/i, 'groww'], ['Dream11', 'India product', /\bdream ?11\b/i, 'dream11'],
  ['Freshworks', 'India product', /\bfreshworks\b/i, 'freshworks'], ['Zoho', 'India product', /\bzoho\b/i, 'zoho'], ['Postman', 'India product', /\bpostman\b/i, 'postman'],
  ['BrowserStack', 'India product', /\bbrowserstack\b/i, 'browserstack'], ['Juspay', 'India product', /\bjuspay\b/i, 'juspay'], ['Nykaa', 'India product', /\bnykaa\b/i, 'nykaa'],
  ['Urban Company', 'India product', /\burban ?company\b/i, 'urban company'], ['Ola', 'India product', /\bola\b/i, 'ola'], ['ShareChat', 'India product', /\bsharechat\b/i, 'sharechat'],
];
const ROLES = { frontend: /\b(front ?-?end|ui engineer|react|javascript|web developer)\b/i, fde: /\b(forward[- ]deployed|fde|deployment strategist|solutions? engineer)\b/i, fullstack: /\bfull ?-?stack\b/i };
const INTERVIEW = /\b(interview|onsite|on-site|loop|phone screen|screening|oa|online assessment|offer|rejected|selected|team match|hiring committee|bar raiser|rounds?|experience)\b/i;
const clip = (s, n = 700) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);
const companiesIn = title => COMPANIES.filter(([, , re]) => re.test(title)).map(([n]) => n);
const rolesIn = text => Object.entries(ROLES).filter(([, re]) => re.test(text)).map(([r]) => r);
// Engagement: upvotes count most, then comments, then views.
const engagement = p => p.upvotes * 3 + p.comments * 2 + Math.round(p.views / 200);

// ---------- LeetCode Discuss ----------
const LC_Q = 'query($first:Int,$skip:Int,$tags:[String!],$kw:[String]!){ugcArticleDiscussionArticles(first:$first,skip:$skip,orderBy:MOST_RECENT,keywords:$kw,tagSlugs:$tags){edges{node{title slug topicId createdAt summary hitCount reactions{count} topic{commentCount}}}}}';
async function lcPage(keyword, skip) {
  try {
    const r = await fetch('https://leetcode.com/graphql', { method: 'POST', headers: { 'content-type': 'application/json', referer: 'https://leetcode.com/discuss/', 'user-agent': 'Mozilla/5.0' }, body: JSON.stringify({ query: LC_Q, variables: { first: 50, skip, tags: ['interview'], kw: [keyword] } }), signal: AbortSignal.timeout(20000) });
    return (await r.json())?.data?.ugcArticleDiscussionArticles?.edges?.map(e => e.node) || [];
  } catch { return []; }
}
async function leetcode() {
  const out = [];
  const keywords = ['', ...COMPANIES.map(c => c[3]), 'facebook', 'frontend', 'forward deployed'];
  for (const kw of keywords) {
    for (let skip = 0; skip < (kw === '' ? 300 : 100); skip += 50) {
      const nodes = await lcPage(kw, skip);
      for (const n of nodes) if (Date.parse(n.createdAt) >= since) out.push({ source: 'LeetCode', title: n.title, url: `https://leetcode.com/discuss/post/${n.topicId}/${n.slug}/`, createdAt: n.createdAt, excerpt: clip(n.summary), upvotes: (n.reactions || []).reduce((a, x) => a + x.count, 0), comments: n.topic?.commentCount ?? 0, views: n.hitCount ?? 0 });
      await wait(300);
      if (nodes.length < 50 || nodes.some(n => Date.parse(n.createdAt) < since)) break;
    }
  }
  return out;
}

// ---------- Reddit (official API, app-only OAuth) ----------
async function reddit() {
  const id = process.env.REDDIT_CLIENT_ID, secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) { console.log('Reddit: no keys set, skipping'); return []; }
  const UA = 'offer-in-90/1.0 (by github.com/shashwa7-dev)';
  const tok = await fetch('https://www.reddit.com/api/v1/access_token', { method: 'POST', headers: { authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'), 'content-type': 'application/x-www-form-urlencoded', 'user-agent': UA }, body: 'grant_type=client_credentials' }).then(r => r.json()).catch(() => null);
  if (!tok?.access_token) { console.log('Reddit: could not get a token'); return []; }
  const out = [];
  for (const sub of ['leetcode', 'cscareerquestions', 'csMajors', 'ExperiencedDevs', 'Frontend', 'developersIndia', 'cscareerquestionsIN']) {
    for (const t of ['interview OR onsite OR loop OR "phone screen"', 'offer OR rejected OR "team match"']) {
      const d = await fetch(`https://oauth.reddit.com/r/${sub}/search?q=${encodeURIComponent(t)}&restrict_sr=1&sort=new&t=month&limit=100`, { headers: { authorization: `Bearer ${tok.access_token}`, 'user-agent': UA } }).then(r => r.json()).catch(() => null);
      for (const { data: p } of d?.data?.children || []) {
        if (p.created_utc * 1000 < since) continue;
        out.push({ source: `r/${sub}`, title: p.title, url: `https://www.reddit.com${p.permalink}`, createdAt: new Date(p.created_utc * 1000).toISOString(), excerpt: clip(p.selftext), upvotes: p.score, comments: p.num_comments, views: 0 });
      }
      await wait(1100);
    }
  }
  return out;
}

const raw = (await Promise.all([leetcode(), reddit()])).flat();
const seen = new Set();
const posts = raw.filter(p => !seen.has(p.url) && seen.add(p.url))
  .map(p => ({ ...p, companies: companiesIn(p.title), roles: rolesIn(`${p.title} ${p.excerpt}`) }))
  .filter(p => p.companies.length && p.companies.length <= 2 && INTERVIEW.test(`${p.title} ${p.excerpt}`)) // 3+ companies = generic list posts
  .map(p => ({ ...p, engagement: engagement(p) }))
  .sort((a, b) => b.engagement - a.engagement);

const companies = {};
for (const [name, group] of COMPANIES) {
  const mine = posts.filter(p => p.companies.includes(name));
  if (!mine.length) continue;
  companies[name] = {
    group, threads: mine.length, engagement: mine.reduce((a, p) => a + p.engagement, 0),
    roles: [...new Set(mine.flatMap(p => p.roles))],
    top: mine.slice(0, TOP_PER_COMPANY).map(({ title, url, source, createdAt, upvotes, comments, views, roles }) => ({ title, url, source, createdAt, upvotes, comments, views, roles })),
  };
}
const window = { from: new Date(since).toISOString(), to: new Date(now).toISOString(), days: WINDOW_DAYS };
mkdirSync('.engine', { recursive: true });
writeFileSync('.engine/interview-posts.json', JSON.stringify({ collectedAt: new Date().toISOString(), window, posts }, null, 1));
writeFileSync('public/interview-threads.json', JSON.stringify({ collectedAt: new Date().toISOString(), window, sources: { leetcode: raw.filter(p => p.source === 'LeetCode').length, reddit: raw.filter(p => p.source.startsWith('r/')).length }, companies }, null, 1) + '\n');
const ranked = Object.entries(companies).sort((a, b) => b[1].engagement - a[1].engagement);
console.log(`${raw.length} posts scanned, ${posts.length} interview threads across ${ranked.length} companies (last ${WINDOW_DAYS} days)`);
ranked.forEach(([n, c]) => console.log(`  ${n.padEnd(16)} ${String(c.threads).padStart(3)} threads  top: ▲${c.top[0].upvotes} 💬${c.top[0].comments} ${c.top[0].title.slice(0, 60)}`));
