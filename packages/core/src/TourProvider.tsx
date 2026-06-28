import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
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
} from './types';

const DEFAULT_CUTOUT: ResolvedCutout = { shape: 'rounded', padding: 8, radius: 12 };

const DEFAULT_THEME: ResolvedTheme = {
  overlayColor: 'rgba(10,12,20,0.78)',
  accent: '#2347ff',
  tooltip: {
    backgroundColor: '#ffffff',
    textColor: '#1f2430',
    titleColor: '#0b0d12',
    borderRadius: 14,
    padding: 16,
    maxWidth: 320,
  },
};

type ThemeInput = Partial<Omit<ResolvedTheme, 'tooltip'>> & {
  tooltip?: Partial<ResolvedTheme['tooltip']>;
};

export interface TourProviderProps {
  children: React.ReactNode;
  /** Register tours up front (you can also register at runtime later). */
  tours?: TourDefinition[];
  theme?: ThemeInput;
  defaultCutout?: Cutout;
  /** Global custom tooltip (step.render takes precedence). */
  tooltipComponent?: TooltipComponent;
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
  defaultCutout,
  tooltipComponent,
  insets,
}: TourProviderProps) {
  const [state, dispatch] = useReducer(reducer, tours, initialState);
  const registry = useRef<TargetRegistry>(new Map());
  const [currentRect, setCurrentRect] = useState<TargetRect | null>(null);
  const { width, height } = useWindowDimensions();

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

  const resolvedTheme = useMemo<ResolvedTheme>(
    () => ({
      ...DEFAULT_THEME,
      ...theme,
      tooltip: { ...DEFAULT_THEME.tooltip, ...theme?.tooltip },
    }),
    [theme]
  );

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
      insets: insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
      screen: { width, height },
    }),
    [state, controller, currentRect, shared, resolvedTheme, resolvedCutout, tooltipComponent, insets, width, height]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourHost />
    </TourContext.Provider>
  );
}
