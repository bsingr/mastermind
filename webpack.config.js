var webpack = require('webpack');
var fs = require('fs');

var config = {
  entry: {
    'app': './app/index.js'
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: `[name].[hash].js`,
    publicPath: __dirname + '/dist'
  },
  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: 'babel',
        exclude: /(node_modules)/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  plugins: [
    function() {
       this.plugin("done", function(stats) {
         const hash = stats.toJson().hash;
         fs.readFile('./index.html', 'utf8', function (err,data) {
           if (err) {
             return console.log('ERR', err);
           }
           var result = data.replace(/dist\/app.*.js/g, `dist/app.${hash}.js`);
           fs.writeFile('./index.html', result, 'utf8', function (err) {
              if (err) return console.log('ERR', err);
           });
         });
       });
    }
  ]
};

module.exports = config;
