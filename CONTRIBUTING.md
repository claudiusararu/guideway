# Contributing to Guideway

Thanks for helping out. Bug reports, docs fixes, and pull requests are all welcome.

For anything bigger than a small fix (a new prop, a behavior change, a new feature), please
open an issue first so we can agree on the API before you write the code.

## Setup

You need Node 22 and pnpm 9 (the exact version is pinned in `package.json` under
`packageManager`, so `corepack enable` picks it up).

```bash
git clone https://github.com/claudiusararu/guideway.git
cd guideway
pnpm install
```

## Repo layout

- `packages/core` - the `guideway` library. This is what ships to npm.
- `apps/example` - an Expo demo app that doubles as the dev harness.

Inside `packages/core/src`:

- `engine/machine.ts` - the tour state machine (a pure reducer).
- `measure.ts`, `scroll.ts` - Fabric-safe measurement and auto-scroll.
- `overlay/` - the spotlight path math (`paths.ts`), tooltip positioning (`position.ts`),
  touch bands (`bands.ts`), and the `Cutout` and `Tooltip` components.
- `theme.ts`, `persistence.ts` - theming and `showOnce` storage.
- `TourProvider.tsx`, `TourHost.tsx`, `hooks/` - the React layer.

## Running the demo

```bash
cd apps/example
npx expo start
```

The example resolves `guideway` to `packages/core/src` (see `apps/example/metro.config.js`),
so your changes to the library show up on reload with no build step. The Expo Go app on your
simulator or device must match the example's Expo SDK version.

## Tests

```bash
pnpm typecheck
pnpm test
pnpm test:coverage
```

Tests run in Jest. The pure modules (state machine, measurement, scroll math, positioning,
paths, bands, theme, persistence) are kept close to 100% coverage, so a change to one of them
should come with tests. CI runs the typecheck and the tests on every push and pull request.

## Before you open a pull request

- `pnpm typecheck` and `pnpm test` pass.
- If you changed the example app, it still bundles: `cd apps/example && npx expo export --platform ios`.
- If you changed anything visual (overlay, tooltip, measurement, scrolling), you checked it on
  a simulator or device. Mention which platforms in the PR. Measurement bugs often show up on
  only one platform, so iOS and Android both matter.
- If you changed the public API, you updated the README.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/) with a scope where it
helps, for example:

- `feat(core): auto-scroll FlatList items by index`
- `fix(core): dismiss the keyboard on step change`
- `docs: add a persistence recipe`
- `chore(example): bump Expo SDK`

## Releases

The maintainer handles version bumps, npm publishing, and GitHub releases.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By taking part, you
agree to uphold it.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).
