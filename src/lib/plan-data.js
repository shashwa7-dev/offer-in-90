// Curriculum entry point. All content lives in src/lib/content/*.js with content-based ids (<prefix>:<slug>); this file merges
// it. CONTENT is what the engine lays out (tracks.ts, plan-build.ts); PLAN is the same object, read by the reference pages.
// Built from the "Amazon Interview Prep by AnubhavInTech" Whimsical board, extended for frontend / full-stack loops at Google,
// Meta, Microsoft, Amazon.

import * as DSA from './content/dsa.js';
import * as FE from './content/fe.js';
import * as UX from './content/ux.js';
import * as CAREER from './content/career.js';
import * as AI from './content/ai.js';
import * as MC from './content/mc.js';
import * as SD from './content/sd.js';
import * as JUDGMENT from './content/judgment.js';
import * as REFERENCE from './content/reference.js';
import * as SUNDAYS from './content/sundays.js';

export const CONTENT = { ...DSA, ...FE, ...UX, ...CAREER, ...AI, ...MC, ...SD, ...JUDGMENT, ...REFERENCE, ...SUNDAYS };
export const PLAN = CONTENT;
