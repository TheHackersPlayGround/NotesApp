module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@shared-api': '../Api_AppMicarandayo', // Adjust this if your path is different
          },
        },
      ],
      'react-native-reanimated/plugin', // Always keep this as the LAST plugin
    ],
  };
};