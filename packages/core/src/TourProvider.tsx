import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import {
  reducer,
  initialState,
  getActiveTour,
  getCurrentStep,
  isLast,
  activeStepCount,
  progress as progressOf,
} from './engine/machine';
import { measureTarget, padRect } from './measure';
import { radiusForShape } from './overlay/paths';
import { TourContext, type ResolvedTheme } from './context';
import { resolveTheme, type ThemeOverride } from './theme';
import { TourHost } from './TourHost';
import type {
  TourDefinition,
  TourController,
  ResolvedCutout,
  Cutout,
  TargetRect,
  TargetRegistry,
  TooltipComponent,
  Insets,
  OverlayTapBehavior,
} from './types';

const DEFAULT_CUTOUT: ResolvedCutout = { shape: 'rounded', padding: 8, radius: 12 };

export interface TourProviderProps {
  children: React.ReactNode;
  /** Register tours up front (you can also register at runtime later). */
  tours?: TourDefinition[];
  /** Partial theme, deep-merged over the chosen light/dark base. */
  theme?: ThemeOverride;
  /** 'light' | 'dark' | 'auto' (follows the device). Default 'light'. */
  colorScheme?: 'light' | 'dark' | 'auto';
  defaultCutout?: Cutout;
  /** Global custom tooltip (step.render takes precedence). */
  tooltipComponent?: TooltipComponent;
  /** What tapping the dimmed scrim does. Default 'next'. */
  overlayTapBehavior?: OverlayTapBehavior;
  /** Let taps reach the highlighted target (the spotlight hole becomes interactive). Default false. */
  allowTargetInteraction?: boolean;
  /** Safe-area insets so tooltips avoid the notch / home indicator.
   *  Pass `useSafeAreaInsets()` from react-native-safe-area-context. */
  insets?: Insets;
}

const ENTER = { duration: 200 };
const MOVE = { duration: 260 };

export function TourProvider({
  children,
  tours = [],
  theme,
  colorScheme = 'light',
  defaultCutout,
  tooltipComponent,
  overlayTapBehavior = 'next',
  allowTargetInteraction = false,
  insets,
}: TourProviderProps) {
  const [state, dispatch] = useReducer(reducer, tours, initialState);
  const registry = useRef<TargetRegistry>(new Map());
  const [currentRect, setCurrentRect] = useState<TargetRect | null>(null);
  const { width, height } = useWindowDimensions();
  const systemScheme = useColorScheme();

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const r = useSharedValue(0);
  const opacity = useSharedValue(0);
  const shared = useMemo(() => ({ x, y, w, h, r, opacity }), [x, y, w, h, r, opacity]);

  const resolvedCutout = useMemo<ResolvedCutout>(
    () => ({ ...DEFAULT_CUTOUT, ...defaultCutout }),
    [defaultCutout]
  );

  const scheme = colorScheme === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : colorScheme;
  const resolvedTheme = useMemo<ResolvedTheme>(() => resolveTheme(scheme, theme), [scheme, theme]);

  // Measure the active step's target, then animate the spotlight to it.
  useEffect(() => {
    let cancelled = false;

    if (state.status !== 'active') {
      opacity.value = withTiming(0, ENTER);
      setCurrentRect(null);
      return;
    }

    const step = getCurrentStep(state);
    if (!step) return;

    measureTarget(registry.current.get(step.id)).then((rect) => {
      if (cancelled || !rect) return;
      const cut = { ...resolvedCutout, ...step.cutout };
      const padded = padRect(rect, cut.padding);
      const rad = radiusForShape(cut.shape, padded.width, padded.height, cut.radius);
      setCurrentRect(padded);

      const firstReveal = opacity.value === 0;
      const cfg = firstReveal ? { duration: 0 } : MOVE;
      x.value = withTiming(padded.x, cfg);
      y.value = withTiming(padded.y, cfg);
      w.value = withTiming(padded.width, cfg);
      h.value = withTiming(padded.height, cfg);
      r.value = withTiming(rad, cfg);
      opacity.value = withTiming(1, ENTER);
    });

    return () => {
      cancelled = true;
    };
    // shared values are stable; re-run when the active step or screen changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.activeTourId, state.stepIndex, width, height, resolvedCutout]);

  const controller = useMemo<TourController>(
    () => ({
      start: (tourId, options) =>
        dispatch({ type: 'START', tourId, fromIndex: options?.fromIndex }),
      stop: () => dispatch({ type: 'STOP' }),
      next: () => {
        if (isLast(state)) getActiveTour(state)?.onComplete?.();
        dispatch({ type: 'NEXT' });
      },
      back: () => dispatch({ type: 'BACK' }),
      skip: () => {
        if (state.status === 'active') getActiveTour(state)?.onSkip?.(state.stepIndex);
        dispatch({ type: 'SKIP' });
      },
      isActive: state.status === 'active',
      activeTourId: state.activeTourId,
      currentStep: getCurrentStep(state),
      stepIndex: state.stepIndex,
      totalSteps: activeStepCount(state),
      progress: progressOf(state),
    }),
    [state]
  );

  const value = useMemo(
    () => ({
      state,
      controller,
      registry: registry.current,
      currentRect,
      shared,
      theme: resolvedTheme,
      defaultCutout: resolvedCutout,
      tooltipComponent,
      overlayTapBehavior,
      allowTargetInteraction,
      insets: insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
      screen: { width, height },
    }),
    [state, controller, currentRect, shared, resolvedTheme, resolvedCutout, tooltipComponent, overlayTapBehavior, allowTargetInteraction, insets, width, height]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourHost />
    </TourContext.Provider>
  );
}
