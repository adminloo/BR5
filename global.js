// Fix for Hermes 'require' issue
global.require = require;
global.__DEV__ = __DEV__;

// Add any other global variables your app needs
global.process = require('process');
global.Buffer = require('buffer').Buffer; 