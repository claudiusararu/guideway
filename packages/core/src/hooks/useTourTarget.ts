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
 * Pass `scrollRef` when the target lives in a ScrollView/FlatList: the tour scrolls it
 * into view before highlighting (in either direction). Every in-scroll target needs it.
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
    registry.set(id, { ref, scrollRef: options.scrollRef, index: options.index });
    return () => {
      if (registry.get(id)?.ref === ref) registry.delete(id);
    };
  }, [id, enabled, registry, options.scrollRef, options.index]);

  return ref;
}
