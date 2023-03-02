const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: {
        play_client: './public/js/play_client.js',
        edit_client: './public/js/edit_client.js',
        agent_client: './public/js/agent_client.js',
        message_handler: './public/js/message_handler.js',
        agent_worker: './public/js/agent_worker.js'
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
    },
    resolve: {
        alias: {
          '@tensorflow/tfjs': path.resolve(__dirname, 'node_modules/@tensorflow/tfjs')
        }
    }
};