// Smoke run against the dev server: every nav item renders without errors, desktop shows the sidebar,
// phone width shows the bottom bar with no horizontal scroll. Usage: node scripts/smoke.mjs <shots dir>
// Audio is always muted: the owner must never hear sound from a test run.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
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
      // scrolled to the end, the last surface must sit fully above the fixed bottom bar
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(200);
      const clear = await page.evaluate(() => {
        const bar = document.querySelector('[data-shell="bottom-bar"]')?.getBoundingClientRect().top ?? innerHeight;
        const boxes = [...document.querySelectorAll('[data-slot="sidebar-inset"] [data-surface]')].map(e => e.getBoundingClientRect().bottom);
        return { bar, bottom: boxes.length ? Math.max(...boxes) : null };
      });
      if (clear.bottom == null) fail(`390 ${v}: no [data-surface]`); else if (clear.bottom <= clear.bar) ok(`390 ${v}: last row clears the bottom bar (${Math.round(clear.bottom)} <= ${Math.round(clear.bar)})`); else fail(`390 ${v}: content hidden under the bottom bar (${Math.round(clear.bottom)} > ${Math.round(clear.bar)})`);
      await page.evaluate(() => window.scrollTo(0, 0));
      checkErrors(errors, `390 ${v}`);
      await page.screenshot({ path: join(shots, `shell-390-${v}.png`), fullPage: false });
    }
    await ctx.close();
  }
  // ---------- phone: getting back to today after opening another day ----------
  {
    const { ctx, page, errors } = await open(390, 844);
    const W = 'today 390 return';
    const bar = page.locator('[data-shell="bottom-bar"]');
    const hdr = () => page.locator('header').first().innerText().then(t => t.replace(/\s+/g, ' '));
    const todayHdr = await hdr();
    await bar.locator('[data-nav="progress"]').click();
    await page.waitForTimeout(500);
    await page.getByRole('radio', { name: 'Whole plan' }).click().catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('[data-day="3"]').first().click({ force: true });
    await page.waitForTimeout(400);
    const dayHdr = await hdr();
    if (/Day 3\b/.test(dayHdr)) ok(`${W}: opened day 3 (${dayHdr})`); else fail(`${W}: day 3 not opened (${dayHdr})`);
    const phoneToday = page.locator('[data-today-phone]');
    if (await phoneToday.isVisible()) ok(`${W}: phone Today control visible on a non-today day`); else fail(`${W}: phone Today control hidden`);
    const dateVisible = await page.evaluate(() => { const h = document.querySelector('header'); const els = [...h.querySelectorAll('li')]; const last = els[els.length - 1]; return last ? last.scrollWidth <= last.clientWidth + 1 : false; });
    if (dateVisible) ok(`${W}: date not truncated`); else fail(`${W}: date truncated in header`);
    await page.screenshot({ path: join(shots, 'today-390-otherday.png') });
    await phoneToday.click();
    await page.waitForTimeout(300);
    if (await hdr() === todayHdr) ok(`${W}: Today control returns to today`); else fail(`${W}: Today control did not return (${await hdr()})`);
    if (await phoneToday.count()) fail(`${W}: phone Today control still shown on today`); else ok(`${W}: control hidden on today`);
    // open day 3 again, then the bottom-bar Today
    await bar.locator('[data-nav="progress"]').click();
    await page.waitForTimeout(400);
    await page.getByRole('radio', { name: 'Whole plan' }).click().catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('[data-day="3"]').first().click({ force: true });
    await page.waitForTimeout(400);
    await bar.locator('[data-nav="progress"]').click();
    await page.waitForTimeout(300);
    await bar.locator('[data-nav="today"]').click();
    await page.waitForTimeout(400);
    if (await hdr() === todayHdr) ok(`${W}: bottom-bar Today after Progress resets to today`); else fail(`${W}: bottom-bar Today left on ${await hdr()}`);
    await page.getByRole('button', { name: 'Previous day' }).click();
    await page.waitForTimeout(200);
    await bar.locator('[data-nav="today"]').click();
    await page.waitForTimeout(300);
    if (await hdr() === todayHdr) ok(`${W}: tapping Today while on Today resets the day`); else fail(`${W}: Today tap on Today did not reset`);
    await page.screenshot({ path: join(shots, 'today-390.png') });
    checkErrors(errors, W);
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
    if (mc === 'rgb(111, 101, 92)') ok(`${W}: missed row is stone`); else fail(`${W}: missed row colour ${mc}`);
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
      const box = page.locator('[data-now] ~ [data-task] [data-status-icon]').first();
      const id = await page.locator('[data-now] ~ [data-task]').first().getAttribute('data-task');
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
    await ownRow.first().locator('[data-status-icon]').click();
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
    if (await renamed.first().locator('[data-status-icon][aria-pressed="true"]').count()) ok(`${W}: restored row still ticked`); else fail(`${W}: restored row not ticked`);
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- Task statuses: icon, menu, right-click, keys, peek (same fixed clock) ----------
  for (const [width, height] of [[1100, 900], [390, 844]]) {
    const at = new Date(2026, 10, 12, 14, 10);
    const st = new Date(at); st.setDate(st.getDate() - 9);
    const fx = { ...fixture, start: isoDay(st), done: {}, status: {}, notes: {}, updatedAt: +at };
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: width === 390 });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fx));
    const page = await ctx.newPage();
    await page.clock.install({ time: at });
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const W = `status ${width}`;
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('offer90.v1') || '{}'));
    const missedCount = () => page.evaluate(() => { const k = [...document.querySelectorAll('div')].find(e => e.textContent === 'Missed' && e.nextElementSibling); return parseInt(k?.nextElementSibling?.textContent || 'NaN', 10); });
    const rows = page.locator('[data-now] ~ [data-task]:not([data-own])');
    const idOf = async r => r.getAttribute('data-task');
    const nRows = await rows.count();
    if (nRows >= 2) ok(`${W}: now block has ${nRows} task rows`); else fail(`${W}: now block has only ${nRows} task rows`);
    // 1. click the icon: done
    const r0 = rows.nth(0), id0 = await idOf(r0);
    await r0.locator('[data-status-icon]').click(); await page.waitForTimeout(200);
    if ((await saved()).done?.[id0]) ok(`${W}: icon click marks done (${id0})`); else fail(`${W}: icon click did not mark done (${id0})`);
    if (await r0.locator('[data-status-icon][aria-pressed="true"]').count() && /: Done$/.test(await r0.locator('[data-status-icon]').getAttribute('aria-label') || '')) ok(`${W}: icon reads Done`); else fail(`${W}: icon not pressed / label not Done`);
    // 2. menu: In progress
    const r1 = rows.nth(1), id1 = await idOf(r1);
    await r1.hover();
    await r1.locator('[data-status-menu]').click(); await page.waitForTimeout(250);
    const opt = page.getByRole('menuitemradio', { name: /In progress/ });
    if (await opt.isVisible().catch(() => false)) ok(`${W}: status menu opens`); else fail(`${W}: status menu did not open`);
    if (await page.getByRole('menuitemradio', { name: /Not started/, checked: true }).count()) ok(`${W}: menu checks the current status`); else fail(`${W}: current status not checked`);
    await opt.click().catch(() => {}); await page.waitForTimeout(250);
    if ((await saved()).status?.[id1] === 'progress') ok(`${W}: menu sets In progress`); else fail(`${W}: In progress not saved (${JSON.stringify((await saved()).status)})`);
    if (/In progress/.test(await r1.innerText())) ok(`${W}: In progress chip shown`); else fail(`${W}: In progress chip missing`);
    // 3. right-click opens the same menu; S on a focused row too
    const r2 = rows.nth(0);
    await r2.locator('[data-title]').click({ button: 'right' }); await page.waitForTimeout(250);
    if (await page.getByRole('menu').isVisible().catch(() => false)) ok(`${W}: right-click opens the status menu`); else fail(`${W}: right-click did not open the menu`);
    { const sv = await saved(); if (sv.done?.[id0] && !sv.status?.[id0]) ok(`${W}: right-click release picks nothing`); else fail(`${W}: right-click changed the status`); }
    await page.keyboard.press('Escape'); await page.getByRole('menu').waitFor({ state: 'detached' }).catch(() => {}); await page.waitForTimeout(150);
    await r2.focus(); await page.keyboard.press('s'); await page.waitForTimeout(250);
    if (await page.getByRole('menu').isVisible().catch(() => false)) ok(`${W}: S opens the menu on a focused row`); else fail(`${W}: S did not open the menu`);
    await page.keyboard.press('Escape'); await page.getByRole('menu').waitFor({ state: 'detached' }).catch(() => {}); await page.waitForTimeout(150);
    // keys are ignored while typing
    await page.getByRole('button', { name: 'Add task' }).first().click();
    await page.getByPlaceholder('Task name, paste a link to attach it').fill('');
    await page.keyboard.type('4'); await page.waitForTimeout(150);
    if (Object.values((await saved()).status || {}).filter(v => v === 'skipped').length === 0) ok(`${W}: keys ignored while typing`); else fail(`${W}: a key typed in an input changed a status`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    // 4. key 4 on a focused missed row: skipped, missed count drops
    const before = await missedCount();
    await page.locator('[data-missed]').filter({ hasText: '05:15' }).click(); await page.waitForTimeout(250);
    const dsa = page.locator('[data-block="dsa"] + [data-task]');
    const idS = await dsa.getAttribute('data-task');
    await dsa.focus(); await page.keyboard.press('4'); await page.waitForTimeout(250);
    if ((await saved()).status?.[idS] === 'skipped') ok(`${W}: key 4 sets Skipped (${idS})`); else fail(`${W}: key 4 did not skip (${idS})`);
    const after = await missedCount();
    if (after === before - 1) ok(`${W}: missed count ${before} -> ${after}`); else fail(`${W}: missed count ${before} -> ${after}`);
    if (/Skipped/.test(await dsa.innerText())) ok(`${W}: Skipped chip shown`); else fail(`${W}: Skipped chip missing`);
    const deco = await dsa.locator('[data-title]').evaluate(e => getComputedStyle(e).textDecorationLine);
    if (deco === 'none') ok(`${W}: skipped text not struck through`); else fail(`${W}: skipped text decoration ${deco}`);
    await page.screenshot({ path: join(shots, `status-${width}.png`), fullPage: true });
    if (width === 390) { const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 390) fail(`${W}: horizontal scroll (${sw})`); else ok(`${W}: scrollWidth ${sw}`); }
    // 5. peek: same control and keys
    await dsa.locator('[data-title]').click(); await page.waitForTimeout(500);
    const peek = page.locator('[data-peek]');
    const pIcon = peek.locator('[data-status-icon]');
    if (await pIcon.count() && /: Skipped$/.test(await pIcon.getAttribute('aria-label') || '')) ok(`${W}: peek shows the status control (Skipped)`); else fail(`${W}: peek status control missing or wrong`);
    await page.keyboard.press('2'); await page.waitForTimeout(250);
    if ((await saved()).status?.[idS] === 'progress') ok(`${W}: key 2 in the peek sets In progress`); else fail(`${W}: key 2 in the peek did nothing`);
    await pIcon.click(); await page.waitForTimeout(250);
    if ((await saved()).done?.[idS] && !(await saved()).status?.[idS]) ok(`${W}: peek icon marks done`); else fail(`${W}: peek icon did not mark done`);
    await peek.locator('[data-status-menu]').click(); await page.waitForTimeout(250);
    await page.getByRole('menuitemradio', { name: /Skipped/ }).click().catch(() => {}); await page.waitForTimeout(250);
    if ((await saved()).status?.[idS] === 'skipped' && !(await saved()).done?.[idS]) ok(`${W}: peek menu sets Skipped`); else fail(`${W}: peek menu did not set Skipped`);
    await page.screenshot({ path: join(shots, `status-peek-${width}.png`) });
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
  // ---------- Roadmap: Timeline (default), Weeks, Reference › Changes ----------
  for (const [width, height] of [[1100, 900], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fixture));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(`${URL}/#roadmap`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const W = `roadmap ${width}`;
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('offer90.v1') || '{}'));
    const noScroll = async label => { if (width !== 390) return; const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 390) fail(`${W} ${label}: horizontal scroll (${sw})`); else ok(`${W} ${label}: scrollWidth ${sw}`); };
    const tl = page.locator('[data-timeline]');
    if (await tl.count()) ok(`${W}: Timeline is the default tab`); else fail(`${W}: no [data-timeline] on load`);
    const tracks = ['DSA', 'Frontend & CS', 'System design', 'Machine coding', 'AI', 'Career'];
    const missing = [];
    for (const t of tracks) if (!(await tl.locator('[data-track-name]').filter({ hasText: new RegExp(`^${t.replace(/[&]/g, '\\$&')}$`) }).count())) missing.push(t);
    if (!missing.length) ok(`${W}: 6 track names`); else fail(`${W}: missing tracks ${missing.join(', ')}`);
    if (await tl.getByText(/W\d+ · now/).count()) ok(`${W}: "W n · now" marker`); else fail(`${W}: no "W n · now" marker`);
    await noScroll('timeline');
    await page.screenshot({ path: join(shots, `roadmap-${width}-timeline.png`), fullPage: true });
    await page.getByRole('radio', { name: 'Weeks' }).click();
    await page.waitForTimeout(300);
    if (await page.getByText('Week 1', { exact: true }).first().isVisible().catch(() => false)) ok(`${W}: Weeks shows "Week 1"`); else fail(`${W}: no "Week 1" on Weeks`);
    await noScroll('weeks');
    await page.screenshot({ path: join(shots, `roadmap-${width}-weeks.png`), fullPage: true });
    await page.getByRole('radio', { name: 'Reference' }).click();
    await page.waitForTimeout(300);
    await noScroll('reference');
    await page.screenshot({ path: join(shots, `roadmap-${width}-reference.png`), fullPage: true });
    if (width === 1100) {
      // Today's plan-update link lands on Reference with Changes open; Mark read clears the notice.
      await page.locator('[data-slot="sidebar"] [data-nav="today"]').first().click();
      await page.waitForTimeout(300);
      const link = page.getByRole('button', { name: /^\d+ plan updates?$/ });
      if (await link.count()) {
        await link.click(); await page.waitForTimeout(400);
        const hash = await page.evaluate(() => location.hash);
        const changes = page.locator('[data-band="changes"]');
        const row = changes.locator('[data-update]').filter({ hasText: 'Google piloting an AI-assisted code comprehension round' });
        if (hash === '#roadmap' && await row.first().isVisible().catch(() => false)) ok(`${W}: plan update link opens Reference › Changes with the update`); else fail(`${W}: Changes not open after the notice link (hash ${hash})`);
        if ((await page.getByRole('radio', { name: 'Reference' }).getAttribute('data-state')) === 'on') ok(`${W}: Reference tab selected`); else fail(`${W}: Reference tab not selected`);
        await page.screenshot({ path: join(shots, `roadmap-${width}-changes.png`), fullPage: true });
        await row.first().getByRole('button', { name: 'Mark read' }).click();
        await page.waitForTimeout(200);
        if ((await saved()).seenUpdates?.['2026-11-09-google-ai-assisted-coding']) ok(`${W}: Mark read sets seenUpdates`); else fail(`${W}: Mark read did not save`);
        await page.locator('[data-slot="sidebar"] [data-nav="today"]').first().click();
        await page.waitForTimeout(300);
        if (await page.getByRole('button', { name: /^\d+ plan updates?$/ }).count()) fail(`${W}: notice still shows plan updates`); else ok(`${W}: Today notice cleared`);
      } else fail(`${W}: no plan update link in the Today notice`);
      // clicking a timeline bar opens a day on Today
      await page.locator('[data-slot="sidebar"] [data-nav="roadmap"]').first().click();
      await page.waitForTimeout(300);
      await page.getByRole('radio', { name: 'Timeline' }).click();
      await page.waitForTimeout(200);
      await page.locator('[data-timeline] [data-bar]').first().click();
      await page.waitForTimeout(400);
      const hash = await page.evaluate(() => location.hash);
      const hdr = await page.locator('header').first().innerText().catch(() => '');
      if (hash === '' && /Day \d+/.test(hdr)) ok(`${W}: bar click opens a day on Today (${hdr.replace(/\s+/g, ' ')})`); else fail(`${W}: bar click → hash "${hash}"`);
    }
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- Notes: two panes on desktop, list → document on phones, "/" focuses search ----------
  for (const [width, height] of [[1100, 800], [390, 844]]) {
    const fx = { ...fixture, tnotes: { 'p-two-sum': { title: 'Two Sum', body: 'Use a **hash map** of value → index.', upd: now - 3600e3 } } };
    const ctx = await browser.newContext({ viewport: { width, height } });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fx));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(`${URL}/#notes`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const W = `notes ${width}`;
    const list = page.locator('[data-notes-list]');
    const editor = page.locator('[data-note-editor]');
    const row = list.locator('[data-note-row]').filter({ hasText: 'Pattern cheat sheet' }).first();
    if (await row.isVisible().catch(() => false)) ok(`${W}: "Pattern cheat sheet" in the list`); else fail(`${W}: "Pattern cheat sheet" not in the list`);
    if (await list.getByText(/^Task notes/).first().isVisible().catch(() => false)) ok(`${W}: Task notes band`); else fail(`${W}: no Task notes band`);
    await page.locator('body').click({ position: { x: width - 5, y: 5 } }).catch(() => {});
    await page.keyboard.press('/');
    await page.waitForTimeout(150);
    if (await page.evaluate(() => document.activeElement?.getAttribute('data-notes-search') !== null && document.activeElement?.tagName === 'INPUT')) ok(`${W}: "/" focuses search`); else fail(`${W}: "/" did not focus search`);
    await page.keyboard.press('Escape');
    await page.locator('body').click({ position: { x: width - 5, y: 5 } }).catch(() => {});
    if (width === 1100) {
      if (await editor.locator('h1').filter({ hasText: 'Pattern cheat sheet' }).first().isVisible().catch(() => false)) ok(`${W}: right pane shows the page heading`); else fail(`${W}: no page heading in the right pane`);
      await page.screenshot({ path: join(shots, `notes-1100-page.png`) });
      await list.locator('[data-note-row]').filter({ hasText: 'Two Sum' }).first().click();
      await page.waitForTimeout(300);
      if (await editor.getByText('hash map').first().isVisible().catch(() => false) && !(await page.locator('[role="dialog"]').count())) ok(`${W}: task note opens in the right pane`); else fail(`${W}: task note did not open in the right pane`);
      await page.screenshot({ path: join(shots, `notes-1100-task.png`) });
    } else {
      if (await editor.count() && await editor.first().isVisible()) fail(`${W}: editor visible before a row is picked`); else ok(`${W}: list only at first`);
      await page.screenshot({ path: join(shots, `notes-390-list.png`) });
      await row.click();
      await page.waitForTimeout(300);
      if (await editor.locator('h1').filter({ hasText: 'Pattern cheat sheet' }).first().isVisible().catch(() => false) && !(await list.isVisible().catch(() => false))) ok(`${W}: row opens the document full width`); else fail(`${W}: row did not open the document`);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > 390) fail(`${W}: horizontal scroll (${sw})`); else ok(`${W}: scrollWidth ${sw}`);
      await page.screenshot({ path: join(shots, `notes-390-doc.png`) });
      const crumb = editor.getByRole('button', { name: 'Notes', exact: true });
      if (await crumb.count()) { await crumb.click(); await page.waitForTimeout(300); }
      if (await list.isVisible().catch(() => false)) ok(`${W}: "Notes" crumb returns to the list`); else fail(`${W}: "Notes" crumb did not return to the list`);
    }
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- "Open News" on the daily reads task lands on Reading and leaves the interviews visit alone ----------
  {
    const at = new Date(2026, 10, 12, 20, 10); // Thu 12 Nov 2026, 20:10: the AI block (news + papers) is current
    const st = new Date(at); st.setDate(st.getDate() - 9);
    const fx = { ...fixture, start: isoDay(st), done: {}, notes: {}, seenUpdates: { 'interviews-visit': 12345 }, updatedAt: +at };
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fx));
    const page = await ctx.newPage();
    await page.clock.install({ time: at });
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const W = 'open news';
    const task = page.locator('[data-task]').filter({ hasText: "Skim today's News" }).first();
    const btn = task.getByRole('button', { name: 'Open News' });
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(500);
      const reading = await page.getByRole('radio', { name: /^Reading/ }).first().getAttribute('data-state').catch(() => null);
      if (reading === 'on') ok(`${W}: daily reads task lands on Reading`); else fail(`${W}: Reading not active (${reading})`);
      const visit = await page.evaluate(() => JSON.parse(localStorage.getItem('offer90.v1') || '{}').seenUpdates?.['interviews-visit']);
      if (visit === 12345) ok(`${W}: interviews-visit unchanged`); else fail(`${W}: interviews-visit changed to ${visit}`);
      await page.getByRole('radio', { name: /^Interviews/ }).first().click();
      await page.waitForTimeout(300);
      const visit2 = await page.evaluate(() => JSON.parse(localStorage.getItem('offer90.v1') || '{}').seenUpdates?.['interviews-visit']);
      if (visit2 > 12345) ok(`${W}: switching to Interviews records the visit`); else fail(`${W}: Interviews visit not recorded (${visit2})`);
    } else fail(`${W}: no "Open News" on the daily reads task`);
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- News: Interviews feed, Reading, Saved ----------
  for (const [width, height] of [[1100, 800], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fixture));
    // outside links must not actually open: keep the click (and React's handler) but drop the navigation
    await ctx.addInitScript(() => document.addEventListener('click', e => { if (e.target instanceof Element && e.target.closest('a[target="_blank"]')) e.preventDefault(); }, true));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const W = `news ${width}`;
    const badge = page.locator('[data-slot="sidebar"] li').filter({ has: page.locator('[data-nav="news"]') }).locator('[data-slot="sidebar-menu-badge"]');
    const badgeN = async () => Number((await badge.first().innerText().catch(() => '0')) || 0);
    const before = width === 1100 ? await badgeN() : 0;
    await page.goto(`${URL}/#news`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const tab = name => page.getByRole('radio', { name: new RegExp(`^${name}`) }).first();
    if (await tab('Interviews').getAttribute('data-state').catch(() => null) === 'on') ok(`${W}: opens on Interviews`); else fail(`${W}: Interviews tab not active`);
    if (await tab('My targets').getAttribute('data-state').catch(() => null) === 'on') ok(`${W}: My targets active`); else fail(`${W}: My targets not active`);
    const posts = page.locator('[data-post]');
    const companiesOf = async () => posts.evaluateAll(els => els.map(e => e.getAttribute('data-company')));
    const targetsOnly = (await companiesOf()).every(c => ['Google', 'Meta'].includes(c));
    if ((await posts.count()) > 0 && targetsOnly) ok(`${W}: ${await posts.count()} target posts`); else fail(`${W}: target posts wrong (${(await companiesOf()).join(',')})`);
    if (width === 1100) {
      const after = await badgeN();
      if (after < before) ok(`${W}: sidebar News badge ${before} → ${after}`); else fail(`${W}: sidebar badge did not drop (${before} → ${after})`);
    }
    await page.screenshot({ path: join(shots, `news-${width}-interviews.png`) });
    // role FDE: only posts with an FDE chip, or the empty line
    await tab('FDE').click();
    await page.waitForTimeout(250);
    const n = await posts.count();
    const chips = await posts.evaluateAll(els => els.every(e => [...e.querySelectorAll('[data-role-chip]')].some(c => c.textContent === 'FDE')));
    if ((n && chips) || (!n && await page.getByText('No posts for these filters.').isVisible())) ok(`${W}: FDE filter (${n} posts)`); else fail(`${W}: FDE filter shows non-FDE posts`);
    await tab('All roles').click();
    await page.waitForTimeout(250);
    // Companies ▾ → Amazon only
    await page.locator('[data-companies]').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(shots, `news-${width}-companies.png`) });
    await page.getByRole('option', { name: /^Amazon/ }).first().click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const cs = await companiesOf();
    if (cs.length && cs.every(c => c === 'Amazon') && await posts.evaluateAll(els => els.every(e => e.textContent.includes('#Amazon')))) ok(`${W}: Amazon only (${cs.length} rows)`); else fail(`${W}: Amazon filter wrong (${cs.join(',')})`);
    const sw1 = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw1 > width) fail(`${W}: horizontal scroll on Interviews (${sw1})`); else ok(`${W}: Interviews scrollWidth ${sw1}`);
    await page.screenshot({ path: join(shots, `news-${width}-amazon.png`) });
    // save the first post (checked on Saved)
    await posts.first().getByRole('button', { name: /Save for later/ }).click();
    await page.waitForTimeout(250);
    // Reading
    await tab('Reading').click();
    await page.waitForTimeout(300);
    const links = page.locator('[data-reading] a[target="_blank"][rel="noopener noreferrer"]');
    if (await links.count()) ok(`${W}: ${await links.count()} reading links open in a new tab`); else fail(`${W}: no reading links with target=_blank`);
    const first = links.first();
    const wasRead = await first.getAttribute('data-read');
    await first.click();
    await page.waitForTimeout(300);
    if (!wasRead && await first.getAttribute('data-read') !== null) ok(`${W}: opened link turns grey (data-read)`); else fail(`${W}: opened link not marked read`);
    const sw2 = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw2 > width) fail(`${W}: horizontal scroll on Reading (${sw2})`); else ok(`${W}: Reading scrollWidth ${sw2}`);
    // manual read/unread toggle writes seenUpdates['n-<id>']; Mark all read clears the latest day
    const seenKeys = () => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('offer90.v1')).seenUpdates).filter(k => k.startsWith('n-')));
    const toggles = page.locator('[data-reading] [data-read-toggle]');
    const secondRow = toggles.nth(1);
    const k0 = (await seenKeys()).length;
    const pressed0 = await secondRow.getAttribute('aria-pressed');
    await secondRow.click();
    await page.waitForTimeout(400);
    const k1 = (await seenKeys()).length;
    if (pressed0 === 'false' ? k1 === k0 + 1 : k1 === k0 - 1) ok(`${W}: read toggle writes seenUpdates (n- keys ${k0} → ${k1})`); else fail(`${W}: read toggle did not write (${k0} → ${k1})`);
    await secondRow.click();
    await page.waitForTimeout(400);
    if ((await seenKeys()).length === k0) ok(`${W}: toggling again restores`); else fail(`${W}: second toggle did not restore`);
    await page.getByRole('radio', { name: /^All/ }).first().click().catch(() => {});
    await page.locator('[data-mark-all]').first().click();
    await page.waitForTimeout(400);
    const latestUnread = await page.locator('[data-reading] [data-read-toggle][aria-pressed="false"]').count();
    if (latestUnread === 0) ok(`${W}: Mark all read clears the latest day`); else fail(`${W}: ${latestUnread} unread after Mark all read`);
    if (width === 1100) { const after = await badgeN(); ok(`${W}: sidebar News badge after Mark all read: ${after}`); }
    await page.screenshot({ path: join(shots, `news-${width}-reading.png`) });
    // Saved: the saved post is listed, search, note and remove still work
    await tab('Saved').click();
    await page.waitForTimeout(300);
    const savedRows = page.locator('[data-saved]');
    if ((await savedRows.count()) === 1) ok(`${W}: saved post listed`); else fail(`${W}: Saved shows ${await savedRows.count()} rows`);
    await page.screenshot({ path: join(shots, `news-${width}-saved.png`) });
    await page.getByPlaceholder(/Search saved/).fill('zzzz-nothing');
    await page.waitForTimeout(150);
    if (!(await savedRows.count()) && await page.getByText('Nothing matches.').isVisible()) ok(`${W}: saved search filters`); else fail(`${W}: saved search did not filter`);
    await page.getByPlaceholder(/Search saved/).fill('');
    await page.waitForTimeout(150);
    await savedRows.first().getByRole('button', { name: /note/i }).click();
    await page.waitForTimeout(400);
    if (await page.locator('[role="dialog"]').isVisible()) ok(`${W}: note on saved item opens the side sheet`); else fail(`${W}: note sheet did not open`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await savedRows.first().getByRole('button', { name: /Remove/ }).click();
    await page.waitForTimeout(250);
    if (!(await savedRows.count())) ok(`${W}: saved item removed`); else fail(`${W}: saved item not removed`);
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- Setup: settings list, targets, confirmations, backup, reminders ----------
  {
    const fx = {
      ...fixture, targets: ['Google', 'Meta', 'Amazon'],
      flags: { 'two-sum': now }, notes: { 0: 'Set up the plan.', 1: 'Second day.' },
      pages: { pgkeep: { title: 'Keep me', body: 'kept body', upd: now } },
      bookmarks: { 'n-keep': { kind: 'news', title: 'Kept bookmark', url: 'https://example.com/a', source: 'Example', savedAt: now } },
      custom: { ckeep: { text: 'Kept own task', date: fixture.start, block: 'dsa', at: now } },
    };
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fx));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    await page.goto(`${URL}/#setup`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(500);
    const W = 'setup 1100';
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('offer90.v1') || '{}'));
    const toastSeen = async re => page.locator('[data-sonner-toast]').filter({ hasText: re }).first().isVisible().catch(() => false);
    const toGo = async v => { await page.locator(`[data-slot="sidebar"] [data-nav="${v}"]`).first().click(); await page.waitForTimeout(400); };

    const titles = await page.locator('[data-band] [data-slot="collapsible-trigger"]').allInnerTexts();
    const want = ['Your plan', 'Interviews', 'Sync and backup', 'Reminders', 'Start again'];
    const miss = want.filter(t => !titles.some(x => x.trim().startsWith(t)));
    if (!miss.length) ok(`${W}: five section titles`); else fail(`${W}: missing sections ${miss.join(', ')} (have ${titles.join(' | ')})`);
    if (await page.locator('input[type="password"]').first().isVisible().catch(() => false)) ok(`${W}: Gist token field visible when not connected`); else fail(`${W}: no token field`);
    if (await page.locator('a[href^="https://github.com/settings/personal-access-tokens"]').count()) ok(`${W}: GitHub token link`); else fail(`${W}: no GitHub token link`);
    const primaries = await page.locator('[data-surface] [data-slot="button"][data-variant="default"]').count();
    const ics = page.getByRole('button', { name: 'Download reminders.ics' });
    if (primaries === 1 && await ics.count()) ok(`${W}: Download .ics is the only primary button`); else fail(`${W}: ${primaries} primary buttons`);
    await page.screenshot({ path: join(shots, 'setup-1100.png'), fullPage: true });

    // prep-day switch
    const sw = page.getByRole('switch', { name: /prep day/i });
    const k0 = (await saved()).kickoff;
    await sw.click(); await page.waitForTimeout(200);
    if ((await saved()).kickoff === !k0) ok(`${W}: prep-day switch toggles kickoff`); else fail(`${W}: prep-day switch did nothing`);
    await sw.click(); await page.waitForTimeout(200);

    // start date picker saves immediately
    const s0 = (await saved()).start;
    await page.locator('[data-start-date]').click();
    await page.waitForTimeout(300);
    const day = page.locator('[data-slot="popover-content"] button[data-day]:not([disabled])').filter({ hasNotText: /^$/ });
    const pickN = await day.count();
    let picked = null;
    for (let i = 0; i < pickN; i++) { const d = day.nth(i); const v = await d.getAttribute('data-day'); if (v && !(await d.getAttribute('aria-selected'))) { picked = d; break; } }
    if (picked) { await picked.click(); await page.waitForTimeout(300); }
    const s1 = (await saved()).start;
    if (s1 && s1 !== s0 && /^\d{4}-\d{2}-\d{2}$/.test(s1)) ok(`${W}: picking a date saves start (${s0} → ${s1})`); else fail(`${W}: start date not saved (${s0} → ${s1})`);
    if (await toastSeen(/Download the calendar again/i)) ok(`${W}: start date toast`); else fail(`${W}: no start date toast`);
    await page.keyboard.press('Escape');
    await page.evaluate(st => { const s = JSON.parse(localStorage.getItem('offer90.v1')); s.start = st; localStorage.setItem('offer90.v1', JSON.stringify(s)); }, s0);
    await page.reload({ waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(400);

    // timetable sheet
    await page.getByRole('button', { name: 'View timetable' }).click();
    await page.waitForTimeout(400);
    const sheet = page.getByRole('dialog', { name: 'Daily timetable' });
    if (await sheet.isVisible().catch(() => false) && await sheet.getByText('Mon–Sat').count() && await sheet.getByText('Sunday').count() && await sheet.getByText('05:15–07:15').count()) ok(`${W}: timetable sheet shows both tables`); else fail(`${W}: timetable sheet missing`);
    await page.screenshot({ path: join(shots, 'setup-1100-timetable.png') });
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);

    // targets: remove Amazon, add a free-text company
    await page.getByRole('button', { name: 'Remove Amazon' }).click();
    await page.waitForTimeout(200);
    if (!(await saved()).targets.includes('Amazon')) ok(`${W}: Amazon removed from targets`); else fail(`${W}: Amazon still a target`);
    await page.getByRole('button', { name: 'Add target company' }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(shots, 'setup-1100-add-target.png') });
    const feedOpt = await page.getByRole('option').count();
    if (feedOpt > 0) ok(`${W}: Add lists ${feedOpt} feed companies`); else fail(`${W}: Add lists no companies`);
    if (await page.getByRole('option', { name: /^Google/ }).count()) fail(`${W}: Add lists a company already targeted`); else ok(`${W}: Add skips existing targets`);
    await page.locator('[cmdk-input]').fill('Zeta Labs');
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: 'Add “Zeta Labs”' }).click();
    await page.waitForTimeout(200);
    if ((await saved()).targets.includes('Zeta Labs')) ok(`${W}: free-text target added`); else fail(`${W}: free-text target not added`);
    await page.getByRole('button', { name: 'Remove Zeta Labs' }).click();
    await page.waitForTimeout(200);
    await toGo('news');
    await page.getByRole('radio', { name: /^Interviews/ }).first().click().catch(() => {});
    await page.waitForTimeout(300);
    const amazonRows = await page.locator('[data-post][data-company="Amazon"]').count();
    const amazonText = await page.locator('[data-post]').filter({ hasText: '#Amazon' }).count();
    if (!amazonRows && !amazonText) ok(`${W}: My targets has no #Amazon rows`); else fail(`${W}: My targets still shows ${amazonRows || amazonText} Amazon rows`);
    await toGo('setup');

    // Start over… → Cancel leaves ticks intact
    const done0 = Object.keys((await saved()).done || {}).length;
    await page.getByRole('button', { name: 'Start over…' }).click();
    await page.waitForTimeout(300);
    const alert = page.getByRole('alertdialog');
    if (await alert.isVisible().catch(() => false) && await alert.getByText('Start over from today?').count()) ok(`${W}: Start over opens an alert dialog`); else fail(`${W}: no Start over alert dialog`);
    await page.screenshot({ path: join(shots, 'setup-1100-start-over.png') });
    await alert.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(300);
    if (Object.keys((await saved()).done || {}).length === done0 && done0 > 0) ok(`${W}: Cancel keeps ${done0} ticks`); else fail(`${W}: Cancel changed ticks (${done0} → ${Object.keys((await saved()).done || {}).length})`);
    // Erase… → Cancel leaves everything
    await page.getByRole('button', { name: 'Erase…' }).click();
    await page.waitForTimeout(300);
    if (await alert.getByText('Erase everything?').count()) ok(`${W}: Erase opens an alert dialog`); else fail(`${W}: no Erase alert dialog`);
    await alert.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForTimeout(300);
    if (Object.keys((await saved()).done || {}).length === done0 && (await saved()).pages?.pgkeep) ok(`${W}: Erase cancel keeps everything`); else fail(`${W}: Erase cancel changed state`);

    // export, then import a modified copy, then an invalid file
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export backup' }).click()]);
    const exported = JSON.parse(readFileSync(await dl.path(), 'utf8'));
    if (exported.start && exported.pages?.pgkeep && /^offer90-backup-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename())) ok(`${W}: export downloads the state (${dl.suggestedFilename()})`); else fail(`${W}: export wrong (${dl.suggestedFilename()})`);
    const imp = join(shots, '..', 'smoke-import.json');
    writeFileSync(imp, JSON.stringify({ ...exported, notes: { 0: 'Imported by smoke' } }));
    await page.locator('input[type="file"]').setInputFiles(imp);
    await page.waitForTimeout(400);
    if ((await saved()).notes?.[0] === 'Imported by smoke' && await toastSeen(/Backup imported/)) ok(`${W}: import replaces the state`); else fail(`${W}: import did not apply`);
    writeFileSync(imp, JSON.stringify({ nope: true }));
    await page.locator('input[type="file"]').setInputFiles(imp);
    await page.waitForTimeout(400);
    if (await toastSeen(/not a valid backup/) && (await saved()).notes?.[0] === 'Imported by smoke') ok(`${W}: invalid import rejected`); else fail(`${W}: invalid import not rejected`);

    // reminders.ics
    const [ical] = await Promise.all([page.waitForEvent('download'), ics.click()]);
    const icsText = readFileSync(await ical.path(), 'utf8');
    if (ical.suggestedFilename() === 'reminders.ics' && icsText.startsWith('BEGIN:VCALENDAR') && /BEGIN:VEVENT/.test(icsText)) ok(`${W}: reminders.ics downloads`); else fail(`${W}: reminders.ics wrong`);

    // Start over → confirm: today is the start; ticks, flags and logs cleared; pages, bookmarks and own tasks kept
    await page.getByRole('button', { name: 'Start over…' }).click();
    await page.waitForTimeout(300);
    await alert.getByRole('button', { name: 'Start over' }).click();
    await page.waitForTimeout(400);
    let st = await saved();
    if (st.start === isoDay(new Date()) && !Object.keys(st.done).length && !Object.keys(st.flags).length && !Object.keys(st.notes).length && st.pages?.pgkeep && st.bookmarks?.['n-keep'] && st.custom?.ckeep) ok(`${W}: Start over resets the plan and keeps pages, bookmarks, own tasks`); else fail(`${W}: Start over wrong (${JSON.stringify({ start: st.start, done: Object.keys(st.done).length, flags: Object.keys(st.flags).length, notes: Object.keys(st.notes).length })})`);
    // Erase → confirm
    await page.getByRole('button', { name: 'Erase…' }).click();
    await page.waitForTimeout(300);
    await alert.getByRole('button', { name: 'Erase' }).click();
    await page.waitForTimeout(400);
    st = await saved();
    if (!st.pages?.pgkeep && !Object.keys(st.bookmarks || {}).length && !Object.keys(st.custom || {}).length && st.start && await toastSeen(/Everything cleared/)) ok(`${W}: Erase clears everything`); else fail(`${W}: Erase left data behind`);
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- Setup at 390 with a Gist connected (status, Sync now, Disconnect) ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); localStorage.setItem('offer90.sync', JSON.stringify({ token: 'smoke-token', gistId: 'smoke-gist' })); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fixture));
    await ctx.route('https://api.github.com/**', r => r.fulfill({ status: 401, contentType: 'application/json', body: '{"message":"Bad credentials"}' }));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    await page.goto(`${URL}/#setup`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.waitForTimeout(800);
    const W = 'setup 390 connected';
    if (await page.getByRole('button', { name: 'Sync now' }).isVisible().catch(() => false) && await page.getByRole('button', { name: /Disconnect/ }).isVisible().catch(() => false)) ok(`${W}: Sync now and Disconnect shown`); else fail(`${W}: Sync now / Disconnect missing`);
    if (await page.locator('[data-sync-status]').count()) ok(`${W}: status line (${(await page.locator('[data-sync-status]').innerText()).trim()})`); else fail(`${W}: no sync status`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > 390) fail(`${W}: horizontal scroll (${sw})`); else ok(`${W}: scrollWidth ${sw}`);
    await page.screenshot({ path: join(shots, 'setup-390-connected.png'), fullPage: true });
    // sync error shows on the phone: dot on More + the error line in the sheet
    if (await page.locator('[data-shell="bottom-bar"] [data-dot="sync"]').count()) ok(`${W}: sync-problem dot on More`); else fail(`${W}: no sync dot on More`);
    await page.locator('[data-shell="bottom-bar"] [data-nav="more"]').click();
    await page.waitForTimeout(400);
    const syncTxt = await page.locator('[data-shell="more-sheet"] [data-shell="sync"]').innerText().catch(() => '');
    if (/Sync problem/.test(syncTxt)) ok(`${W}: More sheet shows "${syncTxt.trim()}"`); else fail(`${W}: More sheet has no sync error line ("${syncTxt}")`);
    await page.screenshot({ path: join(shots, 'more-390-sync-error.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Disconnect/ }).click();
    await page.waitForTimeout(300);
    if (await page.locator('input[type="password"]').isVisible().catch(() => false)) ok(`${W}: Disconnect brings back the token field`); else fail(`${W}: no token field after Disconnect`);
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- Notes: New page clears the search so the new page shows ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 800 } });
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fixture));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    await page.goto(`${URL}/#notes`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const W = 'notes new page';
    await page.locator('[data-notes-search]').fill('zzzz-nothing');
    await page.waitForTimeout(150);
    await page.getByRole('button', { name: 'New page' }).click();
    await page.waitForTimeout(300);
    const q = await page.locator('[data-notes-search]').inputValue();
    const row = page.locator('[data-notes-list] [data-note-row]').filter({ hasText: 'Untitled' });
    if (!q && await row.first().isVisible().catch(() => false)) ok(`${W}: search cleared and the new page is listed`); else fail(`${W}: search "${q}", new page row visible: ${await row.count()}`);
    checkErrors(errors, W);
    await ctx.close();
  }
  // ---------- Every page: future start date, dark mode (desktop and phone) ----------
  for (const [label, opts, fx] of [
    ['future', { viewport: { width: 1100, height: 900 } }, { ...fixture, start: isoDay(new Date(Date.now() + 5 * 864e5)) }],
    ['future-390', { viewport: { width: 390, height: 844 } }, { ...fixture, start: isoDay(new Date(Date.now() + 5 * 864e5)) }],
    ['dark', { viewport: { width: 1100, height: 900 }, colorScheme: 'dark' }, fixture],
    ['dark-390', { viewport: { width: 390, height: 844 }, colorScheme: 'dark' }, fixture],
    ['light-390', { viewport: { width: 390, height: 844 } }, fixture],
  ]) {
    const ctx = await browser.newContext(opts);
    await ctx.addInitScript(f => { if (!sessionStorage.getItem('smoke-seeded')) { localStorage.setItem('offer90.v1', f); sessionStorage.setItem('smoke-seeded', '1'); } }, JSON.stringify(fx));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    for (const v of ['today', 'progress', 'roadmap', 'notes', 'news', 'setup']) {
      await page.goto(v === 'today' ? URL : `${URL}/#${v}`, { waitUntil: 'networkidle' });
      await page.reload({ waitUntil: 'networkidle' });
      await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
      await page.waitForTimeout(400);
      const W = `${label} ${v}`;
      const t = await page.locator('body').innerText();
      if (/NaN|Infinity|undefined/.test(t)) fail(`${W}: NaN/undefined in page text`);
      if (opts.viewport.width === 390) { const sw = await page.evaluate(() => document.documentElement.scrollWidth); if (sw > 390) fail(`${W}: horizontal scroll (${sw})`); }
      checkErrors(errors, W);
      await page.screenshot({ path: join(shots, `all-${label}-${v}.png`), fullPage: true });
    }
    await ctx.close();
  }
  // ---------- No old design tokens left outside src/components/ui ----------
  {
    let hits = '';
    try { hits = execSync(`grep -rnE "c-(dsa|fe|mc|sd|beh|ai|fde|proj|ux|review|update|health)|text-(good|warn|bad)|bg-(good|warn|bad)|font-display|font-mono|catColor" src --exclude-dir=ui`, { encoding: 'utf8' }); } catch { hits = ''; }
    if (!hits.trim()) ok('grep: no old design tokens'); else fail(`grep: old design tokens left:\n${hits}`);
  }
} catch (e) {
  fail(`crashed: ${e.stack || e}`);
} finally {
  await browser.close();
}

if (failures.length) { console.log(`\n${failures.length} failure(s)`); process.exit(1); }
console.log('\nsmoke passed');
