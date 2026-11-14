import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter((f) => /^test-.*\.ts$/.test(f)).sort();
if (!files.length) {
  console.error('no tests found');
  process.exit(1);
}
let failed = 0;
for (const f of files) {
  console.log(`\n# ${f}`);
  const r = spawnSync(process.execPath, ['--experimental-strip-types', '--no-warnings', join(dir, f)], { stdio: 'inherit' });
  if (r.status !== 0) {
    if (r.status === null) console.error(r.error ? String(r.error) : `terminated by signal ${r.signal}`);
    failed++;
  }
}
if (failed) {
  console.error(`\n${failed} test file(s) failed`);
  process.exit(1);
}
