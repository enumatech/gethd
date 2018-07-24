# gethd

[![Build Status](https://travis-ci.org/enumatech/gethd.svg?branch=master)](https://travis-ci.org/enumatech/gethd)

```sh
npx gethd
```

### Jest setup

```javascript
const gethd = require('gethd');

beforeAll(async () => {
  await gethd.start();
  await gethd.waitForReady();
});

afterAll(gethd.stop);
```

### Dev

```sh
nix-shell
pnpm i
pnpm test
```
