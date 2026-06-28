import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { resolveTooltipPosition } from './position';
import type { ResolvedTheme } from '../context';
import type {
  TargetRect,
  TooltipRenderProps,
  TooltipComponent,
  Insets,
  Size,
} from '../types';

interface TooltipProps {
  renderProps: TooltipRenderProps;
  rect: TargetRect;
  theme: ResolvedTheme;
  screen: Size;
  insets: Insets;
  custom?: TooltipComponent;
}

/**
 * Renders the tooltip near the target. It measures its own size on first layout,
 * then runs the pure positioning resolver (flip / shift / clamp to the safe area).
 * Hidden until measured to avoid a position flash. Keyed by step id upstream, so a
 * fresh measure happens per step.
 */
export function Tooltip({ renderProps, rect, theme, screen, insets, custom }: TooltipProps) {
  const [size, setSize] = useState<Size | null>(null);
  const Custom = renderProps.step.render ?? custom;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.width - width) > 1 || Math.abs(size.height - height) > 1) {
      setSize({ width, height });
    }
  };

  const pos = size
    ? resolveTooltipPosition({
        target: rect,
        tooltip: size,
        screen,
        insets,
        preferred: renderProps.step.placement ?? 'bottom',
      })
    : null;

  return (
    <View
      onLayout={onLayout}
      pointerEvents="box-none"
      style={[
        styles.anchor,
        { maxWidth: theme.tooltip.maxWidth },
        pos ? { top: pos.top, left: pos.left, opacity: 1 } : { top: 0, left: 0, opacity: 0 },
      ]}
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
