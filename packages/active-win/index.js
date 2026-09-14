'use strict'

module.exports = () => {
  if (process.platform === 'darwin') {
    return require('./lib/macos.js')()
  }

  return Promise.reject(new Error('macOS only'))
}

module.exports.sync = () => {
  if (process.platform === 'darwin') {
    return require('./lib/macos.js').sync()
  }

  throw new Error('macOS only')
}
