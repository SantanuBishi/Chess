const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },

  resolver: {
    // SVG ko asset ke roop mein load nahi karna
    assetExts: [
      ...defaultConfig.resolver.assetExts.filter(
        (ext) => ext !== 'svg'
      ),
      'wasm',
      'html',
    ],

    // SVG ko React component ke roop mein transform karna
    sourceExts: [
      ...defaultConfig.resolver.sourceExts.filter(
        (ext) => ext !== 'svg'
      ),
      'svg',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);