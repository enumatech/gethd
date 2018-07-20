#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const bip39 = require('bip39');
const { spawn } = require('child_process');
const hdkey = require('ethereumjs-wallet/hdkey');
const {
  testGethInstalled,
  generateKeystoreFilename,
  rmrf,
  mkdirp
} = require('./util');

const cwd = process.cwd();
const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeed(mnemonic);
const key = hdkey.fromMasterSeed(seed);

function createAccount(index) {
  const wallet = key.derivePath(`m/44'/60'/0'/0/${index}`).getWallet();
  const privateKey = wallet.getPrivateKey();
  const publicKey = wallet.getPublicKey();
  const address = wallet.getAddress().toString('hex');
  const keystore = wallet.toV3('');
  const account = { address, publicKey, privateKey, keystore };

  return account;
}

function createAccounts(n) {
  const accounts = [];
  for (let i = 0; i < n; i++) {
    const account = createAccount(i);
    accounts.push(account);
  }
  return accounts;
}

function writeKeystore(keystore, accounts) {
  return Promise.all(
    accounts.map(
      x =>
        new Promise((resolve, reject) => {
          const filepath = path.join(
            keystore,
            generateKeystoreFilename(x.address)
          );
          fs.writeFile(filepath, JSON.stringify(x.keystore), err => {
            if (err) return reject(err);
            resolve();
          });
        })
    )
  );
}

async function geth() {
  testGethInstalled();

  const keystore = path.join(cwd, 'keystore');
  const accounts = createAccounts(2);

  mkdirp.sync(keystore);
  await writeKeystore(keystore, accounts);

  printInfo();

  const geth = spawn('geth', [
    '--dev',
    '--rpc',
    '--rpcapi',
    'admin,shh,personal,net,eth,web3,txpool',
    '--rpccorsdomain',
    '"*"',
    '--keystore',
    keystore
  ]);

  geth.stdout.pipe(process.stdout);
  geth.stderr.pipe(process.stderr);

  geth.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  function cleanup() {
    console.log('geth.cleanup');
    rmrf.sync(keystore);
  }

  function printInfo() {
    console.log('mnemonic', mnemonic);
    console.log('keystore', keystore);
    for (const account of accounts) {
      console.log(account.address);
    }
  }
}

geth().catch(console.error);
