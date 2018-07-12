'use strict';

const webpack = require('webpack');
const path = require('path');
var glob = require("glob");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
function getdemoView(globPath,flag){
    let demofiles = glob.sync(globPath);
    // console.log(demofiles);
    // console.log("================");
    let entries = {},
    entry, dirname, basename, pathname, extname;

    demofiles.forEach(item => {
        entry = item;
        // console.log(entry);
        dirname = path.dirname(entry);//当前目录
        // console.log(dirname)
        // console.log("2222222222222222222222")
        extname = path.extname(entry);//后缀
        basename = path.basename(entry, extname);//文件名
        pathname = path.join(dirname, basename);//文件路径
        if (extname === '.html') {
            entries[pathname] = './' + entry;
        } else if (extname === '.js') {
            entries[basename] = entry;
        }
    });

    return entries;
}

let config= {
//	context: path.resolve(__dirname, './src/js'),
	devtool: 'source-map',
	target:"web",
	entry: {
		commons:['lib/jquery-2.1.0.js','lib/bootstrap/js/bootstrap.min.js','lib/vue.js'],
		index: path.resolve(__dirname, '../src/views/index/index.js'),
		test:path.resolve(__dirname, '../src/views/test/test.js')
	},
	output: {
		publicPath: "/wechat-html/",
		path: path.resolve(__dirname, '../dist/'),
		filename: 'js/[name].bundle.js?v=[hash]',
	},
	module: {
		rules: [
			{

				test: /\.js$/,

				exclude: /node_modules/,

				use: [{
					loader: 'babel-loader',

					options: {
						presets: ['es2015'],
						plugins: [["component", [
						    {
						      "libraryName": "element-ui",
						      "styleLibraryName": "theme-default"
						    }
						]]]
					}
				}],
			},
			{

				test: /\.css$/,

				use: ExtractTextPlugin.extract({

					use: [{
							loader: 'css-loader?importLoaders=1',
						},
						{
							loader: 'postcss-loader',

							options: {

								plugins: function() {
									return [

										require('autoprefixer')({
											browsers: ['ios >= 7.0']
										})
									];
								}
							}
						}]
				})
			},
			{

				test: /\.less$/,

				use: ExtractTextPlugin.extract({
					use: [{
							loader: 'css-loader?importLoaders=1',
						},
						{
							loader: 'postcss-loader',

							options: {
								plugins: function() {
									return [
										require('autoprefixer')({
											browsers: ['ios >= 7.0']
										})
									];
								}
							}
						},

						"less-loader"
					]
				})
			},
			{

				test: /\.(png|jpg|gif)$/i,
				use: [{

						loader: 'url-loader',
						options: {

							limit: 10000,

							name: 'img/[name].[ext]'
						}
					},
					{

						loader: 'img-loader?minimize&optimizationLevel=5&progressive=true'
					},

				]
			},
			{

				test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
				use: {

					loader: 'url-loader',
					options: {

						limit: 10000,

						name: 'font/[name].[ext]'
					}
				}
			},
			{

				test: /\.vue$/,
				use: {
					loader: 'vue-loader',
				}
			},
			{

				test: /\.html$/,
				use: {
					loader: 'html-withimg-loader',
				}
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
	      	'process.env': {
	       		NODE_ENV: '"production"'
	      	}
	    }),

		// new HtmlWebpackPlugin({
		// 	filename: 'index.html',
		// 	template: path.resolve(__dirname,'../src/views/index/index.ejs'),
		// 	chunks:['commons','app']
		// }),
		// new HtmlWebpackPlugin({
		// 	filename: 'test.html',
		// 	template: path.resolve(__dirname,'../src/views/test/index.html'),
		// 	chunks:['commons','test']
		// }),

		new ExtractTextPlugin({
			filename: 'css/styles.css?v=[hash]'
		}),

		new OptimizeCssAssetsPlugin({
			assetNameRegExp: /\.css$/g,
			cssProcessor: require('cssnano'),
			cssProcessorOptions: {
				discardComments: {
					removeAll: true
				}
			},
			canPrint: true
		}),
		new webpack.optimize.CommonsChunkPlugin({
		    name: 'commons',
		    filename: 'js/[name].bundle.js',
		    minChunks: 4,
	  	}),

		new webpack.ProvidePlugin({
			vue: 'lib/vue.js',
			jQuery:'lib/jquery-2.1.0.js'
		})
	],
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		port: 8080,
		compress: true,
		//inline:true,
		//hot: true
	},
	resolve: {

		extensions: [' ','.css','.less','.js','.json','.vue'],

		modules: [path.resolve(__dirname, "src"), "node_modules"],

		alias: {
			"components":path.resolve(__dirname,'../src/components'),
			"assets":path.resolve(__dirname,'../src/assets'),
			"lib":path.resolve(__dirname,'../src/lib'),
		}
	}
};

let pages = Object.keys(getdemoView('./src/views/*/*.html'));

pages.forEach(pathname => {
    let htmlname = pathname.split('src\\')[1];


		let cla=htmlname.split('\\');
		console.log(cla[1]!="comm")
		if(cla[1]!="comm"){
			console.log(`./src/views/${cla[1]}/${cla[1]}.html`)
    let conf = {
        filename: `${cla[1]}.html`,

        template: `./src/views/${cla[1]}/${cla[1]}.html`,
        hash: true,
        chunks:["commons",cla[1]],
        minify: {
              removeAttributeQuotes:true,
              removeComments: true,
              collapseWhitespace: true,
              removeScriptTypeAttributes:true,
              removeStyleLinkTypeAttributes:true
          }
    }
    config.plugins.push(new HtmlWebpackPlugin(conf));
	}
});
module.exports =config;
