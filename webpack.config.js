const {
  DefinePlugin,
  IgnorePlugin,
  LoaderOptionsPlugin,
  NoEmitOnErrorsPlugin,
  ProgressPlugin,
  optimize,
} = require('webpack');
const path = require('path');

const {
  AggressiveMergingPlugin
} = optimize;

// production env?
const isProduction = (process.env.NODE_ENV === 'production');

if (isProduction) {
  console.log('########## PRODUCTION MODE');
}
// directories
const projectRoot = path.resolve(__dirname, '.');
const srcRoot = path.resolve(projectRoot, 'src');
const distRoot = path.resolve(projectRoot, 'dist');

const commonPlugins = [
  new IgnorePlugin(/vertx/),
  new LoaderOptionsPlugin({
    minimize: true,
    debug: !isProduction,
    options: {}
  }),
  new DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  })
];

const devPlugins = [
  new ProgressPlugin()
];

const prodPlugins = [
  new AggressiveMergingPlugin(),
  new NoEmitOnErrorsPlugin(),
];

const plugins = isProduction ?
  [...commonPlugins, ...prodPlugins] : [...commonPlugins, ...devPlugins];

module.exports = {
  target: 'node',
  devtool: !isProduction && 'source-map',
  entry: {
    handler: path.resolve(srcRoot, 'handler'),
  },
  output: {
    path: distRoot,
    filename: '[name].js',
    sourceMapFilename: '[name].map',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader']
    }]
  },
  plugins,
  node: {
    __filename: true,
    __dirname: true,
    console: true
  }
};
