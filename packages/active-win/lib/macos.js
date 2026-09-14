'use strict'
const path = require('path')
const { promisify } = require('util')
const childProcess = require('child_process')

const execFile = promisify(childProcess.execFile)
const bin = path.join(__dirname, '../main')

const parseMac = (stdout) => {
  try {
    return JSON.parse(stdout)
  } catch (error) {
    console.error(error)
    throw new Error('Error parsing window data')
  }
}

module.exports = async (options) => {
  const { stdout } = await execFile(bin, [])
  return parseMac(stdout)
}

module.exports.sync = (options) => {
  const stdout = childProcess.execFileSync(bin, [], {
    encoding: 'utf8',
  })
  return parseMac(stdout)
}
