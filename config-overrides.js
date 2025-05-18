module.exports = function override(config) {
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'asset/resource',
    generator: {
      filename: 'wasm/[name][ext][query]',
    },
  });
  config.resolve = {
    ...config.resolve,
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.wasm'],
  };
  config.output = {
    ...config.output,
    assetModuleFilename: 'wasm/[name][ext][query]',
  };
  return config;
};