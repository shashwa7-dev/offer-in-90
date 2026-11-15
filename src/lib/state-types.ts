/* Types for the v6 synced maps. Pure: no imports, so tests and other pure modules can use them. */

export type TrackId = 'dsa' | 'aib' | 'fe' | 'mc' | 'sd' | 'jt' | 'beh' | 'ai';
/** What the owner picked for one day, plus where each track's sequence stood. `basis` is the plan start the cursors
 * were taken against; with any other start the layout re-derives them (R11). */
export type ModeEntry = { mode: 'steady' | 'grind'; cursors: Record<TrackId, number>; basis?: string };
export type OwnerLabel = { id: string; name: string; color: string; group?: string; kind: 'label' | 'group'; single?: boolean };
/** A problem the owner added that is not in the plan. `pattern` is a PatternId. */
export type OwnProblem = { slug: string; url: string; name: string; diff: 'E' | 'M' | 'H'; pattern: string; at: number };
export type SolveLog = { unseen: boolean; minutes?: number; at: number; /** Task id whose tick created this log (a Phase 3 timed item); un-ticking that task removes it. */ via?: string };

export type RoutineKey = 'breakfast' | 'lunch' | 'dinner' | 'extra';
/** One owner-editable weekday slot (meal or gym). `s` is 'HH:MM'. */
export type RoutineSlot = { on: boolean; title: string; s: string; min: number };
/** Wake-up time in the routine map. `s` is 'HH:MM'. */
export type RoutineTime = { s: string };
/** The synced `routine` map: meal/gym slots plus wake-up. A missing key means its default. */
export type RoutineMap = Partial<Record<RoutineKey, RoutineSlot>> & { wake?: RoutineTime };
