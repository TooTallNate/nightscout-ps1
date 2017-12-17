#!/usr/local/bin/node
const ms = require('ms')
const os = require('os')
const args = require('args')
const fs = require('fs-extra')
const { join } = require('path')
const { resolve } = require('url')
const fetch = require('node-fetch')
const sleep = require('then-sleep')
const sio = require('socket.io-client')
const debug = require('debug')('nightscout-ps1')

const pkg = require('../package.json')

args
  .option('nightscout', 'URL of your Nightscout deployment', '')
  .option(
    'cache-file',
    'Path to the eval-able file',
    join(os.homedir(), '.bgl-cache')
  )

const flags = args.parse(process.argv, {
  name: pkg.name
})
if (args.sub.length > 0) {
  flags.nightscout = args.sub.shift()
}
if (!flags.nightscout) {
  console.error(
    'FATAL: The `--nightscout` parameter must point to your Nightscout URL'
  )
  process.exit(1)
}

let statusPromise
exit(pollStatus(flags))
exit(main(flags))

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

async function updateStatus(nightscout) {
  const endpoint = resolve(nightscout, '/api/v1/status.json')
  debug('Updating status %o', endpoint)
  const res = await fetch(endpoint)
  const body = await res.json()
  debug('Status updated')
  return body
}

async function pollStatus({ nightscout }) {
  statusPromise = updateStatus(nightscout)
  await statusPromise
  // let that response be cached for a little while
  await sleep(ms('5m'))
  return pollStatus(flags)
}

function sortMills(a, b) {
  return a.mills - b.mills
}

async function onDataUpdate(cacheFile, { sgvs }) {
  if (!sgvs) return
  const entry = sgvs.sort(sortMills).pop()
  debug('Got entry: %o', entry)

  const status = await Promise.resolve(statusPromise)

  const data = Object.assign(
    {
      ts: entry.mills,
      bgl: entry.mgdl,
      trend: entry.direction,
      target_top: status.settings.thresholds.bgTargetTop,
      target_bottom: status.settings.thresholds.bgTargetBottom
    },
    entry
  )

  // convert `data` into local Bash variables
  let body = ''
  for (const key of Object.keys(data)) {
    const value = JSON.stringify(String(data[key]))
    body += `local nightscout_${key}=${value}\n`
  }

  await fs.writeFile(cacheFile, body)
  debug('Wrote %o', cacheFile)
}

async function main({ nightscout, cacheFile }) {
  const socket = sio.connect(nightscout)
  socket.on('dataUpdate', e => exit(onDataUpdate(cacheFile, e)))

  const auth = await emit(socket, 'authorize', {
    client: 'web',
    secret: null,
    token: null,
    history: 1
  })
  debug('Auth results %o', auth)
  debug('Waiting for "dataUpdate" events')

  await once(socket, 'close')
  debug('Socket closed. Establishing new connection')
  return main(flags)
}
