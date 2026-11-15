/* Types for the v6 synced maps. Pure: no imports, so tests and other pure modules can use them. */

export type TrackId = 'dsa' | 'aib' | 'fe' | 'mc' | 'sd' | 'jt' | 'beh' | 'ai';
/** What the owner picked for one day, plus where each track's sequence stood. */
export type ModeEntry = { mode: 'steady' | 'grind'; cursors: Record<TrackId, number> };
export type OwnerLabel = { id: string; name: string; color: string; group?: string; kind: 'label' | 'group'; single?: boolean };
/** A problem the owner added that is not in the plan. `pattern` is a PatternId. */
export type OwnProblem = { slug: string; url: string; name: string; diff: 'E' | 'M' | 'H'; pattern: string; at: number };
export type SolveLog = { unseen: boolean; minutes?: number; at: number };
