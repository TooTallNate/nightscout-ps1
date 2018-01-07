#!/usr/local/bin/node
const ms = require('ms')
const os = require('os')
const ini = require('ini')
const args = require('args')
const fs = require('fs-extra')
const { join } = require('path')
const { parse, resolve } = require('url')
const fetch = require('node-fetch')
const sleep = require('then-sleep')
const onWake = require('wake-event')
const sio = require('socket.io-client')
const snakeCase = require('snake-case')
const debug = require('debug')('nightscout-ps1')

const { name } = require('../package.json')

const toSnakeCase = _o => {
  if (!_o) return _o
  const o = {}
  for (const k of Object.keys(_o)) {
    const v = _o[k]
    o[snakeCase(k)] = typeof v === 'object' ? toSnakeCase(v) : v
  }
  return o
}

args
  .option('nightscout', 'URL of your Nightscout deployment', '')
  .option(
    'cache-file',
    'Path to write the latest reading file',
    join(os.homedir(), '.nightscout-latest-entry')
  )

const flags = args.parse(process.argv, { name })
while (args.sub.length > 0) {
  const command = args.sub.shift()
  if (command === 'daemon') {
    // ignore…
  } else {
    // assume it's a Nightscout URL
    flags.nightscout = command
  }
}
if (!flags.nightscout) {
  console.error(
    'FATAL: The `--nightscout` parameter must point to your Nightscout URL'
  )
  process.exit(1)
}

const resolvePrefix = async _url => {
  let url = _url
  if (!parse(url).protocol) {
    url = `http://${url}`
  }
  const res = await fetch(url)
  debug('Resolved URL %o to %o', _url, res.url)
  return res.url
}

const resolvedNightscout = resolvePrefix(flags.nightscout)
let socket
let statusPromise
let previousEntry
exit(pollStatus())
exit(main())

// reset Socket.io connection after the computer wakes from sleep
onWake(() => {
  debug('wake event')
  exit(main())
})

function exit(promise) {
  promise.catch(err => {
    console.error(err)
    process.exit(1)
  })
}

function emit(e, ...args) {
  return new Promise((resolve, reject) => e.emit(...args, resolve))
}

function once(e, name) {
  return new Promise((resolve, reject) => e.once(name, resolve))
}

async function updateStatus() {
  const nightscout = await resolvedNightscout
  const endpoint = resolve(nightscout, '/api/v1/status.json')
  debug('Updating status %o', endpoint)
  const res = await fetch(endpoint)
  const body = await res.json()
  debug('Status updated')
  return body
}

async function pollStatus() {
  statusPromise = updateStatus()
  await statusPromise
  // let that response be cached for a little while
  await sleep(ms('5m'))
  return pollStatus()
}

function sortMills(a, b) {
  return a.mills - b.mills
}

async function onDataUpdate(event) {
  debug('Got event %o', event)
  const { sgvs } = event
  if (!sgvs || !sgvs.length) return

  const latestEntry = sgvs.sort(sortMills).pop()
  debug('Latest entry %o', latestEntry)

  const status = await Promise.resolve(statusPromise)

  const data = {
    previousEntry: previousEntry || latestEntry,
    latestEntry,
    settings: status.settings
  }

  await fs.writeFile(flags.cacheFile, ini.stringify(toSnakeCase(data)))
  debug('Wrote %o', flags.cacheFile)
}

async function main() {
  if (socket) {
    debug('socket.close()')
    socket.close()
  }

  const nightscout = await resolvedNightscout
  debug('Creating socket.io connection %o', nightscout)
  socket = sio.connect(nightscout)
  socket.on('dataUpdate', e => exit(onDataUpdate(e)))

  const auth = await emit(socket, 'authorize', {
    client: 'web',
    secret: null,
    token: null,
    history: 1
  })
  debug('Auth results %o', auth)
  debug('Waiting for "dataUpdate" events')

  await once(socket, 'close')
  socket = null
  debug('Socket closed. Establishing new connection')
  return main()
}
