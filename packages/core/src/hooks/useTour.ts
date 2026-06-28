import { useTourContext } from '../context';
import type { TourController } from '../types';

/**
 * The controller hook. The only state hook an app needs - works anywhere under the
 * provider (e.g. a "Show me around" button in a screen header).
 *
 *   const { start, next, back, isActive } = useTour();
 */
export function useTour(): TourController {
  return useTourContext().controller;
}
