import type { TargetRect, Size } from '../types';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const nn = (n: number): number => (n < 0 ? 0 : n); // clamp to non-negative

/**
 * The four scrim rectangles that cover the screen EXCEPT the hole, so the hole can be
 * left free for interaction with the real target. `top`/`bottom` span the full width;
 * `left`/`right` fill the gaps beside the hole. All dimensions clamped to >= 0. Pure.
 */
export function overlayBands(
  hole: TargetRect,
  screen: Size
): { top: Rect; bottom: Rect; left: Rect; right: Rect } {
  const holeRight = hole.x + hole.width;
  const holeBottom = hole.y + hole.height;
  return {
    top: { x: 0, y: 0, width: screen.width, height: nn(hole.y) },
    bottom: { x: 0, y: nn(holeBottom), width: screen.width, height: nn(screen.height - holeBottom) },
    left: { x: 0, y: nn(hole.y), width: nn(hole.x), height: nn(hole.height) },
    right: { x: nn(holeRight), y: nn(hole.y), width: nn(screen.width - holeRight), height: nn(hole.height) },
  };
}
