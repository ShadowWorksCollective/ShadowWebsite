import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * The data layer. ALL filtering/sorting lives here so the presentation
 * components stay dumb and the same <EventList> can be reused everywhere.
 * Note: getCollection() runs at BUILD time, so "now" is frozen at deploy —
 * schedule a periodic rebuild so the upcoming/past split stays current.
 */

const isProd = import.meta.env.PROD;
const published = <T extends { data: { draft?: boolean } }>(entry: T): boolean =>
  isProd ? !entry.data.draft : true;

type Work = CollectionEntry<'works'>;
type Event = CollectionEntry<'events'>;
type Commission = CollectionEntry<'commissions'>;

const eventEndTime = (e: Event): number =>
  (e.data.endDate ?? e.data.startDate).getTime();

const byFeaturedOrder = (a: Work | Commission, b: Work | Commission): number =>
  (a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
  b.data.year - a.data.year ||
  a.data.title.localeCompare(b.data.title);

const byYearDesc = (a: Work | Commission, b: Work | Commission): number =>
  b.data.year - a.data.year || a.data.title.localeCompare(b.data.title);

// ---- Works -----------------------------------------------------------------

export async function getAllWorks(): Promise<Work[]> {
  return (await getCollection('works')).filter(published).sort(byYearDesc);
}

export async function getFeaturedWorks(limit?: number): Promise<Work[]> {
  const works = (await getCollection('works'))
    .filter(published)
    .filter((w) => w.data.featured)
    .sort(byFeaturedOrder);
  return typeof limit === 'number' ? works.slice(0, limit) : works;
}

// ---- Events ----------------------------------------------------------------

export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  const now = Date.now();
  const events = (await getCollection('events'))
    .filter(published)
    .filter((e) => eventEndTime(e) >= now)
    .sort((a, b) => a.data.startDate.getTime() - b.data.startDate.getTime());
  return typeof limit === 'number' ? events.slice(0, limit) : events;
}

export async function getPastEvents(limit?: number): Promise<Event[]> {
  const now = Date.now();
  const events = (await getCollection('events'))
    .filter(published)
    .filter((e) => eventEndTime(e) < now)
    .sort((a, b) => b.data.startDate.getTime() - a.data.startDate.getTime());
  return typeof limit === 'number' ? events.slice(0, limit) : events;
}

/** Reverse lookup: events whose relevantWorks references this work id. */
export async function getEventsForWork(workId: string): Promise<Event[]> {
  return (await getCollection('events'))
    .filter(published)
    .filter((e) => e.data.relevantWorks.some((ref) => ref.id === workId))
    .sort((a, b) => b.data.startDate.getTime() - a.data.startDate.getTime());
}

// ---- Commissions -----------------------------------------------------------

export async function getAllCommissions(): Promise<Commission[]> {
  return (await getCollection('commissions')).filter(published).sort(byYearDesc);
}

export async function getFeaturedCommissions(limit?: number): Promise<Commission[]> {
  const c = (await getCollection('commissions'))
    .filter(published)
    .filter((x) => x.data.featured)
    .sort(byFeaturedOrder);
  return typeof limit === 'number' ? c.slice(0, limit) : c;
}

// ---- Singletons ------------------------------------------------------------

export async function getSettings() {
  const all = await getCollection('settings');
  if (!all[0]) throw new Error('[queries] Missing site settings (src/content/settings/site.yaml).');
  return all[0];
}

export async function getAbout() {
  const all = await getCollection('about');
  return all[0] ?? null;
}
