module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Must be last. On Reanimated 4, switch this to 'react-native-worklets/plugin'.
    plugins: ['react-native-reanimated/plugin'],
  };
};
