# Guideway

**Product tours, coachmarks, and spotlight onboarding for React Native and Expo.**

[![npm](https://img.shields.io/npm/v/guideway.svg)](https://www.npmjs.com/package/guideway)
[![CI](https://github.com/claudiusararu/guideway/actions/workflows/ci.yml/badge.svg)](https://github.com/claudiusararu/guideway/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/guideway.svg)](./LICENSE)

Built for the New Architecture from day one: Fabric-safe measurement, a Reanimated
spotlight that animates on the UI thread, a hook-first API, and zero native config (it runs
in Expo Go). The incumbents broke when Fabric became mandatory. This one is built for it.

> Early but usable. Spotlight tours with smart tooltip positioning - flips and shifts to
> stay on-screen, safe-area aware - work today on real devices. Auto-scroll to off-screen
> targets, FlatList support, persistence, and a docs site are on the way.

MIT licensed and free. A paid Onboarding Kit (pre-built flow recipes + styled screens) will
live separately.

## Installation

**Expo** (recommended - aligns versions to your SDK):

```bash
npx expo install guideway react-native-reanimated react-native-svg
```

**Bare React Native:**

```bash
npm install guideway react-native-reanimated react-native-svg
```

Guideway needs `react-native-reanimated` and `react-native-svg` as peers.

## Usage

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

No HOCs, no wrapper views that shift your layout, no manual step ordering. Tours are plain
data, so remote-config and A/B-tested onboarding come for free.

> Tip: pass `insets={useSafeAreaInsets()}` (from `react-native-safe-area-context`) to
> `TourProvider` so tooltips stay clear of the notch and home indicator.

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
