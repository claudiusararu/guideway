// Monorepo-aware Metro config: watch the workspace root + resolve from both
// the app's and the root's node_modules so the linked `guideway` source resolves.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Resolve workspace packages via their `react-native`/`source` field (src) instead of
// the `exports` map, which points at the built lib/. This lets the example run the live
// source from packages/core - no `bob build` needed on every change.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
