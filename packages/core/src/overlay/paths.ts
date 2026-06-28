import type { CutoutShape } from '../types';

/** Resolve a cutout shape + the target box into the corner radius to draw. */
export function radiusForShape(
  shape: CutoutShape,
  width: number,
  height: number,
  radius: number
): number {
  'worklet';
  const half = Math.min(width, height) / 2;
  switch (shape) {
    case 'rect':
      return 0;
    case 'circle':
    case 'pill':
      return half;
    case 'rounded':
    default:
      return Math.min(radius, half);
  }
}

/** A rounded-rectangle sub-path (clockwise). r is clamped to half the smaller side. */
export function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  'worklet';
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  if (rr === 0) {
    return `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
  }
  return (
    `M${x + rr} ${y} ` +
    `H${x + w - rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} ` +
    `V${y + h - rr} A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h} ` +
    `H${x + rr} A${rr} ${rr} 0 0 1 ${x} ${y + h - rr} ` +
    `V${y + rr} A${rr} ${rr} 0 0 1 ${x + rr} ${y} Z`
  );
}

/**
 * The full overlay path: a screen-sized rectangle with a rounded-rect hole punched
 * out. Rendered with fillRule="evenodd" so the inner region becomes the spotlight.
 * The command structure is identical every frame so React Native Web interpolates it.
 */
export function buildSpotlightPath(
  screenW: number,
  screenH: number,
  hole: { x: number; y: number; w: number; h: number; r: number }
): string {
  'worklet';
  const outer = `M0 0 H${screenW} V${screenH} H0 Z`;
  const inner = roundedRectPath(hole.x, hole.y, hole.w, hole.h, hole.r);
  return `${outer} ${inner}`;
}
