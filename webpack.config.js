const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: {
        play_client: './public/play_client.js',
        edit_client: './public/edit_client.js'
    },
    output: {
        path: path.resolve(__dirname, 'public/bundles/'),
        filename: '[name]_bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};