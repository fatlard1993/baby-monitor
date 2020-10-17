#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const yargs = require('yargs');
const rootFolder = require('find-root')(__dirname);

function rootPath(){ return path.join(rootFolder, ...arguments); }

process.chdir(rootFolder);

yargs.alias({
	h: 'help',
	v: 'verbosity',
	ver: 'version',
	p: 'port'
});

yargs.boolean(['h', 'ver']);

yargs.default({
	v: 1,
	p: 8080
});

yargs.describe({
	h: 'This',
	v: '<level>'
});

const args = yargs.argv;

['_', '$0', 'v', 'p'].forEach((item) => { delete args[item]; });

const opts = Object.assign(args, { args: Object.assign({}, args), rootFolder, verbosity: Number(args.verbosity) });

const log = new (require('log'))({ tag: 'baby-monitor', color: true, verbosity: opts.verbosity });

log(1)('Options', opts);

(require('./babyMonitor')).init(opts);