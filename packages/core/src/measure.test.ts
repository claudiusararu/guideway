import type { RefObject } from 'react';
import type { View } from 'react-native';
import { measureTarget, padRect, scrollTargetIntoView } from './measure';

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

describe('scrollTargetIntoView', () => {
  const targetAt = (top: number, height: number) =>
    ({
      current: {
        measureLayout: (_node: unknown, ok: (x: number, y: number, w: number, h: number) => void) =>
          ok(0, top, 100, height),
      },
    }) as unknown as RefObject<View | null>;

  it('centers the target via ScrollView.scrollTo (Fabric native ref)', async () => {
    const scrollTo = jest.fn();
    const scroller = { current: { getNativeScrollRef: () => ({}), scrollTo } } as any;
    await scrollTargetIntoView(targetAt(1000, 50), scroller, 800);
    expect(scrollTo).toHaveBeenCalledWith({ y: 625, animated: true }); // 1000 + 25 - 400
  });

  it('falls back to getScrollableNode on the old architecture', async () => {
    const scrollTo = jest.fn();
    const scroller = { current: { getScrollableNode: () => 1, scrollTo } } as any;
    await scrollTargetIntoView(targetAt(500, 100), scroller, 800);
    expect(scrollTo).toHaveBeenCalledWith({ y: 150, animated: true }); // 500 + 50 - 400
  });

  it('uses scrollToOffset for a FlatList', async () => {
    const scrollToOffset = jest.fn();
    const scroller = { current: { scrollToOffset } } as any;
    await scrollTargetIntoView(targetAt(1000, 50), scroller, 800);
    expect(scrollToOffset).toHaveBeenCalledWith({ offset: 625, animated: true });
  });

  it('resolves without scrolling when the refs are empty', async () => {
    await expect(
      scrollTargetIntoView({ current: null }, { current: null } as any, 800)
    ).resolves.toBeUndefined();
  });

  it('resolves when the target has no measureLayout', async () => {
    await expect(
      scrollTargetIntoView({ current: {} as View }, { current: {} } as any, 800)
    ).resolves.toBeUndefined();
  });

  it('resolves and does not throw when the scroller exposes neither scroll method', async () => {
    await expect(
      scrollTargetIntoView(targetAt(1000, 50), { current: {} } as any, 800)
    ).resolves.toBeUndefined();
  });
});
