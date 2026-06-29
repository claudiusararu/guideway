import { resolveScrollOffset, isOffscreen } from './scroll';

describe('resolveScrollOffset - center (default)', () => {
  it('centers the target in the viewport', () => {
    expect(
      resolveScrollOffset({ targetTop: 1000, targetHeight: 50, viewportHeight: 800, currentScroll: 0 })
    ).toBe(625); // 1000 + 25 - 400
  });

  it('clamps to 0 for a target near the top', () => {
    expect(
      resolveScrollOffset({ targetTop: 10, targetHeight: 50, viewportHeight: 800, currentScroll: 0 })
    ).toBe(0);
  });

  it('clamps to the max scroll when contentHeight is given', () => {
    expect(
      resolveScrollOffset({
        targetTop: 2000,
        targetHeight: 50,
        viewportHeight: 800,
        currentScroll: 0,
        contentHeight: 2100,
      })
    ).toBe(1300); // contentHeight - viewportHeight
  });
});

describe('resolveScrollOffset - visible (minimal)', () => {
  const base = { targetHeight: 50, viewportHeight: 800, align: 'visible' as const };

  it('does not move when the target is already visible', () => {
    expect(resolveScrollOffset({ ...base, targetTop: 100, currentScroll: 0 })).toBe(0);
  });

  it('scrolls down to reveal a target below the fold', () => {
    expect(resolveScrollOffset({ ...base, targetTop: 1000, currentScroll: 0 })).toBe(266); // 1050 - 800 + 16
  });

  it('scrolls up to reveal a target above the fold', () => {
    expect(resolveScrollOffset({ ...base, targetTop: 100, currentScroll: 500 })).toBe(84); // 100 - 16
  });
});

describe('isOffscreen', () => {
  it('is false when the target sits inside the viewport', () => {
    expect(isOffscreen(100, 50, 800, 0)).toBe(false);
  });

  it('is true when the target is below the viewport', () => {
    expect(isOffscreen(1000, 50, 800, 0)).toBe(true);
  });

  it('is true when the target is scrolled above the viewport', () => {
    expect(isOffscreen(100, 50, 800, 500)).toBe(true);
  });
});
