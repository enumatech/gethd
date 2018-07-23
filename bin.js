#!/usr/bin/env node

const Gethd = require('./gethd');

new Gethd().start().catch(console.error);
