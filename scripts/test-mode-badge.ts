import assert from 'node:assert/strict';
import * as dsa from '../src/lib/content/dsa.js';
import * as career from '../src/lib/content/career.js';
import * as aiCore from '../src/lib/content/ai-core.js';
import * as frontend from '../src/lib/content/frontend.js';
import * as systems from '../src/lib/content/systems.js';
import * as platform from '../src/lib/content/platform.js';
import * as product from '../src/lib/content/product.js';
import * as reference from '../src/lib/content/reference.js';
import { buildTracks } from '../src/lib/tracks.ts';
import { modeBadge, modeLine, switchMode } from '../src/lib/modes.ts';
import { layoutDays, cursorsAt } from '../src/lib/layout.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const tracks: Any = buildTracks({ ...dsa, ...career, ...aiCore, ...frontend, ...product, ...systems, ...platform, ...reference });
const START = '2026-11-16'; // a Monday
const plan = (modes: Any = {}, done: Any = {}) => layoutDays({ start: START, kickoff: true, modes, tracks, done });
const addDays = (iso: string, n: number) => { const [y, m, d] = iso.split('-').map(Number); const t = new Date(y, m - 1, d + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };

assert.equal(modeLine({}, '2026-11-20'), 'Steady mode');
assert.equal(modeLine({ '2026-11-10': { mode: 'grind', cursors: {} } }, '2026-11-20'), 'Grind mode');

// Steady, fresh: week 3 is the third Monday-to-Sunday after the start
const steady = plan();
assert.equal(modeBadge({}, addDays(START, 14), START, steady), 'Steady · week 3 of 17');
assert.equal(modeBadge({}, START, START, steady), 'Steady · week 1 of 17');

// Grind, fresh
const G: Any = { '2000-01-01': { mode: 'grind', cursors: {} } };
const grind = plan(G);
assert.equal(modeBadge(G, addDays(START, 14), START, grind), 'Grind · week 3 of 13');

// before the start (the prep day and earlier)
assert.equal(modeBadge({}, '2026-11-15', START, steady), 'Steady · starts 16 Nov');
assert.equal(modeBadge(G, '2026-11-02', START, grind), 'Grind · starts 16 Nov');

// Grind -> Steady mid-plan: the mode in force on the viewed day, and the real laid-out length
const date = addDays(START, 15);
const done: Any = {};
const modes = switchMode(G, date, 'steady', cursorsAt(grind, date, done), START);
const mixed = plan(modes, done);
const total = mixed[mixed.length - 1].week;
assert.ok(total >= 13, `mixed plan is ${total} weeks`);
assert.equal(modeBadge(modes, addDays(START, 14), START, mixed), 'Grind · week 3 of ' + total);
assert.equal(modeBadge(modes, date, START, mixed), 'Steady · week 3 of ' + total);
console.log('mode badge: ok');
