/* Private GitHub Gist as a tiny database: one JSON file, read and written with a gist-only token. */
const API = 'https://api.github.com';
const DESC = 'offer-in-90 data (private)';
const FILE = 'offer90.json';

export interface SyncConfig { token: string; gistId?: string }

const headers = (token: string) => ({ Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });

async function check(r: Response) {
  if (r.ok) return r;
  const msg = r.status === 401 ? 'The token was rejected. Create a new one with Gists read/write access.' : r.status === 403 ? 'GitHub refused the request (permission or rate limit).' : r.status === 404 ? 'The data Gist was not found.' : `GitHub error ${r.status}.`;
  throw new Error(msg);
}

/** Find the data gist, or create a private one. */
export async function connect(token: string, initial: unknown): Promise<string> {
  for (let page = 1; page <= 5; page++) {
    const r = await check(await fetch(`${API}/gists?per_page=100&page=${page}`, { headers: headers(token) }));
    const list = (await r.json()) as { id: string; description: string; files: Record<string, unknown> }[];
    const hit = list.find(g => g.description === DESC && g.files[FILE]);
    if (hit) return hit.id;
    if (list.length < 100) break;
  }
  const r = await check(await fetch(`${API}/gists`, { method: 'POST', headers: headers(token), body: JSON.stringify({ description: DESC, public: false, files: { [FILE]: { content: JSON.stringify(initial) } } }) }));
  return ((await r.json()) as { id: string }).id;
}

export async function pull<T>(cfg: Required<SyncConfig>): Promise<T | null> {
  const r = await check(await fetch(`${API}/gists/${cfg.gistId}`, { headers: headers(cfg.token), cache: 'no-store' }));
  const g = (await r.json()) as { files: Record<string, { content: string; truncated: boolean; raw_url: string }> };
  const f = g.files[FILE];
  if (!f) return null;
  const text = f.truncated ? await (await fetch(f.raw_url, { cache: 'no-store' })).text() : f.content;
  try { return JSON.parse(text) as T; } catch { return null; }
}

export async function push(cfg: Required<SyncConfig>, data: unknown) {
  await check(await fetch(`${API}/gists/${cfg.gistId}`, { method: 'PATCH', headers: headers(cfg.token), body: JSON.stringify({ files: { [FILE]: { content: JSON.stringify(data) } } }) }));
}
