'use client';
/* App state: saved in this browser first, then synced to a private Gist when a token is set. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildPlan, dayIndexOf, iso, type CustomTask, type Day, type NewsFeed, type PulseWeek, type UpdateItem, type UpdatesFeed } from './engine';
import { seedPages, type Page } from './seed-pages';
import * as gist from './gist';
import type { ThreadsFeed } from '@/components/interview-pulse';
import { merge, sameData, stamp } from './sync-merge';

export interface TaskNote { title: string; body: string; upd: number; url?: string }
/** A saved copy of a news item, interview thread or plan update, kept after it leaves the feed. */
export interface Bookmark { kind: 'news' | 'thread' | 'update'; title: string; url: string; source: string; detail?: string; savedAt: number }
export interface State {
  v: number; start: string; kickoff: boolean;
  done: Record<string, number>; flags: Record<string, number>; notes: Record<string, string>;
  tnotes: Record<string, TaskNote>; pages: Record<string, Page>; seenUpdates: Record<string, number>; bookmarks: Record<string, Bookmark>; custom: Record<string, CustomTask>;
  meta: Record<string, number>; updatedAt: number;
}
type SyncStatus = { state: 'off' | 'syncing' | 'synced' | 'error'; msg?: string; at?: number };

const KEY = 'offer90.v1', SYNC_KEY = 'offer90.sync';
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const fresh = (): State => ({ v: 5, start: iso(new Date()), kickoff: true, done: {}, flags: {}, notes: {}, tnotes: {}, pages: seedPages(), seenUpdates: {}, bookmarks: {}, custom: {}, meta: {}, updatedAt: 0 });
function normalize(s: Partial<State> | null): State {
  const f = fresh();
  if (!s || !s.start) return f;
  return { ...f, ...s, pages: s.pages ?? seedPages(), seenUpdates: s.seenUpdates || {}, bookmarks: s.bookmarks || {}, custom: s.custom || {}, meta: s.meta || {}, v: 5 };
}
const readLS = <T,>(k: string): T | null => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } };
const writeLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

