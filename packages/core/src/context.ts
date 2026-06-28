import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { TourState } from './engine/machine';
import type { GuidewayTheme } from './theme';
import type {
  TourController,
  TargetRegistry,
  TargetRect,
  ResolvedCutout,
  TooltipComponent,
  Insets,
} from './types';

export interface SpotlightShared {
  x: SharedValue<number>;
  y: SharedValue<number>;
  w: SharedValue<number>;
  h: SharedValue<number>;
  r: SharedValue<number>;
  opacity: SharedValue<number>;
}

/** @deprecated Use `GuidewayTheme`. Kept as an alias for back-compat. */
export type ResolvedTheme = GuidewayTheme;

export interface TourContextValue {
  state: TourState;
  controller: TourController;
  registry: TargetRegistry;
  currentRect: TargetRect | null;
  shared: SpotlightShared;
  theme: ResolvedTheme;
  defaultCutout: ResolvedCutout;
  tooltipComponent?: TooltipComponent;
  insets: Insets;
  screen: { width: number; height: number };
}

export const TourContext = createContext<TourContextValue | null>(null);

export function useTourContext(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('Guideway: hooks and components must be used inside <TourProvider>.');
  }
  return ctx;
}
