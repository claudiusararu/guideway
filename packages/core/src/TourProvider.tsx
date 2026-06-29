import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Keyboard, useColorScheme, useWindowDimensions } from 'react-native';
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
import { measureTarget, padRect, scrollTargetIntoView } from './measure';
import { radiusForShape } from './overlay/paths';
import { TourContext, type ResolvedTheme } from './context';
import { resolveTheme, type ThemeOverride } from './theme';
import { pickAutoStartTour, clearSeen, DEFAULT_SEEN_PREFIX, type TourStorage } from './persistence';
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
  /** Storage adapter (AsyncStorage/MMKV) enabling `showOnce` tours to auto-start once. */
  storage?: TourStorage;
  /** Key prefix for the persisted "seen" flags. Default 'guideway:seen:'. */
  storageKeyPrefix?: string;
}

const ENTER = { duration: 200 };
const MOVE = { duration: 260 };
const SCROLL_SETTLE = 350; // ms to let an auto-scroll finish before measuring the target

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
  storage,
  storageKeyPrefix = DEFAULT_SEEN_PREFIX,
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

  // Dismiss the keyboard on every step change, so a focused input from the previous
  // step doesn't leave the keyboard covering the next tooltip/target.
  useEffect(() => {
    Keyboard.dismiss();
  }, [state.status, state.activeTourId, state.stepIndex]);

  // Auto-start the first unseen showOnce tour (once per install) when storage is provided.
  useEffect(() => {
    if (!storage) return;
    let cancelled = false;
    pickAutoStartTour(tours, storage, storageKeyPrefix).then((id) => {
      if (!cancelled && id) dispatch({ type: 'START', tourId: id });
    });
    return () => {
      cancelled = true;
    };
    // Run once on mount; storage / tours / prefix are stable for this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const entry = registry.current.get(step.id);

    const reveal = (rect: TargetRect | null) => {
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
    };

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (entry?.scrollRef?.current && (entry.ref.current || entry.index != null)) {
      // Off-screen target (rendered or virtualized): scroll it into view, then measure
      // once the scroll settles.
      scrollTargetIntoView(entry.ref, entry.scrollRef, height, { index: entry.index }).then(() => {
        timer = setTimeout(() => {
          if (!cancelled) measureTarget(entry.ref).then(reveal);
        }, SCROLL_SETTLE);
      });
    } else {
      measureTarget(entry?.ref).then(reveal);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
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
      reset: (tourId: string) => {
        if (storage) void clearSeen(tourId, storage, storageKeyPrefix);
      },
      isActive: state.status === 'active',
      activeTourId: state.activeTourId,
      currentStep: getCurrentStep(state),
      stepIndex: state.stepIndex,
      totalSteps: activeStepCount(state),
      progress: progressOf(state),
    }),
    [state, storage, storageKeyPrefix]
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
