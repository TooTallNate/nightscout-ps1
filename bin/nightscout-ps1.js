#!/usr/local/bin/node
if (process.argv[2] === 'daemon') {
  return require('./nightscout-ps1-daemon')
}

// force chalk colors to be enabled because redirected
// usage in the $PS1 causes stdout to not be a TTY
process.env.FORCE_COLOR = '1'

const args = require('args')
const chalk = require('chalk')
const { join } = require('path')
const { homedir } = require('os')

args
  .command(
    'daemon',
    'Start the daemon'
  )
  .option(
    'cache-file',
    'Path to read the latest reading JSON file from',
    join(homedir(), '.bgl-cache.json')
  )

const { cacheFile } = args.parse(process.argv, { name: 'nightscout-ps1' })

const strikethrough = (text, s = '\u0336') =>
  Array.from(String(text)).join(s) + s

const {
  latestEntry: { mgdl, mills, direction },
  settings: {
    alarmTimeagoWarn,
    alarmTimeagoWarnMins,
    alarmTimeagoUrgent,
    alarmTimeagoUrgentMins,
    thresholds: { bgHigh, bgTargetTop, bgTargetBottom, bgLow }
  }
} = require(cacheFile)

let trend
switch (direction) {
  case 'DoubleUp':
    trend = '⇈'
    break
  case 'SingleUp':
    trend = '↑'
    break
  case 'FortyFiveUp':
    trend = '↗'
    break
  case 'Flat':
    trend = '→'
    break
  case 'FortyFiveDown':
    trend = '↘'
    break
  case 'SingleDown':
    trend = '↓'
    break
  case 'DoubleDown':
    trend = '⇊'
    break
  default:
    trend = '?'
    break
}

let color = v => v
let strike = v => v
const diff = Date.now() - mills
const MINUTE = 1000 * 60
if (alarmTimeagoUrgent && diff > (alarmTimeagoUrgentMins * MINUTE)) {
  trend = '↛'
  color = chalk.hex('#FF0000')
  strike = strikethrough

} else if (alarmTimeagoWarn && diff > (alarmTimeagoWarnMins * MINUTE)) {
  trend = '↛'
  color = chalk.hex('#FFF000')
  strike = strikethrough

} else if (mgdl > bgHigh) {
  color = chalk.hex('#FFF000').bold

} else if (mgdl > bgTargetTop) {
  color = chalk.yellow

} else if (mgdl < bgLow) {
  color = chalk.hex('#FF0000').bold

} else if (mgdl < bgTargetBottom) {
  color = chalk.red

} else {
  color = chalk.green
}

console.log(color(`${strike(String(mgdl).padStart(3 ,'0'))} ${trend}`))
