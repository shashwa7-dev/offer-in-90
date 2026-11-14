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
      const link = page.getByRole('button', { name: /^\d+ missed earlier$/ });
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
  // ---------- New task dialog and task peek (same fixed clock) ----------
  for (const [width, height] of [[1100, 900], [390, 844]]) {
    const at = new Date(2026, 10, 12, 14, 10);
    const st = new Date(at); st.setDate(st.getDate() - 9);
    const fx = { ...fixture, start: isoDay(st), done: {}, notes: {}, updatedAt: +at };
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
    const W = `popups ${width}`;
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('offer90.v1') || '{}'));
    const noScroll = async label => { if (width !== 390) return; const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 390) fail(`${W} ${label}: horizontal scroll (${sw})`); else ok(`${W} ${label}: scrollWidth ${sw}`); };

    // C opens the dialog
    await page.keyboard.press('c');
    await page.waitForTimeout(300);
    const dlg = page.getByRole('dialog', { name: 'New task' });
    if (await dlg.isVisible().catch(() => false)) ok(`${W}: C opens the New task dialog`); else fail(`${W}: C did not open the dialog`);
    const blockChip = dlg.locator('[data-chip="block"]');
    if (/13:00/.test(await blockChip.innerText().catch(() => ''))) ok(`${W}: block defaults to the current block`); else fail(`${W}: block chip reads "${await blockChip.innerText().catch(() => '')}"`);
    await dlg.getByPlaceholder('Task name').fill('Smoke dialog task');
    await dlg.getByPlaceholder(/Add a note/).fill('Smoke dialog note');
    await blockChip.click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: /18:00\s*Gym/ }).click();
    await page.waitForTimeout(200);
    if (/18:00/.test(await blockChip.innerText())) ok(`${W}: block set to 18:00 Gym`); else fail(`${W}: block chip did not change`);
    await page.screenshot({ path: join(shots, `dialog-${width}.png`) });
    await noScroll('dialog');
    await dlg.getByRole('button', { name: 'Add task' }).click();
    await page.waitForTimeout(400);
    if (await dlg.isVisible().catch(() => false)) fail(`${W}: dialog still open after Add task`); else ok(`${W}: dialog closes after Add task`);
    let s = await saved();
    const [ownId, own] = Object.entries(s.custom || {}).find(([, c]) => c.text === 'Smoke dialog task') || [];
    if (own?.block === 'workout') ok(`${W}: own task saved to the Gym block`); else fail(`${W}: own task not saved to workout (${JSON.stringify(own)})`);
    if (s.tnotes?.[`u-${ownId}`]?.body === 'Smoke dialog note') ok(`${W}: dialog note saved to tnotes`); else fail(`${W}: dialog note missing`);
    await page.locator('[data-block="workout"]').click();
    await page.waitForTimeout(300);
    const ownRow = page.locator('[data-band="evening"] [data-task][data-own]').filter({ hasText: 'Smoke dialog task' });
    if (await ownRow.count() && /Yours/.test(await ownRow.first().innerText())) ok(`${W}: row appears in Evening with Yours`); else fail(`${W}: own row missing in Evening`);

    // a plan task (a problem in the missed 05:15 block): read-only, no Delete
    await page.locator('[data-missed]').filter({ hasText: '05:15' }).click();
    await page.waitForTimeout(200);
    await page.locator('[data-block="dsa"] ~ [data-task]:not([data-own]) [data-title]').first().click().catch(async () => {
      await page.locator('[data-task]:not([data-own]) [data-title]').first().click();
    });
    await page.waitForTimeout(500);
    const peek = page.locator('[data-peek]');
    if (await peek.isVisible().catch(() => false)) ok(`${W}: plan task opens the peek`); else fail(`${W}: peek did not open for a plan task`);
    if (await peek.locator('input[aria-label="Task title"]').count()) fail(`${W}: plan task title is editable`); else ok(`${W}: plan task title not editable`);
    if (await peek.getByText('Part of the plan. You can tick it, flag it and write notes, but not edit or remove it.').isVisible().catch(() => false)) ok(`${W}: "Part of the plan" line shown`); else fail(`${W}: "Part of the plan" line missing`);
    if (await peek.getByText('Difficulty').count()) ok(`${W}: problem shows Difficulty`); else fail(`${W}: Difficulty missing on a problem`);
    await page.screenshot({ path: join(shots, `peek-plan-${width}.png`) });
    await noScroll('peek plan');
    await peek.getByRole('button', { name: 'More actions' }).click();
    await page.waitForTimeout(200);
    if (await page.getByRole('menuitem', { name: 'Delete' }).count()) fail(`${W}: plan task offers Delete`); else ok(`${W}: plan task has no Delete`);
    await page.keyboard.press('Escape');
    await page.getByRole('menu').waitFor({ state: 'detached' }).catch(() => {}); // the menu's close animation still owns Esc
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    if (await peek.isVisible().catch(() => false)) fail(`${W}: Esc did not close the peek`); else ok(`${W}: Esc closes the peek`);

    // the own task: tick it, open it, edit the title, delete, undo
    await ownRow.first().locator('[role="checkbox"]').click();
    await page.waitForTimeout(200);
    await ownRow.first().locator('[data-title]').click();
    await page.waitForTimeout(500);
    const ti = peek.locator('input[aria-label="Task title"]');
    if (await ti.count()) ok(`${W}: own task title editable`); else fail(`${W}: own task title not editable`);
    if (await peek.getByText(/Added by You/).count()) ok(`${W}: own task shows Added by You`); else fail(`${W}: Added by You missing`);
    await ti.fill('Smoke dialog task renamed'); await ti.press('Enter');
    await page.waitForTimeout(300);
    if ((await saved()).custom?.[ownId]?.text === 'Smoke dialog task renamed') ok(`${W}: peek title edit saves`); else fail(`${W}: peek title edit not saved`);
    await page.screenshot({ path: join(shots, `peek-own-${width}.png`) });
    await noScroll('peek own');
    await peek.getByRole('button', { name: 'More actions' }).click();
    await page.waitForTimeout(200);
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.waitForTimeout(400);
    s = await saved();
    const renamed = page.locator('[data-task][data-own]').filter({ hasText: 'Smoke dialog task renamed' });
    if (!(await renamed.count()) && !s.custom?.[ownId] && !s.done?.[`u-${ownId}`] && !s.tnotes?.[`u-${ownId}`]) ok(`${W}: delete removes row, tick and note`); else fail(`${W}: delete left something behind`);
    await page.getByRole('button', { name: 'Undo' }).click();
    await page.waitForTimeout(400);
    s = await saved();
    if (await renamed.count() && s.custom?.[ownId] && s.done?.[`u-${ownId}`] && s.tnotes?.[`u-${ownId}`]?.body === 'Smoke dialog note') ok(`${W}: Undo restores row, tick and note`); else fail(`${W}: Undo did not restore everything`);
    if (await renamed.first().locator('[role="checkbox"][data-state="checked"]').count()) ok(`${W}: restored row still ticked`); else fail(`${W}: restored row not ticked`);
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- Progress: running total chart, forecast, future start date ----------
  for (const [width, height] of [[1100, 900], [390, 844]]) {
    for (const future of [false, true]) {
      const st = new Date(); st.setDate(st.getDate() + (future ? 5 : -9));
      const fx = { ...fixture, start: isoDay(st) };
      const ctx = await browser.newContext({ viewport: { width, height } });
      await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fx));
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
      page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
      await page.goto(`${URL}/#progress`, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
      await page.waitForTimeout(500);
      const W = `progress ${width}${future ? ' future' : ''}`;
      const noNaN = async label => { const t = await page.locator('body').innerText(); if (/NaN|Infinity/.test(t)) fail(`${W} ${label}: NaN in page text`); else ok(`${W} ${label}: no NaN`); };
      if (await page.getByText('Running total vs plan').first().isVisible().catch(() => false)) ok(`${W}: "Running total vs plan" band`); else fail(`${W}: no "Running total vs plan" band`);
      await noNaN('this month');
      const sfx = future ? '-future' : '';
      await page.screenshot({ path: join(shots, `progress-${width}-month${sfx}.png`), fullPage: true });
      await page.getByRole('radio', { name: 'Whole plan' }).click().catch(async () => { await page.getByText('Whole plan', { exact: true }).click(); });
      await page.waitForTimeout(300);
      if (!future) { if (await page.locator('[data-forecast]').count()) ok(`${W}: whole plan shows [data-forecast]`); else fail(`${W}: no [data-forecast] in whole plan`); }
      await noNaN('whole plan');
      if (width === 390) { const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 390) fail(`${W}: horizontal scroll (${sw})`); else ok(`${W}: scrollWidth ${sw}`); }
      await page.screenshot({ path: join(shots, `progress-${width}-plan${sfx}.png`), fullPage: true });
      if (!future && width === 1100) {
        // clicking a day in the chart opens it on Today
        await page.locator('[data-day="3"]').first().click({ force: true });
        await page.waitForTimeout(400);
        const hash = await page.evaluate(() => location.hash);
        const hdr = await page.locator('header').first().innerText().catch(() => '');
        if (hash === '' && /Day 3\b/.test(hdr)) ok(`${W}: clicking day 3 opens it on Today`); else fail(`${W}: day click → hash "${hash}", header "${hdr.replace(/\s+/g, ' ')}"`);
      }
      checkErrors(errors, W);
      await ctx.close();
    }
  }
} catch (e) {
  fail(`crashed: ${e.stack || e}`);
} finally {
  await browser.close();
}

if (failures.length) { console.log(`\n${failures.length} failure(s)`); process.exit(1); }
console.log('\nsmoke passed');