interface Ctx {
  ready: boolean; state: State; days: Day[]; todayIdx: number; updates: UpdateItem[]; feedAt?: string; news: NewsFeed | null; pulse: PulseWeek[]; threads: ThreadsFeed | null;
  update: (fn: (s: State) => State) => void; replace: (s: Partial<State>) => void;
  sync: SyncStatus; syncConfigured: boolean; connectSync: (token: string) => Promise<void>; disconnectSync: () => void; syncNow: () => Promise<void>;
}
const StoreCtx = createContext<Ctx | null>(null);
export const useStore = () => { const c = useContext(StoreCtx); if (!c) throw new Error('StoreProvider missing'); return c; };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<State>(fresh);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [feedAt, setFeedAt] = useState<string>();
  const [news, setNews] = useState<NewsFeed | null>(null);
  const [pulse, setPulse] = useState<PulseWeek[]>([]);
  const [threads, setThreads] = useState<ThreadsFeed | null>(null);
  const [sync, setSync] = useState<SyncStatus>({ state: 'off' });
  const [cfg, setCfg] = useState<gist.SyncConfig | null>(null);
  const [now, setNow] = useState(() => new Date());
  const dirty = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load local state + sync config + update feed
  useEffect(() => {
    setState(normalize(readLS<State>(KEY)));
    setCfg(readLS<gist.SyncConfig>(SYNC_KEY));
    setReady(true);
    fetch(`${BASE}/updates.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then((f: UpdatesFeed | null) => { if (f) { setUpdates(f.items || []); setFeedAt(f.generatedAt); } }).catch(() => {});
    fetch(`${BASE}/news.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then((n: NewsFeed | null) => setNews(n)).catch(() => {});
    fetch(`${BASE}/pulse.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then((p: { weeks: PulseWeek[] } | null) => setPulse(p?.weeks || [])).catch(() => {});
    fetch(`${BASE}/interview-threads.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)).then((t: ThreadsFeed | null) => setThreads(t)).catch(() => {});
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ---------- sync: pull → merge item by item → push if needed. One run at a time. ----------
  const stateRef = useRef(state);
  stateRef.current = state;
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const running = useRef<Promise<void> | null>(null);
  const again = useRef(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncOnce = useCallback(async (): Promise<void> => {
    const c = cfgRef.current;
    if (!c?.gistId) return;
    if (running.current) { again.current = true; return running.current; }
    const run = (async () => {
      setSync({ state: 'syncing' });
      try {
        const remote = await gist.pull<State>(c as Required<gist.SyncConfig>);
        const local = stateRef.current;
        const merged = remote ? normalize(merge(local, normalize(remote))) : local;
        // apply remote changes locally (only if something actually changed)
        if (!sameData(merged, local)) {
          setState(cur => { const m = cur === local ? merged : normalize(merge(cur, merged)); writeLS(KEY, m); return m; });
          stateRef.current = merged;
        }
        // upload if the Gist is missing anything we have
        if (!remote || !sameData(merged, normalize(remote)) || JSON.stringify(merged.meta) !== JSON.stringify(remote.meta || {})) {
          await gist.push(c as Required<gist.SyncConfig>, merged);
        }
        dirty.current = false;
        if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
        setSync({ state: 'synced', at: Date.now() });
      } catch (e) {
        setSync({ state: 'error', msg: `${(e as Error).message} Retrying in 30 s.` });
        if (retryTimer.current) clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => { void syncOnce(); }, 30_000);
      }
    })();
    running.current = run;
    try { await run; } finally {
      running.current = null;
      if (again.current) { again.current = false; void syncOnce(); }
    }
  }, []);

  // sync on start, every 60 s while visible, when the tab comes back, when going online, and flush when leaving
  useEffect(() => {
    if (!cfg?.gistId) return;
    void syncOnce();
    const tick = setInterval(() => { if (!document.hidden) void syncOnce(); }, 60_000);
    const onVis = () => { void syncOnce(); };
    const onOnline = () => { void syncOnce(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('online', onOnline);
    return () => { clearInterval(tick); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('online', onOnline); };
  }, [cfg, syncOnce]);

  // after local edits, sync 1.5 s after the last change
  useEffect(() => {
    if (!ready || !cfg?.gistId || !dirty.current) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => { void syncOnce(); }, 1500);
  }, [state, cfg, ready, syncOnce]);

  const update = useCallback((fn: (s: State) => State) => {
    setState(prev => { const n = stamp(prev, fn(prev)); writeLS(KEY, n); dirty.current = true; return n; });
  }, []);
  const replace = useCallback((s: Partial<State>) => update(() => normalize(s)), [update]);

  const connectSync = useCallback(async (token: string) => {
    setSync({ state: 'syncing' });
    try {
      const gistId = await gist.connect(token, stateRef.current);
      const c = { token, gistId }; writeLS(SYNC_KEY, c); cfgRef.current = c; setCfg(c);
      await syncOnce();
    } catch (e) { setSync({ state: 'error', msg: (e as Error).message }); }
  }, [syncOnce]);
  const disconnectSync = useCallback(() => { try { localStorage.removeItem(SYNC_KEY); } catch { /* ignore */ } cfgRef.current = null; setCfg(null); setSync({ state: 'off' }); }, []);
  const syncNow = useCallback(async () => { await syncOnce(); }, [syncOnce]);

  const days = useMemo(() => buildPlan(state.start, state.kickoff, updates, state.custom), [state.start, state.kickoff, updates, state.custom]);
  const todayIdx = dayIndexOf(state.start, now);

  const value: Ctx = { ready, state, days, todayIdx, updates, feedAt, news, pulse, threads, update, replace, sync, syncConfigured: !!cfg?.gistId, connectSync, disconnectSync, syncNow };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
