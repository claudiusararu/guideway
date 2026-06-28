/** The fully-resolved theme used to render the overlay + tooltip. */
export interface GuidewayTheme {
  /** Scrim color (include the opacity in the rgba). */
  overlayColor: string;
  /** Single accent, used on the primary button. */
  accent: string;
  tooltip: {
    backgroundColor: string;
    textColor: string;
    titleColor: string;
    borderRadius: number;
    padding: number;
    maxWidth: number;
    /** Optional font for tooltip text (your brand font). */
    fontFamily?: string;
  };
  /** Built-in tooltip button labels (localize / customize here). */
  labels: { next: string; back: string; skip: string; done: string };
}

export type ColorScheme = 'light' | 'dark';

/** Partial theme a consumer passes; deep-merged over the chosen base. */
export interface ThemeOverride {
  overlayColor?: string;
  accent?: string;
  tooltip?: Partial<GuidewayTheme['tooltip']>;
  labels?: Partial<GuidewayTheme['labels']>;
}

const LABELS = { next: 'Next', back: 'Back', skip: 'Skip', done: 'Done' };

export const lightTheme: GuidewayTheme = {
  overlayColor: 'rgba(12,14,22,0.78)',
  accent: '#2347ff',
  tooltip: {
    backgroundColor: '#ffffff',
    textColor: '#33384a',
    titleColor: '#0b0d12',
    borderRadius: 16,
    padding: 16,
    maxWidth: 320,
  },
  labels: { ...LABELS },
};

export const darkTheme: GuidewayTheme = {
  overlayColor: 'rgba(0,0,0,0.84)',
  accent: '#6c8cff',
  tooltip: {
    backgroundColor: '#1b1e26',
    textColor: '#b9bfcc',
    titleColor: '#f4f6fa',
    borderRadius: 16,
    padding: 16,
    maxWidth: 320,
  },
  labels: { ...LABELS },
};

/** Pick the base for the scheme, then deep-merge the consumer's override. Pure. */
export function resolveTheme(scheme: ColorScheme, override?: ThemeOverride): GuidewayTheme {
  const base = scheme === 'dark' ? darkTheme : lightTheme;
  return {
    overlayColor: override?.overlayColor ?? base.overlayColor,
    accent: override?.accent ?? base.accent,
    tooltip: { ...base.tooltip, ...override?.tooltip },
    labels: { ...base.labels, ...override?.labels },
  };
}
