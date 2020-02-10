// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const fs = require('fs-extra');
const paths = require('../config/paths');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const config = configFactory('development');

// removes react-dev-utils/webpackHotDevClient.js at first in the array
config.entry = config.entry.filter(
    entry => !entry.includes('webpackHotDevClient')
);

config.output.path = paths.appBuild;
paths.publicUrl = paths.appBuild + '/';

webpack(config).watch({}, (err, stats) => {
    if (err) {
        console.error(err);
    } else {
        copyPublicFolder();
    }
    console.error(
        stats.toString({
            chunks: false,
            colors: true
        })
    );
});

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml
    });
}