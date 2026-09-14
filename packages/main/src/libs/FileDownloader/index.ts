import { Options, downloadsManager } from './manager'

const downloadFile = (
  url: string,
  fileName?: string,
  options?: Options,
): void => {
  if (url.startsWith('data')) {
    downloadsManager.handleData(url, fileName)
    return
  }
  if (url.startsWith('blob')) {
    downloadsManager.handleBlob(url, fileName)
    return
  }
  if (url.startsWith('http')) {
    downloadsManager.handleNewDownload(url, fileName, undefined, options)
    return
  }
}

export { downloadFile }
