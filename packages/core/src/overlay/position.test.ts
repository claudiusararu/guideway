import { resolveTooltipPosition, type ResolveParams } from './position';

// iPhone-ish screen + safe-area insets.
const SCREEN = { width: 390, height: 844 };
const INSETS = { top: 47, right: 0, bottom: 34, left: 0 };

function resolve(overrides: Partial<ResolveParams> & Pick<ResolveParams, 'target'>) {
  return resolveTooltipPosition({
    screen: SCREEN,
    insets: INSETS,
    tooltip: { width: 280, height: 120 },
    ...overrides,
  });
}

describe('resolveTooltipPosition - placement', () => {
  it('places below when there is room (default preferred=bottom)', () => {
    const r = resolve({ target: { x: 115, y: 400, width: 160, height: 48 } });
    expect(r.placement).toBe('bottom');
    expect(r.top).toBe(468); // 400 + 48 + gap(12) + arrow(8)
    expect(r.left).toBe(55); // centered: 115 + 80 - 140, within bounds
  });

  it('flips above when there is no room below', () => {
    const r = resolve({ target: { x: 115, y: 760, width: 160, height: 48 } });
    expect(r.placement).toBe('top');
    expect(r.top).toBe(620); // 760 - gap - arrow - height = 760 - 12 - 8 - 120
  });

  it('honors preferred=top when it fits', () => {
    const r = resolve({ target: { x: 115, y: 400, width: 160, height: 48 }, preferred: 'top' });
    expect(r.placement).toBe('top');
  });

  it('auto picks bottom for a centered target', () => {
    const r = resolve({ target: { x: 115, y: 400, width: 160, height: 48 }, preferred: 'auto' });
    expect(r.placement).toBe('bottom');
  });

  it('places to the right when preferred=right and it fits', () => {
    const r = resolve({
      target: { x: 40, y: 400, width: 48, height: 48 },
      tooltip: { width: 120, height: 80 },
      preferred: 'right',
    });
    expect(r.placement).toBe('right');
    expect(r.left).toBe(108); // 40 + 48 + 12 + 8
    expect(r.top).toBe(384); // centered on target cross-axis: 400 + 24 - 40
  });

  it('places to the left when preferred=left and it fits', () => {
    const r = resolve({
      target: { x: 250, y: 400, width: 48, height: 48 },
      tooltip: { width: 120, height: 80 },
      preferred: 'left',
    });
    expect(r.placement).toBe('left');
    expect(r.left).toBe(110); // 250 - 12 - 8 - 120
  });

  it('falls back to the side with the most room when nothing fits', () => {
    const r = resolve({
      target: { x: 115, y: 400, width: 160, height: 48 },
      tooltip: { width: 380, height: 800 },
    });
    // Bottom has the most room for a centered target; must still return a valid side.
    expect(['top', 'bottom', 'left', 'right']).toContain(r.placement);
    expect(r.placement).toBe('bottom');
  });
});

describe('resolveTooltipPosition - shift / clamp', () => {
  it('clamps to the left safe-area edge for a target near the left', () => {
    const r = resolve({ target: { x: 0, y: 400, width: 60, height: 48 } });
    expect(r.left).toBe(12); // insets.left(0) + margin(12)
  });

  it('clamps to the right edge for a target near the right', () => {
    const r = resolve({ target: { x: 330, y: 400, width: 60, height: 48 } });
    expect(r.left).toBe(98); // maxLeft = 390 - 0 - 12 - 280
  });

  it('respects left inset when clamping', () => {
    const r = resolve({
      target: { x: 0, y: 400, width: 60, height: 48 },
      insets: { ...INSETS, left: 50 },
    });
    expect(r.left).toBe(62); // insets.left(50) + margin(12)
  });
});

describe('resolveTooltipPosition - arrow', () => {
  it('points up from a below tooltip, aligned to the target center', () => {
    const r = resolve({ target: { x: 115, y: 400, width: 160, height: 48 } });
    expect(r.arrow.side).toBe('top');
    expect(r.arrow.top).toBe(0);
    expect(r.arrow.left).toBe(140); // targetCenterX(195) - tooltipLeft(55)
  });

  it('clamps the arrow within the tooltip for an edge target', () => {
    const r = resolve({ target: { x: 0, y: 400, width: 60, height: 48 } });
    // targetCenterX=30, tooltipLeft=12 -> 18, within [8, 272]
    expect(r.arrow.left).toBe(18);
  });

  it('sits on the side edge for a horizontal placement', () => {
    const r = resolve({
      target: { x: 40, y: 400, width: 48, height: 48 },
      tooltip: { width: 120, height: 80 },
      preferred: 'right',
    });
    expect(r.arrow.side).toBe('left');
    expect(r.arrow.left).toBe(0);
    expect(r.arrow.top).toBe(40); // targetCenterY(424) - tooltipTop(384)
  });
});

describe('resolveTooltipPosition - defaults', () => {
  it('works with no insets and default options', () => {
    const r = resolveTooltipPosition({
      target: { x: 100, y: 100, width: 100, height: 40 },
      tooltip: { width: 200, height: 100 },
      screen: { width: 400, height: 800 },
    });
    expect(r.placement).toBe('bottom');
    expect(r.top).toBe(160); // 100 + 40 + 12 + 8
  });
});
