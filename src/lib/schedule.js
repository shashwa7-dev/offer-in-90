 
// Daily timetable + calendar (.ics) builder.
// Used by index.html in the browser and by `node schedule.js <start-date>` to write reminders.ics.

export const WEEKDAY_BLOCKS = [
  { s: '05:00', e: '05:15', k: 'wake',      title: 'Wake up, water, freshen up', kind: 'life' },
  { s: '05:15', e: '07:15', k: 'dsa',       title: 'Deep work 1 · DSA, new problems', kind: 'study', remind: true },
  { s: '07:15', e: '08:00', k: 'breakfast', title: 'Breakfast, get ready', kind: 'life', remind: true },
  { s: '08:00', e: '10:00', k: 'fe',        title: 'Deep work 2 · Frontend & CS core', kind: 'study', remind: true },
  { s: '10:00', e: '10:15', k: 'break1',    title: 'Break: walk, stretch, water', kind: 'life' },
  { s: '10:15', e: '11:45', k: 'mc',        title: 'Deep work 3 · Machine coding', kind: 'study', remind: true },
  { s: '11:45', e: '13:00', k: 'lunch',     title: 'Lunch + 20 min power nap', kind: 'life', remind: true },
  { s: '13:00', e: '14:30', k: 'sd',        title: 'Deep work 4 · System design', kind: 'study', remind: true },
  { s: '14:30', e: '14:45', k: 'break2',    title: 'Tea break, away from screen', kind: 'life' },
  { s: '14:45', e: '16:00', k: 'rev',       title: 'DSA revision (spaced repetition)', kind: 'study', remind: true },
  { s: '16:00', e: '17:00', k: 'beh',       title: 'Career · behavioral, forward-deployed, applications', kind: 'study', remind: true },
  { s: '17:00', e: '18:00', k: 'free',      title: 'Outdoor walk, sunlight, pre-gym snack', kind: 'life', remind: true },
  { s: '18:00', e: '19:00', k: 'workout',   title: 'Gym', kind: 'health', remind: true },
  { s: '19:00', e: '19:15', k: 'shower',    title: 'Shower', kind: 'life' },
  { s: '19:15', e: '20:00', k: 'dinner',    title: 'Dinner + family time', kind: 'life', remind: true },
  { s: '20:00', e: '21:00', k: 'ai',        title: 'AI: news + papers & courses', kind: 'study', remind: true },
  { s: '21:00', e: '21:30', k: 'review',    title: 'Daily review: tick boxes, write log', kind: 'study', remind: true },
  { s: '21:30', e: '22:00', k: 'wind',      title: 'Wind down, no screens · sleep at 22:00', kind: 'life', remind: true },
];

export const SUNDAY_BLOCKS = [
  { s: '05:00', e: '05:15', k: 'wake',      title: 'Wake up, water, freshen up', kind: 'life' },
  { s: '05:15', e: '06:15', k: 'workout',   title: 'Long walk or easy run', kind: 'health', remind: true },
  { s: '06:30', e: '08:00', k: 'mock',      title: 'Weekly mock test (timed)', kind: 'study', remind: true },
  { s: '08:00', e: '09:00', k: 'breakfast', title: 'Breakfast', kind: 'life' },
  { s: '09:00', e: '11:00', k: 'catchup',   title: 'Catch-up: missed tasks + flagged problems', kind: 'study', remind: true },
  { s: '11:00', e: '12:00', k: 'weekly',    title: 'Weekly reflection + next week preview', kind: 'study', remind: true },
  { s: '12:00', e: '20:30', k: 'rest',      title: 'Rest day: family, friends, outside. No study.', kind: 'life', remind: true },
  { s: '20:30', e: '21:00', k: 'review',    title: 'Prepare for Monday: bag, desk, sleep early', kind: 'study', remind: true },
  { s: '21:30', e: '22:00', k: 'wind',      title: 'Wind down · sleep at 22:00', kind: 'life' },
];

function pad(n) { return String(n).padStart(2, '0'); }
function ymd(d) { return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`; }
function parseISO(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }

export function buildICS(startISO, totalDays = 91) {
  const start = parseISO(startISO);
  const end = new Date(start); end.setDate(end.getDate() + totalDays - 1);
  const until = `${ymd(end)}T235959`;
  const firstSunday = new Date(start);
  while (firstSunday.getDay() !== 0) firstSunday.setDate(firstSunday.getDate() + 1);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FAANG Prep//90 Day Plan//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Interview Prep 90'];
  const add = (b, day, byday, tag) => {
    const t = (hm) => hm.replace(':', '') + '00';
    lines.push(
      'BEGIN:VEVENT',
      `UID:${tag}-${b.k}-${startISO}@faang-prep`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${ymd(day)}T${t(b.s)}`,
      `DTEND:${ymd(day)}T${t(b.e)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${until}`,
      `SUMMARY:${b.title}`,
      'DESCRIPTION:Open your prep dashboard (faang-prep/index.html) to see exactly what to do in this block.',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${b.title}`, 'TRIGGER:-PT2M', 'END:VALARM',
      'END:VEVENT'
    );
  };
  WEEKDAY_BLOCKS.filter(b => b.remind).forEach(b => add(b, start.getDay() === 0 ? new Date(start.getTime() + 864e5) : start, 'MO,TU,WE,TH,FR,SA', 'wk'));
  SUNDAY_BLOCKS.filter(b => b.remind).forEach(b => add(b, firstSunday, 'SU', 'su'));
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

