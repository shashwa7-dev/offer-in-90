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
  // ---------- Today (clock fixed at 14:10 on a weekday, day 9 of the plan) ----------
  for (const [width, height] of [[1100, 900], [390, 844]]) {
    const at = new Date(2026, 10, 12, 14, 10); // Thu 12 Nov 2026, 14:10 local
    const st = new Date(at); st.setDate(st.getDate() - 9);
    const fx = { ...fixture, start: isoDay(st), done: { 'k-wo': +at, 'k-pos': +at, 'k-ai': +at }, notes: {}, updatedAt: +at };
    const ctx = await browser.newContext({ viewport: { width, height } });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fx));
    const page = await ctx.newPage();
    await page.clock.install({ time: at });
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const W = `today ${width}`;
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('offer90.v1') || '{}'));
    for (const b of ['Morning', 'Afternoon', 'Evening']) {
      if (await page.getByRole('button', { name: new RegExp(`^${b}`) }).first().isVisible().catch(() => false)) ok(`${W}: band ${b} visible`); else fail(`${W}: band ${b} not visible`);
    }
    const nowRow = page.locator('[data-now]');
    if ((await nowRow.count()) === 1 && /13:00/.test(await nowRow.innerText())) ok(`${W}: 13:00 block is now`); else fail(`${W}: no single [data-now] row at 13:00 (count ${await nowRow.count()})`);
    const missed = page.locator('[data-missed]').filter({ hasText: '05:15' });
    if (await missed.count()) ok(`${W}: 05:15 block is missed`); else fail(`${W}: no [data-missed] row at 05:15`);
    const mc = await page.locator('[data-missed]').first().evaluate(e => getComputedStyle(e).color).catch(() => 'none');
    if (mc === 'rgb(138, 128, 119)') ok(`${W}: missed row is stone`); else fail(`${W}: missed row colour ${mc}`);
    await page.screenshot({ path: join(shots, `today-${width}.png`), fullPage: true });
    if (width === 1100) {
      // quick add in the open current block → a "Yours" row; then edit and remove it
      await page.getByRole('button', { name: 'Add task' }).first().click();
      await page.getByPlaceholder('Task name, paste a link to attach it').fill('Smoke own task');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const own = page.locator('[data-task]').filter({ hasText: 'Smoke own task' });
      if (await own.count() && /Yours/.test(await own.first().innerText())) ok(`${W}: quick add creates a Yours row`); else fail(`${W}: quick add row missing`);
      if (Object.values((await saved()).custom || {}).some(c => c.text === 'Smoke own task')) ok(`${W}: own task saved`); else fail(`${W}: own task not saved`);
      await own.first().hover();
      await page.getByRole('button', { name: 'Edit Smoke own task' }).click();
      const ed = page.locator('input[value="Smoke own task"]');
      await ed.fill('Smoke own task edited'); await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
      if (Object.values((await saved()).custom || {}).some(c => c.text === 'Smoke own task edited')) ok(`${W}: own task edited`); else fail(`${W}: own task edit not saved`);
      await page.locator('[data-task]').filter({ hasText: 'Smoke own task edited' }).first().hover();
      await page.getByRole('button', { name: 'Remove Smoke own task edited' }).click();
      await page.waitForTimeout(300);
      if (!Object.values((await saved()).custom || {}).length) ok(`${W}: own task removed`); else fail(`${W}: own task not removed`);
      // plan tasks expose no edit/remove
      const planEdit = await page.locator('[data-task]:not([data-own]) [aria-label^="Edit "], [data-task]:not([data-own]) [aria-label^="Remove "]').count();
      if (planEdit === 0) ok(`${W}: plan tasks have no edit/remove`); else fail(`${W}: plan tasks show ${planEdit} edit/remove buttons`);
      // tick a task in the current block
      const box = page.locator('[data-now] ~ [data-task] [role="checkbox"]').first();
      const id = (await box.getAttribute('id') || '').replace(/^t-/, '');
      await box.click(); await page.waitForTimeout(200);
      if ((await saved()).done?.[id]) ok(`${W}: ticking saves (${id})`); else fail(`${W}: tick not saved (${id})`);
      // open the missed DSA block and flag a problem
      await page.locator('[data-missed]').filter({ hasText: '05:15' }).click();
      await page.waitForTimeout(200);
      const flagBtn = page.getByRole('button', { name: /^Flag / }).first();
      await flagBtn.click(); await page.waitForTimeout(200);
      if (Object.keys((await saved()).flags || {}).length) ok(`${W}: flag saves`); else fail(`${W}: flag not saved`);
      // daily log in the review block
      await page.locator('[data-block="review"]').click();
      await page.waitForTimeout(200);
      await page.getByPlaceholder('One line: how did today go?').fill('Smoke log line');
      await page.waitForTimeout(200);
      if ((await saved()).notes?.[9] === 'Smoke log line') ok(`${W}: daily log saves`); else fail(`${W}: daily log not saved`);
      // notice: missed tasks link opens the Missed earlier band
      const link = page.getByRole('button', { name: /missed task/ });
      if (await link.count()) {
        await link.click(); await page.waitForTimeout(400);
        if (await page.locator('[data-band="missed-earlier"] [data-task]').first().isVisible().catch(() => false)) ok(`${W}: missed link opens Missed earlier`); else fail(`${W}: Missed earlier band did not open`);
      } else fail(`${W}: no missed tasks link in the notice`);
      await page.screenshot({ path: join(shots, `today-${width}-after.png`), fullPage: true });
    } else {
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > 390) fail(`${W}: horizontal scroll (scrollWidth ${sw})`); else ok(`${W}: scrollWidth ${sw}`);
    }
    checkErrors(errors, W);
    await ctx.close();
  }
} catch (e) {
  fail(`crashed: ${e.stack || e}`);
} finally {
  await browser.close();
}

if (failures.length) { console.log(`\n${failures.length} failure(s)`); process.exit(1); }
console.log('\nsmoke passed');
