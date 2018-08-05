const Gethd = require('./gethd');
const { sleep } = require('./util');

let gethd = new Gethd();

exports.start = () => gethd.start({ info: false });

exports.stop = () => gethd.stop();

// todo: remove web3 deps
exports.waitForReady = async () => {
  const Web3 = require('web3');
  const web3 = new Web3('http://localhost:8545');
  let ready = false;
  while (!ready) {
    try {
      await web3.eth.getAccounts();
      await sleep(1000);
      ready = true;
    } catch (err) {
      await sleep(100);
    }
  }
};
