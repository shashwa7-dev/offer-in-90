/*
 * Owner labels and system labels. Pure: no runtime imports.
 * Every function returns new plain maps. A deleted label or group is simply absent from the
 * returned map; the store layer stamps the deletion (see sync-merge.ts).
 */

type OwnerLabel = { id: string; name: string; color: string; group?: string; kind: 'label' | 'group'; single?: boolean };
type Labels = Record<string, OwnerLabel>;
type State = { labels: Labels; itemLabels: Record<string, string[]> };

export type TaskMeta = { id: string; own?: string; pattern?: string; tier?: 'must' | 'optional'; flags?: ('hot' | 'hard-hot')[]; depth?: boolean; flagged?: boolean };

export const SYSTEM_GROUPS = [
  { id: 'pattern', name: 'Pattern', single: true },
  { id: 'tier', name: 'Tier', single: true },
  { id: 'frequency', name: 'Frequency', single: false },
  { id: 'source', name: 'Source', single: true },
  { id: 'status-flag', name: 'Status', single: false },
  { id: 'depth', name: 'Depth', single: false },
] as const;

/** Fixed system label names, so an owner label cannot shadow them. */
const SYSTEM_NAMES = ['must', 'optional', 'hot', 'hard hot', 'hard-hot', 'yours', 'plan', 'flagged'];

export function systemLabelsFor(t: TaskMeta): string[] {
  const out: string[] = [];
  if (t.pattern) out.push(`sys:pattern:${t.pattern}`);
  if (t.tier) out.push(`sys:tier:${t.tier}`);
  for (const f of t.flags || []) out.push(`sys:freq:${f}`);
  out.push(t.own ? 'sys:source:yours' : 'sys:source:plan');
  if (t.flagged) out.push('sys:flagged');
  if (t.depth) out.push('sys:depth');
  return out;
}

const norm = (s: string) => s.trim().toLowerCase();

function nameError(labels: Labels, name: string, exceptId?: string): 'duplicate' | 'empty' | null {
  const n = norm(name);
  if (!n) return 'empty';
  if (SYSTEM_GROUPS.some(g => norm(g.name) === n) || SYSTEM_NAMES.includes(n)) return 'duplicate';
  if (Object.values(labels).some(l => l.id !== exceptId && norm(l.name) === n)) return 'duplicate';
  return null;
}

const newId = () => 'lb-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function createLabel(labels: Labels, input: { name: string; color: string; group?: string }): { labels: Labels; id: string } | { error: 'duplicate' | 'empty' } {
  const error = nameError(labels, input.name);
  if (error) return { error };
  let id = newId();
  while (labels[id]) id = newId();
  const label: OwnerLabel = { id, name: input.name.trim(), color: input.color, kind: 'label' };
  if (input.group) label.group = input.group;
  return { labels: { ...labels, [id]: label }, id };
}

export function createGroup(labels: Labels, input: { name: string; single: boolean }): { labels: Labels; id: string } | { error: 'duplicate' | 'empty' } {
  const error = nameError(labels, input.name);
  if (error) return { error };
  let id = newId();
  while (labels[id]) id = newId();
  return { labels: { ...labels, [id]: { id, name: input.name.trim(), color: '', kind: 'group', single: input.single } }, id };
}

export function renameLabel(labels: Labels, id: string, name: string): { labels: Labels } | { error: 'duplicate' | 'empty' } {
  if (!labels[id]) return { labels };
  const error = nameError(labels, name, id);
  if (error) return { error };
  return { labels: { ...labels, [id]: { ...labels[id], name: name.trim() } } };
}

export function recolorLabel(labels: Labels, id: string, color: string): Labels {
  return labels[id] ? { ...labels, [id]: { ...labels[id], color } } : labels;
}

/** Delete a label, or a group together with its labels, and remove them from every item. */
export function deleteLabel(state: State, id: string): State {
  const target = state.labels[id];
  if (!target) return state;
  const gone = new Set([id]);
  if (target.kind === 'group') for (const l of Object.values(state.labels)) if (l.group === id) gone.add(l.id);
  const labels: Labels = {};
  for (const [k, l] of Object.entries(state.labels)) if (!gone.has(k)) labels[k] = l;
  const itemLabels: Record<string, string[]> = {};
  for (const [item, ids] of Object.entries(state.itemLabels)) {
    const kept = ids.filter(x => !gone.has(x));
    if (kept.length) itemLabels[item] = kept;
  }
  return { labels, itemLabels };
}

/** Apply an owner label to an item. System ids, groups and unknown ids are ignored. A single-choice group keeps one label per item. */
export function applyLabel(state: State, itemId: string, labelId: string): State {
  const label = state.labels[labelId];
  if (!label || label.kind !== 'label') return state;
  const cur = state.itemLabels[itemId] || [];
  if (cur.includes(labelId)) return state;
  const grp = label.group ? state.labels[label.group] : undefined;
  const base = grp?.single ? cur.filter(x => state.labels[x]?.group !== label.group) : cur;
  return { ...state, itemLabels: { ...state.itemLabels, [itemId]: [...base, labelId] } };
}

export function removeLabel(state: State, itemId: string, labelId: string): State {
  const cur = state.itemLabels[itemId];
  if (!cur || !cur.includes(labelId)) return state;
  const next = cur.filter(x => x !== labelId);
  const itemLabels = { ...state.itemLabels };
  if (next.length) itemLabels[itemId] = next; else delete itemLabels[itemId];
  return { ...state, itemLabels };
}

export function labelsOf(itemLabels: Record<string, string[]>, t: TaskMeta): string[] {
  return [...(itemLabels[t.id] || []), ...systemLabelsFor(t)];
}

/** The label ids a task may show or match. An unseen check that is still hidden (not started, or skipped) keeps every
 * system label back except Source, so no pattern, tier, frequency or depth hints at what it is. Owner labels stay. */
export function visibleLabelIds(ids: string[], hidden: boolean): string[] {
  return hidden ? ids.filter((id) => !id.startsWith('sys:') || id.startsWith('sys:source:')) : ids;
}
