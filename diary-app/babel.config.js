module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],
}

// Rule:

// Plugin must be LAST item in the plugins array. If you have other plugins,
// make sure to place 'react-native-reanimated/plugin' at the end of the array.