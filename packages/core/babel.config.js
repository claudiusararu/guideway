// Babel config for Jest (babel-jest). The library itself is built by
// react-native-builder-bob, which uses its own preset, so this is test-only.
module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
  };
};
