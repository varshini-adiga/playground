const presets = [
  ['@babel/preset-env', { corejs: 3, useBuiltIns: 'usage' }],
  '@babel/preset-react'
];

const plugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  ["@babel/plugin-proposal-private-methods", { "loose": true }]
];

const env = {
  development: {
    plugins
  },
  production: {
    plugins: ['transform-react-remove-prop-types', ...plugins]
  }
};

module.exports = {
  presets,
  plugins,
  env
};
