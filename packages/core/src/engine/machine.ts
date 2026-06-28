import type { StepDefinition, TourDefinition } from '../types';

/**
 * The tour state machine. Pure and framework-free on purpose: this is where the
 * bulk of correctness lives, and it runs in milliseconds with zero mocking.
 * The React layer is a thin binding over this.
 */
export interface TourState {
  status: 'idle' | 'active';
  activeTourId: string | null;
  /** -1 when idle. */
  stepIndex: number;
  /** Registry of known tours, keyed by id. */
  tours: Record<string, TourDefinition>;
}

export type TourEvent =
  | { type: 'REGISTER'; tour: TourDefinition }
  | { type: 'UNREGISTER'; tourId: string }
  | { type: 'START'; tourId: string; fromIndex?: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SKIP' }
  | { type: 'STOP' }
  | { type: 'GOTO'; stepId: string };

export function initialState(tours: TourDefinition[] = []): TourState {
  return {
    status: 'idle',
    activeTourId: null,
    stepIndex: -1,
    tours: Object.fromEntries(tours.map((t) => [t.id, t])),
  };
}

const idle = (state: TourState): TourState => ({
  ...state,
  status: 'idle',
  activeTourId: null,
  stepIndex: -1,
});

export function reducer(state: TourState, event: TourEvent): TourState {
  switch (event.type) {
    case 'REGISTER':
      return { ...state, tours: { ...state.tours, [event.tour.id]: event.tour } };

    case 'UNREGISTER': {
      if (!state.tours[event.tourId]) return state;
      const { [event.tourId]: _removed, ...rest } = state.tours;
      const next = { ...state, tours: rest };
      return state.activeTourId === event.tourId ? idle(next) : next;
    }

    case 'START': {
      const tour = state.tours[event.tourId];
      if (!tour || tour.steps.length === 0) return state;
      const from = event.fromIndex ?? 0;
      const stepIndex = clamp(from, 0, tour.steps.length - 1);
      return { ...state, status: 'active', activeTourId: event.tourId, stepIndex };
    }

    case 'NEXT': {
      if (state.status !== 'active') return state;
      const total = activeStepCount(state);
      // Advancing past the last step completes (returns to idle).
      return state.stepIndex >= total - 1
        ? idle(state)
        : { ...state, stepIndex: state.stepIndex + 1 };
    }

    case 'BACK': {
      if (state.status !== 'active') return state;
      return state.stepIndex <= 0
        ? state
        : { ...state, stepIndex: state.stepIndex - 1 };
    }

    case 'GOTO': {
      if (state.status !== 'active') return state;
      const tour = getActiveTour(state);
      if (!tour) return state;
      const idx = tour.steps.findIndex((s) => s.id === event.stepId);
      return idx === -1 ? state : { ...state, stepIndex: idx };
    }

    case 'SKIP':
    case 'STOP':
      return state.status === 'active' ? idle(state) : state;

    default:
      return state;
  }
}

// ---- Selectors -------------------------------------------------------------

export function getActiveTour(state: TourState): TourDefinition | null {
  return state.activeTourId ? state.tours[state.activeTourId] ?? null : null;
}

export function activeStepCount(state: TourState): number {
  return getActiveTour(state)?.steps.length ?? 0;
}

export function getCurrentStep(state: TourState): StepDefinition | null {
  const tour = getActiveTour(state);
  if (!tour || state.stepIndex < 0) return null;
  return tour.steps[state.stepIndex] ?? null;
}

export function isFirst(state: TourState): boolean {
  return state.status === 'active' && state.stepIndex === 0;
}

export function isLast(state: TourState): boolean {
  return state.status === 'active' && state.stepIndex === activeStepCount(state) - 1;
}

export function progress(state: TourState): number {
  const total = activeStepCount(state);
  if (total <= 1) return state.status === 'active' ? 1 : 0;
  return state.status === 'active' ? state.stepIndex / (total - 1) : 0;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
