/* eslint-disable */
// Systems and architecture track (roadmap v3 §3, `sd`, 1.5 h): 78 rows, one per slot, in slot order.
// Weeks 1–2 (slots 1–12): how computers work, networking and APIs, HLD fundamentals, then Bitly. Weeks 3–9 (13–54):
// one HLD design, then one depth item (DDIA, a later fundamental, software design, a case study or a building block).
// Weeks 10–13 (55–78): one 45-min mock, then one depth item.
// Row format: the plan's "Content row format" (tracks.ts expandRow). A v2 id keeps its v2 url; `covers` lists the v2 ids
// a row absorbs. Secondary links (`url2`) follow the sourcing rule: the System Design Primer where it has a solution.
// New URLs checked 2026-11-15 (curl; github.com rate-limited, checked with gh api).

const PRIMER = 'https://github.com/donnemartin/system-design-primer';
const primerSolution = (name) => `${PRIMER}/blob/master/solutions/system_design/${name}/README.md`;
const hi = (path) => `https://www.hellointerview.com/learn/system-design/${path}`;
const FRAMEWORK = hi('in-a-hurry/delivery');
const DDIA = 'https://dataintensive.net/';

/** HLD design, learn: read the problem, draw it yourself, then compare. */
const hld = (slug, name, focus, deep, url, url2) => ({
  id: `sd:hld-${slug}`, url, ...(url2 ? { url2 } : {}),
  understand: `HLD · Design ${name}. Read only the problem and the requirements in the linked breakdown. Stop before the design.`,
  do: `Draw it yourself in Excalidraw, 45 min: requirements, core entities, API, high-level design, then 2 deep dives (${focus}).`,
  explain: `Now read the full breakdown${url2 ? ' and the System Design Primer solution' : ''} and compare ${url2 ? 'both' : 'it'} with your drawing. Name 3 trade-offs you would defend, out loud, 3 min. Deep enough when you can ${deep}.`,
});

/** HLD design, timed mock with a self-review against the delivery framework. */
const mock = (id, name, url, { covers, second, compare = 'the linked breakdown' } = {}) => ({
  id, kind: 'mock', mins: 45, url, url2: FRAMEWORK, ...(covers ? { covers } : {}),
  text: `${second ? 'Second-pass mock' : 'Mock'}, 45 min, timed, out loud: design ${name}.${second ? ' You drew it once before; start from a blank page.' : ''} Then self-review against the HLD delivery framework (requirements, entities, API, data flow, high-level design, deep dives): what did you skip, and where did the time go? Then compare with ${compare}.`,
});

/** How real systems work: a company write-up (v2 jt:hiw-* id and url). */
const CASE_DO = 'Close the post and redraw the system from memory in Excalidraw, 30 min. Then check it against the post and fix what you got wrong.';
const caseStudy = (id, title, url, explain) => ({ id, url, understand: `How real systems work · ${title} Read the post.`, do: CASE_DO, explain });

