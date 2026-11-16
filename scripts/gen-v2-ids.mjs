// One-off: writes scripts/fixtures/v2-ids.json, every `id` in every exported array of the v2 curriculum modules at e9600f2. Run: git archive e9600f2 src/lib/content | tar -x -C <dir> && node scripts/gen-v2-ids.mjs <dir>
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/gen-v2-ids.mjs <dir holding src/lib/content from e9600f2>'); process.exit(1); }
// The curriculum modules. reference.js and sundays.js are not track content (kept as built), so they are left out.
const MODULES = ['ai', 'career', 'dsa', 'fe', 'judgment', 'mc', 'sd', 'ux'];
const out = {};
for (const m of MODULES) {
  const mod = await import(pathToFileURL(resolve(dir, 'src/lib/content', `${m}.js`)).href);
  for (const [name, v] of Object.entries(mod)) {
    if (!Array.isArray(v)) continue;
    const ids = v.filter((x) => x && typeof x === 'object' && typeof x.id === 'string').map((x) => x.id);
    if (ids.length) out[`${m}.${name}`] = ids;
  }
}
const file = join(fileURLToPath(new URL('.', import.meta.url)), 'fixtures', 'v2-ids.json');
writeFileSync(file, JSON.stringify(out, null, 1) + '\n');
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.length}`).join('\n'));
