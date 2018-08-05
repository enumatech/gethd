const fs = require('fs');
const tmp = require('tmp');
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

class Gethd {
  // todo: options
  // gasPrice, gasLimit, networkId, port, blockTime...
  constructor(options = {}) {
    this.dir = options.dir || process.cwd();

    this.mnemonic = bip39.generateMnemonic();
    this.key = hdkey.fromMasterSeed(bip39.mnemonicToSeed(this.mnemonic));
    this.datadir = path.join(this.dir, 'datadir');
    this.keystore = path.join(this.datadir, 'keystore');
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

  writeGenesis() {
    const genesis = {
      config: {
        homesteadBlock: 0,
        eip155Block: 0,
        eip158Block: 0
      },
      difficulty: '0x0',
      gasLimit: '2100000',
      alloc: this.accounts.reduce((x, { address }) => {
        x[address] = { balance: '1000000000000000000' };
        return x;
      }, {})
    };

    // console.log(JSON.stringify(genesis, ' ', 2));

    return new Promise((resolve, reject) => {
      tmp.file((err, filepath) => {
        if (err) return reject(err);

        fs.writeFile(filepath, JSON.stringify(genesis), err => {
          if (err) return reject(err);

          this.genesis = filepath;
          resolve(this.genesis);
        });
      });
    });
  }

  initDatadir() {
    mkdirp.sync(this.datadir);

    return new Promise((resolve, reject) => {
      const geth = spawn('geth', [
        '--datadir',
        this.datadir,
        'init',
        this.genesis
      ]);

      // geth.stdout.pipe(process.stdout);
      // geth.stderr.pipe(process.stderr);

      geth.on('exit', resolve);
    });
  }

  async start(options = { info: true }) {
    testGethInstalled();

    this.createAccounts(2);

    await this.writeGenesis();
    await this.initDatadir();
    await this.writeKeystore();

    if (options.info) {
      this.printInfo();
    }

    this.geth = spawn('geth', [
      '--rpc',
      '--rpcapi',
      'admin,shh,personal,net,eth,web3,txpool',
      '--rpccorsdomain',
      '"*"',
      '--unlock',
      this.accounts.map(x => x.address).join(','),
      '--password',
      '/dev/null',
      '--datadir',
      this.datadir
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
      this.cleanup();
      await sleep(1200);
    }
  }

  cleanup() {
    rmrf.sync(this.keystore);
    rmrf.sync(this.datadir);
    rmrf.sync(this.genesis);
  }

  printInfo() {
    console.log('mnemonic', this.mnemonic);
    console.log('keystore', this.keystore);
    for (const account of this.accounts) {
      console.log(account.address);
    }
  }
}

module.exports = Gethd;
