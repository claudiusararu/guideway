import type { ReactNode, ComponentType, RefObject } from 'react';
import type { View, ScrollView, FlatList } from 'react-native';

/** A measured target rect, in window coordinates (what the cutout draws around). */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CutoutShape = 'rect' | 'rounded' | 'circle' | 'pill';

export interface Cutout {
  shape?: CutoutShape;
  /** Extra space around the target rect, in px. */
  padding?: number;
  /** Corner radius for shape 'rounded'. Default 8. */
  radius?: number;
}

/** Fully-resolved cutout after provider defaults are merged in. */
export interface ResolvedCutout {
  shape: CutoutShape;
  padding: number;
  radius: number;
}

/** Props handed to a custom tooltip component. This is the entire render contract. */
export interface TooltipRenderProps {
  step: StepDefinition;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  back: () => void;
  skip: () => void;
  stop: () => void;
}

export type TooltipComponent = ComponentType<TooltipRenderProps>;

/** Author-facing step definition. */
export interface StepDefinition {
  /** Unique within the tour. Must match a useTourTarget(id). */
  id: string;
  title?: string;
  body?: string | ReactNode;
  /** Per-step custom tooltip; overrides the tour/provider default. */
  render?: TooltipComponent;
  /** Hole appearance for this step; merged over provider defaults. */
  cutout?: Cutout;
}

export interface TourDefinition {
  /** Unique tour id. Used by start(id) and for persistence keys. */
  id: string;
  steps: StepDefinition[];
  /** Auto-start once per persistence-adapter lifetime. (Wired in a later week.) */
  showOnce?: boolean;
  onComplete?: () => void;
  onSkip?: (atIndex: number) => void;
}

/** Options for marking a target. scrollRef/index land in Week 4-5. */
export interface UseTourTargetOptions {
  scrollRef?: RefObject<ScrollView | FlatList<unknown>>;
  index?: number;
  enabled?: boolean;
}

export interface TourController {
  start: (tourId: string, options?: { fromIndex?: number }) => void;
  stop: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  isActive: boolean;
  activeTourId: string | null;
  currentStep: StepDefinition | null;
  stepIndex: number;
  totalSteps: number;
  progress: number;
}

/** Internal: a registered target ref keyed by step id. */
export type TargetRegistry = Map<string, RefObject<View | null>>;
