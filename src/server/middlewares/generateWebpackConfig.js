const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

const env = require("env-var");

/**
 * @param {string} distPath
 * @param {string} htmlTemplatePath
 * @param {string} mainJsPath
 */
export function generateWebpackConfig({
  distPath,
  htmlTemplatePath,
  mainJsPath
}) {
  let isDev = process.env.NODE_ENV !== "production";
  let isProd = !isDev;
  let isCI = !!process.env.CI;

  /** mode **/
  let mode = isDev ? "development" : "production";

  /** devtool **/
  let devtool = isDev ? "cheap-module-source-map" : false;

  /** entry **/
  let entry = [
    ...(isDev && env.get("HOT_RELOAD_DISABLED").asBool() !== true
      ? ["webpack-hot-middleware/client?reload=true"]
      : []),
    mainJsPath
  ];

  /** output **/
  let output = {
    path: distPath,
    filename: isDev ? "[name].js" : "[name].[hash].js",
    chunkFilename: isDev ? "[name].js" : "[name].[hash].js",
    publicPath: "/"
  };

  /** plugins **/
  let plugins = [
    ...(!isCI ? [new webpack.ProgressPlugin()] : []),
    new HtmlWebpackPlugin({
      template: htmlTemplatePath,
      inject: "body",
      filename: "index.html"
    }),
    ...(isDev && env.get("HOT_RELOAD_DISABLED").asBool() !== true
      ? [new webpack.HotModuleReplacementPlugin()]
      : []),
    ...(isProd
      ? [
          new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].[hash].css"
          }),
          new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8
          }),
          new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              level: 11
            },
            threshold: 10240,
            minRatio: 0.8
          })
        ]
      : []),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      SYNAPTIX_USER_SESSION_COOKIE_NAME: "SNXID"
    })
  ];

  /** optimization **/
  let optimization = {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  };

  if (isProd) {
    optimization.minimize = true;
    optimization.minimizer = [
      new TerserPlugin({
        extractComments: true,
      })
    ];
  }

  /** modules **/
  let webpackModule = {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              rootMode: "upward"
            }
          }
        ]
      },
      {
        /*
         * Also, CSS dependencies in node_modules are not used by this project
         *
         */
        test: /\.css$/i,
        include: /node_modules/,
        use: [require.resolve("style-loader"), require.resolve("css-loader")]
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: require.resolve("url-loader"),
            options: {
              limit: 4096
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: {
          loader: require.resolve("file-loader"),
          options: {
            name: "[path][name].[hash].[ext]"
          }
        }
      },
      {
        test: /\.md/,
        use: require.resolve("raw-loader")
      }
    ]
  };

  return {
    mode,
    devtool,
    entry,
    output,
    plugins,
    optimization,
    module: webpackModule,
    resolve: {
      extensions: [
        ".js",
        ".json" /* needed because some dependencies use { import './Package' } expecting to resolve Package.json */,
        ".css" /* for libraries shipping ES6 module to work */
      ],
      fallback: {
        // This is to avoid the error "BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default."
        "path": require.resolve("path-browserify"),
        "url": require.resolve("url"),
        "events": require.resolve("events")
      }
    },
    cache: {
      type: 'filesystem'
    },
    performance: {
      hints: false
    }
  };
}
