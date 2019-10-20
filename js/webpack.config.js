var version = require('./package.json').version;
var path = require( 'path' );

const babelSettings = {
  plugins: [
    'add-module-exports',
    'transform-regenerator',
	'babel-plugin-transform-class-properties'
  ],
  presets: [ 'env', 'stage-1', 'react' ]
};


module.exports = [
    {
	  mode: 'development',
	  optimization: {
		minimize: false
	  },
      entry: './src/index.js',
      output: {
          filename: 'index.js',
          path: '/Huawei/jupyter-react-example-master/example/static',
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
