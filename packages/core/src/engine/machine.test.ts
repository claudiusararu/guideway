import {
  initialState,
  reducer,
  getActiveTour,
  getCurrentStep,
  isFirst,
  isLast,
  progress,
  activeStepCount,
  type TourState,
} from './machine';
import type { TourDefinition } from '../types';

const tourA: TourDefinition = {
  id: 'a',
  steps: [
    { id: 'a1', title: 'one' },
    { id: 'a2', title: 'two' },
    { id: 'a3', title: 'three' },
  ],
};
const tourB: TourDefinition = { id: 'b', steps: [{ id: 'b1', title: 'b-one' }] };

const withTours = (...tours: TourDefinition[]): TourState => initialState(tours);
const started = (tourId = 'a'): TourState =>
  reducer(withTours(tourA, tourB), { type: 'START', tourId });

describe('initialState', () => {
  it('is idle with no active tour', () => {
    const s = initialState();
    expect(s.status).toBe('idle');
    expect(s.activeTourId).toBeNull();
    expect(s.stepIndex).toBe(-1);
    expect(s.tours).toEqual({});
  });

  it('seeds the registry from passed tours', () => {
    const s = withTours(tourA, tourB);
    expect(Object.keys(s.tours)).toEqual(['a', 'b']);
  });
});

describe('REGISTER / UNREGISTER', () => {
  it('registers a tour at runtime', () => {
    const s = reducer(initialState(), { type: 'REGISTER', tour: tourA });
    expect(s.tours.a).toBe(tourA);
  });

  it('unregisters a tour', () => {
    const s = reducer(withTours(tourA, tourB), { type: 'UNREGISTER', tourId: 'b' });
    expect(s.tours.b).toBeUndefined();
    expect(s.tours.a).toBe(tourA);
  });

  it('is a no-op when unregistering an unknown tour', () => {
    const before = withTours(tourA);
    expect(reducer(before, { type: 'UNREGISTER', tourId: 'nope' })).toBe(before);
  });

  it('stops the tour if the active one is unregistered', () => {
    const s = reducer(started('a'), { type: 'UNREGISTER', tourId: 'a' });
    expect(s.status).toBe('idle');
    expect(s.activeTourId).toBeNull();
  });
});

describe('START', () => {
  it('activates a tour at step 0', () => {
    const s = started('a');
    expect(s.status).toBe('active');
    expect(s.activeTourId).toBe('a');
    expect(s.stepIndex).toBe(0);
  });

  it('can start from a given index, clamped to bounds', () => {
    const s = reducer(withTours(tourA), { type: 'START', tourId: 'a', fromIndex: 99 });
    expect(s.stepIndex).toBe(2);
  });

  it('is a no-op for an unknown tour', () => {
    const before = withTours(tourA);
    expect(reducer(before, { type: 'START', tourId: 'ghost' })).toBe(before);
  });

  it('is a no-op for a tour with no steps', () => {
    const before = withTours({ id: 'empty', steps: [] });
    expect(reducer(before, { type: 'START', tourId: 'empty' })).toBe(before);
  });
});

describe('NEXT / BACK', () => {
  it('advances through steps', () => {
    let s = started('a');
    s = reducer(s, { type: 'NEXT' });
    expect(s.stepIndex).toBe(1);
    s = reducer(s, { type: 'NEXT' });
    expect(s.stepIndex).toBe(2);
  });

  it('completes (returns to idle) when advancing past the last step', () => {
    let s = reducer(started('a'), { type: 'GOTO', stepId: 'a3' });
    s = reducer(s, { type: 'NEXT' });
    expect(s.status).toBe('idle');
    expect(s.stepIndex).toBe(-1);
  });

  it('goes back, but not before the first step', () => {
    let s = reducer(started('a'), { type: 'NEXT' });
    s = reducer(s, { type: 'BACK' });
    expect(s.stepIndex).toBe(0);
    const stuck = reducer(s, { type: 'BACK' });
    expect(stuck).toBe(s); // no-op at first step
  });

  it('NEXT/BACK are no-ops when idle', () => {
    const before = withTours(tourA);
    expect(reducer(before, { type: 'NEXT' })).toBe(before);
    expect(reducer(before, { type: 'BACK' })).toBe(before);
  });
});

describe('GOTO', () => {
  it('jumps to a step by id', () => {
    const s = reducer(started('a'), { type: 'GOTO', stepId: 'a3' });
    expect(s.stepIndex).toBe(2);
  });

  it('is a no-op for an unknown step id', () => {
    const active = started('a');
    expect(reducer(active, { type: 'GOTO', stepId: 'nope' })).toBe(active);
  });

  it('is a no-op when idle', () => {
    const before = withTours(tourA);
    expect(reducer(before, { type: 'GOTO', stepId: 'a1' })).toBe(before);
  });
});

describe('SKIP / STOP', () => {
  it('SKIP returns to idle', () => {
    expect(reducer(started('a'), { type: 'SKIP' }).status).toBe('idle');
  });
  it('STOP returns to idle', () => {
    expect(reducer(started('a'), { type: 'STOP' }).status).toBe('idle');
  });
  it('are no-ops when already idle', () => {
    const before = withTours(tourA);
    expect(reducer(before, { type: 'SKIP' })).toBe(before);
    expect(reducer(before, { type: 'STOP' })).toBe(before);
  });
});

describe('multi-tour isolation', () => {
  it('starting tour B does not mutate tour A progress', () => {
    const s = reducer(started('a'), { type: 'START', tourId: 'b' });
    expect(s.activeTourId).toBe('b');
    expect(s.stepIndex).toBe(0);
    expect(s.tours.a).toBe(tourA); // registry intact
  });
});

describe('selectors', () => {
  it('getActiveTour / getCurrentStep reflect position', () => {
    const s = reducer(started('a'), { type: 'NEXT' });
    expect(getActiveTour(s)).toBe(tourA);
    expect(getCurrentStep(s)?.id).toBe('a2');
  });

  it('return null/0 when idle', () => {
    const s = withTours(tourA);
    expect(getActiveTour(s)).toBeNull();
    expect(getCurrentStep(s)).toBeNull();
    expect(activeStepCount(s)).toBe(0);
  });

  it('isFirst / isLast', () => {
    const s0 = started('a');
    expect(isFirst(s0)).toBe(true);
    expect(isLast(s0)).toBe(false);
    const sLast = reducer(s0, { type: 'GOTO', stepId: 'a3' });
    expect(isLast(sLast)).toBe(true);
  });

  it('progress goes 0 -> 1 across the tour', () => {
    const s0 = started('a');
    expect(progress(s0)).toBe(0);
    const sLast = reducer(s0, { type: 'GOTO', stepId: 'a3' });
    expect(progress(sLast)).toBe(1);
  });

  it('progress is 1 for a single-step active tour, 0 when idle', () => {
    expect(progress(started('b'))).toBe(1);
    expect(progress(withTours(tourA))).toBe(0);
  });
});
