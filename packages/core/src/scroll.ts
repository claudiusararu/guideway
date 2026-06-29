export type ScrollAlign = 'center' | 'visible';

export interface ScrollOffsetParams {
  /** The target's top edge, measured within the scroll content. */
  targetTop: number;
  targetHeight: number;
  /** Height of the visible scroll viewport. */
  viewportHeight: number;
  /** The container's current scroll offset. */
  currentScroll: number;
  /** Total scrollable content height, used to clamp. Optional. */
  contentHeight?: number;
  /** Breathing room from the viewport edge when scrolling into view. Default 16. */
  padding?: number;
  /** 'center' centers the target; 'visible' scrolls the minimum amount. Default 'center'. */
  align?: ScrollAlign;
}

/**
 * The scroll offset that brings a target into the viewport. 'center' centers it; 'visible'
 * scrolls the least amount needed (and returns the current offset if it's already in view).
 * Clamped to [0, contentHeight - viewportHeight] when contentHeight is given. Pure.
 */
export function resolveScrollOffset(p: ScrollOffsetParams): number {
  const align = p.align ?? 'center';
  const pad = p.padding ?? 16;
  const targetBottom = p.targetTop + p.targetHeight;

  let next: number;
  if (align === 'center') {
    next = p.targetTop + p.targetHeight / 2 - p.viewportHeight / 2;
  } else {
    const viewTop = p.currentScroll;
    const viewBottom = p.currentScroll + p.viewportHeight;
    if (p.targetTop >= viewTop + pad && targetBottom <= viewBottom - pad) {
      next = p.currentScroll; // already comfortably visible
    } else if (p.targetTop < viewTop + pad) {
      next = p.targetTop - pad; // reveal from the top
    } else {
      next = targetBottom - p.viewportHeight + pad; // reveal from the bottom
    }
  }

  const max = p.contentHeight != null ? Math.max(0, p.contentHeight - p.viewportHeight) : Infinity;
  return Math.max(0, Math.min(next, max));
}

/** Whether the target is at least partially outside the current viewport. */
export function isOffscreen(
  targetTop: number,
  targetHeight: number,
  viewportHeight: number,
  currentScroll: number
): boolean {
  const viewTop = currentScroll;
  const viewBottom = currentScroll + viewportHeight;
  return targetTop < viewTop || targetTop + targetHeight > viewBottom;
}
