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
	ver: 'version'
});

yargs.boolean(['h', 'ver']);

yargs.default({
	v: 1
});

yargs.describe({
	h: 'This',
	v: '<level>'
});

var opts = yargs.argv;

opts.rootFolder = rootFolder;

delete opts._;
delete opts.$0;
delete opts.h;
delete opts.v;

opts.verbosity = Number(opts.verbosity);

//log args polyfill
process.env.DBG = opts.verbosity;
process.env.COLOR = true;

const log = require('log');

log(1)('[Baby Monitor] Options', opts);

(require('./babyMonitor')).init(opts);