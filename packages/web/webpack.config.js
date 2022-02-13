const path = require('node:path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const envs = dotenv.config();
dotenvExpand.expand(envs);

function getAppSrc() {
  return path.resolve(process.cwd(), 'src');
}

function resolve(filePath, fileName) {
  return path.resolve(getAppSrc(), filePath, fileName);
}

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const imageInlineSizeLimit = 8192;
const isDevMode = process.env.NODE_ENV !== 'production';
const shouldUseSourceMap = true;

const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    isDevMode && require.resolve('style-loader'),
    !isDevMode && { loader: MiniCssExtractPlugin.loader },
    {
      loader: 'css-modules-typescript-loader',
      options: { namedExport: true },
    },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: {
          ident: 'postcss',
          plugins: [
            'postcss-flexbugs-fixes',
            ['postcss-preset-env', { autoprefixer: { flexbox: 'no-2009' }, stage: 3 }],
            'postcss-normalize',
          ],
        },
        sourceMap: shouldUseSourceMap,
      },
    },
  ].filter(Boolean);

  if (preProcessor) {
    loaders.push(
      {
        loader: require.resolve('resolve-url-loader'),
        options: { sourceMap: shouldUseSourceMap, root: getAppSrc() },
      },
      {
        loader: require.resolve(preProcessor),
        options: { sourceMap: shouldUseSourceMap },
      },
    );
  }

  return loaders;
};

module.exports = {
  mode: isDevMode ? 'development' : 'production',
  entry: {
    main: resolve('app', 'index.ts'),
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name]-[hash:8].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.json', '.js'],
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            type: 'asset',
            parser: { dataUrlCondition: { maxSize: imageInlineSizeLimit } },
            generator: {
              filename: 'media/img/[name].[hash].[ext]',
            },
          },
          {
            test: /\.svg$/,
            type: 'asset',
            parser: { dataUrlCondition: { maxSize: imageInlineSizeLimit } },
            generator: {
              filename: 'media/svg/[name].[hash].[ext]',
            },
          },
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: path.resolve(process.cwd(), 'src'),
            loader: require.resolve('babel-loader'),
            options: {
              presets: ['@babel/env', '@babel/preset-typescript'],
            },
          },
          {
            test: cssRegex,
            exclude: cssModuleRegex,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: shouldUseSourceMap,
              modules: { mode: 'icss' },
            }),
            sideEffects: true,
          },
          {
            test: cssModuleRegex,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: shouldUseSourceMap,
              modules: { mode: 'local', localIdentName: '[name]__[local]___[hash:base64:5]' },
            }),
          },
          {
            test: sassRegex,
            exclude: sassModuleRegex,
            use: getStyleLoaders(
              {
                importLoaders: 3,
                sourceMap: shouldUseSourceMap,
                modules: { mode: 'icss' },
              },
              'sass-loader',
            ),
            sideEffects: true,
          },
          {
            test: sassModuleRegex,
            use: getStyleLoaders(
              {
                importLoaders: 3,
                sourceMap: shouldUseSourceMap,
                modules: { mode: 'local', localIdentName: '[name]__[local]___[hash:base64:5]' },
              },
              'sass-loader',
            ),
          },
          {
            exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            type: 'asset/resource',
            generator: {
              filename: 'media/[hash][ext][query]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: true }),
    // new CopyPlugin({ patterns: [{ from: 'public/img', to: 'img' }] }),
    !isDevMode && new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('app', 'index.html'),
    }),
  ].filter(Boolean),
  devtool: 'source-map',
  }
