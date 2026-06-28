import { buildSpotlightPath, roundedRectPath, radiusForShape } from './paths';

describe('radiusForShape', () => {
  it('rect = 0', () => {
    expect(radiusForShape('rect', 100, 40, 12)).toBe(0);
  });
  it('circle / pill = half the smaller side', () => {
    expect(radiusForShape('circle', 100, 40, 12)).toBe(20);
    expect(radiusForShape('pill', 100, 40, 12)).toBe(20);
  });
  it('rounded = requested radius, clamped to half the smaller side', () => {
    expect(radiusForShape('rounded', 100, 40, 12)).toBe(12);
    expect(radiusForShape('rounded', 100, 40, 999)).toBe(20);
  });
});

describe('roundedRectPath', () => {
  it('emits sharp corners when r = 0', () => {
    expect(roundedRectPath(10, 20, 100, 40, 0)).toBe('M10 20 H110 V60 H10 Z');
  });

  it('emits arcs when r > 0', () => {
    const d = roundedRectPath(0, 0, 100, 40, 8);
    expect(d).toContain('A8 8 0 0 1');
    expect(d.startsWith('M8 0')).toBe(true);
    expect(d.trim().endsWith('Z')).toBe(true);
  });

  it('clamps the radius to half the smaller side', () => {
    // h=40 -> max r is 20; arcs must use 20, not the requested 999
    expect(roundedRectPath(0, 0, 100, 40, 999)).toContain('A20 20');
  });

  it('never emits a negative radius', () => {
    expect(roundedRectPath(0, 0, 100, 40, -5)).toBe('M0 0 H100 V40 H0 Z');
  });
});

describe('buildSpotlightPath', () => {
  it('starts with a full-screen outer rectangle', () => {
    const d = buildSpotlightPath(390, 844, { x: 20, y: 200, w: 160, h: 48, r: 8 });
    expect(d.startsWith('M0 0 H390 V844 H0 Z')).toBe(true);
  });

  it('includes the inner hole sub-path', () => {
    const d = buildSpotlightPath(390, 844, { x: 20, y: 200, w: 160, h: 48, r: 8 });
    expect(d).toContain('M28 200'); // x + r = 20 + 8
    expect(d).toContain('A8 8 0 0 1');
  });

  it('keeps an identical command structure across different geometry (web-interpolatable)', () => {
    const shape = (d: string) => d.replace(/-?\d+(\.\d+)?/g, '#');
    const a = buildSpotlightPath(390, 844, { x: 20, y: 200, w: 160, h: 48, r: 8 });
    const b = buildSpotlightPath(390, 844, { x: 50, y: 400, w: 120, h: 60, r: 8 });
    expect(shape(a)).toBe(shape(b));
  });
});
