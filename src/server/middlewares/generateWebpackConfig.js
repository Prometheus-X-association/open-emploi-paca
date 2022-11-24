const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const env = require("env-var");

/**
 * @param {string} distPath
 * @param {string} assetsPath
 * @param {string} jsAssetsPath
 * @param {string} htmlTemplatePath
 * @param {object} entries
 */
export function generateWebpackConfig({
  distPath,
  assetsPath = "a/",
  jsAssetsPath = "js/",
  htmlTemplatePath,
  entries,
}) {
  let isDev = process.env.NODE_ENV !== "production";
  let isProd = !isDev;
  let isCI = !!process.env.CI;

  /** mode **/
  let mode = isDev ? "development" : "production";

  /** devtool **/
  let devtool = isDev ? "cheap-module-source-map" : false;

  /** entry **/
  let entry = entries.reduce((acc, { name, entry }) => {
    if (isDev) {
      acc[name] = [
        "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000",
        entry,
      ];
    } else {
      acc[name] = entry;
    }
    return acc;
  }, {});

  /** output **/
  let output = {
    path: distPath,
    filename: jsAssetsPath + (isDev ? "[name].js" : "[name].[hash].js"),
    chunkFilename: jsAssetsPath + (isDev ? "[name].js" : "[name].[hash].js"),
    publicPath: "/",
  };

  /** plugins **/
  let plugins = [
    new CleanWebpackPlugin(),
    ...(!isCI ? [new webpack.ProgressPlugin()] : []),
    ...entries.map(
      ({ html }) =>
        new HtmlWebpackPlugin({
          inject: "body",
          ...html,
        })
    ),
    ...(isDev
      ? [
          new webpack.HotModuleReplacementPlugin(),
          new ReactRefreshWebpackPlugin(),
        ]
      : []),
    ...(isProd
      ? [
          new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].[hash].css",
          }),
          new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
          }),
          new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
              level: 11,
            },
            threshold: 10240,
            minRatio: 0.8,
          }),
        ]
      : []),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: "development",
      SYNAPTIX_USER_SESSION_COOKIE_NAME: "SNXID",
      THUMBOR_BASE_URL: "",
    }),
  ];

  /** optimization **/
  let optimization = {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test(module) {
            return module.resource && module.resource.includes(`.yarn/cache`);
          },
          name: "vendors",
          chunks: "all",
        },
      },
    },
  };

  if (isProd) {
    optimization.minimize = true;
    optimization.minimizer = [
      new TerserPlugin({
        extractComments: true,
      }),
    ];
  }

  // HMR
  // if(isDev && env.get("HOT_RELOAD_DISABLED").asBool() !== true) {
  //   entry.hmr = "webpack-hot-middleware/client";
  //   plugins.push(new webpack.HotModuleReplacementPlugin());
  // }

  /** modules **/
  let webpackModule = {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              rootMode: "upward",
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        exclude: /node_modules\/wever/,
        use: [require.resolve("style-loader"), require.resolve("css-loader")],
      },
      {
        test: /\.css$/i,
        include: /node_modules\/wever/,
        use: [
          require.resolve("style-loader"),
          {
            loader: require.resolve("css-loader"),
            options: {
              url: false,
            },
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico|woff|woff2|eot|ttf)$/i,
        use: {
          loader: require.resolve("file-loader"),
          options: {
            name: "[name].[hash].[ext]",
            outputPath: assetsPath,
          },
        },
      },
      {
        test: /\.md/,
        use: require.resolve("raw-loader"),
      },
    ],
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
        ".css" /* for libraries shipping ES6 module to work */,
      ],
      fallback: {
        // This is to avoid the error "BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default."
        path: false,
        url: false,
        events: require.resolve("events"),
      },
    },
    cache: {
      type: "filesystem",
    },
    performance: {
      hints: false,
    },
  };
}
