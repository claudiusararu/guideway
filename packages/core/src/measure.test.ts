import type { RefObject } from 'react';
import type { View } from 'react-native';
import { measureTarget, padRect } from './measure';

/** Build a fake host node whose measureInWindow resolves to a fixed rect. */
function refTo(rect: { x: number; y: number; w: number; h: number } | null): RefObject<View | null> {
  if (rect === null) return { current: null };
  return {
    current: {
      measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
        cb(rect.x, rect.y, rect.w, rect.h),
    } as unknown as View,
  };
}

describe('measureTarget', () => {
  it('resolves the measured rect', async () => {
    const rect = await measureTarget(refTo({ x: 20, y: 200, w: 160, h: 48 }));
    expect(rect).toEqual({ x: 20, y: 200, width: 160, height: 48 });
  });

  it('resolves null for a null ref', async () => {
    expect(await measureTarget(null)).toBeNull();
    expect(await measureTarget({ current: null })).toBeNull();
  });

  it('resolves null for a node without measureInWindow', async () => {
    expect(await measureTarget({ current: {} as View })).toBeNull();
  });

  it('resolves null for a zero-size (unmounted/virtualized) target', async () => {
    expect(await measureTarget(refTo({ x: 0, y: 0, w: 0, h: 0 }))).toBeNull();
  });

  it('resolves null for non-finite coordinates', async () => {
    const ref = {
      current: {
        measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) =>
          cb(NaN, NaN, 10, 10),
      } as unknown as View,
    };
    expect(await measureTarget(ref)).toBeNull();
  });
});

describe('padRect', () => {
  it('expands the rect symmetrically', () => {
    expect(padRect({ x: 20, y: 200, width: 160, height: 48 }, 8)).toEqual({
      x: 12,
      y: 192,
      width: 176,
      height: 64,
    });
  });
});
