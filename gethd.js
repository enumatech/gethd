const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');
const {
  testGethInstalled,
  generateKeystoreFilename,
  rmrf,
  mkdirp,
  sleep
} = require('./util');

class Geth {
  constructor(options = {}) {
    this.dir = options.dir || process.cwd();

    this.mnemonic = bip39.generateMnemonic();
    this.key = hdkey.fromMasterSeed(bip39.mnemonicToSeed(this.mnemonic));
    this.keystore = path.join(this.dir, 'keystore');
  }

  createAccount(index) {
    const wallet = this.key.derivePath(`m/44'/60'/0'/0/${index}`).getWallet();
    const privateKey = wallet.getPrivateKey();
    const publicKey = wallet.getPublicKey();
    const address = wallet.getAddress().toString('hex');
    const keystore = wallet.toV3('');
    const account = { address, publicKey, privateKey, keystore };

    return account;
  }

  createAccounts(n) {
    const accounts = [];
    for (let i = 0; i < n; i++) {
      const account = this.createAccount(i);
      accounts.push(account);
    }
    this.accounts = accounts;
    return accounts;
  }

  writeKeystore() {
    mkdirp.sync(this.keystore);

    return Promise.all(
      this.accounts.map(
        x =>
          new Promise((resolve, reject) => {
            const filepath = path.join(
              this.keystore,
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

  async start(options = { info: true }) {
    testGethInstalled();

    this.createAccounts(2);
    await this.writeKeystore();

    if (options.info) {
      this.printInfo();
    }

    this.geth = spawn('geth', [
      '--dev',
      '--rpc',
      '--rpcapi',
      'admin,shh,personal,net,eth,web3,txpool',
      '--rpccorsdomain',
      '"*"',
      '--keystore',
      this.keystore
    ]);

    if (options.info) {
      this.geth.stdout.pipe(process.stdout);
      this.geth.stderr.pipe(process.stderr);
    }

    this.geth.on('exit', () => this.cleanup);
    process.on('SIGINT', () => this.cleanup);
  }

  async stop() {
    if (this.geth) {
      this.geth.kill();
      await sleep(1200);
    }
  }

  cleanup() {
    rmrf.sync(this.keystore);
  }

  printInfo() {
    console.log('mnemonic', this.mnemonic);
    console.log('keystore', this.keystore);
    for (const account of this.accounts) {
      console.log(account.address);
    }
  }
}

module.exports = Geth;
