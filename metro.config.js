const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'wasm',   // 🔥 IMPORTANT: allow JS as asset for WebView
      'html', // 🔥 IMPORTANT
    ],
    sourceExts: defaultConfig.resolver.sourceExts.filter(
      ext => ext !== 'svg'
    ).concat(['svg']),
  },
};

module.exports = mergeConfig(defaultConfig, config);
