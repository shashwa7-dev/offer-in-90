'use client';
/* App state: saved in this browser first, then synced to a private Gist when a token is set. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildPlan, dayIndexOf, iso, type Day, type UpdateItem, type UpdatesFeed } from './engine';
import { seedPages, type Page } from './seed-pages';
import * as gist from './gist';

export interface TaskNote { title: string; body: string; upd: number; url?: string }
export interface State {
  v: number; start: string; kickoff: boolean;
  done: Record<string, number>; flags: Record<string, number>; notes: Record<string, string>;
  tnotes: Record<string, TaskNote>; pages: Record<string, Page>; seenUpdates: Record<string, number>;
  updatedAt: number;
}
type SyncStatus = { state: 'off' | 'syncing' | 'synced' | 'error'; msg?: string; at?: number };

const KEY = 'offer90.v1', SYNC_KEY = 'offer90.sync';
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const fresh = (): State => ({ v: 5, start: iso(new Date()), kickoff: true, done: {}, flags: {}, notes: {}, tnotes: {}, pages: seedPages(), seenUpdates: {}, updatedAt: 0 });
function normalize(s: Partial<State> | null): State {
  const f = fresh();
  if (!s || !s.start) return f;
  return { ...f, ...s, pages: { ...seedPages(), ...(s.pages || {}) }, seenUpdates: s.seenUpdates || {}, v: 5 };
}
const readLS = <T,>(k: string): T | null => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; } };
const writeLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

interface Ctx {
  ready: boolean; state: State; days: Day[]; todayIdx: number; updates: UpdateItem[]; feedAt?: string;
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
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const pullRemote = useCallback(async (c: gist.SyncConfig) => {
    if (!c.gistId) return;
    setSync({ state: 'syncing' });
    try {
      const remote = await gist.pull<State>(c as Required<gist.SyncConfig>);
      setState(local => {
        if (remote && remote.updatedAt > local.updatedAt && !dirty.current) { const n = normalize(remote); writeLS(KEY, n); return n; }
        if (remote && local.updatedAt > remote.updatedAt) dirty.current = true;
        return local;
      });
      setSync({ state: 'synced', at: Date.now() });
    } catch (e) { setSync({ state: 'error', msg: (e as Error).message }); }
  }, []);

  const pushRemote = useCallback(async (c: gist.SyncConfig, s: State) => {
    if (!c.gistId) return;
    setSync({ state: 'syncing' });
    try { await gist.push(c as Required<gist.SyncConfig>, s); dirty.current = false; setSync({ state: 'synced', at: Date.now() }); }
    catch (e) { setSync({ state: 'error', msg: (e as Error).message }); }
  }, []);

  // pull on start and whenever the tab comes back
  useEffect(() => {
    if (!cfg?.gistId) return;
    pullRemote(cfg);
    const onVis = () => { if (!document.hidden && !dirty.current) pullRemote(cfg); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [cfg, pullRemote]);

  // push after changes (debounced)
  useEffect(() => {
    if (!ready || !cfg?.gistId || !dirty.current) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => pushRemote(cfg, state), 1500);
  }, [state, cfg, ready, pushRemote]);

  const update = useCallback((fn: (s: State) => State) => {
    setState(prev => { const n = { ...fn(prev), updatedAt: Date.now() }; writeLS(KEY, n); dirty.current = true; return n; });
  }, []);
  const replace = useCallback((s: Partial<State>) => update(() => normalize(s)), [update]);

  const connectSync = useCallback(async (token: string) => {
    setSync({ state: 'syncing' });
    try {
      const gistId = await gist.connect(token, { ...state, updatedAt: state.updatedAt || Date.now() });
      const c = { token, gistId }; writeLS(SYNC_KEY, c); setCfg(c);
      await pullRemote(c);
    } catch (e) { setSync({ state: 'error', msg: (e as Error).message }); }
  }, [state, pullRemote]);
  const disconnectSync = useCallback(() => { try { localStorage.removeItem(SYNC_KEY); } catch { /* ignore */ } setCfg(null); setSync({ state: 'off' }); }, []);
  const syncNow = useCallback(async () => { if (cfg) { if (dirty.current) await pushRemote(cfg, state); else await pullRemote(cfg); } }, [cfg, state, pullRemote, pushRemote]);

  const days = useMemo(() => buildPlan(state.start, state.kickoff, updates), [state.start, state.kickoff, updates]);
  const todayIdx = dayIndexOf(state.start, now);

  const value: Ctx = { ready, state, days, todayIdx, updates, feedAt, update, replace, sync, syncConfigured: !!cfg?.gistId, connectSync, disconnectSync, syncNow };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
