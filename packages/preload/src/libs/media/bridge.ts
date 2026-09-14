import { ipcRenderer, contextBridge } from 'electron'
import { MEDIA_WINDOW } from 'vkme-common'

const api: Window['_media'] = {
  restore: () => ipcRenderer.invoke(MEDIA_WINDOW.RESTORE),
  hide: () => ipcRenderer.invoke(MEDIA_WINDOW.HIDE),
  unmount: (listener: () => void) =>
    ipcRenderer.on(MEDIA_WINDOW.UNMOUNT, (_) => listener()),
  unmounted: () => ipcRenderer.invoke(MEDIA_WINDOW.UNMOUNTED),
}

contextBridge.exposeInMainWorld('_media', api)
