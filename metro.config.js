// C:/xampp/htdocs/AppMicarandayo/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Get the path of your project and your API folder
const projectRoot = __dirname;
const apiRoot = path.resolve(projectRoot, '../Api_AppMicarandayo');

const config = getDefaultConfig(projectRoot);

// 2. Tell Metro to watch the external API folder
config.watchFolders = [apiRoot];

// 3. Ensure Metro can resolve modules correctly from both folders
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = config;