import type { RefObject } from 'react';
import type { View } from 'react-native';
import type { TargetRect } from './types';

/**
 * Measure a target in window coordinates, New-Architecture-safe.
 *
 * Uses the host instance's `measureInWindow` (the coordinate space our in-root
 * overlay also lives in). Deliberately NOT `findNodeHandle` + `UIManager.measure`
 * (deprecated, mis-fires under Fabric) and NOT the Reanimated worklet `measure()`
 * for the initial read (it can SIGSEGV on Android before the view is attached).
 *
 * Resolves null for a missing/unmounted/zero-size target so callers can skip or
 * retry rather than freeze.
 */
export function measureTarget(
  ref: RefObject<View | null> | undefined | null
): Promise<TargetRect | null> {
  return new Promise((resolve) => {
    const node = ref?.current as
      | { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void }
      | null
      | undefined;

    if (!node || typeof node.measureInWindow !== 'function') {
      resolve(null);
      return;
    }

    node.measureInWindow((x, y, width, height) => {
      if (!isFinite(x) || !isFinite(y) || (width === 0 && height === 0)) {
        resolve(null);
        return;
      }
      resolve({ x, y, width, height });
    });
  });
}

/** Expand a measured rect by uniform padding (used to size the cutout). */
export function padRect(rect: TargetRect, padding: number): TargetRect {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}
