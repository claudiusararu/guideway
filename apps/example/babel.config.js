module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Must be last. Reanimated 4 ships the worklets plugin separately.
    plugins: ['react-native-worklets/plugin'],
  };
};
