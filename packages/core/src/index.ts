export { TourProvider, type TourProviderProps } from './TourProvider';
export { useTour } from './hooks/useTour';
export { useTourTarget } from './hooks/useTourTarget';

export type {
  TourDefinition,
  StepDefinition,
  Cutout,
  CutoutShape,
  TargetRect,
  TourController,
  TooltipRenderProps,
  TooltipComponent,
  UseTourTargetOptions,
  Placement,
  PreferredPlacement,
  Insets,
  OverlayTapBehavior,
} from './types';

export { lightTheme, darkTheme, resolveTheme } from './theme';
export type { GuidewayTheme, ColorScheme, ThemeOverride } from './theme';
export type { ResolvedTheme } from './context';

// Lower-level engine, exposed for advanced use + testing.
export {
  reducer as tourReducer,
  initialState as createTourState,
  type TourState,
  type TourEvent,
} from './engine/machine';
