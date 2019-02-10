#!/usr/bin/env node
const ms = require('ms');
const os = require('os');
const url = require('url');
const args = require('args');
const path = require('path');
const fetch = require('node-fetch');
const sleep = require('then-sleep');
const onWake = require('wake-event');
const sio = require('socket.io-client');
const snakeCase = require('snake-case');
const {writeFile} = require('fs-extra');
const debug = require('debug')('nightscout-ps1');
const homedir = os.homedir();

let socket;
let statusPromise;
// eslint-disable-next-line prefer-const
let resolvedNightscout;
const entries = new Map();
const {name: packageName} = require('../package.json');

function *flatten(input, prefix = '') {
	for (const key of Object.keys(input)) {
		let value = input[key];
		const name = prefix + snakeCase(key);
		if (Array.isArray(value)) {
			value = value.join(',');
		} else if (typeof value === 'object') {
			yield *flatten(value, `${name}_`);
			value = null;
		} else {
			value = String(value);
		}
		if (value !== null) {
		  yield [name, value];
		}
	}
}

const toJson = (data) => JSON.stringify(data, null, '\t');
const toEnv = (data) => Array.from(flatten(data))
	.map(([key, value]) => `${key}=${JSON.stringify(value)}`)
	.join('\n');

const formatters = new Map([
	['.env', toEnv],
	['.json', toJson]
]);

args
	.option('nightscout', 'URL of your Nightscout deployment', '')
	.option(
		'cache-file',
		'Path to write the latest reading file',
		['~/.nightscout-ps1.env']
	);

const flags = args.parse(process.argv, {name: packageName});

// Resolve ~
const cacheFile = flags.cacheFile.map((f) => f.replace(/^~/, homedir));

// Validate file extensions and pre-cache the formatters
for (const file of cacheFile) {
	const {ext} = path.parse(file);
	const formatter = formatters.get(ext);
	if (!formatter) {
		console.error(`File extension "${ext}" does not have a formatter!`);
		process.exit(2);
	}
	formatters.set(file, formatter);
}

if (!flags.nightscout && args.sub.length > 0) {
	// assume it's a Nightscout URL
	flags.nightscout = args.sub[0];
}

if (!flags.nightscout) {
	console.error(
		'FATAL: The `--nightscout` parameter must point to your Nightscout URL'
	);
	process.exit(1);
}

const resolvePrefix = async (_href) => {
	let href = _href;
	if (!url.parse(href).protocol) {
		href = `http://${href}`;
	}
	const res = await fetch(href);
	debug('Resolved URL %o to %o', _href, res.url);
	return res.url;
};

function exit(promise) {
	promise.catch((err) => {
		console.error(err);
		process.exit(1);
	});
}

async function updateStatus() {
	const nightscout = await resolvedNightscout;
	const endpoint = url.resolve(nightscout, '/api/v1/status.json');
	debug('Updating status %o', endpoint);
	const res = await fetch(endpoint);
	const body = await res.json();
	debug('Status updated');
	return body;
}

async function pollStatus() {
	statusPromise = updateStatus();
	await statusPromise;
	// let that response be cached for a little while
	await sleep(ms('5m'));
	return pollStatus();
}

function emit(e, ...argv) {
	return new Promise((resolve) => e.emit(...argv, resolve));
}

function once(e, name) {
	return new Promise((resolve) => e.once(name, resolve));
}

async function onDataUpdate(event) {
	debug('Got event %o', event);
	const {sgvs} = event;
	if (!sgvs) {
		return;
	}
	for (const entry of sgvs) {
		entries.set(entry.mills, entry);
	}

	const sorted = Array.from(entries.keys()).sort();

	// Purge old entries, keep up to two
	const count = Math.max(0, sorted.length - 2);
	debug('Purging %o entries', count);
	for (let i = 0; i < count; i++) {
		const key = sorted.shift();
		entries.delete(key);
	}

	const latestEntry = entries.get(sorted.pop());
	debug('Latest entry %o', latestEntry);

	const previousEntry = entries.get(sorted.pop() || latestEntry.mills);
	debug('Previous entry %o', previousEntry);

	const {settings} = await Promise.resolve(statusPromise);

	const data = {
		previousEntry,
		latestEntry,
		settings
	};

	await Promise.all(cacheFile.map(async (file) => {
		const str = formatters.get(file)(data);
		await writeFile(file, `${str}\n`);
		debug('Wrote %o', file);
	}));
}

async function main() {
	const nightscout = await resolvedNightscout;

	if (socket) {
		debug('socket.close()');
		socket.close();
	}

	debug('Creating socket.io connection %o', nightscout);
	socket = sio.connect(nightscout);
	socket.on('dataUpdate', (e) => exit(onDataUpdate(e)));

	const auth = await emit(socket, 'authorize', {
		client: 'web',
		secret: null,
		token: null,
		history: 1
	});
	debug('Auth results %o', auth);
	debug('Waiting for "dataUpdate" events');

	await once(socket, 'close');
	socket = null;
	debug('Socket closed. Establishing new connection');
	return main();
}

resolvedNightscout = resolvePrefix(flags.nightscout);
exit(pollStatus());
exit(main());

// reset Socket.io connection after the computer wakes from sleep
onWake(() => {
	debug('Wake event');
	exit(main());
});
