/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

const merge = require('webpack-merge').merge

// plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const SveltePreprocess = require('svelte-preprocess')
const Autoprefixer = require('autoprefixer')

module.exports = (env) => {
  const devMode = env.mode === 'development'

  const config = {
    entry: { bundle: ['./src/index.ts', './src/style.css'] },

    resolve: {
      alias: { svelte: path.resolve('node_modules', 'svelte') },
      extensions: ['.ts', '.js', '.mjs', '.svelte', '.json'],
      mainFields: ['svelte', 'browser', 'module', 'main'],
    },

    module: {
      rules: [
        {
          test: /\.svelte$/,
          use: {
            loader: 'svelte-loader',
            options: {
              compilerOptions: {
                dev: devMode,
              },
              emitCss: !devMode,
              hotReload: devMode,
              hotOptions: {
                // List of options and defaults: https://www.npmjs.com/package/svelte-loader-hot#usage
                noPreserveState: false,
                optimistic: true,
              },
              preprocess: SveltePreprocess({
                scss: true,
                sass: true,
                postcss: {
                  plugins: [Autoprefixer],
                },
              }),
            },
          },
        },
        // Required to prevent errors from Svelte on Webpack 5+
        {
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
          ],
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },

    plugins: [
      new HtmlWebpackPlugin({
        title: 'SpinBlocks',
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'assets/**',

            // if there are nested subdirectories , keep the hierarchy
            to({ absoluteFilename }) {
              const assetsPath = path.resolve(__dirname, 'assets')
              return `assets/${absoluteFilename.slice(assetsPath.length)}`
            },
          },
        ],
      }),
    ],
  }
  const envConfig = require(path.resolve(__dirname, `./webpack.${env.mode || 'development'}.js`))(
    env
  )

  return merge(config, envConfig)
}
