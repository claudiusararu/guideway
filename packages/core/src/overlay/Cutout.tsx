import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { buildSpotlightPath } from './paths';
import type { SpotlightShared } from '../context';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CutoutProps {
  shared: SpotlightShared;
  color: string;
  screen: { width: number; height: number };
}

/**
 * A full-screen scrim with a rounded-rect hole punched out via fillRule="evenodd".
 * The path is rebuilt from shared values inside a worklet, so the spotlight glides
 * and reshapes entirely on the UI thread.
 */
export function Cutout({ shared, color, screen }: CutoutProps) {
  const animatedProps = useAnimatedProps(() => ({
    d: buildSpotlightPath(screen.width, screen.height, {
      x: shared.x.value,
      y: shared.y.value,
      w: shared.w.value,
      h: shared.h.value,
      r: shared.r.value,
    }),
    fillOpacity: shared.opacity.value,
  }));

  return (
    <Svg
      width={screen.width}
      height={screen.height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <AnimatedPath animatedProps={animatedProps} fill={color} fillRule="evenodd" />
    </Svg>
  );
}
