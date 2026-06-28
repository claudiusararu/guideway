import { useEffect, useRef } from 'react';
import type { View } from 'react-native';
import { useTourContext } from '../context';
import type { UseTourTargetOptions } from '../types';

/**
 * Mark a view as a tour target. Attach the returned ref to YOUR view - no wrapper,
 * no layout shift (the #1 bug in the HOC-era incumbents).
 *
 *   const ref = useTourTarget('search');
 *   return <TextInput ref={ref} ... />;
 *
 * scrollRef / index are accepted now and wired for auto-scroll in a later release.
 */
export function useTourTarget(
  id: string,
  options: UseTourTargetOptions = {}
): React.RefObject<View | null> {
  const { registry } = useTourContext();
  const ref = useRef<View | null>(null);
  const enabled = options.enabled ?? true;

  useEffect(() => {
    if (!enabled || !id) {
      registry.delete(id);
      return;
    }
    registry.set(id, ref);
    return () => {
      if (registry.get(id) === ref) registry.delete(id);
    };
  }, [id, enabled, registry]);

  return ref;
}
