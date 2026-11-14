// Smoke run against the dev server: every nav item renders without errors, desktop shows the sidebar,
// phone width shows the bottom bar with no horizontal scroll. Usage: node scripts/smoke.mjs <shots dir>
// Audio is always muted: the owner must never hear sound from a test run.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.SMOKE_URL || 'http://localhost:3000';
const shots = process.argv[2];
if (!shots) { console.error('usage: node scripts/smoke.mjs <shots dir>'); process.exit(2); }
mkdirSync(shots, { recursive: true });

const pad = n => String(n).padStart(2, '0');
const isoDay = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const start = new Date(); start.setDate(start.getDate() - 9);
const now = Date.now();
const fixture = {
  v: 5, start: isoDay(start), kickoff: true, targets: ['Google', 'Meta'],
  done: { 'k-wo': now, 'k-pos': now, 'k-ai': now, 's1-wo': now, 'fe-1': now },
  flags: {}, notes: { 0: 'Set up the plan.' }, tnotes: {}, seenUpdates: {}, bookmarks: {}, custom: {}, meta: {}, updatedAt: now,
};

const failures = [];
const fail = m => { failures.push(m); console.log(`FAIL ${m}`); };
const ok = m => console.log(`ok   ${m}`);

const browser = await chromium.launch({ args: ['--mute-audio'] });
async function open(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fixture));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  await page.goto(URL, { waitUntil: 'networkidle' });
  // The Next dev indicator sits bottom-left over the phone bar; errors are caught from the console instead.
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  await page.waitForTimeout(400);
  return { ctx, page, errors };
}
const checkErrors = (errors, label) => { if (errors.length) fail(`${label}: ${errors.splice(0).join(' | ')}`); else ok(`${label}: no errors`); };

try {
  // ---------- desktop ----------
  {
    const { ctx, page, errors } = await open(1100, 800);
    const sidebar = page.locator('[data-slot="sidebar"]:visible').first();
    if (await sidebar.count() && await sidebar.isVisible()) ok('1100: sidebar visible'); else fail('1100: sidebar not visible');
    if (await page.locator('[data-shell="bottom-bar"]').isVisible().catch(() => false)) fail('1100: bottom bar visible on desktop'); else ok('1100: bottom bar hidden');
    for (const v of ['today', 'progress', 'roadmap', 'notes', 'news', 'setup']) {
      const item = page.locator(`[data-slot="sidebar"] [data-nav="${v}"]`).first();
      if (!(await item.count())) { fail(`1100: no sidebar nav item for ${v}`); continue; }
      await item.click();
      await page.waitForTimeout(300);
      const hash = await page.evaluate(() => location.hash);
      if ((v === 'today' && hash !== '') || (v !== 'today' && hash !== `#${v}`)) fail(`1100: ${v} hash is "${hash}"`);
      checkErrors(errors, `1100 ${v}`);
      await page.screenshot({ path: join(shots, `shell-1100-${v}.png`) });
    }
    // hash on load
    await page.goto(`${URL}/#progress`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' }); // a hash-only goto does not reload the document
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(300);
    if (await page.locator('[data-slot="sidebar"] [data-nav="progress"][data-active="true"]').count()) ok('1100: #progress opens Progress on load'); else fail('1100: #progress did not open Progress on load');
    // ⌘B collapses to icons
    await page.locator('body').click({ position: { x: 900, y: 10 } }).catch(() => {});
    await page.keyboard.press('ControlOrMeta+b');
    await page.waitForTimeout(400);
    if (await page.locator('[data-slot="sidebar"][data-state="collapsed"]').count()) ok('1100: ⌘B collapses the sidebar'); else fail('1100: ⌘B did not collapse the sidebar');
    await page.screenshot({ path: join(shots, 'shell-1100-collapsed.png') });
    checkErrors(errors, '1100 collapse');
    await ctx.close();
  }
  // ---------- phone ----------
  {
    const { ctx, page, errors } = await open(390, 844);
    const bar = page.locator('[data-shell="bottom-bar"]');
    if (await bar.isVisible().catch(() => false)) ok('390: bottom bar visible'); else fail('390: bottom bar not visible');
    if (await page.locator('[data-slot="sidebar"]:visible').count()) fail('390: sidebar visible on phone'); else ok('390: sidebar hidden');
    const go = async v => {
      const direct = bar.locator(`[data-nav="${v}"]`);
      if (await direct.count()) { await direct.click(); return true; }
      const more = bar.locator('[data-nav="more"]');
      if (!(await more.count())) return false;
      await more.click();
      await page.waitForTimeout(300);
      const inSheet = page.locator(`[data-shell="more-sheet"] [data-nav="${v}"]`);
      if (!(await inSheet.count())) return false;
      await inSheet.click();
      return true;
    };
    for (const v of ['today', 'progress', 'notes', 'roadmap', 'news', 'setup']) {
      if (!(await go(v))) { fail(`390: cannot reach ${v}`); continue; }
      await page.waitForTimeout(400);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > 390) fail(`390 ${v}: horizontal scroll (scrollWidth ${sw})`); else ok(`390 ${v}: scrollWidth ${sw}`);
      checkErrors(errors, `390 ${v}`);
      await page.screenshot({ path: join(shots, `shell-390-${v}.png`), fullPage: false });
    }
    await ctx.close();
  }
} catch (e) {
  fail(`crashed: ${e.stack || e}`);
} finally {
  await browser.close();
}

if (failures.length) { console.log(`\n${failures.length} failure(s)`); process.exit(1); }
console.log('\nsmoke passed');
