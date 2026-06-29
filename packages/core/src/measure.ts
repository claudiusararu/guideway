import type { RefObject } from 'react';
import type { View, ScrollView, FlatList } from 'react-native';
import type { TargetRect } from './types';
import { resolveScrollOffset, type ScrollAlign } from './scroll';

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

/**
 * Scroll a target into view inside its container, then resolve. Measures the target's
 * offset within the scroll content (`measureLayout`, New-Architecture-safe) and scrolls
 * there via `resolveScrollOffset`. Supports ScrollView (`scrollTo`) and FlatList
 * (`scrollToOffset`). Resolves immediately if it can't measure or scroll.
 */
export function scrollTargetIntoView(
  targetRef: RefObject<View | null>,
  scrollRef: RefObject<ScrollView | FlatList<unknown> | null>,
  viewportHeight: number,
  align: ScrollAlign = 'center'
): Promise<void> {
  return new Promise((resolve) => {
    // RN ref methods (measureLayout/getScrollableNode/scrollTo) aren't on the static types.
    const scroller = scrollRef.current as any;
    const target = targetRef.current as any;
    if (!scroller || !target || typeof target.measureLayout !== 'function') {
      resolve();
      return;
    }
    const node =
      typeof scroller.getScrollableNode === 'function' ? scroller.getScrollableNode() : scroller;
    const done = () => resolve();
    target.measureLayout(
      node,
      (_x: number, top: number, _w: number, height: number) => {
        const y = resolveScrollOffset({
          targetTop: top,
          targetHeight: height,
          viewportHeight,
          currentScroll: 0,
          align,
        });
        if (typeof scroller.scrollTo === 'function') scroller.scrollTo({ y, animated: true });
        else if (typeof scroller.scrollToOffset === 'function')
          scroller.scrollToOffset({ offset: y, animated: true });
        done();
      },
      done
    );
  });
}
