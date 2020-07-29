'use strict';

process.env.BABEL_ENV = process.env.ANALYZE_BUNDLE_MODE;
process.env.NODE_ENV = process.env.ANALYZE_BUNDLE_MODE;

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {choosePort} = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../config/paths');

// Import dev or prod webpack config according to NODE_ENV env variable
let config;
if (process.env.NODE_ENV === "development") {
    config = require('../config/webpack.config.dev');
} else if (process.env.NODE_ENV === "production") {
    config = require('../config/webpack.config.prod');
}

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8888;
const HOST = process.env.HOST || '0.0.0.0';

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `choosePort()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
    .then(port => {
        config.plugins.push(new BundleAnalyzerPlugin({analyzerPort: port}));

        // use build folder for output
        config.output.path = paths.appBuild;

        console.log(chalk.cyan("Creating an interactive treemap visualization of the contents of all bundles..."));

        webpack(config, (err, stats) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log(stats.toString({
                chunks: false,
                colors: true
            }));
        });
    })
    .catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });
