/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack')
const path = require('path')

const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ZipPlugin = require('zip-webpack-plugin')
const SvelteCheckPlugin = require('svelte-check-plugin')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'))

module.exports = (env) => {
  return {
    mode: env.mode,

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'swc-loader',
            options: {
              jsc: {
                parser: {
                  syntax: 'typescript',
                },
              },
            },
          },
        },
        {
          test: /\.(png)$/i,
          type: 'asset',
        },
      ],
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'game.[contenthash].js',
    },

    optimization: {
      minimize: true,
      minimizer: [
        // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
        `...`,
        new TerserPlugin({
          minify: TerserPlugin.swcMinify,
          // `terserOptions` options will be passed to `swc` (`@swc/core`)
          // Link to options - https://swc.rs/docs/config-js-minify
          terserOptions: {},
        }),
        new CssMinimizerPlugin(),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [['optipng', { optimizationLevel: 7 }]],
            },
          },
        }),
      ],
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
      }),

      new webpack.DefinePlugin({
        VERSION: JSON.stringify(pkg.version + 'r'),
        DEV_MODE: JSON.stringify(false),
      }),

      new ESLintPlugin({
        emitError: true,
        emitWarning: true,
        failOnError: true,
        failOnWarning: true,
      }),
      new SvelteCheckPlugin(),
      new webpack.ProgressPlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: './../bundle-report.html',
      }),
      new ZipPlugin({
        filename: 'app.zip',
        exclude: [/\.js.map$/],
      }),
    ],
  }
}
