import { resolveTheme, lightTheme, darkTheme } from './theme';

describe('resolveTheme', () => {
  it('returns the light base for the light scheme', () => {
    const t = resolveTheme('light');
    expect(t.tooltip.backgroundColor).toBe(lightTheme.tooltip.backgroundColor);
    expect(t.overlayColor).toBe(lightTheme.overlayColor);
    expect(t.accent).toBe(lightTheme.accent);
    expect(t.labels.next).toBe('Next');
  });

  it('returns the dark base for the dark scheme', () => {
    const t = resolveTheme('dark');
    expect(t.tooltip.backgroundColor).toBe(darkTheme.tooltip.backgroundColor);
    expect(t.overlayColor).toBe(darkTheme.overlayColor);
  });

  it('overrides top-level tokens', () => {
    const t = resolveTheme('light', { accent: '#ff0000', overlayColor: 'rgba(0,0,0,0.5)' });
    expect(t.accent).toBe('#ff0000');
    expect(t.overlayColor).toBe('rgba(0,0,0,0.5)');
  });

  it('deep-merges tooltip partials, keeping untouched base values', () => {
    const t = resolveTheme('light', { tooltip: { backgroundColor: '#000000' } });
    expect(t.tooltip.backgroundColor).toBe('#000000');
    expect(t.tooltip.textColor).toBe(lightTheme.tooltip.textColor);
    expect(t.tooltip.borderRadius).toBe(lightTheme.tooltip.borderRadius);
  });

  it('deep-merges label partials, keeping untouched base values', () => {
    const t = resolveTheme('dark', { labels: { skip: 'Dismiss' } });
    expect(t.labels.skip).toBe('Dismiss');
    expect(t.labels.next).toBe('Next');
    expect(t.labels.done).toBe('Done');
  });

  it('applies a fontFamily override', () => {
    const t = resolveTheme('light', { tooltip: { fontFamily: 'Inter' } });
    expect(t.tooltip.fontFamily).toBe('Inter');
  });

  it('does not mutate the base presets', () => {
    resolveTheme('light', { tooltip: { padding: 99 }, labels: { next: 'X' } });
    expect(lightTheme.tooltip.padding).toBe(16);
    expect(lightTheme.labels.next).toBe('Next');
  });
});
