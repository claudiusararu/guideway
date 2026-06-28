import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { ResolvedTheme } from '../context';
import type { TargetRect, TooltipRenderProps, TooltipComponent } from '../types';

interface TooltipProps {
  renderProps: TooltipRenderProps;
  rect: TargetRect;
  theme: ResolvedTheme;
  screen: { width: number; height: number };
  custom?: TooltipComponent;
}

const GAP = 12;
const MARGIN = 16;

/**
 * Positions the tooltip near the target. Week 1: placed below the target (above if
 * there is no room), left-aligned and clamped to the screen. Week 2 swaps in
 * floating-ui for full flip/shift + an arrow.
 */
export function Tooltip({ renderProps, rect, theme, screen, custom }: TooltipProps) {
  const Custom = renderProps.step.render ?? custom;
  const estimatedHeight = 150;
  const below = rect.y + rect.height + GAP;
  const placeAbove = below + estimatedHeight > screen.height - MARGIN;
  const top = placeAbove
    ? Math.max(MARGIN, rect.y - estimatedHeight - GAP)
    : below;
  const left = clamp(rect.x, MARGIN, screen.width - theme.tooltip.maxWidth - MARGIN);

  return (
    <View
      style={[styles.anchor, { top, left, maxWidth: theme.tooltip.maxWidth }]}
      pointerEvents="box-none"
    >
      {Custom ? <Custom {...renderProps} /> : <BuiltInTooltip {...renderProps} theme={theme} />}
    </View>
  );
}

function BuiltInTooltip(props: TooltipRenderProps & { theme: ResolvedTheme }) {
  const { step, stepIndex, totalSteps, isFirst, isLast, next, back, skip, theme } = props;
  const t = theme.tooltip;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.backgroundColor, borderRadius: t.borderRadius, padding: t.padding },
      ]}
    >
      {step.title ? <Text style={[styles.title, { color: t.titleColor }]}>{step.title}</Text> : null}
      {typeof step.body === 'string' ? (
        <Text style={[styles.body, { color: t.textColor }]}>{step.body}</Text>
      ) : (
        step.body ?? null
      )}

      <View style={styles.row}>
        <Pressable hitSlop={8} onPress={skip}>
          <Text style={[styles.skip, { color: t.textColor }]}>Skip</Text>
        </Pressable>

        <View style={styles.spacer} />
        <Text style={[styles.count, { color: t.textColor }]}>
          {stepIndex + 1} / {totalSteps}
        </Text>

        {!isFirst ? (
          <Pressable hitSlop={8} onPress={back} style={styles.ghost}>
            <Text style={[styles.ghostText, { color: t.titleColor }]}>Back</Text>
          </Pressable>
        ) : null}

        <Pressable hitSlop={8} onPress={next} style={[styles.primary, { backgroundColor: theme.accent }]}>
          <Text style={styles.primaryText}>{isLast ? 'Done' : 'Next'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(Math.max(min, max), n));
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute' },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  spacer: { flex: 1 },
  count: { fontSize: 13, opacity: 0.6, marginRight: 4 },
  skip: { fontSize: 14, fontWeight: '600', opacity: 0.7 },
  ghost: { paddingVertical: 8, paddingHorizontal: 12 },
  ghostText: { fontSize: 14, fontWeight: '700' },
  primary: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
