import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { TourState } from './engine/machine';
import type {
  TourController,
  TargetRegistry,
  TargetRect,
  ResolvedCutout,
  TooltipComponent,
} from './types';

export interface SpotlightShared {
  x: SharedValue<number>;
  y: SharedValue<number>;
  w: SharedValue<number>;
  h: SharedValue<number>;
  r: SharedValue<number>;
  opacity: SharedValue<number>;
}

export interface ResolvedTheme {
  overlayColor: string;
  accent: string;
  tooltip: {
    backgroundColor: string;
    textColor: string;
    titleColor: string;
    borderRadius: number;
    padding: number;
    maxWidth: number;
  };
}

export interface TourContextValue {
  state: TourState;
  controller: TourController;
  registry: TargetRegistry;
  currentRect: TargetRect | null;
  shared: SpotlightShared;
  theme: ResolvedTheme;
  defaultCutout: ResolvedCutout;
  tooltipComponent?: TooltipComponent;
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
