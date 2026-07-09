const path                     = require('path');
const { VueLoaderPlugin }      = require('vue-loader');

module.exports = {
    target: 'electron-renderer',
    entry: {
        main: './src/main/index.js',
        renderer: './src/renderer/index.js',
        i18n: './src/i18n/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: {
            type: 'commonjs2',
            export: 'default',
        },
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    externals: {
        appMain: 'commonjs appMain',
        appView: 'commonjs appView',
        axios: 'commonjs axios',
        constant: 'commonjs constant',
        logger: 'commonjs logger',
        appConfig: 'commonjs appConfig',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
};
