const path = require('path');
const { spawn } = require('child_process');

const binPath = path.join(__dirname, 'bin.js');
let geth = null;

exports.start = () => {
  geth = spawn('node', [binPath]);
  return geth;
};

exports.stop = () => {
  if (geth) {
    geth.kill();
  }
};

exports.waitForReady = async () => {
  const Web3 = require('web3');
  const web3 = new Web3('http://localhost:8545');
  let ready = false;
  while (!ready) {
    try {
      await web3.eth.getAccounts();
      ready = true;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};
