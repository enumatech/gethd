const Web3 = require('web3');
const gethd = require('../');

const web3 = new Web3('http://localhost:8545');
let accounts = [];

beforeAll(async () => {
  await gethd.start();
  await gethd.waitForReady();
}, 20000);

afterAll(gethd.stop);

test('balance', async () => {
  accounts = await web3.eth.getAccounts();
  expect(await web3.eth.getBalance(accounts[0])).toEqual('1000000000000000000');
  expect(await web3.eth.getBalance(accounts[1])).toEqual('1000000000000000000');
});
