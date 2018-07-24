const Web3 = require('web3');
const gethd = require('../');

const web3 = new Web3('http://localhost:8545');
let accounts = [];

beforeAll(async () => {
  await gethd.start();
  await gethd.waitForReady();
  accounts = await web3.eth.getAccounts();
}, 10000);

afterAll(gethd.stop);

test('banlance of account 0 is positive', async () => {
  expect(await web3.eth.getBalance(accounts[0])).toEqual(
    '115792089237316195423570985008687907853269984665640564039457584007913129639927'
  );
});
