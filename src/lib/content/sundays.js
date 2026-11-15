/* eslint-disable */
// Sundays (roadmap v2 §17) and readiness checks (§11). The fixed core runs every Sunday (09:00–10:30): weekly self-check,
// reflection with a listen-back, next-week preview, and the readiness check or week-8 review when due. Then active rest or
// revision mode (per-Sunday toggle, laid out by the engine). The Sunday read and optional items never count as "behind".
// Item shape: { id, text, url?, mins?, depth?, slots? } plus extra keys. IDs are content-based (<prefix>:<slug>) and must never change.
// Weeks are Grind weeks; Steady maps them with round(w × 17/13) (§14).

export const SUNDAY_CORE = [
  // R1 placeholder for the weekly test (R2 replaces it with the graded quiz): hand-scored 0–100 per section into `scores` (`w<n>/<section>`).
  { id: 'sun:weekly-self-check', scores: true, mins: 40, text: "Weekly self-check: 40 min, closed book. From memory, answer 5 questions per section on this week's topics (DSA, frontend & CS, system design, AI), Depth topics counted twice, then check against your notes and enter a 0–100 score for each section." },
  { id: 'sun:reflection', mins: 30, text: 'Weekly reflection with a listen-back: write what went well, what slipped and why. Then listen to one recording of yourself explaining something this week, and write one thing to change.' },
  { id: 'sun:next-week-preview', mins: 10, text: "Preview next week (10 min): skim next week's topics and flag anything that needs setup or a booking (peer mocks, repos, accounts)." },
];

// §17 rules: optional from week 8, never counted as behind.
export const SUNDAY_OPTIONAL = [
  { id: 'sun:apply-roles', fromWeek: 8, optional: true, text: 'Optional: apply to 3–5 roles or ask for referrals, and log them in Job tracker.', url: 'https://www.linkedin.com/jobs/' },
];

