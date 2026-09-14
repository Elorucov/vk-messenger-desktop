import { ipcRenderer, contextBridge } from 'electron'
import { FileDownloadingChannel } from 'vkme-common'

contextBridge.exposeInMainWorld('_downloader', {
  downloadAsFile: async (data, fileFormat, fileName) => {
    return ipcRenderer.invoke(
      FileDownloadingChannel.DOWNLOAD_AS_FILE,
      data,
      fileFormat,
      fileName,
    )
  },
  updateSnackbar: (listener) =>
    ipcRenderer.on(FileDownloadingChannel.ON_UPDATE, (_, params) =>
      listener(params),
    ),
  getFilePreview: (listener) =>
    ipcRenderer.on(FileDownloadingChannel.GET_FILE_PREVIEW, (_, params) =>
      listener(params),
    ),
  downloadBlob: (listener) =>
    ipcRenderer.on(FileDownloadingChannel.DOWNLOAD_BLOB, (_, url, fileName) =>
      listener(url, fileName),
    ),
  updatePreview: (url, fileName) =>
    ipcRenderer.invoke(FileDownloadingChannel.UPDATE_PREVIEW, url, fileName),
  cancel: (url) =>
    ipcRenderer.invoke(FileDownloadingChannel.CANCEL_DOWNLOAD, url),
  openByPath: (path) =>
    ipcRenderer.invoke(FileDownloadingChannel.OPEN_BY_PATH, path),
  downloadAttach: (doc) =>
    ipcRenderer.invoke(FileDownloadingChannel.DOWNLOAD_ATTACH, doc),
} as Window['_downloader'])
