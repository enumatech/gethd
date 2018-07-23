// https://github.com/ethereumjs/keythereum/blob/master/index.js#L466
exports.generateKeystoreFilename = address => {
  let filename = 'UTC--' + new Date().toISOString() + '--' + address;
  if (process.platform === 'win32') filename = filename.split(':').join('-');
  return filename;
};

exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.testGethInstalled = () => {};

// todo: remove deps
exports.mkdirp = require('mkdirp');
exports.rmrf = require('rimraf');
