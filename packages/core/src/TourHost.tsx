import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { getCurrentStep, isFirst, isLast } from './engine/machine';
import { useTourContext } from './context';
import { Cutout } from './overlay/Cutout';
import { Tooltip } from './overlay/Tooltip';
import type { TooltipRenderProps } from './types';

/**
 * The overlay layer. Rendered as the last child of the provider, in the app's own
 * window (NOT a Modal), so it shares the coordinate space of measureInWindow and
 * floats above the content without a separate native window.
 */
export function TourHost() {
  const { state, controller, currentRect, shared, theme, tooltipComponent, screen } =
    useTourContext();

  if (state.status !== 'active') return null;
  const step = getCurrentStep(state);
  if (!step) return null;

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
      {/* Tap the dimmed area to advance. Tooltip buttons render above this. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={controller.next} />
      {currentRect ? (
        <Tooltip
          renderProps={renderProps}
          rect={currentRect}
          theme={theme}
          screen={screen}
          custom={tooltipComponent}
        />
      ) : null}
    </>
  );
}
