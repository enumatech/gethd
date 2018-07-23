# gethd

[![Build Status](https://travis-ci.org/enumatech/gethd.svg?branch=master)](https://travis-ci.org/enumatech/gethd)

```
nix-shell
pnpm i
./bin.js
```

In an other terminal:

```
pnpm test
```

```javascript
const gethd = require('gethd');

beforeAll(async () => {
  gethd.start();
  await gethd.waitForReady();
});

afterAll(gethd.stop);
```