// Sunday read (§17): one per Sunday, suggested in both modes, 30–60 min, optional. Grind uses reads 1–13 (`grind: true`);
// Steady uses all 15 plus the 2 `steadyExtra` reads. Categories: app (how a real app works), incident, industry, ai-paper,
// classic-paper. None repeats a Monday how-it-works read (§4).
// URLs checked 2026-11-15. Uber (406 to curl) and Swiggy Bytes / Medium (Cloudflare challenge) block scripted clients:
// Uber was confirmed with WebFetch, Swiggy Bytes with its Wayback snapshot. OpenAI (403 to scripts) was confirmed with its
// Wayback snapshot of 2026-11-08; the paper is arXiv 2509.04664 (WebFetch-confirmed). Linear's /blog/ links now redirect to /now/
// and Swiggy's group-ordering post to /life-at-swiggy/, so the final URLs are used.
// Read 14 (Hotstar): the spec's "Scaling the Hotstar Platform for 50M" could not be confirmed (blog.hotstar.com blocks scripts and
// WebFetch, and the Wayback Machine has no capture of it). Fallback per the brief: Hotstar's own "Scaling for Tsunami Traffic"
// (Kaushik Chandrashekar, 2019-04-18; ladder autoscaling per million concurrent users up to 25M, why reactive autoscaling is too
// slow for spikes), confirmed from its Wayback snapshot of 2022-08-24.
// Steady extras, both confirmed with WebFetch 2026-11-15: DeepSeek-R1 (arXiv 2501.12948, AI paper) and Amazon Science, "Navigating
// uncertainty in Amazon's middle-mile network" (2026-05-06, logistics industry problem).
const NOTES = "Then 3 lines in Notes: the real problem, the key trade-off they made, and where you'd use the idea (or what you'd do differently).";
const read = (slug, category, title, url, grind, extra) => ({
  id: `sun:read-${slug}`, category, url, mins: 45, optional: true, grind,
  text: `Sunday read · ${title}. ${NOTES}`,
  ...(extra ? { steadyExtra: true } : {}),
});
export const SUNDAY_READS = [
  read('uber-h3', 'app', 'Uber: H3, the hexagonal spatial index behind pricing and dispatch (2018)', 'https://www.uber.com/blog/h3/', true),
  read('gitlab-db-outage', 'incident', "GitLab: postmortem of the Jan 31, 2017 database outage (6 h of data lost, backups that didn't work)", 'https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/', true),
  read('openai-hallucinate', 'ai-paper', 'OpenAI: "Why Language Models Hallucinate" (Kalai et al., Sep 2025), the blog post (the paper is arXiv 2509.04664)', 'https://openai.com/index/why-language-models-hallucinate/', true),
  read('swiggy-challenges', 'industry', 'Swiggy: "A brief introduction to engineering challenges at Swiggy" (food delivery: assignment, ETAs, peaks)', 'https://bytes.swiggy.com/engineering-challenges-at-swiggy-430dea6c86a3', true),
  read('amazon-dynamo', 'classic-paper', 'Amazon Dynamo (SOSP 2007): availability over consistency, the paper behind DynamoDB and Cassandra', 'https://www.allthingsdistributed.com/2007/10/amazons_dynamo.html', true),
  read('linear-multi-region', 'app', 'Linear: "How we built multi-region support for Linear"', 'https://linear.app/now/how-we-built-multi-region-support-for-linear', true),
  read('aws-us-east-1-oct-2025', 'incident', "AWS us-east-1, Oct 19–20 2025: a race condition in DynamoDB's DNS automation that took down a large part of the internet", 'https://aws.amazon.com/message/101925/', true),
  read('uber-deepeta', 'industry', 'Uber: DeepETA, predicting arrival times with deep learning (2022)', 'https://www.uber.com/blog/deepeta-how-uber-predicts-arrival-times/', true),
  read('anthropic-tracing-thoughts', 'ai-paper', 'Anthropic: "Tracing the thoughts of a large language model" (Mar 2025, interpretability)', 'https://www.anthropic.com/research/tracing-thoughts-language-model', true),
  read('swiggy-group-ordering', 'app', 'Swiggy: how Group Ordering was built (a shared cart in real time, 2024)', 'https://blog.swiggy.com/life-at-swiggy/heres-how-swiggy-built-the-group-ordering-feature/', true),
  read('crowdstrike-channel-file-291', 'incident', 'CrowdStrike: Channel File 291 root-cause analysis (Jul 2024, the global Windows crash)', 'https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf', true),
  read('razorpay-uptime-slas', 'industry', 'Razorpay: payment gateway uptime and SLAs (UPI concentration risk in Indian payments)', 'https://razorpay.com/blog/payment-gateway-uptime-slas/', true),
  read('zomato-billing-dynamodb', 'app', 'Zomato with AWS: moving the billing platform from TiDB to DynamoDB', 'https://aws.amazon.com/blogs/database/unlocking-performance-scalability-and-cost-efficiency-of-zomatos-billing-platform-by-switching-from-tidb-to-dynamodb/', true),
  read('hotstar-tsunami-traffic', 'industry', 'Hotstar: "Scaling for Tsunami Traffic", live cricket at up to 25M concurrent viewers (why reactive autoscaling fails for spikes, ladder-based scaling)', 'https://blog.hotstar.com/scaling-for-tsunami-traffic-2ec290c37504', false),
  read('linear-delta-sync', 'app', 'Linear: "Rebuilding the delta sync read path" (when Postgres reads stopped scaling)', 'https://linear.app/now/rebuilding-delta-sync-read-path', false),
  read('deepseek-r1', 'ai-paper', 'DeepSeek-R1 (Jan 2025): reasoning learned with reinforcement learning, without human-written reasoning examples (read the intro, approach and the "unsuccessful attempts" section)', 'https://arxiv.org/abs/2501.12948', false, true),
  read('amazon-middle-mile', 'industry', "Amazon Science: navigating uncertainty in Amazon's middle-mile network (2026; logistics: truck routes and inventory under uncertain demand)", 'https://www.amazon.science/blog/navigating-uncertainty-in-amazons-middle-mile-network', false, true),
];

// §11 readiness checks, shown as Sunday checks on the Sunday that ends Grind week `week`; applying is never required.
// A failed check is suggested first in the next revision Sunday (engine). Text exactly as §11.
const ready = (week, text) => ({ id: `sun:readiness-w${week}`, week, text });
export const READINESS = [
  ready(4, '3 past-project deep dives rehearsed; story bank of 12 stories; pitch recorded; unseen checks passed for the Arrays and Stack patterns; 3 decision memos; weekly test ≥ 70%.'),
  ready(8, 'Linked List, Trees and Heaps green; 4 open-source fixes submitted; flagship has real-time and 1 AI feature working; take-home 1 done.'),
  ready(10, 'unseen checks passed for 18 of the 24 patterns; 6 decomposition reps.'),
  ready(12, 'all 24 patterns green (the second unseen solve comes from Phase 3 timed sets and mocks); the top-12 machine-coding builds done in ≤ 45 min.'),
  ready(13, '3 full mock loops (product engineer, FDE, frontend SDE-2); flagship case study published; weekly test ≥ 80% for 3 weeks running.'),
];

// §11 week-8 review (Grind week 8 / Steady week 10), a fixed Sunday task. The spec's "(§13)" pointer is left out of the task text.
export const WEEK8_REVIEW = {
  id: 'sun:week8-review', week: 8,
  text: 'Week-8 review: read the weekly-test trend, which patterns are green, the readiness checks, and the four depth tests. Then rebalance the remaining weeks: move optional reps into weak areas and note what to drop to optional. Write the result as a Notes page.',
};
