import { seenKey, pickAutoStartTour, clearSeen, type TourStorage } from './persistence';

function memStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
}

describe('seenKey', () => {
  it('uses the default prefix', () => expect(seenKey('main')).toBe('guideway:seen:main'));
  it('uses a custom prefix', () => expect(seenKey('main', 'x:')).toBe('x:main'));
});

describe('pickAutoStartTour', () => {
  const tours = [{ id: 'a' }, { id: 'b', showOnce: true }, { id: 'c', showOnce: true }];

  it('returns the first unseen showOnce tour and marks it seen', async () => {
    const s = memStorage();
    expect(await pickAutoStartTour(tours, s)).toBe('b');
    expect(s.map.get('guideway:seen:b')).toBe('1');
  });

  it('skips an already-seen tour and picks the next', async () => {
    const s = memStorage({ 'guideway:seen:b': '1' });
    expect(await pickAutoStartTour(tours, s)).toBe('c');
  });

  it('returns null when every showOnce tour is seen', async () => {
    const s = memStorage({ 'guideway:seen:b': '1', 'guideway:seen:c': '1' });
    expect(await pickAutoStartTour(tours, s)).toBeNull();
  });

  it('returns null when no tour is showOnce', async () => {
    expect(await pickAutoStartTour([{ id: 'a' }, { id: 'b' }], memStorage())).toBeNull();
  });
});

describe('clearSeen', () => {
  it('removes the key via removeItem when available', async () => {
    const s = memStorage({ 'guideway:seen:main': '1' });
    await clearSeen('main', s);
    expect(s.map.has('guideway:seen:main')).toBe(false);
  });

  it('falls back to writing an empty value when removeItem is absent', async () => {
    const map = new Map([['guideway:seen:main', '1']]);
    const s: TourStorage = {
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => {
        map.set(k, v);
      },
    };
    await clearSeen('main', s);
    expect(map.get('guideway:seen:main')).toBe('');
  });
});
