const Web3 = require('web3');
const gethd = require('../');

const web3 = new Web3('http://localhost:8545');
let accounts = [];

beforeAll(async () => {
  gethd.start();
  await gethd.waitForReady();
  accounts = await web3.eth.getAccounts();
});

afterAll(gethd.stop);

describe('balance', function() {
  it('of account 0 is positive', async () => {
    expect(await web3.eth.getBalance(accounts[0])).toEqual(
      '115792089237316195423570985008687907853269984665640564039457584007913129639927'
    );
  });

  // it('of account 1 is 100', async () => {
  //   expect(await web3.eth.getBalance(accounts[1])).toEqual('100');
  // });
});
