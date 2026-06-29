import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { getCurrentStep, isFirst, isLast } from './engine/machine';
import { useTourContext } from './context';
import { Cutout } from './overlay/Cutout';
import { Tooltip } from './overlay/Tooltip';
import { overlayBands } from './overlay/bands';
import type { TargetRect, TooltipRenderProps } from './types';

/**
 * The overlay layer. Rendered as the last child of the provider, in the app's own
 * window (NOT a Modal), so it shares the coordinate space of measureInWindow and
 * floats above the content without a separate native window.
 */
export function TourHost() {
  const {
    state,
    controller,
    currentRect,
    shared,
    theme,
    tooltipComponent,
    overlayTapBehavior,
    allowTargetInteraction,
    insets,
    screen,
  } = useTourContext();

  if (state.status !== 'active') return null;
  const step = getCurrentStep(state);
  if (!step) return null;

  const onScrimTap = () => {
    if (overlayTapBehavior === 'next') controller.next();
    else if (overlayTapBehavior === 'skip') controller.skip();
    // 'none' -> swallow the tap, do nothing
  };

  const renderProps: TooltipRenderProps = {
    step,
    stepIndex: state.stepIndex,
    totalSteps: controller.totalSteps,
    progress: controller.progress,
    isFirst: isFirst(state),
    isLast: isLast(state),
    next: controller.next,
    back: controller.back,
    skip: controller.skip,
    stop: controller.stop,
  };

  return (
    <>
      <Cutout shared={shared} color={theme.overlayColor} screen={screen} />
      <ScrimTouchLayer
        hole={allowTargetInteraction ? currentRect : null}
        screen={screen}
        onTap={onScrimTap}
      />
      {currentRect ? (
        <Tooltip
          key={step.id}
          renderProps={renderProps}
          rect={currentRect}
          theme={theme}
          screen={screen}
          insets={insets}
          custom={tooltipComponent}
        />
      ) : null}
    </>
  );
}

/**
 * The tap-catching scrim. With no hole (default) it's a single full-screen catcher that
 * blocks all touches. With a hole (allowTargetInteraction) it's four bands around the
 * hole - so taps inside the hole fall through to the real target.
 */
function ScrimTouchLayer({
  hole,
  screen,
  onTap,
}: {
  hole: TargetRect | null;
  screen: { width: number; height: number };
  onTap: () => void;
}) {
  if (!hole) {
    return <Pressable style={StyleSheet.absoluteFill} onPress={onTap} />;
  }
  const b = overlayBands(hole, screen);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {[b.top, b.bottom, b.left, b.right].map((r, i) => (
        <Pressable
          key={i}
          onPress={onTap}
          style={{ position: 'absolute', left: r.x, top: r.y, width: r.width, height: r.height }}
        />
      ))}
    </View>
  );
}
