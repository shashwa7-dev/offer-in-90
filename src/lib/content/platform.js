// Platform, data and DevOps track (roadmap v3 §4, `jt`, 45 min): 76 rows, 78 slots (the two FDE rounds take 2 slots each).
// Slots 1–18: the DevOps basics, in the spec's order. Slots 1–5 need no flagship; slot 6 waits for the flagship scaffold
// (product slot 1). Slots 19–78: the depth items, in the spec's order. The 12 practical coding reps are listed here in
// v2 order; tracks.ts (platformTrack) puts them at or near slots 23, 28, …, 78 (23 + 5k), between depth topics.
// `group` ties the rows of one multi-slot depth topic (SQL, Docker, Kubernetes, …): the builder keeps a group on
// consecutive slots. Row format: the plan's "Content row format" (tracks.ts expandRow). A v2 id keeps its v2 url where that link still
// teaches the slot; `covers` lists the v2 ids a row absorbs. Local Kubernetes runs on kind; AWS runs on the free tier
// behind a budget alarm. Code is TypeScript (run .ts files with `node --experimental-strip-types` or tsx).
// New URLs checked 2026-11-15 (curl, then scripts/check-links.mjs).

const MS = 'https://missing.csail.mit.edu/2020';
const PG = 'https://www.postgresql.org/docs/current';

/** One practical coding rep: 45 min timed, TypeScript, one task. v2 ids are kept. */
const practical = (slug, task, explain, covers) => ({
  id: `jt:practical-${slug}`, kind: 'rep', mins: 45, ...(covers ? { covers } : {}),
  text: `Practical coding rep (TypeScript, 45 min timed): ${task} Then, out loud in 2 min: ${explain}`,
});
const PRACTICAL = {
  'rate-limiter': practical('rate-limiter', 'a rate limiter (token bucket or sliding window) with tests.',
    'why your limiter allows or blocks a burst at the window edge, and how it behaves across 2 servers.'),
  'retry-backoff': practical('retry-backoff', 'retry(fn, opts) with exponential backoff and full jitter, a max-attempts cap, an AbortSignal, and retries only for safe errors (timeouts, 429, 5xx on idempotent calls). Test it with fake timers.',
    'why jitter matters when 1,000 clients fail at once, and which requests must never be retried blindly.'),
  'ttl-cache-swr': practical('ttl-cache-swr', 'a TTL cache with stale-while-revalidate (serve stale, refresh once in the background).',
    'what a user sees during the refresh window, and how you stop 100 concurrent refreshes.'),
  'debounced-fetcher': practical('debounced-fetcher', 'a debounced, cancellable fetcher: only the last call wins, earlier in-flight calls are aborted with AbortController, and callers of a cancelled call get a clear AbortError. Test it with fake timers and a mock fetch.',
    'how you prove a stale response can never overwrite a newer one.'),
  'merge-csvs': practical('merge-csvs', 'merge two messy CSVs and report mismatches (bad rows, duplicate keys, differing values).',
    'how your merge treats a key that appears twice in one file, and why.'),
  'parse-log': practical('parse-log', 'stream a large access log line by line (node:readline) and answer 5 questions: top 5 errors, the 5 slowest endpoints at p95, requests per minute, the busiest client, and the share of 5xx. Keep memory flat.',
    'how your parser handles a malformed line, and what changes when the file is 50 GB.', ['fde:practical-coding-log']),
  'streaming-backpressure': practical('streaming-backpressure', 'a streaming consumer with backpressure (a fast producer, a slow consumer, a bounded buffer).',
    'what happens to memory without backpressure, and where your design pauses the producer.'),
  'rag-pipeline': practical('rag-pipeline', 'a small RAG pipeline: chunk 20 docs, embed them with an embeddings API, keep vectors in memory, retrieve top-k by cosine similarity, answer with citations, and run 5 test questions with expected sources.',
    'one question it gets wrong, and whether retrieval or generation caused it.'),
  'cli-tool': practical('cli-tool', 'a CLI tool with arguments (node:util parseArgs), a help text, exit codes and one test.',
    'which exit code each failure gets, and why a script that calls your tool cares.'),
  'lru-cache': practical('lru-cache', 'an LRU cache with O(1) get and put (a Map keeps insertion order), a capacity, and tests for eviction order.',
    'why a Map gives O(1) here, and what you would change to add a TTL.'),
  'promise-pool': practical('promise-pool', 'a promise pool with a concurrency limit that keeps results in order and surfaces errors.',
    'what your pool does when one task rejects while 3 are in flight.'),
  'webhook-idempotency': practical('webhook-idempotency', 'a webhook receiver (node:http) with idempotency: verify an HMAC signature with timingSafeEqual, reject old timestamps, dedupe by event id, and process each event at most once.',
    'what happens when the same event arrives twice at the same moment, and how your dedupe survives a restart.'),
};

/** A code-review rep on a merged open-source PR (v2 id, url and text kept, as one 45-min task). */
const gh = (repo) => `https://github.com/${repo}/pulls?q=${encodeURIComponent('is:pr is:merged review:changes_requested')}`;
const codeReview = (n, name, repo) => ({
  id: `jt:code-review-${n}`, kind: 'rep', mins: 45, url: gh(repo),
  text: `Code review rep ${n} (${name}, 45 min): open a merged PR where the maintainers asked for changes. Review its first version yourself (correctness, edge cases, naming, tests), then compare with the maintainers' comments. Out loud, 2 min: one issue you missed and why you missed it.`,
});

