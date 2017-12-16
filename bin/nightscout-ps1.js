#!/usr/local/bin/node
const os = require('os')
const fs = require('fs-extra')
const { resolve } = require('url')
const fetch = require('node-fetch')

async function get(url) {
  console.log(`GET ${url}`)
  const res = await fetch(url)
  return res.text()
}

async function main([baseUrl, cacheFile = `${os.homedir()}/.bgl-cache`]) {
  const entryUrl = resolve(baseUrl, '/api/v1/entries?count=1')
  const statusUrl = resolve(baseUrl, '/api/v1/status.json')

  const [rawEntry, rawStatus] = await Promise.all([
    get(entryUrl),
    get(statusUrl)
  ])

  const entry = rawEntry.split(/\t+/)
  const status = JSON.parse(rawStatus)

  const data = {
    ts: entry[1],
    bgl: entry[2],
    trend: entry[3],
    target_top: status.settings.thresholds.bgTargetTop,
    target_bottom: status.settings.thresholds.bgTargetBottom
  }

  // convert `data` into local Bash variables
  let body = ''
  for (const key of Object.keys(data)) {
    const value = JSON.stringify(String(data[key]))
    body += `local nightscout_${key}=${value}\n`
  }

  await fs.writeFile(cacheFile, body)
  console.log(`Wrote ${cacheFile}`)
}

const args = process.argv.slice(2)
if (process.env.BASE_URL) {
  args.unshift(process.env.BASE_URL)
}
main(args).catch(err => {
  console.error(err)
  process.exit(1)
})
