/* eslint-disable */
// Career block (roadmap v2 §8): behavioral/resume, forward-deployed track, company map.
// Item shape: { id, text, url?, mins?, depth?, slots? } plus extra keys. IDs are content-based (<prefix>:<slug>) and must never change.

export const BEH = [
  { id: 'beh:resume', text: 'Resume: rewrite every bullet as impact (did X, measured by Y, by doing Z). One page.', url: 'https://www.techinterviewhandbook.org/resume/' },
  { id: 'beh:linkedin-github', text: 'LinkedIn headline + About; GitHub: pin 3 best repos with READMEs', url: 'https://www.techinterviewhandbook.org/resume/' },
  { id: 'beh:story-bank', text: 'Story bank: list 12 projects/situations from your work (wins, failures, conflicts)', url: 'https://in.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique' },
  { id: 'beh:positioning', text: 'Positioning: pick your pitch ("product engineer who ships AI features", with forward-deployed engineer second) and 3 target role titles', url: 'https://www.linkedin.com/jobs/' },
  { id: 'beh:market-scan', text: 'Market scan: save 10 job posts (frontend, full-stack, FDE, AI product engineer); copy required skills into Notes', url: 'https://www.linkedin.com/jobs/' },
  { id: 'beh:amazon-structure-lps', text: 'Amazon interview structure (SDE-1: 2 DSA+LP rounds, bar raiser, HR; SDE-2 adds LLD and an HLD round) + all 16 Leadership Principles', url: 'https://www.tryexponent.com/blog/what-are-the-amazon-leadership-principles' },
  { id: 'beh:lp-customer-ownership', text: 'STAR stories: Customer Obsession + Ownership', url: 'https://leetcode.com/discuss/post/437082/amazon-behavioral-questions-leadership-p-kvhl/' },
  { id: 'beh:lp-invent-right', text: 'STAR stories: Invent and Simplify + Are Right, A Lot', url: 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview' },
  { id: 'beh:lp-learn-hire', text: 'STAR stories: Learn and Be Curious + Hire and Develop the Best', url: 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview' },
  { id: 'beh:lp-standards-think-big', text: 'STAR stories: Insist on the Highest Standards + Think Big', url: 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview' },
  { id: 'beh:lp-action-frugality', text: 'STAR stories: Bias for Action + Frugality', url: 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview' },
  { id: 'beh:deep-dive-1', text: 'Deep dive of your own past work 1 of 3: pick a real project from one of your jobs. Cover the architecture sketch, trade-offs, metrics, your own part and what you would change. Rehearse it as a 15-min talk and write the list of drill-down questions.', url: 'https://www.techinterviewhandbook.org/behavioral-interview/' },
  { id: 'beh:lp-trust-dive-deep', text: 'STAR stories: Earn Trust + Dive Deep', url: 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview' },
  { id: 'beh:lp-backbone-results', text: 'STAR stories: Have Backbone; Disagree and Commit + Deliver Results', url: 'https://www.tryexponent.com/blog/how-to-nail-amazons-behavioral-interview-questions' },
  { id: 'beh:lp-employer-scale', text: 'STAR stories: Earth\'s Best Employer + Success and Scale Bring Broad Responsibility', url: 'https://www.tryexponent.com/blog/how-to-nail-amazons-behavioral-interview-questions' },
  { id: 'beh:google-behavioral', text: 'Google: Googleyness & leadership questions; map your stories to them', url: 'https://igotanoffer.com/blogs/tech/google-behavioral-interview' },
  { id: 'beh:meta-microsoft-behavioral', text: 'Meta & Microsoft behavioral: conflict, growth, impact, ambiguity', url: 'https://www.techinterviewhandbook.org/behavioral-interview/' },
  { id: 'beh:deep-dive-2', text: 'Deep dive of your own past work 2 of 3: pick a real project from one of your jobs. Cover the architecture sketch, trade-offs, metrics, your own part and what you would change. Rehearse it as a 15-min talk and write the list of drill-down questions.', url: 'https://www.techinterviewhandbook.org/behavioral-interview/' },
  { id: 'beh:tell-me-about-yourself', text: '"Tell me about yourself": write a 90-second pitch and record it', url: 'https://www.techinterviewhandbook.org/behavioral-interview/' },
  { id: 'beh:project-deep-dive', text: 'Project deep dive: your best project — architecture, trade-offs, numbers', url: 'https://www.techinterviewhandbook.org/behavioral-interview/' },
  { id: 'beh:failures', text: 'Stories: 2 failures / mistakes and what you changed', url: 'https://www.techinterviewhandbook.org/behavioral-interview-questions/' },
  { id: 'beh:conflicts', text: 'Stories: 2 conflicts (teammate, manager) and the outcome', url: 'https://www.techinterviewhandbook.org/behavioral-interview-questions/' },
  { id: 'beh:customer-stories', text: 'Stories: working with a customer or non-technical stakeholder (key for FDE roles)' },
  { id: 'beh:deep-dive-3', text: 'Deep dive of your own past work 3 of 3: pick a real project from one of your jobs. Cover the architecture sketch, trade-offs, metrics, your own part and what you would change. Rehearse it as a 15-min talk and write the list of drill-down questions.', url: 'https://www.techinterviewhandbook.org/behavioral-interview/' },
  { id: 'beh:questions-to-ask', text: 'Write 10 good questions to ask interviewers', url: 'https://www.techinterviewhandbook.org/final-questions/' },
  { id: 'beh:amazon-oa', text: 'Amazon OA: learn the format (coding 70 min, work simulation, work-style MCQs)', url: 'https://www.youtube.com/watch?v=56PjX-j0Nt4' },
  { id: 'beh:amazon-work-sim', text: 'Amazon work simulation practice: email modules, prioritizing under ambiguity, debugging a product page, customer replies', url: 'https://www.youtube.com/watch?v=56PjX-j0Nt4' },
  { id: 'beh:amazon-work-style', text: 'Amazon work-style assessment: most/least-likely MCQs. Answer 20 sample items the LP way.', url: 'https://www.youtube.com/watch?v=56PjX-j0Nt4' },
  { id: 'beh:microsoft-growth', text: 'Microsoft: growth mindset stories (learning from failure, feedback, collaboration)', url: 'https://prepare.sh/articles/microsoft-interview-process-2026' },
  { id: 'beh:ai-usage-story', text: 'AI usage story: how you use AI tools day to day and how you review their output (asked at every company now)' },
  { id: 'beh:target-list', text: 'Target list: 40 companies in 3 tiers (big tech, AI companies with FDE roles, practice companies)', url: 'https://www.levels.fyi/' },
  { id: 'beh:referrals', text: 'Referrals: find 2 engineers per target company on LinkedIn', url: 'https://www.linkedin.com/' },
  { id: 'beh:referral-template', text: 'Write your referral message template; send the first 10' },
  { id: 'beh:practice-lp-stories', text: 'Practice aloud: 2 LP stories with a timer, get feedback from a friend' },
  { id: 'beh:resume-update', text: 'Update resume with new skills; add a "Building now" line for your flagship project', url: 'https://www.techinterviewhandbook.org/resume/' },
  { id: 'beh:practice-why-company', text: 'Practice aloud: "Why this company?" for your top 5' },
  { id: 'beh:referrals-2', text: 'Send 10 more referral requests' },
  { id: 'beh:practice-new-stories', text: 'Practice aloud: 2 stories you have not said out loud yet' },
  { id: 'beh:negotiation-1', text: 'Offers and negotiation 1: how pay is made up in India (base, joining bonus, RSUs and vesting, variable) and what levels.fyi shows for your target levels', url: 'https://www.levels.fyi/' },
  { id: 'beh:negotiation-2', text: 'Offers and negotiation 2: competing offers and the recruiter call. Write your script and rehearse it out loud.', url: 'https://www.techinterviewhandbook.org/negotiation/' },
];

// Forward-deployed engineer track (weeks 6–13), following roadmap.sh/forward-deployed-engineer. The 2 Python items (dropped, v3-dropped.js) and the 4 Stage-6 cloud items (Platform) were moved out in v2 (AIB_MOVED).
export const FDE = [
  { id: 'fde:stage1-intro', text: 'Stage 1 · Intro: roles & responsibilities, FDE tiers, "from X to FDE". Read 5 real FDE postings; write your skills gap in Notes.', url: 'https://roadmap.sh/forward-deployed-engineer' },
  { id: 'fde:stage1-glossary', text: 'Stage 1 · Glossary: Delta, UAT, last-mile integration, Day 2 operations, productized consulting, embedded engineering. Plus the interview loop.', url: 'https://careerservices.fas.harvard.edu/blog/2026/08/01/forward-deployed-engineer-interview-the-definitive-2026-guide-fde/' },
  { id: 'fde:decomposition-framework', text: 'Rep · Decomposition framework (use your template page), then rep 1, 45 min out loud: "Reduce traffic congestion in a city"', url: 'https://a10x.dev/blog/forward-deployed-engineer-interview-questions' },
  { id: 'fde:git-beyond-basics', text: 'Stage 2 · Git beyond basics: rebase, bisect, cherry-pick, conflicts in someone else\'s repo', url: 'https://roadmap.sh/git-github' },
  { id: 'fde:linux-shell', text: 'Stage 2 · Linux & shell: processes, permissions, ssh, grep/awk/jq, cron, logs. Debug a service on a VM.', url: 'https://roadmap.sh/shell-bash' },
  { id: 'fde:practical-coding-log', text: 'Rep · Practical coding (Python, 45 min): parse a log file and answer 5 questions about it' },
  { id: 'fde:data-audit-modeling', text: 'Stage 4 · Data audit + data modeling: draw the schema of a messy sample database and spot the problems', url: 'https://roadmap.sh/data-engineer', depth: true },
  { id: 'fde:sql-analysis', text: 'Stage 4 · SQL for analysis: CTEs + window functions (5 problems)', url: 'https://leetcode.com/studyplan/top-sql-50/', depth: true },
  { id: 'fde:data-pipelines', text: 'Stage 4 · Data pipelines: ETL vs ELT, batch vs streaming, idempotent jobs, data quality checks', url: 'https://roadmap.sh/data-engineer', depth: true },
  { id: 'fde:data-warehouses', text: 'Stage 4 · Data warehouses (BigQuery / Snowflake), star schema; Spark and Airflow at concept level (write one Airflow DAG)', url: 'https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html' },
  { id: 'fde:decomposition-2', text: 'Rep · Decomposition 2: "Let several teams query shared data without exposing raw records"' },
  { id: 'fde:context-engineering', text: 'Stage 5 · Context engineering + prompt management (templates, versioning, testing prompts)', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents', depth: true },
  { id: 'fde:model-providers', text: 'Stage 5 · Choosing model providers: price, latency, quality, data policy. Build a wrapper that can switch providers.', url: 'https://artificialanalysis.ai/' },
  { id: 'fde:agents-memory', text: 'Stage 5 · Agents: memory & state, multi-agent patterns, when one agent is enough', url: 'https://roadmap.sh/ai-agents', depth: true },
  { id: 'fde:integration-engineering', text: 'Stage 5 · Integration engineering: legacy systems (SOAP/XML, batch files, SFTP, webhooks, old auth). Wrap one in a clean REST API.' },
  { id: 'fde:reengineering-round', text: 'Rep · Re-engineering round: clone an unfamiliar repo, find and fix a bug in 60 min (try with and without an AI coding tool)', url: 'https://github.com/topics/good-first-issue', depth: true },
  { id: 'fde:client-simulation-1', text: 'Rep · Client simulation 1: explain a delayed launch and a trade-off to a non-technical executive (record 5 min)' },
  { id: 'fde:eval-pipelines', text: 'Stage 7 · Eval pipelines: run evals in CI and block deploys when quality drops', url: 'https://hamel.dev/blog/posts/evals/', depth: true },
  { id: 'fde:debugging-agents', text: 'Stage 7 · Debugging agent logic: traces, replaying runs, a failure taxonomy', url: 'https://langfuse.com/docs', depth: true },
  { id: 'fde:inference-optimization', text: 'Stage 7 · Inference optimization: caching, batching, smaller models, streaming, latency budgets', depth: true },
  { id: 'fde:security', text: 'Stage 7 · Security: DevSecOps, API security, enterprise auth (SSO, SAML, OIDC)', url: 'https://owasp.org/www-project-api-security/' },
  { id: 'fde:governance-privacy', text: 'Stage 7 · AI governance, data privacy & compliance: PII/PHI, GDPR/HIPAA basics, audit logs, data residency', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
  { id: 'fde:mlops', text: 'Stage 7 · MLOps basics: model and prompt versioning, drift monitoring, staged rollouts', url: 'https://roadmap.sh/mlops' },
  { id: 'fde:learning-round', text: 'Rep · Learning round: learn an API you have never used in 30 min, then build with it' },
  { id: 'fde:discovery', text: 'Stage 8 · Discovery: requirements gathering. Write 10 scoping questions for an AI support assistant, run a mock discovery call.' },
  { id: 'fde:scoping', text: 'Stage 8 · Scoping & sequencing; scope vs speed vs quality. Write a phased plan: pilot → UAT → rollout → Day 2.' },
  { id: 'fde:business-acumen', text: 'Stage 8 · Business acumen: enterprise workflows, ROI & AI impact. Build an ROI estimate for an AI assistant.' },
  { id: 'fde:stakeholders', text: 'Stage 8 · Stakeholder management + the product feedback loop (field → product team)' },
  { id: 'fde:communication', text: 'Stage 8 · Communication: technical writing, executive reporting, time-to-value. Write a 1-page solution doc + a weekly status update.' },
  { id: 'fde:decomposition-3', text: 'Rep · Decomposition 3: "Help a clinic reduce missed appointments using AI"' },
  { id: 'fde:client-simulation-2', text: 'Rep · Client simulation 2: the customer says your AI tool gave a wrong answer to their CEO' },
  { id: 'fde:take-home-1', text: 'Rep · Take-home day 1: scope an LLM workflow for a fake customer (invoice extraction)' },
  { id: 'fde:take-home-2', text: 'Rep · Take-home day 2: build it end to end (Python or TypeScript), deployed' },
  { id: 'fde:take-home-3', text: 'Rep · Take-home day 3: evals, failure handling, a customer-facing README and a 3-min demo' },
  { id: 'fde:decomposition-4', text: 'Rep · Decomposition 4: "An insurer wants to cut claims processing from 10 days to 2"' },
  { id: 'fde:mock-fde-loop', text: 'Rep · Mock FDE loop with a peer: decomposition + client simulation', url: 'https://www.tryexponent.com/practice' },
];

// What each company actually tests and where the plan covers it: [company, what they test, where the plan covers it].
export const COMPANY_MAP = [
  ['Google (frontend SWE)', 'Phone screen: DSA. Onsite 4–5 rounds: mostly LeetCode medium–hard DSA, one frontend round (JS/async/DOM/React; large-scale frontend design at senior), Googleyness. Hiring committee + team match. At least one in-person round.', 'DSA every day + Google plain-doc sets in Phase 3; Frontend (senior); frontend system design; Googleyness stories'],
  ['Meta (front-end / product)', 'Screen: 2 problems in ~35–45 min (vanilla JS for front-end). Loop: 2 coding (one may be AI-enabled), product architecture (user-facing product, sometimes diagrammed in Mermaid), behavioral.', 'Meta speed sets (2 in 40 min) in Phase 3; Frontend timed JS reps; AI-enabled coding drills on Saturdays; frontend system design'],
  ['Meta AI-enabled round', '60 min, multi-file codebase in CoderPad: fix a bug → implement a feature (harder than medium) with an AI chat → optimize for bigger inputs. Graded on understanding, verification, communication.', 'AI-enabled coding drills (odd Saturdays, weeks 1–9); Platform re-engineering and learning rounds; AI core slot 70 (build with an AI assistant, review every line)'],
  ['Microsoft', '3–6 rounds: long machine-coding rounds (e.g. an Outlook or Teams-style UI), advanced JS, LLD, DSA, browser internals; growth mindset. Some teams add an AI-assisted round.', 'Machine-coding rehearsal reps (Frontend, weeks 11–13); LLD Saturdays; Frontend browser internals; growth-mindset stories'],
  ['Amazon', 'OA (coding 70 min + work simulation + work style), DSA + Leadership Principles every round, LLD/HLD at SDE-2, bar raiser.', 'The Whimsical board, mapped in the board table'],
  ['Forward-deployed (AI labs, Palantir, Databricks, startups)', 'Practical coding (often Python), system design with LLM/RAG/evals, decomposition, client simulation, behavioral, sometimes a 4–8 h take-home. Posts ask for Python/TS, SQL, cloud, containers, RAG/evals/agents, discovery skills.', 'Career FDE stages and decomposition reps; AI engineering core; Platform (data, integration, practical reps in TypeScript); the flagship'],
  ['System design in 2026 (all companies)', 'LLM parts (gateways, vector stores, evals, agent sandboxes) are now normal design material; cost and latency reasoning is graded; "design an eval framework" is a common prompt.', 'AI engineering core: 8 AI designs + 3 timed AI-design mocks; Systems HLD designs'],
  ['Apple (team-specific)', 'Varies by team. Deep frontend craft, accessibility, performance and privacy questions, plus a long deep dive into a past project.', 'Frontend (accessibility, performance, browser security); project deep dives in Career'],
  ['Stripe', 'Bug squash, an integration round, API design and code review.', 'Platform: re-engineering round, code-review reps, customer APIs and webhooks; Systems: API design and the Stripe idempotency case study'],
];

// Product engineer prep (roadmap v2 §8): one teardown per target company with a consumer or developer product.
// Sequenced by Task 5 after BEH runs out, alongside the FDE items. Rows of COMPANY_MAP that are rounds or topics (Meta AI-enabled round, forward-deployed, system design in 2026) have no product, so no teardown.
const teardown = (slug, company, url) => ({ id: `beh:teardown-${slug}`, company, text: `Product teardown · ${company}: use the product, write 3 improvements`, url });
export const TEARDOWNS = [
  teardown('google', 'Google', 'https://www.google.com/maps'),
  teardown('meta', 'Meta', 'https://www.instagram.com/'),
  teardown('microsoft', 'Microsoft', 'https://www.microsoft.com/en-us/microsoft-365'),
  teardown('amazon', 'Amazon', 'https://www.amazon.in/'),
  teardown('apple', 'Apple', 'https://www.apple.com/'),
  teardown('stripe', 'Stripe', 'https://stripe.com/payments/checkout'),
];

// DECOMP (moved here from the v2 judgment.js, v3 §6): the 12 decomposition and client-simulation reps, laid out by CAREER below.
// v2: Thu · Decomposition or client simulation, 45 min out loud.
// §4 counts 11 existing prompts: the 6 FDE `Rep ·` decomposition and client-simulation items (`from`: the FDE item it moves here
// from; its CAREER row lists that id in `covers`) and the 5 non-coding FDE_PROMPTS (`v1Prompt`: its
// 0-based index in the old FDE_PROMPTS). FDE_PROMPTS[1] repeats fde:client-simulation-2 word for word, so it is not used twice;
// the plan takes 2 prompts from published FDE guides instead of 1 (`source`, checked with WebFetch 2026-11-15). FDE_PROMPTS[3]
// (merge two messy CSVs) is a practical-coding rep, so it lives in PRACTICAL.
const LOUD = '(45 min, out loud)';
const AC = 'https://www.aced.io/blog/decomposition-interview'; // Aced (formerly Exponent), "How to Answer Decomposition Interview Questions: The Definitive Guide (2026)"
const TI = 'https://www.techinterview.org/post/3233477236/forward-deployed-engineer-interview/'; // techinterview, "What the forward deployed engineer interview really tests", 2026-08-05
export const DECOMP = [
  { id: 'jt:decomp-traffic', from: 'fde:decomposition-framework', text: `Decomposition 1 ${LOUD}: learn the decomposition framework (use your template page), then "Reduce traffic congestion in a city"`, url: 'https://a10x.dev/blog/forward-deployed-engineer-interview-questions', mins: 45 },
  { id: 'jt:decomp-fraud', v1Prompt: 0, text: `Decomposition: "A bank wants to flag fraudulent transactions in real time" ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-shared-data', from: 'fde:decomposition-2', text: `Decomposition: "Let several teams query shared data without exposing raw records" ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-delayed-launch', from: 'fde:client-simulation-1', text: 'Client simulation: explain a delayed launch and a trade-off to a non-technical executive (record 5 min)', mins: 45 },
  { id: 'jt:decomp-delivery-delays', v1Prompt: 2, text: `Decomposition: "A logistics company wants to predict delivery delays" ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-clinic', from: 'fde:decomposition-3', text: `Decomposition: "Help a clinic reduce missed appointments using AI" ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-wrong-answer', from: 'fde:client-simulation-2', text: `Client simulation: the customer says your AI tool gave a wrong answer to their CEO ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-night-nurses', v1Prompt: 4, text: `Decomposition: "A hospital wants an AI assistant for nurses on night shifts" ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-911-response', source: AC, url: AC, text: `Decomposition: "A major city wants to reduce 911 emergency response times. They have call data, traffic data, and ambulance GPS data." ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-scope-cut', v1Prompt: 5, text: `Client simulation: scope cut. The customer wants 10 features in 4 weeks ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-claims', from: 'fde:decomposition-4', text: `Decomposition: "An insurer wants to cut claims processing from 10 days to 2" ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-wrong-dashboard', source: TI, url: TI, text: `Client simulation: "A customer says their dashboard is wrong. They can't tell you which number. What do you do?" ${LOUD}`, mins: 45 },
];


// ---------- v3 Career and FDE (roadmap v3 §6, the `beh` track, 1 h) ----------
// CAREER: the 65 weekday rows in slot order (Saturdays are MOCK_DAY). Row format: the plan's "Content row format".
// A BEH/FDE row keeps its v2 id and url; the 5 shared slots (items of 30 min or less) name the second id in `covers`;
// a DECOMP rep covers the FDE item it came from. Order: BEH in v2 order (Amazon OA prep in week 1, deep dives on the
// Fridays of weeks 2–4); from week 7 the FDE stages and DECOMP reps, a product teardown every 5 slots (Thursdays),
// applications from week 8, negotiation on Mon–Tue of week 12. New URLs checked 2026-11-16.
const QBANK = 'https://www.techinterviewhandbook.org/behavioral-interview-questions/'; // Tech Interview Handbook, behavioral question bank
const RUBRIC = 'https://www.techinterviewhandbook.org/coding-interview-rubrics/'; // Tech Interview Handbook, coding interview rubric
const PEER = 'https://www.tryexponent.com/practice';
const NOTES = 'Write it in Notes.';
const v2 = (id) => {
  const x = [...BEH, ...FDE].find((y) => y.id === id);
  if (!x) throw new Error(`career: no v2 item ${id}`);
  return x;
};
/** A learning row from a v2 BEH or FDE item: Understand defaults to its v2 text and url. */
const learn = (id, { understand, url, url2, covers, do: d, explain }) => {
  const x = v2(id);
  return {
    id, ...(covers ? { covers } : {}), ...(id.startsWith('fde:') ? { cat: 'fde' } : {}),
    understand: understand ?? x.text, url: url ?? x.url, ...(url2 ? { url2 } : {}), ...(d ? { do: d } : {}), explain,
  };
};
/** A DECOMP prompt as a learning row (45 min, out loud): Understand is its v2 text; Do runs it; Explain reviews it. */
const rep = (id) => {
  const x = DECOMP.find((y) => y.id === id);
  if (!x) throw new Error(`career: no DECOMP item ${id}`);
  const sim = id.startsWith('jt:client-sim-');
  return {
    id, cat: 'fde', ...(x.from ? { covers: [x.from] } : {}),
    understand: `${x.text}. First reread your ${sim ? 'client-simulation notes' : 'decomposition template'} and the linked guide.`, url: x.url ?? (sim ? TI : AC),
    do: sim
      ? 'Play both sides for 35 min, out loud and recorded: say the problem back, say what you know and do not know yet, give 2 options with their trade-offs, and agree a next step.'
      : 'Talk it through for 35 min with a timer, writing the outline in Notes as you go: your clarifying questions, the users and the data, the parts of the problem, a first version you could ship, and how you would measure it.',
    explain: sim
      ? 'Out loud, 10 min: play the recording back and note where you used jargon or got defensive, then say the 3 questions you should have asked first. Deep enough when you can give the customer a next step and a date in under a minute.'
      : 'Out loud, 10 min: give the answer again as a 3-min summary, then say the 3 questions you should have asked first. Deep enough when you can name the first version you would ship and the number that shows it worked.',
  };
};
/** A product teardown, one per target company. */
const tear = (slug) => {
  const x = TEARDOWNS.find((y) => y.id === `beh:teardown-${slug}`);
  return {
    id: x.id, understand: `${x.text}. Use it for 20 min as a new user, on the main job it exists for. Note every moment you hesitate.`, url: x.url,
    do: 'Write 3 improvements in Notes. For each: the user problem, the change, and the number that would show it worked.',
    explain: `Out loud, 3 min: your best improvement, pitched to a product manager at ${x.company}. Deep enough when you can say who it helps, what it costs to build, and how you would measure it.`,
  };
};
const story = (lps) => `Write one STAR story for each of ${lps} in Notes: situation and task in 2 lines, then your actions, then the result with a number.`;
const tell = (what) => `Out loud, 2 min each, with a timer: ${what}. Deep enough when you can tell each story in under 2 minutes without notes and answer "what would you do differently?"`;

export const CAREER = [
  // ---------- Week 1 ----------
  learn('beh:resume', {
    do: 'Rewrite every bullet of your resume as impact. Keep it to one page and cut any bullet with no result.',
    explain: 'Out loud, 2 min: walk through your top 3 bullets. Deep enough when you can say the number behind each bullet and how you measured it.' }),
  learn('beh:linkedin-github', { covers: ['beh:positioning'],
    understand: `${v2('beh:linkedin-github').text}. Then: ${v2('beh:positioning').text}.`,
    do: 'Update your LinkedIn headline and About to match your pitch. Pin 3 repos on GitHub, each with a README that says what it does and how to run it.',
    explain: 'Out loud, 1 min: your pitch and your 3 target role titles. Deep enough when you can say why each title fits your past work.' }),
  learn('beh:amazon-oa', {
    do: 'Write down the OA parts, their times and what each one measures. Plan which Saturday coding rounds you will treat as OA practice.',
    explain: 'Out loud, 2 min: the OA format. Deep enough when you can say how the coding part is scored and what the work simulation looks for.' }),
  learn('beh:amazon-work-sim', {
    do: 'Answer 3 sample work-simulation prompts in writing: one email, one priority call under ambiguity, one customer reply.',
    explain: 'Out loud, 2 min: one of your answers and the Leadership Principle behind it. Deep enough when you can name the principle each choice shows.' }),
  learn('beh:amazon-work-style', {
    do: 'Answer 20 most/least-likely sample items. Mark the principle behind each answer.',
    explain: 'Out loud, 2 min: 3 items where both answers looked fine. Deep enough when you can say which principle breaks the tie.' }),
  // ---------- Week 2 ----------
  learn('beh:story-bank', { url2: QBANK,
    do: 'List 12 projects or situations from your work in Notes: 4 wins, 4 failures or mistakes, 4 conflicts or hard calls. One line each, with a number.',
    explain: 'Out loud, 3 min: pick 3 and say which interview questions each answers. Deep enough when you can map every story to at least 2 questions from the question bank.' }),
  learn('beh:market-scan', {
    do: 'Save 10 job posts (frontend, full-stack, forward-deployed engineer, AI product engineer). Copy the required skills into a table in Notes and count which ones repeat.',
    explain: 'Out loud, 2 min: the 5 skills that come up most. Deep enough when you can say where this plan covers each one.' }),
  learn('beh:amazon-structure-lps', {
    do: 'Write each of the 16 Leadership Principles in one line in your own words, and next to it the story from your bank that fits best.',
    explain: 'Out loud, 3 min: the loop for your level and 5 principles from memory. Deep enough when you can say what the bar raiser is for.' }),
  learn('beh:lp-customer-ownership', { do: story('Customer Obsession and Ownership'), explain: tell('both stories') }),
  learn('beh:deep-dive-1', {
    do: 'Draw the architecture in Excalidraw. Write the trade-offs, the metrics, your own part, what you would change, and 10 drill-down questions an interviewer would ask.',
    explain: 'Out loud, 15 min, recorded: give the talk, then answer 3 of your drill-down questions. Deep enough when you can answer "why not the other option?" for every box on the diagram.' }),
  // ---------- Week 3 ----------
  learn('beh:lp-invent-right', { do: story('Invent and Simplify and Are Right, A Lot'), explain: tell('both stories') }),
  learn('beh:lp-learn-hire', { do: story('Learn and Be Curious and Hire and Develop the Best'), explain: tell('both stories') }),
  learn('beh:lp-standards-think-big', { do: story('Insist on the Highest Standards and Think Big'), explain: tell('both stories') }),
  learn('beh:lp-action-frugality', { do: story('Bias for Action and Frugality'), explain: tell('both stories') }),
  learn('beh:deep-dive-2', {
    do: 'Use a different project from deep dive 1. Draw the architecture, then write the trade-offs, metrics, your own part, what you would change, and 10 drill-down questions.',
    explain: 'Out loud, 15 min, recorded: give the talk, then answer 3 drill-down questions. Deep enough when you can say the one decision you would reverse today and why.' }),
  // ---------- Week 4 ----------
  learn('beh:lp-trust-dive-deep', { do: story('Earn Trust and Dive Deep'), explain: tell('both stories') }),
  learn('beh:lp-backbone-results', { do: story('Have Backbone; Disagree and Commit and Deliver Results'), explain: tell('both stories') }),
  learn('beh:lp-employer-scale', { do: story("Earth's Best Employer and Success and Scale Bring Broad Responsibility"), explain: tell('both stories') }),
  learn('beh:google-behavioral', { url2: QBANK,
    do: 'List 8 Googleyness and leadership questions. Next to each, write the story from your bank that answers it.',
    explain: tell('2 of them') }),
  learn('beh:deep-dive-3', {
    do: 'Use a third project. Draw the architecture, then write the trade-offs, metrics, your own part, what you would change, and 10 drill-down questions.',
    explain: 'Out loud, 15 min, recorded: give the talk to a friend or the camera. Deep enough when you can go 2 levels deeper on any part without saying "I am not sure".' }),
  // ---------- Week 5 ----------
  learn('beh:meta-microsoft-behavioral', { url2: QBANK,
    do: 'Pick one story each for conflict, growth, impact and ambiguity. Write the result line of each with a number.',
    explain: tell('the conflict and the ambiguity stories') }),
  learn('beh:tell-me-about-yourself', {
    do: 'Write the 90-second pitch: who you are, 2 things you built and their results, and why this role. Record it on your phone.',
    explain: 'Out loud: play the recording back, then say it again better. Deep enough when you can say it in 90 seconds without notes and land on why this role.' }),
  learn('beh:project-deep-dive', {
    do: 'Pick your best project. Write the architecture, 3 trade-offs and the numbers (users, latency, cost, time saved) on one page.',
    explain: 'Out loud, 5 min: the short version for a behavioral round. Deep enough when you can switch between the 1-minute and the 5-minute version on request.' }),
  learn('beh:failures', {
    do: 'Write 2 failure stories in Notes. Keep the mistake clearly yours, and end each with what you changed afterwards.',
    explain: tell('both failure stories') }),
  learn('beh:conflicts', {
    do: 'Write 2 conflict stories (one with a teammate, one with a manager): the disagreement, how you handled it, the outcome.',
    explain: tell('both conflict stories') }),
  // ---------- Week 6 ----------
  learn('beh:customer-stories', { url: QBANK,
    do: 'Write 2 stories about working with a customer or a non-technical stakeholder: what they needed, what you explained, what changed.',
    explain: 'Out loud, 2 min each: tell them as if to a forward-deployed engineer interviewer. Deep enough when you can say how you checked they understood you.' }),
  learn('beh:questions-to-ask', { covers: ['beh:practice-why-company'],
    understand: `${v2('beh:questions-to-ask').text}. Then: ${v2('beh:practice-why-company').text}.`,
    do: 'Write 10 questions to ask (team, process, product, growth). Then write a 3-line "Why this company?" for each of your top 5.',
    explain: 'Out loud, 1 min each: "Why this company?" for your top 5. Deep enough when you can name a product detail or a recent change for each one.' }),
  learn('beh:microsoft-growth', {
    do: 'Write 2 growth mindset stories: one where feedback changed how you work, one where you learned a new area fast.',
    explain: tell('both stories') }),
  learn('beh:ai-usage-story', { url: 'https://www.hellointerview.com/blog/meta-ai-enabled-coding',
    do: 'Write how you use AI tools day to day: which tools, for which tasks, and how you check their output. Add one time the AI was wrong and how you caught it.',
    explain: 'Out loud, 2 min: your AI usage story. Deep enough when you can say exactly how you verify AI-written code before it ships.' }),
  learn('beh:practice-lp-stories', { url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
    do: 'Pick 2 LP stories. Tell them to a friend with a 2-minute timer and write down their feedback.',
    explain: 'Out loud: tell the weaker story again with the feedback applied. Deep enough when you can handle 2 follow-up questions on each story without notes.' }),
  // ---------- Week 7: FDE stages, DECOMP reps and teardowns begin ----------
  learn('beh:practice-new-stories', { url: QBANK,
    do: 'Pick 2 stories from your bank you have never said out loud. Pick a question from the bank for each.',
    explain: tell('both stories') }),
  learn('fde:stage1-intro', { covers: ['fde:stage1-glossary'],
    understand: `${v2('fde:stage1-intro').text} Then: ${v2('fde:stage1-glossary').text}`, url2: v2('fde:stage1-glossary').url,
    do: 'Write each glossary term in one line in your own words. Then list the FDE interview rounds and which part of this plan prepares each.',
    explain: 'Out loud, 3 min: what a forward-deployed engineer does in a week. Deep enough when you can explain UAT, last-mile integration and Day 2 operations to a non-engineer.' }),
  rep('jt:decomp-traffic'),
  tear('google'),
  rep('jt:decomp-fraud'),
  // ---------- Week 8: applications start ----------
  learn('beh:target-list', {
    do: 'List 40 companies in 3 tiers: big tech, AI companies with FDE roles, practice companies. Note the role and level for each.',
    explain: 'Out loud, 2 min: your top 5 and why. Deep enough when you can say which roles you apply for first and why that order.' }),
  learn('fde:discovery', { url: 'https://roadmap.sh/forward-deployed-engineer',
    do: 'Write 10 scoping questions for an AI support assistant. Then run a 20-min mock discovery call with a friend playing the customer.',
    explain: 'Out loud, 3 min: what you learned in the call. Deep enough when you can say the one requirement the customer did not say but needed.' }),
  learn('beh:referrals', { covers: ['beh:referral-template'],
    understand: `${v2('beh:referrals').text}. Then: ${v2('beh:referral-template').text}.`,
    do: 'Find 2 engineers per target company. Write the referral template (who you are, the role, one line on why you fit, the job link). Send the first 10.',
    explain: 'Out loud, 1 min: read your template as the receiver would. Deep enough when you can say why a busy engineer would answer it.' }),
  tear('meta'),
  rep('jt:decomp-shared-data'),
  // ---------- Week 9 ----------
  { id: 'beh:company-loops',
    understand: "Company loops: for each of your top 5 targets, map the interview loop from the reference page's company map (what each round tests and how long it is).",
    url: 'https://www.techinterviewhandbook.org/software-engineering-interview-guide/',
    do: 'Make a table in Notes: company, rounds, what each tests, and which of your Saturday mocks and loops rehearse it. Mark any round you have not practised.',
    explain: 'Out loud, 3 min: the loop of your first-choice company. Deep enough when you can say which round is your weakest and what you will do about it before the onsite.' },
  learn('fde:scoping', { url: 'https://roadmap.sh/forward-deployed-engineer',
    do: 'For the AI support assistant from discovery, write a phased plan: pilot, UAT, rollout, Day 2. Say what is cut from the pilot and why.',
    explain: 'Out loud, 3 min: scope vs speed vs quality in your plan. Deep enough when you can say what you would drop first if the deadline moved up by 2 weeks.' }),
  learn('beh:resume-update', { covers: ['beh:referrals-2'],
    understand: `${v2('beh:resume-update').text}. Then: ${v2('beh:referrals-2').text}.`,
    do: 'Add the new skills and a "Building now" line for your flagship project. Send 10 more referral requests with the updated resume.',
    explain: 'Out loud, 1 min: your "Building now" line and the skill it proves. Deep enough when you can answer 2 follow-up questions about the flagship from it.' }),
  tear('microsoft'),
  rep('jt:client-sim-delayed-launch'),
  // ---------- Week 10 ----------
  learn('fde:business-acumen', { url: 'https://roadmap.sh/forward-deployed-engineer',
    do: 'Build an ROI estimate for an AI support assistant in a table: tickets per month, minutes saved per ticket, cost per conversation, build cost. Find the break-even month.',
    explain: 'Out loud, 3 min: your ROI case to a CFO. Deep enough when you can say which one number, if wrong, would kill the case.' }),
  rep('jt:decomp-delivery-delays'),
  learn('fde:stakeholders', { url: 'https://roadmap.sh/forward-deployed-engineer',
    do: 'Map the stakeholders of an AI rollout at a customer (sponsor, users, IT, security, legal). For each: what they want and what would make them block it. Then write one field-to-product feedback note.',
    explain: 'Out loud, 3 min: how you would handle the stakeholder most likely to block. Deep enough when you can say what you would bring to your first meeting with them.' }),
  tear('amazon'),
  learn('fde:communication', { url: 'https://developers.google.com/tech-writing/one', url2: 'https://roadmap.sh/forward-deployed-engineer',
    do: 'Write a 1-page solution doc for the AI support assistant and a weekly status update for its executive sponsor.',
    explain: 'Out loud, 2 min: the status update. Deep enough when you can give the risk and the ask in the first 30 seconds.' }),
  // ---------- Week 11: the FDE take-home, Mon–Wed ----------
  learn('fde:take-home-1', { understand: 'FDE take-home day 1: scope an LLM workflow for a fake customer (invoice extraction): inputs, outputs, edge cases, what "done" means.',
    url: 'https://www.anthropic.com/engineering/building-effective-agents',
    do: 'Write the scope in a README: the fields to extract, 5 messy sample invoices, the success measure, and whether a fixed workflow or an agent fits better.',
    explain: 'Out loud, 2 min: your scope to the customer. Deep enough when you can say what you will not build and why.' }),
  learn('fde:take-home-2', { understand: 'FDE take-home day 2: build the invoice extraction workflow end to end and deploy it.',
    url: 'https://ai-sdk.dev/docs/introduction',
    do: 'In TypeScript (an AI assistant is allowed), build it with structured output into a schema you validate. Deploy it and run your 5 sample invoices through it.',
    explain: 'Out loud, 2 min: the path of one invoice through your code. Deep enough when you can say what happens when the model returns a field in the wrong format.' }),
  learn('fde:take-home-3', { understand: 'FDE take-home day 3: evals, failure handling, a customer-facing README and a 3-min demo.',
    url: 'https://hamel.dev/blog/posts/evals/',
    do: 'Add an eval over your sample invoices with a pass rate, retries for bad output, and a README for the customer. Record a 3-min demo.',
    explain: 'Out loud, 3 min: the demo as if to the customer. Deep enough when you can show one failure your eval caught and how you fixed it.' }),
  tear('apple'),
  rep('jt:decomp-clinic'),
  // ---------- Week 12: negotiation Mon–Tue ----------
  learn('beh:negotiation-1', { url2: 'https://www.techinterviewhandbook.org/negotiation-rules/',
    do: 'Look up your target levels on levels.fyi for 3 companies. Write a table: base, joining bonus, RSUs per year, variable, total.',
    explain: 'Out loud, 2 min: how RSU vesting changes the first-year number. Deep enough when you can compare two offers with different vesting on year-one and year-four pay.' }),
  learn('beh:negotiation-2', {
    do: 'Write your recruiter-call script: your excitement, the competing offer, the number you ask for, and what you say after a "no".',
    explain: 'Out loud, with a friend as the recruiter: run the call twice. Deep enough when you can state your number and then stay quiet.' }),
  rep('jt:client-sim-wrong-answer'),
  tear('stripe'),
  rep('jt:decomp-night-nurses'),
  // ---------- Week 13 ----------
  rep('jt:decomp-911-response'),
  rep('jt:client-sim-scope-cut'),
  rep('jt:decomp-claims'),
  rep('jt:client-sim-wrong-dashboard'),
  learn('fde:mock-fde-loop', { understand: 'Mock FDE loop with a peer: book a free peer session and ask for a decomposition round, then a client simulation.',
    do: 'Run the 2 rounds (25 min each) with the peer, one prompt you have not done yet in each. Write down their feedback.',
    explain: 'Out loud, 3 min: what the peer said you missed. Deep enough when you can redo your weakest answer with the feedback applied.' }),
];

// MOCK_DAY: the 13 Saturdays (v3 §6). `row` is the Saturday career slot (60 min); `carry` rows go to that week's Sunday
// (45 min each). Coding rounds name an OA post by its index in reference.js OA_LINKS (`oa`: 8..15; DSA uses 0..7) and cite
// the coding rubric as `url2`, as do the AI drills and round 1 of each mock loop (rounds 2 and 3 score on that rubric too).
const AI_DRILL_URL = 'https://www.hellointerview.com/blog/meta-ai-enabled-coding';
const HLD_FRAMEWORK = 'https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery';
const drill = (n, feature, extra = {}) => ({
  id: `beh:ai-drill-${n}`, kind: 'rep', mins: 60, url: AI_DRILL_URL, url2: RUBRIC, ...extra,
  text: `AI-enabled coding drill ${n} of 5 (Meta-style, 60 min): take a small TypeScript repo you have not read (a few files). Read it for 5 min, fix one bug without AI, then ${feature} using AI chat only (no autocomplete), then make it work for a 10× larger input. Verify every AI suggestion before you keep it and narrate out loud. Score yourself on the rubric.`,
});
const oaRound = (n) => ({
  id: `beh:oa-round-${n}`, kind: 'rep', mins: 60, oa: 7 + n, url2: RUBRIC,
  text: `Coding round ${n} of 4 (Amazon OA simulation, 60 min): solve the 2 problems from this post, timed, in a plain editor. Then score yourself on the rubric and read the best solution to each.`,
});
const aiMock = (id, prompt, url) => ({
  id, kind: 'mock', mins: 45, url,
  text: `Timed AI-design mock (45 min, solo, out loud): ${prompt} Requirements, numbers, diagram, a deep dive on the model path, then evals and failure modes. Afterwards, compare with the linked source and write down the 3 things you skipped.`,
});
const peer = (id, round, extra = {}) => ({
  id, kind: 'mock', mins: 45, url: PEER, ...extra,
  text: `Peer mock with a real person (Exponent free peer practice, 45 min): ${round} Write down their feedback, then redo your weakest answer.`,
});
const LOOPS = [
  { name: 'AI or product engineer', lld: ['sdm:lld-json-parser', 'a JSON parser'],
    r3: { kind: 'mock', url: 'https://eugeneyan.com/writing/llm-patterns/', text: 'AI design: an AI writing assistant inside a docs product (streaming, context from the document, evals, cost per user). Requirements, numbers, diagram, the model path, then evals and failure modes.' } },
  { name: 'big-tech SWE', lld: ['sdm:lld-2048', 'the game 2048'],
    r3: { kind: 'mock', url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/uber', text: 'HLD: design Uber (ride matching, live driver locations, surge). Requirements, entities, API, data flow, high-level design, deep dives.' } },
  { name: 'senior frontend', lld: ['sdm:lld-minesweeper', 'Minesweeper'],
    r3: { kind: 'mock', url: 'https://www.greatfrontend.com/front-end-system-design-playbook', text: 'Frontend system design: a collaborative whiteboard (rendering, state, real-time sync, offline). Requirements, architecture, data model, interface, optimizations (RADIO).' } },
  { name: 'forward-deployed engineer', lld: ['sdm:lld-chess', 'Chess'],
    r3: { kind: 'mock', url: AC, text: 'Behavioral + decomposition: 15 min of behavioral (your pitch, one customer story, one conflict story), then 30 min of decomposition: "A retailer wants to cut product returns using AI".' } },
];
const loop = (n) => {
  const L = LOOPS[n - 1], head = (k) => `Full mock loop ${n} of 4 (${L.name}), round ${k} of 3`;
  return {
    row: { id: `beh:loop-${n}-round-1`, kind: 'mock', mins: 60, oa: 11 + n, url2: RUBRIC,
      text: `${head(1)}: coding, 60 min. Solve the 2 problems from this post, timed, talking out loud as in an onsite. Rounds 2 and 3 are tomorrow. Score each round on the rubric.${n === 1 ? ' Before your first big-tech onsite, book one paid mock with an experienced interviewer.' : ''}` },
    carry: [
      { id: `beh:loop-${n}-round-2`, kind: 'mock', mins: 45, covers: [L.lld[0]], url: 'https://www.lldcoding.com/',
        text: `${head(2)}: LLD, 45 min, timed, out loud. Design ${L.lld[1]}: the classes, interfaces and main flows in TypeScript, then one extension a partner or you add halfway.` },
      { id: `beh:loop-${n}-round-3`, kind: L.r3.kind, mins: 45, url: L.r3.url,
        text: `${head(3)}: ${L.r3.text} 45 min, timed, out loud. Then score the whole loop on the rubric from round 1 and write down the one round you would fail today.` },
    ],
  };
};
export const MOCK_DAY = [
  { week: 1, row: drill(1, 'add a filter option to an existing list', { covers: ['aib:ai-assisted-coding-round'] }), carry: [] },
  { week: 2, row: oaRound(1), carry: [] },
  { week: 3, row: drill(2, 'add a cache in front of a slow function and prove it with a test'), carry: [] },
  { week: 4, row: oaRound(2), carry: [peer('beh:peer-w4-behavioral', 'behavioral round. Use 3 Leadership Principle stories and your 90-second pitch; ask for feedback on structure and numbers.', { url2: QBANK })] },
  { week: 5, row: drill(3, 'add a CSV import that reports an error for each bad row'),
    carry: [{ id: 'beh:mock-w5-sd', kind: 'mock', mins: 45, url: 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-cache', url2: HLD_FRAMEWORK,
      text: 'System design mock (45 min, solo, timed, out loud): design a distributed cache. Requirements, entities, API, data flow, high-level design, deep dives. Then compare with the linked breakdown and write down what you skipped.' }] },
  { week: 6, row: oaRound(3), carry: [peer('beh:peer-w6-decomposition', 'decomposition round. Ask the peer for a prompt you have not seen; use your decomposition template.', { cat: 'fde', url2: AC })] },
  { week: 7, row: drill(4, 'add undo to one editing action'),
    carry: [aiMock('beh:mock-w7-ai', 'an AI support assistant for an online store (RAG over help articles, order lookups as tools, a human handoff, cost per conversation).', 'https://www.anthropic.com/engineering/building-effective-agents')] },
  { week: 8, row: oaRound(4), carry: [peer('beh:peer-w8-sd', 'system design round. The peer picks an HLD prompt you have not drawn yet.', { url2: HLD_FRAMEWORK })] },
  { week: 9, row: drill(5, 'add pagination to an API and its client'),
    carry: [aiMock('beh:mock-w9-ai', 'an LLM gateway for a company (routing between providers, caching, rate limits per team, fallbacks when a provider is down, cost tracking).', 'https://huyenchip.com/2024/07/25/genai-platform.html')] },
  ...[1, 2, 3, 4].map((n) => ({ week: 9 + n, ...loop(n) })),
];
