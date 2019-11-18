var version = require('./package.json').version;
var path = require( 'path' );
const TerserPlugin = require('terser-webpack-plugin');


const babelSettings = {
  plugins: [
    'add-module-exports',
    'transform-regenerator',
	'babel-plugin-transform-class-properties',
	'transform-decorators-legacy',
  ],
  presets: [ 'env', 'stage-1', 'react' ]
};


module.exports = [
    {
	  name: 'dev',
	  mode: 'development',
	  optimization: {
		minimize: false
	  },
      entry: './src/index.js',
      output: {
          filename: 'index.js',
          path: '/Huawei/jupyter-react-example-master/qcircuit/static',
          libraryTarget: 'umd'
      },
      module : {
        rules : [
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: [`babel-loader?${JSON.stringify( babelSettings )}`]
          },
          { test: /\.css$/, loader: "style-loader?sourceMap!css-loader?importLoaders=1" },
          {
            test: /\.json$/, loader: 'json-loader'
          }
        ]
      }
    }, {
	  name: 'production',
	  mode: 'production',
	  optimization: {
		minimize: true,
		minimizer: [
		  new TerserPlugin({
			cache: true,
			parallel: true,
			sourceMap: true, // Must be set to true if using source-maps in production
			terserOptions: {
			  // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
			}
		  }),
		],
	  },
      entry: './src/index.js',
      output: {
          filename: 'index.js',
          path: '/Huawei/jupyter-react-example-master/qcircuit/static',
          libraryTarget: 'umd'
      },
      module : {
        rules : [
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: [`babel-loader?${JSON.stringify( babelSettings )}`]
          },
          { test: /\.css$/, loader: "style-loader?sourceMap!css-loader?importLoaders=1" },
          {
            test: /\.json$/, loader: 'json-loader'
          }
        ]
      }
    }
];
