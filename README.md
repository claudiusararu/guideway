# Guideway

**Product tours, coachmarks, and spotlight onboarding for React Native and Expo.**

[![npm](https://img.shields.io/npm/v/guideway.svg)](https://www.npmjs.com/package/guideway)
[![CI](https://github.com/claudiusararu/guideway/actions/workflows/ci.yml/badge.svg)](https://github.com/claudiusararu/guideway/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/guideway.svg)](./LICENSE)

Built for the New Architecture from day one: Fabric-safe measurement, a Reanimated
spotlight that animates on the UI thread, a hook-first API, and zero native config (it runs
in Expo Go). The incumbents broke when Fabric became mandatory. This one is built for it.

> Works today on real devices (iOS verified; Android shares the same Fabric-safe paths).
> The core is feature-complete; a docs site is next.

MIT licensed and free. A paid Onboarding Kit (pre-built flow recipes + styled screens) will
live separately.

## Features

- **Spotlight tours** - a Reanimated cutout that glides between targets and reshapes (rect, rounded, circle, pill), entirely on the UI thread.
- **Smart tooltips** - flip above/below and shift sideways to stay on-screen, safe-area aware, with per-step placement.
- **Theming** - built-in light/dark themes, a `colorScheme` prop (`light`/`dark`/`auto`), and tokens for colors, radius, fonts, and button labels - or replace the tooltip entirely.
- **Interactive spotlight** - tap straight through the hole to use the real element (`allowTargetInteraction`), configurable scrim taps, and the keyboard dismisses on every step.
- **Auto-scroll** - off-screen targets scroll into view before highlighting, in `ScrollView` and `FlatList` (virtualized rows via `scrollToIndex`).
- **Persistence** - `showOnce` tours auto-fire once and never nag again, via a pluggable storage adapter (AsyncStorage, MMKV, anything with `getItem`/`setItem`); `reset()` re-arms one.
- **Hook-first** - no HOCs, no wrapper views that shift your layout. Tours are plain data, so remote-config and A/B-tested onboarding come for free.
- **New-Architecture native** - Fabric-safe measurement, zero native config, runs in Expo Go.

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

## Recipes

```tsx
// Dark mode that follows the device
<TourProvider tours={tours} colorScheme="auto" />

// Let users tap the highlighted element itself
<TourProvider tours={tours} allowTargetInteraction />

// Scroll an off-screen target into view first - pass its scroll container
const listRef = useRef<FlatList>(null);
const row = useTourTarget('row', { scrollRef: listRef, index: 29 });

// Restyle anything
<TourProvider tours={tours} theme={{ accent: '#ff5a5f', tooltip: { borderRadius: 20 } }} />

// Show a tour once, ever - persisted across launches (AsyncStorage / MMKV / ...)
import AsyncStorage from '@react-native-async-storage/async-storage';
const onceTours = [{ id: 'welcome', showOnce: true, steps: [/* ... */] }];
<TourProvider tours={onceTours} storage={AsyncStorage} />; // auto-fires once; reset('welcome') re-arms
```

See [`apps/example`](./apps/example) for a working demo of every feature - theming, the
interactive spotlight, and auto-scroll in both a ScrollView and a FlatList.

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
