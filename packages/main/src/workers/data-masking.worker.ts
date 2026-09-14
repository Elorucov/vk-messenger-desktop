import { WorkerPool } from '../utils/worker.pool'

const workerScript = `
const { parentPort } = require('worker_threads')
const hidePrivateData = (data, clearData = {}) => {
  if (typeof data !== 'object' || data == null) return data

  Object.keys(data).forEach((key) => {
    const keysRegEx = /(token|message|text|client_secret|webview_url|auth_hash|key|access_key)/i
    if (keysRegEx.test(key) && typeof data[key] === 'string') {
      clearData[key] = data[key]
        .slice(0, 3)
        .concat(data[key].slice(3).replace(/./g, '*'))
    } else if (
      typeof data[key] === 'object' &&
      !Array.isArray(data[key]) &&
      data[key] != null
    ) {
      clearData[key] = hidePrivateData(data[key])
    } else if (Array.isArray(data[key])) {
      clearData[key] = []

      data[key].forEach((item, index) => {
        if (typeof item === 'object' && item != null) {
          clearData[key][index] = hidePrivateData(item)
        } else {
          clearData[key][index] = data[key][index]
        }
      })
    } else {
      clearData[key] = data[key]
    }
  })

  return clearData
}

parentPort?.on('message', (data) =>
  parentPort?.postMessage(
    JSON.stringify(
      typeof data === 'string' || Buffer.isBuffer(data)
        ? hidePrivateData(JSON.parse(data.toString('utf8')))
        : hidePrivateData(data),
    ),
  ),
)
`

const wp: WorkerPool = new WorkerPool(2, workerScript)
export const maskData = async <T>(data: T): Promise<T> =>
  new Promise((resolve, reject) =>
    wp.runTask(data, (err: Error, data: T) =>
      err ? reject(err) : resolve(data),
    ),
  )
