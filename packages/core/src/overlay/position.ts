import type { TargetRect, Placement, PreferredPlacement, Insets, Size } from '../types';

export type { Placement, PreferredPlacement, Insets, Size } from '../types';

export interface ResolvedPosition {
  top: number;
  left: number;
  placement: Placement;
  /** Arrow offset within the tooltip box, and which edge it sits on. */
  arrow: { left: number; top: number; side: Placement };
}

export interface ResolveParams {
  /** The highlighted target (cutout) rect, in window coordinates. */
  target: TargetRect;
  /** Measured tooltip size. */
  tooltip: Size;
  screen: Size;
  insets?: Insets;
  /** Preferred side; 'auto' lets the resolver choose. Default 'bottom'. */
  preferred?: PreferredPlacement;
  /** Space between target and tooltip. Default 12. */
  gap?: number;
  /** Minimum distance from the screen/safe-area edge. Default 12. */
  edgeMargin?: number;
  /** Arrow size (height of the caret). Default 8. */
  arrowSize?: number;
}

const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

const isVertical = (p: Placement): boolean => p === 'top' || p === 'bottom';

function opposite(p: Placement): Placement {
  switch (p) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}

function perpendicular(p: Placement): Placement[] {
  return isVertical(p) ? ['right', 'left'] : ['bottom', 'top'];
}

function clamp(n: number, min: number, max: number): number {
  if (max < min) return min; // box larger than the available range -> pin to min edge
  return Math.max(min, Math.min(max, n));
}

/**
 * Place a tooltip near a target rect: pick a side that fits (flipping if needed),
 * shift along the cross-axis to stay within the safe area, and compute the arrow
 * offset pointing back at the target. Pure - fully unit-testable, zero deps.
 */
export function resolveTooltipPosition(params: ResolveParams): ResolvedPosition {
  const { target, tooltip, screen } = params;
  const insets = params.insets ?? NO_INSETS;
  const preferred = params.preferred ?? 'bottom';
  const gap = params.gap ?? 12;
  const margin = params.edgeMargin ?? 12;
  const arrowSize = params.arrowSize ?? 8;

  const room: Record<Placement, number> = {
    top: target.y - insets.top - margin,
    bottom: screen.height - insets.bottom - margin - (target.y + target.height),
    left: target.x - insets.left - margin,
    right: screen.width - insets.right - margin - (target.x + target.width),
  };
  const needed = (p: Placement): number =>
    (isVertical(p) ? tooltip.height : tooltip.width) + gap + arrowSize;

  const placement = choosePlacement(preferred, room, needed);

  const minLeft = insets.left + margin;
  const maxLeft = screen.width - insets.right - margin - tooltip.width;
  const minTop = insets.top + margin;
  const maxTop = screen.height - insets.bottom - margin - tooltip.height;

  let top: number;
  let left: number;

  if (isVertical(placement)) {
    left = clamp(target.x + target.width / 2 - tooltip.width / 2, minLeft, maxLeft);
    top =
      placement === 'bottom'
        ? target.y + target.height + gap + arrowSize
        : target.y - gap - arrowSize - tooltip.height;
  } else {
    top = clamp(target.y + target.height / 2 - tooltip.height / 2, minTop, maxTop);
    left =
      placement === 'right'
        ? target.x + target.width + gap + arrowSize
        : target.x - gap - arrowSize - tooltip.width;
  }

  return { top, left, placement, arrow: resolveArrow(placement, target, top, left, tooltip, arrowSize) };
}

function choosePlacement(
  preferred: PreferredPlacement,
  room: Record<Placement, number>,
  needed: (p: Placement) => number
): Placement {
  const order: Placement[] =
    preferred === 'auto'
      ? ['bottom', 'top', 'right', 'left']
      : [preferred, opposite(preferred), ...perpendicular(preferred)];

  for (const p of order) {
    if (room[p] >= needed(p)) return p;
  }
  // Nothing fits cleanly: fall back to the side with the most room.
  const all: Placement[] = ['bottom', 'top', 'right', 'left'];
  return all.reduce((best, p) => (room[p] > room[best] ? p : best), 'bottom' as Placement);
}

function resolveArrow(
  placement: Placement,
  target: TargetRect,
  top: number,
  left: number,
  tooltip: Size,
  arrowSize: number
): { left: number; top: number; side: Placement } {
  const side = opposite(placement); // arrow sits on the tooltip edge facing the target
  if (isVertical(placement)) {
    const centerX = target.x + target.width / 2;
    return {
      left: clamp(centerX - left, arrowSize, tooltip.width - arrowSize),
      top: placement === 'bottom' ? 0 : tooltip.height,
      side,
    };
  }
  const centerY = target.y + target.height / 2;
  return {
    left: placement === 'right' ? 0 : tooltip.width,
    top: clamp(centerY - top, arrowSize, tooltip.height - arrowSize),
    side,
  };
}