export const PLATFORM = [
  // ---------- Weeks 1–3: DevOps basics (slots 1–18) ----------
  // 1
  { id: 'pf:shell', covers: ['fde:linux-shell'], url: `${MS}/course-shell/`, url2: 'https://roadmap.sh/shell-bash',
    understand: 'DevOps basics · The terminal and shell: processes, ports, env vars, logs and ssh. Read the Missing Semester shell lecture.',
    do: 'Write a 10-line TypeScript HTTP server that reads PORT from the environment. Start it in the background, find it with ps and lsof -i, send it a request with curl, then kill it. Redirect its output to a log file and follow it with tail -f. Make an ssh key with ssh-keygen, add it to GitHub and test it with ssh -T git@github.com.',
    explain: 'Out loud, 3 min: what happens between typing a command and the process running, and where its env vars come from. Deep enough when you can find what is listening on a port, and say why a process did not see an env var you just exported.' },
  // 2
  { id: 'pf:shell-tools', url: `${MS}/data-wrangling/`, url2: 'https://jqlang.org/manual/',
    understand: 'DevOps basics · Shell power tools: rg, jq, regex and pipes. Read the Missing Semester data-wrangling lecture, then skim the jq manual.',
    do: 'Write a TypeScript script that prints 10,000 JSON log lines (level, route, ms, status). Then answer with one pipe each: the top 5 routes by errors (jq, sort, uniq -c), every line slower than 500 ms, and every TODO in a repo of your choice (rg). Write one regex that pulls a request id out of a plain-text line.',
    explain: 'Out loud, 2 min: walk through one of your pipes stage by stage. Deep enough when you can answer a new question about a log file in under 2 minutes without opening an editor.' },
  // 3
  { id: 'pf:git-workflows', covers: ['fde:git-beyond-basics'], url: 'https://git-scm.com/book/en/v2/Git-Branching-Rebasing', url2: 'https://roadmap.sh/git-github',
    understand: 'DevOps basics · Git workflows: branches, rebase vs merge, pull-request reviews, and reverting a bad deploy. Read the Pro Git chapter on rebasing.',
    do: 'In a scratch GitHub repo: make a feature branch with 4 messy commits, squash them into 2 with an interactive rebase, open a PR and review it yourself with 3 line comments. Merge it, pretend it broke production, and undo it with git revert. Then resolve a conflict between two branches by hand.',
    explain: 'Out loud, 3 min: when you rebase and when you merge, and why you revert a shared branch instead of resetting it. Deep enough when you can undo a bad merge on main without rewriting anyone else\'s history.' },
  // 4
  { id: 'pf:git-internals', url: 'https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain', url2: 'https://semver.org/',
    understand: 'DevOps basics · Git internals, bisect and semver: blobs, trees, commits and refs; finding a bad commit by binary search; what a version number promises. Read the Pro Git internals chapter, then the semver spec.',
    do: 'In a scratch repo, walk one commit with git cat-file -p down to a blob. Write a TypeScript script that makes 50 commits and plants a bug in commit 31, plus a small test that fails on it. Find the commit with git bisect run and your test. Then tag v1.0.0 and decide the next version for a bug fix, a new option and a renamed export.',
    explain: 'Out loud, 3 min: what a branch is on disk, and how bisect finds one bad commit in 1,000 in about 10 steps. Deep enough when you can say why a renamed export is a major version bump even if nothing else changed.' },
  // 5
  { id: 'pf:debugging', url: `${MS}/debugging-profiling/`, url2: 'https://nodejs.org/learn/getting-started/profiling',
    understand: 'DevOps basics · Debugging and profiling: breakpoints, the Node inspector, CPU profiles and flame charts. Read the Missing Semester debugging and profiling lecture, then the Node.js profiling guide.',
    do: 'Write a TypeScript script with one slow function hidden among fast ones. Step through it with a breakpoint (VS Code or chrome://inspect). Record a CPU profile with node --cpu-prof, open it in Chrome DevTools, find the hot function, fix it, and measure the time before and after.',
    explain: 'Out loud, 2 min: how you read a flame chart, and when a debugger beats console.log. Deep enough when you can find the slowest function in a script you did not write, from a profile alone.' },
  // 6
  { id: 'pf:environments', after: 'proj:pick-scaffold', url: 'https://12factor.net/config', url2: 'https://nextjs.org/docs/app/guides/environment-variables',
    understand: 'DevOps basics · Environments and config: dev, staging and prod; config in env vars; what goes in .env and what never does. Read the 12-factor config page, then your framework\'s env-var guide.',
    do: 'In your flagship: add a .env.example with every variable, keep .env out of git, and validate the env at startup with a zod schema that fails fast with a clear message. Give dev, staging and prod their own values. Mark which variables are safe to ship to the browser.',
    explain: 'Out loud, 2 min: what breaks if staging shares a database with prod, and how a secret leaks into a client bundle. Deep enough when you can add a new env var to all three environments without a deploy failing.' },
  // 7
  { id: 'pf:deploy', url: 'https://vercel.com/docs/deployments', url2: 'https://vercel.com/docs/instant-rollback',
    understand: 'DevOps basics · Deploy the web app: builds, preview deploys per PR, promotion and rollback. Read the Vercel deployments docs (Fly.io or Render work the same way).',
    do: 'Deploy your flagship to Vercel (or Fly.io or Render) from GitHub. Open a PR and use its preview URL. Ship a deliberately broken change, then roll back to the previous deploy and time it. Write the steps in the flagship README.',
    explain: 'Out loud, 2 min: the path from git push to a live URL. Deep enough when you can say what a preview deploy shares with production (database, secrets) and why that matters.' },
  // 8
  { id: 'pf:dns-https', url: 'https://dnsimple.com/comics/how-dns-works/', url2: 'https://letsencrypt.org/how-it-works/',
    understand: 'DevOps basics · Domains, DNS and HTTPS: A, CNAME and TXT records, TTLs, certificates and how Let\'s Encrypt proves you own a domain. Read the "How DNS Works" comic, then Let\'s Encrypt\'s "How it works".',
    do: 'Point a domain at your flagship (a cheap one, or your host\'s free subdomain). Inspect the records with dig, follow the CNAME chain, and read the certificate with openssl s_client: issuer, expiry and names. Turn on HTTPS redirects and an HSTS header, and check them with curl -I.',
    explain: 'Out loud, 3 min: what happens from typing your domain to the TLS handshake finishing. Deep enough when you can say why a DNS change "takes a while", and what the TTL has to do with it.' },
  // 9
  { id: 'pf:postgres-backups', url: `${PG}/backup-dump.html`, url2: `${PG}/continuous-archiving.html`,
    understand: 'DevOps basics · Managed Postgres: backups, a tested restore and migrations. Read the Postgres docs on SQL dumps, then skim point-in-time recovery.',
    do: 'Put your flagship on a managed Postgres free tier (Neon or Supabase). Write and apply one migration with your migration tool, plus its down step. Take a pg_dump, restore it into a fresh database and check the row counts match. Time the restore and write the steps down.',
    explain: 'Out loud, 2 min: the difference between a dump and point-in-time recovery, and how much data each loses. Deep enough when you can say why a backup you have never restored is not a backup.' },
  // 10
  { id: 'pf:ci-basics', url: 'https://docs.github.com/en/actions/get-started/quickstart',
    understand: 'DevOps basics · Basic CI with GitHub Actions: lint, typecheck, test and build on every PR, so later eval gates have a CI to run in. Read the GitHub Actions quickstart.',
    do: 'Add a workflow to your flagship that runs lint, tsc --noEmit, tests and the build on every PR, with dependency caching. Break a test on purpose and watch the PR go red. Protect main so a red check blocks the merge.',
    explain: 'Out loud, 2 min: what runs when, and what the cache saves. Deep enough when you can read a failed CI log and find the failing step and line in under a minute.' },
  // 11
  { id: 'pf:feature-flags', url: 'https://martinfowler.com/articles/feature-toggles.html',
    understand: 'DevOps basics · Feature flags, the mechanics: release, ops and experiment toggles, percentage rollouts, and cleaning flags up. Read Martin Fowler\'s "Feature Toggles". (The product use is in the Product track.)',
    do: 'In your flagship, write a small flag module: a flag is on per environment, per user id, or for a percentage of users through a stable hash of the user id. Put one real change behind a flag, test both paths, and add a kill switch you can flip without a deploy.',
    explain: 'Out loud, 2 min: why the percentage must come from a stable hash and not Math.random. Deep enough when you can name the cost of a flag left in the code for a year.' },
  // 12
  { id: 'pf:logs-alert', url: 'https://getpino.io/', url2: 'https://sre.google/sre-book/monitoring-distributed-systems/',
    understand: 'DevOps basics · Reading logs and setting an alert: structured JSON logs, levels, a request id on every line, and alerting on symptoms, not causes. Read the pino docs, then the SRE book chapter on monitoring.',
    do: 'In your flagship, switch to structured logs with pino: level, route, duration, status and a request id passed through every call. Find one request end to end in your host\'s log viewer. Then set one alert (your host\'s or a free tier such as Better Stack) on the 5xx rate, and trigger it on purpose.',
    explain: 'Out loud, 2 min: why you alert on what users feel (errors, latency) and not on CPU. Deep enough when you can find every log line of one failed request in under a minute.' },
  // 13
  { id: 'pf:uptime-errors', url: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/', url2: 'https://uptimerobot.com/',
    understand: 'DevOps basics · Uptime monitoring and error tracking: health checks, external uptime probes, and grouped errors with stack traces and source maps. Read the Sentry setup guide for your framework.',
    do: 'Add Sentry (free tier) to your flagship, throw a test error in the browser and on the server, and check both stack traces point at your source lines. Add a /api/health route that checks the database, and an external uptime check on it. Break the database URL in staging and see who tells you first.',
    explain: 'Out loud, 2 min: what a health check should test, and what it must not. Deep enough when you can say how you would learn about an outage before a user tells you.' },
  // 14
  { id: 'pf:costs', url: 'https://vercel.com/docs/spend-management',
    understand: 'DevOps basics · What it costs: free tiers, usage limits and hard cost caps on every service you use. Read your host\'s spend-management page.',
    do: 'List every service your flagship uses (host, database, LLM API, email, monitoring) with its free-tier limits. Set a spend cap or usage alert on each one, including a monthly limit on your LLM API key. Write cost.md: the monthly bill at 10, 1,000 and 100,000 users, and which service breaks its free tier first.',
    explain: 'Out loud, 2 min: which line of your bill grows fastest with users, and why. Deep enough when you can say what happens to your app, not just your bill, when a cap is hit.' },
  // 15
  { id: 'pf:oauth-oidc', url: 'https://oauth.net/2/pkce/', url2: 'https://openid.net/developers/how-connect-works/',
    understand: 'DevOps basics · OAuth 2.0 and OpenID Connect hands-on: the authorization code flow with PKCE, access vs ID tokens, scopes and refresh. Read oauth.net on PKCE, then "How OpenID Connect works".',
    do: 'Add "Sign in with GitHub" or Google to your flagship (Auth.js or by hand). Watch the redirect, the code and the token exchange in DevTools. Decode the ID token and check iss, aud, exp and nonce yourself. Then make a request with an expired token and handle it.',
    explain: 'Out loud, 3 min: the PKCE flow from the click to the session cookie. Deep enough when you can say what PKCE stops an attacker from doing, and why an access token is not proof of who the user is.' },
  // 16
  { id: 'pf:sso-saml', covers: ['fde:security'], url: 'https://workos.com/guide/the-developers-guide-to-sso', url2: 'https://owasp.org/www-project-api-security/',
    understand: 'DevOps basics · Enterprise auth: SSO, SAML vs OIDC, IdP- and SP-initiated login, and just-in-time provisioning. Read the WorkOS guide to SSO, then skim the OWASP API Security Top 10.',
    do: 'Connect your flagship to Mock SAML (mocksaml.com, a free test IdP) through a SAML library. Log in, then read the SAML response: issuer, audience, NameID, signature and expiry. Create the user on first login inside the right workspace. Check your API against 2 items of the OWASP API Security Top 10.',
    explain: 'Out loud, 3 min: how an enterprise customer\'s employee signs in to your app with SSO. Deep enough when you can say what you must check in a SAML response before you trust it, and when a customer asks for SAML instead of OIDC.' },
  // 17
  { id: 'pf:secrets', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html', url2: 'https://github.com/gitleaks/gitleaks',
    understand: 'DevOps basics · Secrets management and key rotation: where secrets live, who can read them, scanning for leaks, and rotating without downtime. Read the OWASP Secrets Management cheat sheet.',
    do: 'Move every flagship secret into your host\'s secret store, one set per environment. Run gitleaks over the full git history and fix anything it finds. Rotate your LLM API key with no downtime: add the new key, deploy, revoke the old one, and check nothing failed.',
    explain: 'Out loud, 2 min: what you do in the first hour after a key leaks to a public repo. Deep enough when you can say why deleting the commit is not enough.' },
  // 18
  { id: 'pf:hashing-owasp', url: 'https://top10.owasp.org/', url2: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
    understand: 'DevOps basics · Hashing vs encryption, and the OWASP Web Top 10: one-way hashes, slow password hashes, symmetric encryption, and the 10 most common web risks. Read the OWASP Top 10, then the password storage cheat sheet.',
    do: 'In a TypeScript file in your flagship repo, use node:crypto to hash with SHA-256, hash a password with scrypt and a salt, and encrypt and decrypt with AES-256-GCM. Then check your flagship against 3 of the Top 10 (broken access control, injection, security misconfiguration) and fix one finding.',
    explain: 'Out loud, 3 min: when you hash, when you encrypt, and why SHA-256 is wrong for passwords. Deep enough when you can explain broken access control with an example from your own API.' },

  // ---------- Weeks 4–13: depth (slots 19–78) ----------
  // SQL in depth (5)
  { id: 'fe:sql', group: 'sql', url: `${PG}/transaction-iso.html`, url2: 'https://leetcode.com/studyplan/top-sql-50/',
    understand: 'SQL in depth · Joins, transactions and isolation levels: read committed vs repeatable read vs serializable, and the anomalies each one allows. Read the Postgres transaction isolation page.',
    do: 'On your flagship database, open two psql sessions and show a non-repeatable read at READ COMMITTED, then prevent it with REPEATABLE READ. Write a TypeScript script where two concurrent requests decrement the same counter and lose an update. Fix it twice: with SELECT … FOR UPDATE, and with an atomic UPDATE.',
    explain: 'Out loud, 3 min: what a lost update is and which isolation level stops it. Deep enough when you can say which level your flagship uses by default, and one bug that level still allows.' },
  { id: 'fe:use-the-index-luke-1', group: 'sql', url: 'https://use-the-index-luke.com/sql/anatomy',
    understand: 'SQL in depth · Use The Index, Luke 1: the anatomy of an index, the B-tree, and the where clause (equality, ranges, functions on columns). Read the anatomy chapter and the where-clause chapter.',
    do: 'Seed one flagship table with 100,000 rows from a TypeScript script. Run EXPLAIN on 3 of your real queries and predict the plan first. Add an index, run them again, then wrap the column in lower() and watch the index stop being used. Fix it with an expression index.',
    explain: 'Out loud, 2 min: how a B-tree lookup works, and why a function on a column skips the index. Deep enough when you can predict whether a query uses an index before you run EXPLAIN.' },
  { id: 'fe:use-the-index-luke-2', group: 'sql', url: 'https://use-the-index-luke.com/sql/where-clause/the-equals-operator/concatenated-keys',
    understand: 'SQL in depth · Use The Index, Luke 2: multi-column indexes, column order, and sorting and paging with an index. Read the concatenated-keys section, then the sorting and grouping chapter.',
    do: 'Take your flagship\'s main list query (filter by workspace, sort by updated time, page 20 at a time). Design the multi-column index for it and defend the column order. Switch from OFFSET to keyset (cursor) paging and compare EXPLAIN for page 1 and page 500.',
    explain: 'Out loud, 2 min: how you pick the column order of a composite index. Deep enough when you can say why OFFSET gets slower with every page and keyset paging does not.' },
  { id: 'pf:explain-analyze', group: 'sql', url: `${PG}/using-explain.html`,
    understand: 'SQL in depth · Query plans with EXPLAIN ANALYZE: seq scan, index scan, bitmap scan, nested loop vs hash join, estimated vs actual rows. Read the Postgres "Using EXPLAIN" page.',
    do: 'Turn on pg_stat_statements (or your provider\'s query insights) for your flagship and find the 3 slowest queries. Run EXPLAIN (ANALYZE, BUFFERS) on each. Find one where the estimated rows are far from the actual rows, run ANALYZE on the table, and fix the slowest query.',
    explain: 'Out loud, 3 min: walk through one plan from the innermost node out. Deep enough when you can say why the planner picked a seq scan, and when a seq scan is the right choice.' },
  { id: 'fde:sql-analysis', group: 'sql', url: 'https://leetcode.com/studyplan/top-sql-50/', url2: `${PG}/tutorial-window.html`,
    understand: 'SQL in depth · CTEs and window functions for analysis: WITH, ROW_NUMBER, RANK, LAG, running totals, top-N per group. Read the Postgres window functions tutorial, then solve 3 window problems from LeetCode SQL 50.',
    do: 'Write 5 analysis queries over your flagship data: daily active users with a CTE, the top 3 documents per workspace with ROW_NUMBER, a running total of AI calls, week-over-week retention with LAG, and the median answer latency. Save them as a .sql file in the repo.',
    explain: 'Out loud, 2 min: what a window function does that GROUP BY cannot. Deep enough when you can write top-N per group from memory.' },
  // Postgres in practice (1)
  { id: 'pf:postgres-in-practice', url: `${PG}/ddl-rowsecurity.html`, url2: `${PG}/routine-vacuuming.html`,
    understand: 'Postgres in practice · Connection pooling, vacuum and row-level security. Read the Postgres row security page, then skim routine vacuuming.',
    do: 'In your flagship: add a row-level security policy so a user only sees rows of their own workspace, and write a test that tries to read another workspace and fails. Fire 50 concurrent requests and watch the connection count with and without a pooler (PgBouncer or your provider\'s pooled URL). Check dead rows in pg_stat_user_tables after a bulk update.',
    explain: 'Out loud, 3 min: why serverless functions run out of database connections, and what a pooler does about it. Deep enough when you can say what vacuum cleans up, and what row-level security protects that app code cannot.' },
  // NoSQL modeling (1)
  { id: 'fe:nosql', url: 'https://www.mongodb.com/docs/manual/data-modeling/', url2: 'https://www.alexdebrie.com/posts/dynamodb-single-table/',
    understand: 'NoSQL data modeling (MongoDB and DynamoDB), and SQL vs NoSQL: embed vs reference, access patterns first, partition and sort keys, single-table design. Read the MongoDB data-modeling page, then Alex DeBrie on single-table design.',
    do: 'Model your flagship\'s core entities (workspaces, users, documents, messages) for DynamoDB. List the access patterns first, then design the partition and sort keys and one secondary index. Write the 5 main queries as TypeScript key conditions against DynamoDB Local or on paper.',
    explain: 'Out loud, 3 min: when you would move this data out of Postgres, and what you would lose. Deep enough when you can say what a hot partition is and how your key design avoids it.' },
  // Redis (1)
  { id: 'fe:redis', url: 'https://redis.io/docs/latest/develop/',
    understand: 'Redis: data types, caching strategies (cache-aside, write-through), TTL and eviction, and rate limiting. Read the Redis develop docs on data types and keys.',
    do: 'Add Redis to your flagship (Upstash free tier or a local container). Put cache-aside with a TTL in front of one slow read, and log the hit rate. Rate-limit the AI endpoint per user with a token bucket in Redis. Then invalidate the cache on write and test the stale case.',
    explain: 'Out loud, 3 min: what goes wrong when a cache and a database disagree, and how your TTL bounds it. Deep enough when you can say what happens to your app when Redis is down.' },
  // Queues and background jobs (2)
  { id: 'fe:queues', group: 'queues', url: 'https://kafka.apache.org/intro',
    understand: 'Queues and streams: Kafka vs SQS-style queues, at-least-once vs exactly-once delivery, retries, dead-letter queues and idempotent consumers. Read the Kafka introduction.',
    do: 'In a TypeScript file in your flagship repo, write an in-memory queue with visibility timeouts. Make the consumer crash halfway through a job and show the job runs twice. Make the consumer idempotent with a processed-ids table, and send a job that always fails to a dead-letter list after 3 tries.',
    explain: 'Out loud, 3 min: why "exactly once" is really at-least-once plus idempotency. Deep enough when you can say when you would pick a log like Kafka over a queue.' },
  { id: 'pf:background-job', group: 'queues', url: 'https://docs.bullmq.io/', url2: 'https://www.inngest.com/docs/patterns/jobs/keeping-your-api-fast',
    understand: 'Queues · One background job in the flagship: move slow work off the request path, with retries, backoff and status. Read the BullMQ guide (or Inngest if your host is serverless).',
    do: 'In your flagship, move one slow task off the request path (embedding a document on save, or an export) into a background job with BullMQ and Redis, or Inngest. Add retries with backoff, a dead-letter path, and a job status the UI polls. Kill the worker mid-job and check the job finishes after a restart.',
    explain: 'Out loud, 2 min: what the user sees while the job runs and when it fails. Deep enough when you can say what makes your job safe to run twice.' },
  // The Node runtime (1)
  { id: 'fe:node-runtime', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick', url2: 'https://nodejs.org/api/worker_threads.html',
    understand: 'The Node runtime: event-loop phases, streams, worker threads and cluster. Read the Node.js event-loop guide.',
    do: 'In your flagship server, block the event loop with a sync loop and measure the lag with perf_hooks.monitorEventLoopDelay while other requests wait. Stream a large export to the client instead of building it in memory, and compare peak memory. Move one CPU-heavy step into a worker thread.',
    explain: 'Out loud, 3 min: what one slow synchronous function does to every other request on the server. Deep enough when you can say when to use a stream, a worker thread, or another process.' },
  // Docker (2)
  { id: 'aib:containers', group: 'docker', url: 'https://docs.docker.com/get-started/', url2: 'https://docs.docker.com/build/building/multi-stage/',
    understand: 'Docker, part 1: images, layers, containers, the build cache and multi-stage builds. Read Docker\'s get-started guide, then the multi-stage builds page.',
    do: 'Write a multi-stage Dockerfile for your flagship: install, build, then copy only the output into a slim runtime image that runs as a non-root user. Add a .dockerignore. Compare the image size before and after, and change one source file to see which layers rebuild.',
    explain: 'Out loud, 2 min: what a layer is and why the order of your COPY lines matters. Deep enough when you can say how a container differs from a VM, and why your image runs as non-root.' },
  { id: 'pf:docker-compose', group: 'docker', url: 'https://docs.docker.com/compose/gettingstarted/',
    understand: 'Docker, part 2: Docker Compose for a local stack, with networks, volumes, health checks and start order. Read the Compose getting-started guide.',
    do: 'Write a compose file for your flagship: the app, Postgres and Redis, with volumes, health checks, and the app waiting for a healthy database. Run migrations on start. Get a fresh clone running with one command, and delete the Postgres volume to see what you lose.',
    explain: 'Out loud, 2 min: how containers in one compose file find each other. Deep enough when you can say why depends_on alone does not wait for the database to be ready.' },
  // Kubernetes on kind (3)
  { id: 'pf:k8s-deployments', group: 'kubernetes', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', url2: 'https://kind.sigs.k8s.io/docs/user/quick-start/',
    understand: 'Kubernetes on kind, part 1: pods, deployments, replica sets, and readiness and liveness probes. Read the Kubernetes basics tutorial, then the kind quick start.',
    do: 'Create a local cluster with kind, load your flagship image with kind load docker-image, and run it as a Deployment with 2 replicas, readiness and liveness probes. Delete a pod and watch it come back. Break the readiness probe and see the pod drop out of service.',
    explain: 'Out loud, 2 min: what the deployment controller does when a pod dies. Deep enough when you can say the difference between a failed readiness probe and a failed liveness probe.' },
  { id: 'pf:k8s-services', group: 'kubernetes', url: 'https://kubernetes.io/docs/concepts/services-networking/service/',
    understand: 'Kubernetes on kind, part 2: services, ingress, ConfigMaps and Secrets, and rolling updates. Read the Kubernetes Service concept page.',
    do: 'On your kind cluster, put a Service in front of your flagship Deployment and reach it through port-forward or an ingress. Move its config into a ConfigMap and its secrets into a Secret. Roll out a new image tag, watch the rolling update, then roll back with kubectl rollout undo.',
    explain: 'Out loud, 2 min: how a request finds a healthy pod. Deep enough when you can say why a Kubernetes Secret is not encrypted by default, and what you would use instead.' },
  { id: 'pf:k8s-scaling', group: 'kubernetes', url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/', url2: 'https://github.com/mcollina/autocannon',
    understand: 'Kubernetes on kind, part 3: resource requests and limits, the horizontal pod autoscaler, and what OOMKilled means. Read the HPA walkthrough.',
    do: 'On your kind cluster, set CPU and memory requests and limits on your flagship, install metrics-server and add an HPA. Load it with npx autocannon and watch it scale out and back in. Set the memory limit too low and read the OOMKilled event.',
    explain: 'Out loud, 2 min: the difference between a request and a limit, and what each one decides. Deep enough when you can say why autoscaling on CPU can be wrong for an app that waits on an LLM API.' },
  // Terraform (2)
  { id: 'aib:terraform', group: 'terraform', url: 'https://developer.hashicorp.com/terraform/tutorials/docker-get-started', url2: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started',
    understand: 'Terraform, part 1: providers, resources, plan, apply and destroy, and the state file. Read the Terraform Docker get-started tutorial (no cloud bill); the AWS version is the second link, for the AWS slots.',
    do: 'With the Terraform Docker provider, describe your flagship\'s local stack (the app image and a Postgres container) as code. Run plan, apply, change one value and plan again, then destroy. Open the state file and find your resources in it.',
    explain: 'Out loud, 2 min: what terraform plan compares to decide what to change. Deep enough when you can say why the state file matters and what goes wrong if two people apply at once.' },
  { id: 'pf:terraform-state-modules', group: 'terraform', url: 'https://developer.hashicorp.com/terraform/language/state', url2: 'https://developer.hashicorp.com/terraform/language/modules',
    understand: 'Terraform, part 2: remote state and locking, modules, variables and outputs, drift, and plan in CI. Read the Terraform state docs, then the modules overview.',
    do: 'Refactor your flagship\'s Terraform into a module with variables and outputs. Move the state to a remote backend with locking (HCP Terraform\'s free tier). Add a CI job that posts terraform plan on every PR. Change a resource by hand and watch the next plan catch the drift.',
    explain: 'Out loud, 2 min: how a module is like a function, and what remote state and locking prevent. Deep enough when you can say what you do when someone changed production by hand.' },
  // CI/CD and safe rollouts (3)
  { id: 'aib:devops', group: 'cicd', url: 'https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments', url2: 'https://roadmap.sh/devops',
    understand: 'CI/CD, part 1: build once and promote the same artifact, deployment environments, approvals and secrets per environment. Read the GitHub docs on deployment environments.',
    do: 'Extend your flagship\'s CI: build the Docker image once, tag it with the commit SHA and push it to GitHub Container Registry. Deploy that same image to staging on every merge, and to production after a manual approval. Add a rollback job that redeploys the previous SHA.',
    explain: 'Out loud, 2 min: why you deploy the same image to staging and prod instead of rebuilding. Deep enough when you can roll back production in under 5 minutes and say how you know it worked.' },
  { id: 'pf:canary', group: 'cicd', url: 'https://martinfowler.com/bliki/CanaryRelease.html', url2: 'https://sre.google/workbook/canarying-releases/',
    understand: 'CI/CD, part 2: canary releases: send a small share of traffic to the new version, compare it with the old one, then promote or abort. Read Martin Fowler on canary releases, then the SRE workbook chapter on canarying.',
    do: 'On your kind cluster, run v1 and v2 of your flagship behind one Service with 9 v1 replicas and 1 v2 replica. Make v2 return 5% errors. Send load, compare the error rates per version from your logs or metrics, and write the abort rule you would automate.',
    explain: 'Out loud, 2 min: how big the canary must be and how long it must run to catch a 1% error rate. Deep enough when you can name a bug a canary will not catch.' },
  { id: 'pf:blue-green', group: 'cicd', url: 'https://martinfowler.com/bliki/BlueGreenDeployment.html',
    understand: 'CI/CD, part 3: blue-green deploys and database changes that both versions can live with (expand, migrate, contract). Read Martin Fowler on blue-green deployment.',
    do: 'On your kind cluster, run blue and green Deployments of your flagship and switch the Service selector from one to the other, then back. Add a new column with expand and contract: add it as nullable, write both, backfill, then drop the old one in a later release. Check blue still works at each step.',
    explain: 'Out loud, 2 min: why the database is the hard part of a rollback. Deep enough when you can say when you would pick blue-green over a canary.' },
  // Observability with OpenTelemetry (2)
  { id: 'fe:docker-ci', group: 'otel', url: 'https://opentelemetry.io/docs/languages/js/getting-started/nodejs/', url2: 'https://www.jaegertracing.io/docs/latest/getting-started/',
    understand: 'Observability with OpenTelemetry, part 1: traces and spans, context propagation, and auto-instrumentation. Read the OpenTelemetry Node.js getting-started guide.',
    do: 'Add the OpenTelemetry SDK to your flagship with auto-instrumentation for HTTP and Postgres, and export to Jaeger running in Docker. Add one manual span around the LLM call with the model and token counts as attributes. Open the trace of one slow request and find the slowest span.',
    explain: 'Out loud, 2 min: how a trace id follows a request across services. Deep enough when you can find why one request was slow from its trace alone.' },
  { id: 'pf:otel-metrics', group: 'otel', url: 'https://opentelemetry.io/docs/concepts/signals/',
    understand: 'Observability with OpenTelemetry, part 2: metrics (counters, histograms), logs linked to traces, and a first dashboard. Read the OpenTelemetry signals page.',
    do: 'In your flagship, add OpenTelemetry metrics: request count, a latency histogram and LLM tokens per request. Put the trace id on every log line. Run Grafana and Prometheus in Docker and build one dashboard with p50 and p95 latency, error rate and tokens per minute.',
    explain: 'Out loud, 2 min: why you use a histogram, not an average, for latency. Deep enough when you can go from a spike on the dashboard to the trace and the log lines behind it.' },
  // SLOs and incident response (2)
  { id: 'pf:slos', group: 'slo', url: 'https://sre.google/workbook/implementing-slos/',
    understand: 'SLOs: SLIs, SLOs and error budgets, and burn-rate alerts. Read the SRE workbook chapter on implementing SLOs.',
    do: 'Write 2 SLOs for your flagship: availability of the main API and p95 latency of the AI answer endpoint. Compute the SLIs from your metrics, work out the monthly error budget, and add a burn-rate alert. Write what the team stops doing when the budget runs out.',
    explain: 'Out loud, 2 min: why 100% is the wrong target. Deep enough when you can say how many minutes of downtime a 99.9% monthly SLO allows, and what a fast burn means.' },
  { id: 'jt:depth-sre-troubleshooting', group: 'slo', url: 'https://sre.google/sre-book/effective-troubleshooting/', url2: 'https://sre.google/sre-book/managing-incidents/',
    understand: 'Incident response: the observe, hypothesise, test loop, its common pitfalls, and running an incident. Read the SRE book chapter 12, "Effective Troubleshooting", then the chapter on managing incidents.',
    do: 'Run a game day on your flagship\'s staging: ask a friend or an AI to break one thing you do not know about (a bad env var, a dropped index, a blocked port). Fix it with the loop, using only your logs, traces and dashboards, and keep a timeline. Write a blameless postmortem with 2 action items.',
    explain: 'Out loud, 3 min: the troubleshooting loop and two pitfalls you hit. Deep enough when you can say how you told the cause apart from a symptom, and what you would alert on next time.' },
  // AWS core (3)
  { id: 'aib:aws', group: 'aws', url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html', url2: 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/scaling_aws/README.md',
    understand: 'AWS core, part 1: accounts, IAM users, roles and policies, least privilege, and the free tier. Read the IAM best-practices page, then the System Design Primer\'s "Scaling AWS to millions of users".',
    do: 'Open an AWS free tier account. Before anything else, set MFA on the root user and a budget alarm at 1 dollar. Create an admin role you sign in to through IAM Identity Center, set up the AWS CLI with a profile, and write a least-privilege policy that lets your flagship read one S3 bucket and nothing else. Test it with the policy simulator.',
    explain: 'Out loud, 3 min: the difference between a user, a role and a policy. Deep enough when you can say why long-lived access keys in code are the classic AWS breach, and what your flagship uses instead.' },
  { id: 'pf:aws-vpc-compute', group: 'aws', url: 'https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html',
    understand: 'AWS core, part 2: VPCs, public and private subnets, security groups, and compute choices (EC2, ECS on Fargate, Lambda). Read the VPC "How it works" page.',
    do: 'With Terraform, on the free tier with your budget alarm on: build a VPC with one public and one private subnet, a security group that only allows HTTPS in, and one free-tier EC2 instance that runs your flagship container. Reach it, read its logs, then terraform destroy and check the bill stays at zero.',
    explain: 'Out loud, 2 min: why the database goes in a private subnet. Deep enough when you can pick between EC2, Fargate and Lambda for your flagship and defend it on cost and cold starts.' },
  { id: 'pf:aws-storage-lambda', group: 'aws', url: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html', url2: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html',
    understand: 'AWS core, part 3: S3, presigned URLs, and Lambda with event triggers. Read the Lambda Node.js guide, then the S3 presigned URL page.',
    do: 'With Terraform, on the free tier: a private S3 bucket for your flagship\'s file uploads, presigned upload URLs from your API, and a TypeScript Lambda that runs on each upload and writes the file\'s size and type to your database or logs. Upload a file from the app, check the Lambda ran, then destroy everything.',
    explain: 'Out loud, 2 min: why the browser uploads straight to S3 with a presigned URL. Deep enough when you can say what a Lambda cold start costs you and how you would cut it.' },
  // FinOps (1)
  { id: 'pf:finops', url: 'https://www.finops.org/introduction/what-is-finops/', url2: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html',
    understand: 'FinOps: cost per request, rightsizing, tagging and budgets. Read the FinOps Foundation\'s "What is FinOps".',
    do: 'Tag every Terraform resource of your flagship with project, environment and owner. Work out cost per request: hosting, database and LLM tokens for one day, divided by that day\'s requests. Find the biggest line and cut it (a smaller instance, a cheaper model for easy calls, or a cache). Write the before and after in cost.md.',
    explain: 'Out loud, 2 min: your cost per request and what drives it. Deep enough when you can say what your flagship would cost at 100 times today\'s traffic, and the first thing you would change.' },
  // Data engineering (3)
  { id: 'fde:data-pipelines', group: 'data', url: 'https://roadmap.sh/data-engineer', url2: 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html',
    understand: 'Data engineering, part 1: ETL vs ELT, batch vs streaming, idempotent jobs, data-quality checks, and orchestration with Airflow or Dagster (a graph of tasks with retries and schedules; concepts only). Read the roadmap.sh data engineer path, then the Airflow core concepts.',
    do: 'Write a nightly TypeScript job that copies the flagship\'s events from Postgres to an analytics table, one date partition at a time. Make it idempotent: run the same day twice and get the same rows. Add 3 data-quality checks (row count, no null user ids, no future timestamps) that fail the job. Schedule it with a GitHub Actions cron.',
    explain: 'Out loud, 3 min: ETL vs ELT, and why your job is safe to re-run. Deep enough when you can say what an orchestrator gives you over a cron job.' },
  { id: 'fde:data-warehouses', group: 'data', url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/star-schema-olap-cube/', url2: 'https://duckdb.org/docs/stable/clients/node_neo/overview',
    understand: 'Data engineering, part 2: warehouses (BigQuery, Snowflake), columnar storage, and star schemas with fact and dimension tables. Read the Kimball Group page on star schemas.',
    do: 'Load your flagship\'s events into DuckDB from TypeScript (@duckdb/node-api). Build a star schema: a fact table of AI questions, and dimensions for user, workspace and date. Answer 3 product questions with it, and time one against the same query on Postgres.',
    explain: 'Out loud, 2 min: why a warehouse stores data by column. Deep enough when you can say what goes in a fact table and what goes in a dimension, with your own tables.' },
  { id: 'fde:data-audit-modeling', group: 'data', url: 'https://www.getdbt.com/blog/data-quality-dimensions', url2: 'https://github.com/lerocha/chinook-database',
    understand: 'Data engineering, part 3: auditing and modeling messy data: completeness, uniqueness, validity, consistency, and fixing the schema. Read dbt on data-quality dimensions.',
    do: 'Write a TypeScript audit script and run it on your flagship database and on a messy sample (the Chinook database with some rows broken on purpose). Report nulls, duplicates, orphaned foreign keys, mixed formats and out-of-range values. Draw the fixed data model and list the constraints you would add.',
    explain: 'Out loud, 3 min: the 3 worst problems you found and how each one would mislead a dashboard. Deep enough when you can audit a customer\'s database you have never seen in your first hour.' },
  // FDE integration (3)
  { id: 'pf:customer-apis-webhooks', group: 'integration', url: 'https://docs.stripe.com/webhooks',
    understand: 'FDE integration, part 1: customer-facing APIs and webhooks: API keys, versioning, signed webhooks, retries and delivery logs. Read Stripe\'s webhook docs as the model to copy.',
    do: 'Give your flagship a small public API with per-workspace API keys (stored hashed), and outgoing webhooks: sign each payload with HMAC, retry with backoff, and keep a delivery log the customer can see. Write a tiny receiver that verifies the signature, and replay a failed delivery.',
    explain: 'Out loud, 2 min: how a customer proves a webhook came from you. Deep enough when you can say what your API promises when you ship version 2.' },
  { id: 'fde:integration-engineering', group: 'integration', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer',
    understand: 'FDE integration, part 2: legacy systems: SOAP and XML, nightly batch files over SFTP, old auth, and an anti-corruption layer between them and your code. Read the anti-corruption layer pattern.',
    do: 'Fake a legacy system for your flagship: a SOAP-style XML endpoint and a nightly CSV file drop. Wrap both in a clean TypeScript adapter that exposes typed REST endpoints, maps their fields to your model, and retries the flaky one. Test it with recorded fixtures.',
    explain: 'Out loud, 3 min: why the legacy model must not leak into your own code. Deep enough when you can say how you would test against a customer system you cannot call from CI.' },
  { id: 'pf:privacy-residency', group: 'integration', url: 'https://gdpr.eu/what-is-gdpr/',
    understand: 'FDE integration, part 3: data privacy and residency: personal data, lawful basis, export and deletion rights, data processors, and keeping data in one region. Read the GDPR overview.',
    do: 'Make a data map of your flagship: every place personal data lives (database, logs, backups, the LLM provider, analytics). Add an export-my-data and a delete-my-data endpoint, and redact emails and phone numbers before text goes to the LLM. Write what an EU customer would ask about where their data is stored.',
    explain: 'Out loud, 2 min: what "delete my data" means for your backups and logs. Deep enough when you can answer a customer\'s security questionnaire about where their data goes.' },
  // Code-review reps (4)
  codeReview(1, 'PostHog', 'PostHog/posthog'),
  codeReview(2, 'Excalidraw', 'excalidraw/excalidraw'),
  codeReview(3, 'Cal.com', 'calcom/cal.diy'),
  codeReview(4, 'PostHog', 'PostHog/posthog'),
  // Re-engineering round (2 slots)
  { id: 'fde:reengineering-round', parts: 2, url: 'https://github.com/topics/good-first-issue',
    understand: 'Re-engineering round (60 min over 2 sessions): clone an unfamiliar TypeScript repo, find a real bug and fix it. Session 1: pick an open bug, get the repo running, reproduce it. Session 2: find the cause, fix it with a test, and open a PR or write the fix up.',
    do: 'Session 1 without an AI coding tool, session 2 with one. Log how long each step took (setup, reproduce, find, fix) and where the tool helped or misled you.',
    explain: 'Out loud, 3 min, at the end of each session: how you found your way around code you had never seen, and what you know about the bug so far. Deep enough when you can say how you proved the root cause before you wrote the fix.' },
  // Learning round (2 slots)
  { id: 'fde:learning-round', parts: 2, url: 'https://github.com/public-apis/public-apis',
    understand: 'Learning round (60 min over 2 sessions): learn an API you have never used, then build with it. Session 1: pick one from the public-apis list, read its docs for 30 minutes and make your first calls. Session 2: build a small working TypeScript integration with error handling.',
    do: 'Keep notes as you go: what you read first, what you skipped, and the first wrong guess you made. If it fits, wire the integration into your flagship.',
    explain: 'Out loud, 3 min, at the end of each session, as if to an interviewer: what the API does and how you are learning it. Deep enough when you can explain its auth, limits and one gotcha after one hour.' },
  // Disaster recovery, nginx, network debugging, gRPC, multi-tenancy (1 each)
  { id: 'pf:dr-drill', url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html',
    understand: 'A disaster-recovery drill: RTO and RPO, backup and restore vs pilot light vs warm standby vs active-active. Read the AWS whitepaper on disaster-recovery options.',
    do: 'Set an RTO and RPO for your flagship. Then lose the primary on purpose: drop the staging database (or delete its volume). Restore from your latest backup or point-in-time recovery, fail the app over to it, and time every step. Compare the result with your targets and fix the slowest step.',
    explain: 'Out loud, 2 min: your RTO and RPO, what you actually got, and the gap. Deep enough when you can say which DR strategy your flagship needs and what it costs per month.' },
  { id: 'pf:nginx', url: 'https://nginx.org/en/docs/beginners_guide.html',
    understand: 'nginx and reverse proxies: proxying, TLS termination, gzip, caching static files, rate limits, and streaming responses. Read the nginx beginner\'s guide.',
    do: 'Put nginx in front of your flagship in Docker Compose: proxy to the app, gzip, cache static assets with long expiry, and rate-limit the AI endpoint. Make the streamed AI answer work through the proxy (turn off proxy buffering for it) and check tokens still arrive one by one.',
    explain: 'Out loud, 2 min: what a reverse proxy does that your app server should not. Deep enough when you can say why a streamed response arrived all at once behind a proxy, and how you fixed it.' },
  { id: 'pf:network-debugging', url: 'https://everything.curl.dev/', url2: 'https://jvns.ca/blog/2016/03/16/tcpdump-is-amazing/',
    understand: 'Network debugging: curl with timings, dig, and tcpdump. Read the curl book\'s sections on verbose output and timing, then Julia Evans on tcpdump.',
    do: 'Debug your flagship over the network: time DNS, connect, TLS and first byte with curl -w, check its records with dig, and capture one local request to nginx with tcpdump (or Wireshark). Then break 3 things on purpose (a wrong Host header, an expired cert, a bad DNS record) and find each one with these tools.',
    explain: 'Out loud, 2 min: which tool you reach for first when "the site is slow". Deep enough when you can tell from curl\'s timings alone whether DNS, TLS or the server is the slow part.' },
  { id: 'pf:grpc', url: 'https://grpc.io/docs/languages/node/quickstart/', url2: 'https://protobuf.dev/programming-guides/proto3/',
    understand: 'gRPC and protobuf hands-on: .proto files, generated types, unary and streaming calls, and deadlines. Read the gRPC Node quick start, then the proto3 guide.',
    do: 'Split one internal piece of your flagship (for example the embedding step) into a gRPC service. Write the .proto, generate TypeScript types, and call it with a unary call and a server-streaming call, each with a deadline. Compare the payload size with the same data as JSON.',
    explain: 'Out loud, 2 min: what protobuf gives you over JSON, and what it costs. Deep enough when you can say when you would pick gRPC over REST, and why browsers need a proxy for it.' },
  { id: 'pf:multi-tenancy', url: 'https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/tenant-isolation.html', url2: 'https://stripe.com/blog/rate-limiters',
    understand: 'Multi-tenancy and per-tenant limits: pooled vs siloed tenants, tenant isolation, noisy neighbours, and rate limits per tenant. Read the AWS SaaS tenant-isolation page, then Stripe on rate limiters.',
    do: 'In your flagship, make the workspace the tenant everywhere: a tenant id on every row and query, row-level security per tenant, a per-tenant rate limit in Redis and a per-tenant monthly LLM budget. Write a test where one tenant floods the API and check the others are not slowed down.',
    explain: 'Out loud, 3 min: how you stop one big customer from hurting the rest. Deep enough when you can say when a customer should get their own database, and what that costs you.' },

  // The 12 practical coding reps, in v2 order (platformTrack places them at slots 23 + 5k).
  ...Object.values(PRACTICAL),
];
