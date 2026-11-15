// Curriculum entry point. All content lives in src/lib/content/*.js with content-based ids (<prefix>:<slug>); this file merges
// it. CONTENT is what the engine lays out (tracks.ts, plan-build.ts); PLAN is the same object, read by the reference pages.
// Built from the "Amazon Interview Prep by AnubhavInTech" Whimsical board, extended for frontend / full-stack loops at Google,
// Meta, Microsoft, Amazon. The v2 modules are gone (roadmap v3); v3-dropped.js lists what v3 does not place, for the coverage test.

import * as DSA from './content/dsa.js';
import * as CAREER from './content/career.js';
import * as AI_CORE from './content/ai-core.js';
import * as FRONTEND from './content/frontend.js';
import * as PRODUCT from './content/product.js';
import * as SYSTEMS from './content/systems.js';
import * as PLATFORM from './content/platform.js';
import * as REFERENCE from './content/reference.js';
import * as SUNDAYS from './content/sundays.js';

export const CONTENT = { ...DSA, ...CAREER, ...AI_CORE, ...FRONTEND, ...PRODUCT, ...SYSTEMS, ...PLATFORM, ...REFERENCE, ...SUNDAYS };
export const PLAN = CONTENT;
