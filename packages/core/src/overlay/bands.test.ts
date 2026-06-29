import { overlayBands } from './bands';

const SCREEN = { width: 390, height: 844 };

describe('overlayBands', () => {
  it('tiles the screen around a centered hole', () => {
    const hole = { x: 100, y: 300, width: 160, height: 48 };
    const b = overlayBands(hole, SCREEN);
    expect(b.top).toEqual({ x: 0, y: 0, width: 390, height: 300 });
    expect(b.bottom).toEqual({ x: 0, y: 348, width: 390, height: 496 });
    expect(b.left).toEqual({ x: 0, y: 300, width: 100, height: 48 });
    expect(b.right).toEqual({ x: 260, y: 300, width: 130, height: 48 });
  });

  it('covers the full screen area (bands + hole)', () => {
    const hole = { x: 100, y: 300, width: 160, height: 48 };
    const b = overlayBands(hole, SCREEN);
    const bandArea =
      b.top.width * b.top.height +
      b.bottom.width * b.bottom.height +
      b.left.width * b.left.height +
      b.right.width * b.right.height;
    const holeArea = hole.width * hole.height;
    expect(bandArea + holeArea).toBe(SCREEN.width * SCREEN.height);
  });

  it('zeroes the top band when the hole touches the top edge', () => {
    const b = overlayBands({ x: 100, y: 0, width: 160, height: 48 }, SCREEN);
    expect(b.top.height).toBe(0);
    expect(b.bottom.height).toBe(844 - 48);
  });

  it('zeroes the left band when the hole touches the left edge', () => {
    const b = overlayBands({ x: 0, y: 300, width: 160, height: 48 }, SCREEN);
    expect(b.left.width).toBe(0);
    expect(b.right.width).toBe(390 - 160);
  });

  it('never returns negative dimensions for an oversized hole', () => {
    const b = overlayBands({ x: 0, y: 0, width: 999, height: 999 }, SCREEN);
    for (const r of [b.top, b.bottom, b.left, b.right]) {
      expect(r.width).toBeGreaterThanOrEqual(0);
      expect(r.height).toBeGreaterThanOrEqual(0);
    }
  });
});
