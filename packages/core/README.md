# guideway

[![npm](https://img.shields.io/npm/v/guideway.svg)](https://www.npmjs.com/package/guideway)
[![license](https://img.shields.io/npm/l/guideway.svg)](https://github.com/claudiusararu/guideway/blob/main/LICENSE)

Product tours, coachmarks, and spotlight onboarding for React Native and Expo.
Fabric-first, Reanimated-powered, hook-first, TypeScript-first.

- **Spotlight tours** with an animated cutout (rect / rounded / circle / pill)
- **Smart tooltips** - flip/shift to stay on-screen, safe-area aware
- **Theming** - built-in light/dark + `colorScheme` + tokens, or a custom tooltip
- **Interactive spotlight** - tap through to the real element; keyboard-aware
- **Auto-scroll** - brings off-screen targets into view (ScrollView + FlatList)
- Hook-first, no HOCs, tours are plain data

## Install

Expo (recommended):

```bash
npx expo install guideway react-native-reanimated react-native-svg
```

Bare React Native:

```bash
npm install guideway react-native-reanimated react-native-svg
```

## Usage

```tsx
import { TourProvider, useTour, useTourTarget } from 'guideway';

function Screen() {
  const search = useTourTarget('search');
  const { start } = useTour();
  return (
    <View>
      <TextInput ref={search} placeholder="Search" />
      <Button title="Show me around" onPress={() => start('main')} />
    </View>
  );
}

const tours = [{ id: 'main', steps: [{ id: 'search', title: 'Find anything', body: 'Search here.' }] }];
// wrap your app: <TourProvider tours={tours}><Screen /></TourProvider>
```

See the [repository](https://github.com/claudiusararu/guideway) for full docs, recipes, and
an example app that demos every feature. MIT licensed.
