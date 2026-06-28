# Guideway

**Product tours, coachmarks, and spotlight onboarding for React Native and Expo.**

Built for the New Architecture from day one: Fabric-safe measurement, a Reanimated
spotlight that animates on the UI thread, hook-first API, zero native config (works in
Expo Go). The incumbents broke when Fabric became mandatory. This one is built for it.

> Status: early development (Week 1 skeleton). The core engine, measurement, and the
> animated spotlight are in place; auto-scroll, FlatList, persistence, and the docs site
> land over the following weeks. Not yet published to npm.

MIT licensed and free. A paid Onboarding Kit (pre-built flow recipes + styled screens)
will live separately.

## Quick taste

```tsx
import { TourProvider, useTour, useTourTarget } from 'guideway';

function Screen() {
  const search = useTourTarget('search');
  const create = useTourTarget('create');
  const { start } = useTour();

  return (
    <View>
      <TextInput ref={search} placeholder="Search" />
      <Pressable ref={create}><Text>+</Text></Pressable>
      <Button title="Show me around" onPress={() => start('main')} />
    </View>
  );
}

// tours are plain data
const tours = [{
  id: 'main',
  steps: [
    { id: 'search', title: 'Find anything', body: 'Search your whole library here.' },
    { id: 'create', title: 'Create instantly', body: 'Start something new from the + button.', cutout: { shape: 'circle' } },
  ],
}];

// wrap the app
<TourProvider tours={tours}><Screen /></TourProvider>
```

No HOCs, no wrapper views that shift your layout, no manual step ordering. Tours are
plain data, so remote-config and A/B-tested onboarding come for free.

## Repo layout (pnpm monorepo)

- `packages/core` - the `guideway` library (MIT).
- `apps/example` - an Expo demo app and dev harness.

## Develop

```bash
pnpm install
pnpm test           # unit tests for the core engine (Jest)
pnpm typecheck

# run the demo (aligns Expo/RN/Reanimated versions to the SDK first)
cd apps/example && npx expo install --fix && npx expo start
```

## License

MIT - see [`LICENSE`](./LICENSE). Built by [Claudiu Sararu](https://github.com/claudiusararu) - [guideway.dev](https://guideway.dev).
