const DAY = { day: 'numeric' } as const;
const MONTH = { month: 'short' } as const;
const YEAR = { year: 'numeric' } as const;

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', opts).format(d);

/** "15 Aug 2026", "15–17 Aug 2026", "28 Jul – 3 Aug 2026", "28 Dec 2025 – 3 Jan 2026". */
export function formatDateRange(start: Date, end?: Date | null): string {
  const startFull = `${fmt(start, DAY)} ${fmt(start, MONTH)} ${fmt(start, YEAR)}`;
  if (!end || start.getTime() === end.getTime()) return startFull;

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${fmt(start, DAY)}–${fmt(end, DAY)} ${fmt(end, MONTH)} ${fmt(end, YEAR)}`;
  }
  if (sameYear) {
    return `${fmt(start, DAY)} ${fmt(start, MONTH)} – ${fmt(end, DAY)} ${fmt(end, MONTH)} ${fmt(end, YEAR)}`;
  }
  return `${fmt(start, DAY)} ${fmt(start, MONTH)} ${fmt(start, YEAR)} – ${fmt(end, DAY)} ${fmt(end, MONTH)} ${fmt(end, YEAR)}`;
}

const KIND_LABELS = {
  music: 'Music',
  exhibition: 'Exhibition',
  both: 'Music + Exhibition',
} as const;

export function kindLabel(kind: 'music' | 'exhibition' | 'both'): string {
  return KIND_LABELS[kind];
}