export const SYSTEMS = [
  // ---------- Weeks 1–2 (slots 1–12) ----------
  // 1
  { id: 'sd:numbers-card', url: hi('core-concepts/numbers-to-know'), url2: `${PRIMER}#latency-numbers-every-programmer-should-know`,
    understand: 'How computers work · Numbers to know: CPU caches, memory, SSD and network round trips; the requests per second a server, a database and a cache can take; the size of a row, an image and a video minute. Read the page, then the primer latency and powers-of-two tables.',
    do: 'In a TS scratch file, time 1 million Map reads, one 100 MB file read and 20 fetches to a nearby host. Put your numbers on a one-page card next to the table figures. Keep the card beside every estimate.',
    explain: 'Out loud, 3 min: why memory is far faster than SSD and the network slower again, and what that means for where a cache goes. Deep enough when you can estimate, without notes, how long it takes to read 1 GB from memory, from SSD and across a data centre.' },
  // 2
  { id: 'sd:os', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    understand: 'How computers work · The operating system: processes vs threads, CPU scheduling, virtual memory and paging, file systems and I/O. Read the OSTEP chapters on processes, address spaces and files (skim the rest).',
    do: 'In a TS scratch file, run a CPU-heavy loop on the main thread, then in a worker thread, then in a child process. Time each one and watch memory in top. Note what is shared and what is copied.',
    explain: 'Out loud, 3 min: what the OS does when programs ask for more memory than the machine has, and why a thread is cheaper to start than a process. Deep enough when you can say why a Node server runs one process per core, and what a page fault costs.' },
  // 3
  { id: 'sd:concurrency', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf', url2: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
    understand: 'How computers work · Concurrency: race conditions, locks and deadlock, async I/O vs threads, and the event loop. Read the OSTEP chapter on threads, then the Node.js event loop guide.',
    do: 'In a TS scratch file, two async functions read a shared balance, await a timer, then write it back. Run them together and show the lost update. Fix it with a small promise-based mutex, and add a test.',
    explain: 'Out loud, 3 min: why the lost update happens even on one thread, and what a deadlock needs. Deep enough when you can say when async I/O beats threads and when it does not (CPU-bound work).' },
  // 4
  { id: 'sd:internet', covers: ['fe:os-networking'], url: 'https://github.com/alex/what-happens-when', url2: hi('core-concepts/networking-essentials'),
    understand: 'Networking · How the internet works: IP, TCP vs UDP, DNS resolution, HTTP/1.1 to 2 to 3, TLS, CDNs. Read "what happens when you type a URL", then the Hello Interview networking essentials.',
    do: 'In a TS scratch file, resolve a domain with node:dns, open a TCP socket with node:net and send a raw HTTP/1.1 GET. Print each step with its time: DNS, connect, first byte.',
    explain: 'Out loud, 5 min: what happens when you type a URL, from the key press to the first paint. Deep enough when you can say why HTTP/3 runs on UDP, and what TLS 1.3 saves over 1.2.' },
  // 5
  { id: 'sd:fundamentals', covers: ['sd:capacity-estimation'], url: PRIMER, url2: hi('in-a-hurry/introduction'),
    understand: 'HLD fundamentals · Scalability, latency vs throughput, availability vs consistency, and back-of-envelope capacity estimation. Read the System Design Primer sections on performance vs scalability, latency vs throughput, and availability.',
    do: 'In a TS scratch file, write estimate(dailyUsers, actionsPerUser, bytesPerAction). Return average and peak QPS, storage per year and bandwidth. Run it for a URL shortener and a chat app, and check the results against your numbers card.',
    explain: 'Out loud, 3 min: estimate the QPS and 5-year storage of a service with 100 million daily users. Deep enough when you can say which number drives the design (reads, writes or storage) and why.' },
  // 6
  { id: 'sd:cap-pacelc', url: `${PRIMER}#cap-theorem`, url2: hi('core-concepts/cap-theorem'),
    understand: 'HLD fundamentals · CAP and PACELC, and SLOs, SLAs and SLIs with latency budgets. Read the primer CAP section, then the Hello Interview CAP page.',
    do: 'In a TS scratch file, write an SLO calculator: given a target (say 99.9%) and a period, print the error budget in minutes. Then split a 300 ms p99 budget across a gateway, a service, a cache and a database.',
    explain: 'Out loud, 3 min: which consistency you would pick for a shopping cart and for a bank balance, and what each choice costs. Deep enough when you can say what PACELC adds to CAP when there is no partition.' },
  // 7
  { id: 'sd:communication', covers: ['fe:api-design'], url: `${PRIMER}#communication`, url2: hi('core-concepts/api-design'),
    understand: 'Networking · Communication and API design: REST vs gRPC vs GraphQL, gateways and proxies, pagination, versioning, errors and idempotency keys. Read the primer communication section, then the Hello Interview API design page.',
    do: 'In a TS scratch file, design the API for a todo app: typed requests and responses, cursor pagination, one error shape and an Idempotency-Key header on POST. Write an in-memory list handler and test that paging stays correct while items are added.',
    explain: 'Out loud, 3 min: how you make a retried POST safe, and how you paginate a list that changes while someone pages through it. Deep enough when you can say when you would pick gRPC over REST, and what GraphQL costs on the server.' },
  // 8
  { id: 'sd:caching', url: `${PRIMER}#cache`, url2: hi('core-concepts/caching'),
    understand: 'HLD fundamentals · Caching (cache-aside, write-through, write-back, TTL and LRU), CDNs and load balancing. Read the primer cache section, then the Hello Interview caching page.',
    do: 'In a TS scratch file, build an LRU cache with a TTL (a Map keeps insertion order). Put a cache-aside wrapper around a slow fake database and log hits, misses and stale reads.',
    explain: 'Out loud, 3 min: how cache-aside and write-through each serve stale data, and which one you would ship for a product page. Deep enough when you can explain a cache stampede and two ways to stop it.' },
  // 9
  { id: 'sd:messaging', url: hi('deep-dives/kafka'), url2: `${PRIMER}#asynchronism`,
    understand: 'HLD fundamentals · Messaging: queues vs streams, pub-sub, event-driven design, backpressure. Read the Hello Interview Kafka deep dive, then the primer section on asynchronism.',
    do: 'In a TS scratch file, build an in-memory queue with at-least-once delivery: a message goes back on the queue if it is not acked within 2 seconds. Crash the consumer halfway once, and make the handler idempotent so the retry is safe.',
    explain: 'Out loud, 3 min: what happens when a consumer crashes halfway through a message, and how at-least-once delivery shapes your handler. Deep enough when you can say when you would pick Kafka over a simple queue, and what a partition key decides.' },
  // 10
  { id: 'sd:delivery-framework', url: FRAMEWORK, url2: 'https://www.techinterviewhandbook.org/system-design/',
    understand: 'HLD · The delivery framework: requirements, core entities, API, data flow, high-level design, deep dives. Read it with its time split for a 45-minute round and its list of common mistakes.',
    do: 'In Excalidraw, 30 min: run the framework on "design a pastebin". Set a timer for each step and write down where you went over.',
    explain: 'Out loud, 3 min: the six steps, what you say in each, and the minutes you give it. Deep enough when you can name the three most common mistakes and how you avoid each one in a round.' },
  // 11
  { id: 'sd:concepts-to-master', url: PRIMER, url2: hi('patterns/scaling-reads'),
    understand: 'HLD · Concepts to master: multi-layer caching, read-heavy vs write-heavy design, hot keys, p99 tail latency, rate-limit strategies, storage tiering, cost-aware design. Look each one up in the primer index, then read the Hello Interview "scaling reads" pattern.',
    do: 'In a TS scratch file, simulate 10,000 requests where 1% of keys get half the traffic. Count the load on each of 4 database shards, then add a small local cache in front and count again.',
    explain: 'Out loud, 3 min: how you would handle a hot key on a celebrity profile, and why p99 matters more than the average. Deep enough when you can name one way to scale reads and one to scale writes, and say when each fits.' },
  // 12
  hld('bitly', 'Bit.ly (a URL shortener)', 'short code generation, redirect latency',
    'explain how two long URLs never get the same short code, and why redirects are served from a cache',
    hi('problem-breakdowns/bitly'), primerSolution('pastebin')),

  // ---------- Weeks 3–9 (slots 13–54): HLD design, then a depth item ----------
  // 13
  hld('rate-limiter', 'a rate limiter', 'token bucket vs sliding window, the shared counter store',
    'explain how 2 servers share one limit without a race, and what happens when the counter store is down',
    hi('problem-breakdowns/distributed-rate-limiter')),
  // 14
  { id: 'sd:ddia-2a', covers: ['ai:depth-ddia-data-models'], url: DDIA, url2: hi('core-concepts/data-modeling'),
    understand: 'Designing Data-Intensive Applications, ch. 2 part 1: the relational and document models, and when each one fits. Read the first half of the chapter, up to query languages.',
    do: 'In a TS scratch file, model a resume (user, jobs, schools) twice: as normalised tables (arrays of rows with foreign keys) and as one nested document. Write "get the full resume" and "find everyone who worked at X" for both and compare the code.',
    explain: 'Out loud, 3 min: when you would pick a document store over Postgres, and what it costs. Deep enough when you can explain schema-on-read vs schema-on-write, and why many-to-many data pulls you back to relational.' },
  // 15
  hld('dropbox', 'Dropbox or Google Drive', 'chunked upload, sync across devices',
    'explain how an edit on a laptop reaches a phone, and what happens when both edit the same file offline',
    hi('problem-breakdowns/dropbox')),
  // 16
  { id: 'sd:ddia-2b', url: DDIA, url2: 'https://www.postgresql.org/docs/current/datatype-json.html',
    understand: 'Designing Data-Intensive Applications, ch. 2 part 2: query languages (declarative vs imperative, MapReduce) and graph models. Read the second half of the chapter.',
    do: 'In a TS scratch file, store a small social graph as an edge list and answer "friends of friends who live in London" with a breadth-first search. Then write the same question in your notes as one SQL query with a recursive CTE.',
    explain: 'Out loud, 3 min: why a declarative query lets the database optimise and imperative code does not. Deep enough when you can say which model (relational, document or graph) you would use for a social network, a CMS and an order system, and why.' },
  // 17
  hld('whatsapp', 'WhatsApp', 'message delivery and receipts, offline users',
    'explain how delivery and read receipts stay correct when a phone goes offline mid-send and reconnects on another network',
    hi('problem-breakdowns/whatsapp')),
  // 18
  { id: 'sd:idempotency-saga', url: 'https://microservices.io/patterns/data/saga.html', url2: 'https://microservices.io/patterns/data/cqrs.html',
    understand: 'Later fundamentals · Idempotency, the saga pattern (choreography vs orchestration) and CQRS. Read the saga page, then the CQRS page.',
    do: 'In a TS scratch file, write an orchestrated saga for an order: reserve stock, charge the card, book delivery. Make each step and its compensation idempotent. Fail the delivery step and show the saga undoing the first two.',
    explain: 'Out loud, 3 min: how a saga undoes a half-finished order, and why every step and compensation must be idempotent. Deep enough when you can say when CQRS is worth its cost and when it is not.' },
  // 19
  hld('ticketmaster', 'Ticketmaster (booking under contention)', 'seat holds under contention, the virtual waiting room',
    'explain how you stop two people booking the last seat, and how a seat hold expires',
    hi('problem-breakdowns/ticketmaster')),
  // 20
  { id: 'sd:ddia-3a', covers: ['ai:depth-ddia-storage-indexes', 'sd:storage'], url: DDIA, url2: hi('core-concepts/db-indexing'),
    understand: 'Designing Data-Intensive Applications, ch. 3 part 1: storage engines. Append-only logs, SSTables and LSM trees vs B-trees, and what that means for SQL vs NoSQL. Read the first half of the chapter.',
    do: 'In a TS scratch file, build a tiny log-structured key-value store: append every write to a file, keep an in-memory index of byte offsets, and add a compaction step that keeps only the latest value per key.',
    explain: 'Out loud, 3 min: why writes are faster in an LSM tree and reads in a B-tree. Deep enough when you can say when a B-tree index stops helping a query, and what you would use instead.' },
  // 21
  hld('fb-news-feed', 'the Facebook news feed', 'fan-out on write vs on read, celebrity accounts',
    'explain when you switch from fan-out on write to fan-out on read, and what a celebrity post costs each way',
    hi('problem-breakdowns/fb-news-feed'), primerSolution('twitter')),
  // 22
  { id: 'sd:ddia-3b', url: DDIA, url2: 'https://use-the-index-luke.com/',
    understand: 'Designing Data-Intensive Applications, ch. 3 part 2: OLTP vs OLAP, data warehouses, star schemas and column-oriented storage. Read the second half of the chapter.',
    do: 'In a TS scratch file, store 1 million fake orders twice: as an array of row objects and as one typed array per column. Time "revenue by month" on each and write down why one is faster.',
    explain: 'Out loud, 3 min: why analytics queries run on a column store and not on the production database. Deep enough when you can explain how column compression and a sort order speed up a scan.' },
  // 23
  hld('youtube', 'YouTube', 'upload and transcoding pipeline, adaptive streaming',
    'explain the path of a video from upload to the first play, and where the CDN fits',
    hi('problem-breakdowns/youtube')),
  // 24 (this is also JT_DEPTH_READS[0]; placed here once)
  { id: 'jt:hiw-stripe-idempotency', url: 'https://stripe.com/blog/idempotency',
    understand: 'How real systems work · Stripe idempotency keys ("Designing robust and predictable APIs with idempotency", Brandur Leach). Read the post.',
    do: 'In a TS scratch file, write idempotency-key middleware for a fake charge endpoint: store the key with a hash of the request and the response, replay the stored response on a retry, and reject the same key with a different body. Test a retry after a timeout.',
    explain: 'Out loud, 3 min: what a client retry does to a charge with and without an idempotency key, and where the key is stored. Deep enough when you can say what happens if the server crashes after charging but before saving the response.' },
  // 25
  hld('web-crawler', 'a web crawler', 'the URL frontier and politeness, duplicate detection',
    'explain how you avoid crawling one page twice, and how you stay polite to a single host',
    hi('problem-breakdowns/web-crawler'), primerSolution('web_crawler')),
  // 26
  { id: 'sd:ddia-4a', url: DDIA, url2: 'https://protobuf.dev/programming-guides/proto3/',
    understand: 'Designing Data-Intensive Applications, ch. 4 part 1: encoding formats. JSON and binary formats (Thrift, Protocol Buffers, Avro), and how each handles schema changes. Read the first half of the chapter.',
    do: 'In a TS scratch file, encode the same 1,000 user records as JSON and as a hand-written binary format with a DataView (fixed fields plus length-prefixed strings). Compare the byte sizes and the encode and decode times.',
    explain: 'Out loud, 3 min: what forward and backward compatibility mean, and how Protocol Buffers field tags give you both. Deep enough when you can say which schema changes are safe (add an optional field) and which break old readers (reuse a tag).' },
  // 27
  hld('distributed-cache', 'a distributed cache (Redis)', 'sharding with consistent hashing, eviction and replication',
    'explain what happens to the keys when a cache node dies, and how you handle a hot key',
    hi('deep-dives/redis'), primerSolution('query_cache')),
  // 28
  { id: 'sd:ddia-4b', url: DDIA, url2: 'https://martin.kleppmann.com/2012/12/05/schema-evolution-in-avro-protocol-buffers-thrift.html',
    understand: 'Designing Data-Intensive Applications, ch. 4 part 2: modes of dataflow. Through databases, through services (REST and RPC), and through message brokers. Read the second half of the chapter.',
    do: 'In a TS scratch file, write v1 and v2 of an event type, where v2 adds an optional field. Write a reader for each and test that old code reads new events and new code reads old events.',
    explain: 'Out loud, 3 min: why a rolling deploy means old and new code read the same data at the same time. Deep enough when you can say why a remote call is not like a local call, and what that means for timeouts and retries.' },
  // 29
  hld('job-scheduler', 'a job scheduler', 'storing jobs by run time, at-least-once execution',
    'explain how a job runs once in effect when a worker dies halfway through it',
    hi('problem-breakdowns/job-scheduler')),
  // 30
  { id: 'sd:block-search', url: hi('deep-dives/elasticsearch'),
    understand: 'HLD building block · Search and inverted indexes: tokenising, posting lists, ranking (TF-IDF, BM25), and how Elasticsearch shards an index. Read the Hello Interview Elasticsearch deep dive.',
    do: 'In a TS scratch file, build an inverted index over 1,000 short documents: tokenise, lowercase, and map each term to a sorted list of ids. Support AND queries by intersecting the lists, and rank by term frequency.',
    explain: 'Out loud, 3 min: why a LIKE query does not scale and an inverted index does. Deep enough when you can say how a new document becomes searchable, and why search is called near real time.' },
  // 31
  hld('payment-system', 'a payment system', 'idempotent charges, the ledger, reconciliation',
    'explain how a retried payment is never charged twice, and how the ledger proves it',
    hi('problem-breakdowns/payment-system')),
  // 32
  { id: 'sd:ddia-5a', covers: ['ai:depth-ddia-replication', 'sd:replication-sharding'], url: DDIA,
    understand: 'Designing Data-Intensive Applications, ch. 5 part 1: leaders and followers. Sync vs async replication, adding a follower, failover, and replication lag (read-your-writes, monotonic reads). Read the first half of the chapter.',
    do: 'In a TS scratch file, simulate a leader and 2 followers with a random replication delay. Write, then read from a random follower, and count the stale reads. Add read-your-writes (read from the leader for 1 second after a user writes) and count again.',
    explain: 'Out loud, 3 min: the stale-read bug a user sees right after an update, and its fix. Deep enough when you can explain what can go wrong during failover (lost writes, split brain).' },
  // 33
  hld('top-k-leaderboard', 'a top-K leaderboard', 'counting at scale, exact vs approximate top-K',
    'explain how you keep a live top 100 over a sliding window, and what you give up with a count-min sketch',
    hi('problem-breakdowns/top-k'), primerSolution('sales_rank')),
  // 34
  { id: 'sd:ddia-5b', url: DDIA, url2: hi('deep-dives/cassandra'),
    understand: 'Designing Data-Intensive Applications, ch. 5 part 2: multi-leader and leaderless replication. Write conflicts, last-write-wins, quorums (w + r > n) and sloppy quorums. Read the second half of the chapter.',
    do: 'In a TS scratch file, simulate 3 leaderless replicas with n = 3, w = 2, r = 2. Write with version numbers, read from 2 random replicas and keep the newest. Then try w = 1, r = 1 and show a stale read.',
    explain: 'Out loud, 3 min: why w + r > n usually gives a fresh read, and when it still does not. Deep enough when you can say what last-write-wins silently loses, and when you would accept that.' },
  // 35
  hld('yelp', 'Yelp (geo search)', 'geospatial search, ratings at read time',
    'explain how you find businesses within 5 km fast, and why a geohash or a quadtree helps',
    hi('problem-breakdowns/yelp')),
  // 36
  caseStudy('jt:hiw-discord-message-storage', 'Discord message storage (trillions of messages, Cassandra to ScyllaDB).', 'https://discord.com/blog/how-discord-stores-trillions-of-messages',
    'Out loud, 3 min: why hot partitions hurt them, and how the data model and the data services fix it. Deep enough when you can explain their partition key (channel plus time bucket) and what request coalescing saves.'),
  // 37
  hld('live-comments', 'YouTube live comments', 'real-time fan-out to millions of viewers',
    'explain how a comment reaches every viewer of a live video within 2 seconds, and how you scale the open connections',
    hi('problem-breakdowns/fb-live-comments')),
  // 38
  { id: 'sd:ddia-6a', url: DDIA, url2: hi('core-concepts/sharding'),
    understand: 'Designing Data-Intensive Applications, ch. 6 part 1: partitioning (sharding). By key range vs by hash of key, skew and hot spots, and secondary indexes (local vs global). Read the first half of the chapter.',
    do: 'In a TS scratch file, shard 100,000 fake user ids across 8 partitions by range and by hash. Print the keys per partition for each. Then add a celebrity key that gets 10% of all reads and show the hot spot.',
    explain: 'Out loud, 3 min: when you would shard by range and when by hash. Deep enough when you can explain why a global secondary index makes writes slower and reads faster.' },
  // 39
  hld('ad-click-aggregator', 'an ad click aggregator', 'stream processing, deduplication, exact counts',
    'explain how a click is counted once even when the stream retries, and how you reconcile with the batch numbers',
    hi('problem-breakdowns/ad-click-aggregator')),
  // 40
  { id: 'sd:ddia-6b', url: DDIA, url2: hi('core-concepts/consistent-hashing'),
    understand: 'Designing Data-Intensive Applications, ch. 6 part 2: rebalancing and request routing, plus consistent hashing. Read the second half of the chapter, then the Hello Interview consistent hashing page.',
    do: 'In a TS scratch file, build a consistent-hash ring with virtual nodes. Add a 5th node to 4 and count how many of 100,000 keys move. Compare with hash(key) % n.',
    explain: 'Out loud, 3 min: why hash mod n moves almost every key when a node joins, and consistent hashing moves about 1/n of them. Deep enough when you can say what virtual nodes fix, and how a client finds the right partition.' },
  // 41
  hld('news-aggregator', 'a news aggregator (Google News)', 'ingestion from many sources, a fresh and fast feed',
    'explain how new articles show up within minutes while the feed stays fast for every reader',
    hi('problem-breakdowns/google-news')),
  // 42
  { id: 'sd:observability-security', url: 'https://newsletter.systemdesign.one/', url2: 'https://sre.google/sre-book/monitoring-distributed-systems/',
    understand: 'Later fundamentals · Observability (SLIs, logs, metrics, traces, alerts) and security basics (authentication vs authorisation, TLS, secrets). Search the System Design newsletter for its observability and security posts, then read the SRE book chapter on monitoring.',
    do: 'In a TS scratch file, wrap a fake HTTP handler with middleware that logs one JSON line per request (trace id, route, status, duration) and counts errors. Add a check that returns 401 with no token and 403 with the wrong role.',
    explain: 'Out loud, 3 min: the four golden signals, and which alert should wake someone up. Deep enough when you can explain authentication vs authorisation, and where a secret must never be (code, logs, the client).' },
  // 43
  hld('local-delivery', 'a local delivery service (Gopuff)', 'inventory across warehouses, availability by location',
    'explain how you show only items a nearby warehouse has, and how you stop two orders taking the last one',
    hi('problem-breakdowns/gopuff')),
  // 44
  { id: 'sd:ddia-7a', covers: ['ai:depth-ddia-transactions', 'sd:transactions'], url: DDIA, url2: 'https://www.postgresql.org/docs/current/transaction-iso.html',
    understand: 'Designing Data-Intensive Applications, ch. 7 part 1: transactions. ACID, single-object vs multi-object writes, weak isolation (read committed, snapshot isolation) and lost updates. Read the first half of the chapter.',
    do: 'In a TS scratch file, simulate two users booking the last seat: each reads the count, waits, then writes. Show the double booking. Fix it twice: with a compare-and-set on a version number, and with a lock.',
    explain: 'Out loud, 3 min: the race in a double booking and the cheapest fix. Deep enough when you can say which anomalies read committed allows and which ones snapshot isolation stops.' },
  // 45
  hld('leetcode', 'LeetCode (an online judge)', 'running untrusted code safely, the contest leaderboard',
    'explain how you isolate user code, and how you handle 100,000 submissions in the last minute of a contest',
    hi('problem-breakdowns/leetcode')),
  // 46
  { id: 'sd:ddia-7b', url: DDIA, url2: hi('patterns/dealing-with-contention'),
    understand: 'Designing Data-Intensive Applications, ch. 7 part 2: write skew and phantoms, and serializability (serial execution, two-phase locking, serializable snapshot isolation). Read the second half of the chapter.',
    do: 'In a TS scratch file, model the on-call doctors example: two doctors go off call at once because each one sees the other still on call. Show the write skew, then fix it by locking both rows before the check.',
    explain: 'Out loud, 3 min: what write skew is, and why snapshot isolation does not stop it. Deep enough when you can compare two-phase locking and serializable snapshot isolation on cost.' },
  // 47
  { id: 'sd:arch-styles', url: 'https://martinfowler.com/articles/microservices.html', url2: 'https://martinfowler.com/bliki/MonolithFirst.html',
    understand: 'Software design · Architecture styles: monolith, modular monolith, microservices, and layering. Read Martin Fowler on microservices, then "MonolithFirst".',
    do: 'In Excalidraw, 30 min: draw one shop app three ways (a monolith, a modular monolith with clear module boundaries, and 4 services). Mark each place where one order crosses the network.',
    explain: 'Out loud, 3 min: why you would start a 5-person team on a modular monolith. Deep enough when you can name 3 signs that it is time to split out a service, and what the split costs.' },
  // 48
  { id: 'sd:testing-strategy', url: 'https://martinfowler.com/articles/practical-test-pyramid.html', url2: 'https://docs.pact.io/',
    understand: 'Software design · Testing strategy: the test pyramid (unit, integration, end-to-end), contract tests between services, and evals as tests for LLM features. Read "The Practical Test Pyramid".',
    do: 'In a TS scratch file, take a small function that calls an API. Write one unit test with a fake, one contract-style test that checks the response shape the client relies on, and one eval-style test that runs 10 fixed inputs and fails if fewer than 9 pass a check.',
    explain: 'Out loud, 3 min: why most tests should be unit tests, and what end-to-end tests catch that the others miss. Deep enough when you can say what a contract test protects between two teams, and why an LLM feature needs evals as well as unit tests.' },
  // 49
  { id: 'sd:block-geo', url: 'https://en.wikipedia.org/wiki/Geohash', url2: 'https://h3geo.org/docs/',
    understand: 'HLD building block · Geospatial indexing: geohashes, quadtrees and H3 hexagons, and how a "near me" query runs. Read the geohash article, then the H3 overview.',
    do: 'In a TS scratch file, write a geohash encoder (interleave longitude and latitude bits, then base32). Encode 1,000 random points, then find the points near one location by matching a prefix and checking the 8 neighbouring cells.',
    explain: 'Out loud, 3 min: why a plain index on latitude and longitude is slow for "within 5 km", and how a geohash prefix helps. Deep enough when you can say when a quadtree beats a fixed geohash grid (dense cities).' },
  // 50
  caseStudy('jt:hiw-figma-multiplayer', 'Figma multiplayer.', 'https://www.figma.com/blog/how-figmas-multiplayer-technology-works/',
    'Out loud, 3 min: what happens when two people edit the same property at once, and why the server decides. Deep enough when you can say why Figma chose a central server over a full CRDT, and what that gives up.'),
  // 51
  { id: 'sd:block-probabilistic', url: 'https://llimllib.github.io/bloomfilter-tutorial/', url2: 'https://redis.io/docs/latest/develop/data-types/probabilistic/hyperloglogs/',
    understand: 'HLD building block · Probabilistic structures: Bloom filters (is it maybe in the set?), HyperLogLog (how many unique?) and count-min sketch (how often?). Try the Bloom filter tutorial, then read the Redis HyperLogLog page.',
    do: 'In a TS scratch file, build a Bloom filter with k hash functions over a bit array. Insert 10,000 words, test 10,000 others, and compare the false positive rate with the formula. Try 3 sizes.',
    explain: 'Out loud, 3 min: why a Bloom filter can say "maybe" but never a wrong "no". Deep enough when you can name a design for each structure (crawler seen-URLs, unique visitors, top-K counts) and the error you accept.' },
  // 52
  { id: 'sd:refactoring', url: 'https://refactoring.guru/refactoring/smells',
    understand: 'Software design · Refactoring and code smells: long method, large class, duplicated code, feature envy, shotgun surgery, primitive obsession. Read the code smells catalogue.',
    do: 'In a TS scratch file, write a messy 100-line checkout function on purpose (or take one from your own code). Add tests first. Then refactor in small steps: extract functions, replace primitives with types, remove duplication. Run the tests after each step.',
    explain: 'Out loud, 3 min: the 3 smells you see most in real code and the refactoring for each. Deep enough when you can say why the tests come before the refactor, and when you would leave messy code alone.' },
  // 53
  caseStudy('jt:hiw-slack-real-time', 'Slack real-time messaging.', 'https://slack.engineering/real-time-messaging/',
    'Out loud, 3 min: the path of one message from sender to every open client, and what happens when a gateway server dies. Deep enough when you can say why channel state lives in its own service, apart from the WebSocket gateways.'),
  // 54
  { id: 'sd:block-realtime-fanout', url: hi('patterns/realtime-updates'),
    understand: 'HLD building block · Real-time fan-out: polling, long polling, server-sent events and WebSockets, with pub/sub behind them. Read the Hello Interview real-time updates pattern.',
    do: 'In a TS scratch file, write a WebSocket server with the ws package that sends each message to every client in a room through an in-memory pub/sub. Start 3 clients and show one message reaching all of them.',
    explain: 'Out loud, 3 min: how a message reaches users connected to different servers. Deep enough when you can pick SSE or WebSockets for a live score and for a chat, and say why.' },

  // ---------- Weeks 10–13 (slots 55–78): a mock, then a depth item ----------
  // 55
  mock('sd:hld-tinder', 'Tinder', hi('problem-breakdowns/tinder')),
  // 56
  { id: 'sd:ddia-8a', url: DDIA, url2: 'https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing',
    understand: 'Designing Data-Intensive Applications, ch. 8 part 1: the trouble with distributed systems. Partial failures, unreliable networks, timeouts and unbounded delays. Read the first half of the chapter.',
    do: 'In a TS scratch file, write a fetch wrapper with a timeout, retries with exponential backoff and full jitter, and a cap on attempts. Point it at a fake server that drops 30% of requests and is slow 10% of the time, and log what happens.',
    explain: 'Out loud, 3 min: why you cannot tell a slow node from a dead one. Deep enough when you can say how you would choose a timeout, and why jitter matters when 1,000 clients retry at once.' },
  // 57
  mock('sd:hld-instagram-post-search', 'Instagram post search', hi('problem-breakdowns/fb-post-search')),
  // 58
  { id: 'sd:ddia-8b', url: DDIA, url2: 'https://en.wikipedia.org/wiki/Lamport_timestamp',
    understand: 'Designing Data-Intensive Applications, ch. 8 part 2: unreliable clocks (time-of-day vs monotonic, clock skew), process pauses, and knowledge and truth (quorums, fencing tokens). Read the second half of the chapter.',
    do: 'In a TS scratch file, simulate 3 nodes with skewed clocks writing one key with last-write-wins on wall-clock time, and show a newer write being lost. Then order the writes with a Lamport clock and show the order holds.',
    explain: 'Out loud, 3 min: why last-write-wins on wall-clock time can lose data. Deep enough when you can explain a fencing token and the long-pause bug it stops.' },
  // 59
  mock('sd:hld-price-tracker', 'a price tracking service (camelcamelcamel)', hi('problem-breakdowns/camelcamelcamel')),
  // 60
  { id: 'sd:ddia-9a', covers: ['sd:reliability'], url: DDIA, url2: 'https://jepsen.io/consistency',
    understand: 'Designing Data-Intensive Applications, ch. 9 part 1: consistency guarantees. Linearizability and its cost, and ordering (causality, sequence numbers, total order broadcast). Read the first half of the chapter.',
    do: 'In a TS scratch file, simulate one register on 2 replicas with async replication. Record a history of reads and writes from 3 clients, and write a checker that flags a read that goes back in time.',
    explain: 'Out loud, 3 min: what linearizability promises, and why it is slow across regions. Deep enough when you can say which features need it (leader election, unique usernames, seat booking) and which are fine with causal or eventual consistency.' },
  // 61
  mock('sd:hld-online-auction', 'an online auction', hi('problem-breakdowns/online-auction')),
  // 62
  { id: 'sd:ddia-9b', url: DDIA, url2: 'https://raft.github.io/',
    understand: 'Designing Data-Intensive Applications, ch. 9 part 2: distributed transactions and consensus. Two-phase commit and its limits, fault-tolerant consensus, Raft, and coordination services like ZooKeeper and etcd. Read the second half of the chapter.',
    do: 'Watch the visualisation on the Raft site. Then, in a TS scratch file, simulate leader election: 5 nodes with random election timeouts, terms and votes. Kill the leader and show a new one elected with a higher term.',
    explain: 'Out loud, 3 min: how Raft elects a leader, and why it needs a majority. Deep enough when you can say why two-phase commit blocks when the coordinator dies, and what consensus fixes.' },
  // 63
  mock('sd:hld-search-autocomplete', 'search autocomplete (backend)', PRIMER, { compare: 'the System Design Primer (its caching and sharding sections)' }),
  // 64
  caseStudy('jt:hiw-linear-sync-engine', 'Linear sync engine.', 'https://linear.app/now/scaling-the-linear-sync-engine',
    'Out loud, 3 min: how a change made offline reaches every other client, and what breaks at scale. Deep enough when you can say how a client catches up after a long time offline.'),
  // 65
  mock('sd:hld-robinhood', 'Robinhood (stock trading)', hi('problem-breakdowns/robinhood'), { covers: ['sdm:hld-robinhood'] }),
  // 66
  caseStudy('jt:hiw-notion-data-model', 'Notion data model (everything is a block).', 'https://www.notion.com/blog/data-model-behind-notion',
    'Out loud, 3 min: how a block tree is stored and permissioned, and the cost of that flexibility. Deep enough when you can draw a page as a tree of blocks and say what moving one block changes.'),
  // 67
  mock('sd:hld-instagram', 'Instagram', hi('problem-breakdowns/instagram'), { covers: ['sdm:hld-instagram'] }),
  // 68
  caseStudy('jt:hiw-nextjs-caching', 'Next.js and Vercel caching ("Our Journey with Caching").', 'https://nextjs.org/blog/our-journey-with-caching',
    'Out loud, 3 min: which caches a request passes through, and why stale data showed up for users. Deep enough when you can say what changed in the defaults, and why opt-in caching is easier to reason about.'),
  // 69
  mock('sd:hld-google-docs', 'Google Docs', hi('problem-breakdowns/google-docs'), { covers: ['sdm:hld-google-docs'] }),
  // 70
  caseStudy('jt:hiw-shopify-bfcm', 'Shopify Black Friday scale (how they prepare for BFCM).', 'https://shopify.engineering/bfcm-readiness-2025',
    'Out loud, 3 min: how Shopify gets ready for its biggest traffic weekend: load tests, capacity and what they freeze. Deep enough when you can name 3 things you would copy for your own launch day.'),
  // 71
  mock('sdm:hld-rate-limiter', 'a rate limiter', hi('problem-breakdowns/distributed-rate-limiter'), { second: true }),
  // 72
  caseStudy('jt:hiw-cloudflare-nov-2025', "Cloudflare's 18 November 2025 outage postmortem.", 'https://blog.cloudflare.com/18-november-2025-outage/',
    'Out loud, 3 min: what failed, how it spread and how they recovered. Deep enough when you can name the root cause and 2 changes that would have stopped it spreading.'),
  // 73
  mock('sdm:hld-whatsapp', 'WhatsApp', hi('problem-breakdowns/whatsapp'), { second: true }),
  // 74
  caseStudy('jt:hiw-github-copilot', 'GitHub Copilot (how it builds the prompt from your code).', 'https://github.blog/ai-and-ml/github-copilot/how-github-copilot-is-getting-better-at-understanding-your-code/',
    'Out loud, 3 min: what context goes into one completion request, and the latency and quality trade-off behind it. Deep enough when you can say how it picks which snippets from your other open files go into the prompt.'),
  // 75
  mock('sdm:hld-ticketmaster', 'Ticketmaster', hi('problem-breakdowns/ticketmaster'), { second: true }),
  // 76
  { id: 'sd:block-stream-processing', url: 'https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/', url2: hi('deep-dives/flink'),
    understand: 'HLD building block · Stream processing: windows, watermarks, state, and exactly-once (idempotent producers, transactions, checkpoints). Read the Confluent post on exactly-once in Kafka, then the Hello Interview Flink deep dive.',
    do: 'In a TS scratch file, turn a stream of click events into 1-minute tumbling windows. Feed in duplicates and late events. Dedupe by event id, and handle late events with a 30-second watermark.',
    explain: 'Out loud, 3 min: why "exactly once" really means "effectively once" (at-least-once plus dedupe or transactions). Deep enough when you can say what a watermark decides, and what happens to an event that arrives after it.' },
  // 77
  { id: 'sd:block-blob-media', url: hi('patterns/large-blobs'),
    understand: 'HLD building block · Blob storage and media pipelines: object stores like S3, presigned URLs, multipart upload, processing queues and CDNs. Read the Hello Interview large blobs pattern.',
    do: 'In a TS scratch file, split a file into 5 MB parts, upload them to a fake store that fails 1 part in 10, retry only the failed parts, and check the joined file matches the original.',
    explain: 'Out loud, 3 min: why a large file should not pass through your app servers. Deep enough when you can explain resumable uploads, and how a user sees the photo before the resize job is done.' },
  // 78
  { id: 'sd:block-ids-clocks-locks', url: 'https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html', url2: hi('deep-dives/zookeeper'),
    understand: 'HLD building block · Distributed IDs, clocks and locks: Snowflake-style ids, UUID v4 vs v7, logical clocks, and leases with fencing tokens. Read "How to do distributed locking" by Martin Kleppmann.',
    do: 'In a TS scratch file, write a Snowflake-style id generator with BigInt (41 bits of time, 10 of machine, 12 of sequence). Make 1 million ids on 2 fake machines and check they are unique and roughly time-ordered.',
    explain: 'Out loud, 3 min: why auto-increment ids break once you shard, and what a Snowflake id gives you. Deep enough when you can say why a lock with a timeout is not safe on its own, and how a fencing token fixes it.' },
];
