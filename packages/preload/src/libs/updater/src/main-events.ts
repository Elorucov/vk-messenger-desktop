import { ipcRenderer, contextBridge } from 'electron'
import { AUTOUPDATER_TAG } from '..'
import { UpdateChannel } from 'vkme-common'
import { commonLogger } from '../../logger'

const MAIN_EVENT_TAG = 'Main'

contextBridge.exposeInMainWorld('_updater', {
  installUpdate: (): Promise<void> => {
    commonLogger.info(
      'preload',
      AUTOUPDATER_TAG,
      MAIN_EVENT_TAG,
      UpdateChannel.INSTALL_UPDATE,
    )
    return ipcRenderer.invoke(UpdateChannel.INSTALL_UPDATE)
  },
  getAutomaticUpdates: (): Promise<boolean> => {
    commonLogger.info(
      'preload',
      AUTOUPDATER_TAG,
      MAIN_EVENT_TAG,
      UpdateChannel.GET_AUTOMATIC_UPDATES,
    )
    return ipcRenderer.invoke(UpdateChannel.GET_AUTOMATIC_UPDATES)
  },
  cancelDownload: (): Promise<void> => {
    commonLogger.info(
      'preload',
      AUTOUPDATER_TAG,
      MAIN_EVENT_TAG,
      UpdateChannel.CANCEL_DOWNLOAD,
    )
    return ipcRenderer.invoke(UpdateChannel.CANCEL_DOWNLOAD)
  },
  checkForUpdates: () => {
    commonLogger.info(
      'preload',
      AUTOUPDATER_TAG,
      MAIN_EVENT_TAG,
      UpdateChannel.CHECK_FOR_UPDATE,
    )
    return ipcRenderer.invoke(UpdateChannel.CHECK_FOR_UPDATE)
  },
  downloadUpdate: (): Promise<void> => {
    commonLogger.info(
      'preload',
      AUTOUPDATER_TAG,
      MAIN_EVENT_TAG,
      UpdateChannel.DOWNLOAD_UPDATE,
    )
    return ipcRenderer.invoke(UpdateChannel.DOWNLOAD_UPDATE)
  },
  toggleAutomaticUpdates: (): Promise<void> => {
    commonLogger.info(
      'preload',
      AUTOUPDATER_TAG,
      MAIN_EVENT_TAG,
      UpdateChannel.TOGGLE_AUTOMATIC_UPDATES,
    )
    return ipcRenderer.invoke(UpdateChannel.TOGGLE_AUTOMATIC_UPDATES)
  },
  setUpdateUrl: (url: string): Promise<void> => {
    commonLogger.info(
      'preload',
      AUTOUPDATER_TAG,
      MAIN_EVENT_TAG,
      UpdateChannel.SET_UPDATE_URL,
    )
    return ipcRenderer.invoke(UpdateChannel.SET_UPDATE_URL, url)
  },
} as Window['_updater'])
