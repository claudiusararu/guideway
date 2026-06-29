/**
 * Pluggable storage for "show once" tours. Shaped to match AsyncStorage and MMKV, and
 * tolerant of sync or async implementations - pass whatever your app already uses.
 */
export interface TourStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem?(key: string): Promise<void> | void;
}

export const DEFAULT_SEEN_PREFIX = 'guideway:seen:';

export function seenKey(tourId: string, prefix: string = DEFAULT_SEEN_PREFIX): string {
  return `${prefix}${tourId}`;
}

/**
 * The first `showOnce` tour that hasn't been seen yet: marks it seen and returns its id
 * (or null if there's nothing to auto-start). Marking happens up front, so a tour shows
 * exactly once even if the app is killed mid-tour.
 */
export async function pickAutoStartTour(
  tours: ReadonlyArray<{ id: string; showOnce?: boolean }>,
  storage: TourStorage,
  prefix: string = DEFAULT_SEEN_PREFIX
): Promise<string | null> {
  for (const tour of tours) {
    if (!tour.showOnce) continue;
    const seen = await storage.getItem(seenKey(tour.id, prefix));
    if (!seen) {
      await storage.setItem(seenKey(tour.id, prefix), '1');
      return tour.id;
    }
  }
  return null;
}

/** Clear a tour's seen flag so it can auto-start again (e.g. a "replay tour" button). */
export async function clearSeen(
  tourId: string,
  storage: TourStorage,
  prefix: string = DEFAULT_SEEN_PREFIX
): Promise<void> {
  const key = seenKey(tourId, prefix);
  if (typeof storage.removeItem === 'function') await storage.removeItem(key);
  else await storage.setItem(key, ''); // empty string reads back falsy = unseen
}
