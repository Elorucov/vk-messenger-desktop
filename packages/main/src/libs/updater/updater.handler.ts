import { ipcMain } from 'electron'
import { UpdateChannel, UpdateStatus, UpdaterStoreKey } from 'vkme-common'
import { UPDATER_TAG } from './updater-tag'
import {
  autoUpdater,
  CancellationToken,
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from 'electron-updater'
import { UpdatesStore } from './updates-store'
import globalStore from '../../storage/global.store'
import { checkForUpdates, notifyRenderer, onError } from './utils'
import { updaterInstance } from './init'
import { commonLogger } from '../logger'
import { memoryStore } from '../../storage/memory.store'

let cancellationToken: undefined | CancellationToken

const SET_UPDATE_URL_IPC_HANDLER = 'setUpdateUrlIpcHandler'
const CANCEL_DOWNLOAD_IPC_HANDLER = 'cancelDownloadIpcHandler'
const DOWNLOAD_UPDATE_IPC_HANDLER = 'downloadUpdateIpcHandler'
const DOWNLOAD_UPDATE_TAG = 'downloadUpdate'
const INSTALL_UPDATE_IPC_HANDLER = 'installUpdateIpcHandler'
const TOGGLE_AUTOMATIC_DOWNLOAD_IPC_HANDLER_TAG =
  'toggleAutomaticDownloadIpcHandler'
const ON_UPDATE_DOWNLOADED_HANDLER = 'onUpdateDownloadedHandler'
const ON_UPDATE_CANCELLED_HANDLER = 'onUpdateCancelledHandler'
const ON_DOWNLOAD_PROGRESS_HANDLER_TAG = 'onDownloadProgressHandler'
const ON_UPDATE_AVAILABLE_HANDLER_TAG = 'onUpdateAvailableHandler'
const ON_UPDATE_NOT_AVAILABLE_HANDLER_TAG = 'onUpdateNotAvailableHandler'

const downloadUpdate = () => {
  commonLogger.info(
    'main',
    UPDATER_TAG,
    DOWNLOAD_UPDATE_IPC_HANDLER,
    'Update download requested',
  )
  if (
    UpdatesStore.get(UpdaterStoreKey.STATUS) === UpdateStatus.DOWNLOADING_UPDATE
  ) {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      DOWNLOAD_UPDATE_TAG,
      'Download is already in progress',
    )
    return
  }

  if (!cancellationToken) {
    cancellationToken = new CancellationToken()
  }

  commonLogger.info(
    'main',
    UPDATER_TAG,
    DOWNLOAD_UPDATE_TAG,
    `Downloading update started`,
  )

  UpdatesStore.setMany({
    [UpdaterStoreKey.STATUS]: UpdateStatus.DOWNLOADING_UPDATE,
    [UpdaterStoreKey.PROGRESS]: 0,
  })
  updaterInstance.downloadUpdate(cancellationToken).catch((e) => {
    commonLogger.error('main', UPDATER_TAG, DOWNLOAD_UPDATE_TAG, e)
    UpdatesStore.set(UpdaterStoreKey.STATUS, UpdateStatus.UPDATE_AVAILABLE)
  })
}
export const initHandlers = (): void => {
  // установка URL
  commonLogger.info(
    'main',
    UPDATER_TAG,
    SET_UPDATE_URL_IPC_HANDLER,
    'Registerred',
  )
  ipcMain.handle(UpdateChannel.SET_UPDATE_URL, (_, url: string) => {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      SET_UPDATE_URL_IPC_HANDLER,
      'Update URL set',
      url,
    )

    memoryStore.setUpdateUrl(url)
    autoUpdater.setFeedURL(url)
    UpdatesStore.reset()
  })
  // отмена скачивания обновления
  commonLogger.info(
    'main',
    UPDATER_TAG,
    CANCEL_DOWNLOAD_IPC_HANDLER,
    'Registerred',
  )
  ipcMain.handle(UpdateChannel.CANCEL_DOWNLOAD, () => {
    if (cancellationToken) {
      commonLogger.info(
        'main',
        UPDATER_TAG,
        CANCEL_DOWNLOAD_IPC_HANDLER,
        'Update download cancelled',
      )
      cancellationToken.cancel()
      cancellationToken.dispose()
      cancellationToken = undefined

      UpdatesStore.set(UpdaterStoreKey.STATUS, UpdateStatus.UPDATE_AVAILABLE)

      notifyRenderer()
    }
  })
  // скачивание обновления
  commonLogger.info(
    'main',
    UPDATER_TAG,
    DOWNLOAD_UPDATE_IPC_HANDLER,
    'Registerred',
  )

  ipcMain.handle(UpdateChannel.DOWNLOAD_UPDATE, downloadUpdate)

  // установка обновления
  commonLogger.info(
    'main',
    UPDATER_TAG,
    INSTALL_UPDATE_IPC_HANDLER,
    'Registerred',
  )
  ipcMain.handle(UpdateChannel.INSTALL_UPDATE, () => {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      INSTALL_UPDATE_IPC_HANDLER,
      'Update installation requested',
    )
    globalStore.set('readyToClose', true)
    updaterInstance.quitAndInstall(true, true)
  })
  // Тоггл автоапдейтов
  commonLogger.info(
    'main',
    UPDATER_TAG,
    TOGGLE_AUTOMATIC_DOWNLOAD_IPC_HANDLER_TAG,
    'Registerred',
  )
  ipcMain.handle(UpdateChannel.TOGGLE_AUTOMATIC_UPDATES, () => {
    const currentValue = UpdatesStore.get(
      UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED,
    )
    const newValue = !currentValue

    commonLogger.info(
      'main',
      UPDATER_TAG,
      TOGGLE_AUTOMATIC_DOWNLOAD_IPC_HANDLER_TAG,
      'Automatic download toggled',
      newValue ? 'Enabled' : 'Disabled',
    )

    UpdatesStore.set(UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED, newValue)

    return newValue
  })
  // автоматическое обновление
  commonLogger.info(
    'main',
    UPDATER_TAG,
    TOGGLE_AUTOMATIC_DOWNLOAD_IPC_HANDLER_TAG,
    'Registerred',
  )

  ipcMain.handle(UpdateChannel.GET_AUTOMATIC_UPDATES, () => {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      TOGGLE_AUTOMATIC_DOWNLOAD_IPC_HANDLER_TAG,
      'Automatic download status requested',
    )
    return UpdatesStore.get(UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED)
  })
  // Проверка обновлений
  commonLogger.info(
    'main',
    UPDATER_TAG,
    UpdateChannel.CHECK_FOR_UPDATE,
    'Registerred',
  )
  ipcMain.handle(UpdateChannel.CHECK_FOR_UPDATE, (_, force) =>
    checkForUpdates(force),
  )

  ipcMain.on(
    UpdateChannel.UPDATE_DOWNLOADED,
    (_, info: UpdateDownloadedEvent) => {
      if (cancellationToken) {
        cancellationToken.dispose()
        cancellationToken = undefined
      }

      commonLogger.info(
        'main',
        UPDATER_TAG,
        ON_UPDATE_DOWNLOADED_HANDLER,
        `Finish downloading update to version ${info.version}`,
      )

      UpdatesStore.setMany({
        [UpdaterStoreKey.RELEASE_NOTES]:
          (info?.releaseNotes as string) ?? 'Исправления и улучшения',
        [UpdaterStoreKey.STATUS]: UpdateStatus.UPDATE_DOWNLOADED,
        [UpdaterStoreKey.UPDATE_SIZE]: info.files?.[0]?.size,
      })

      notifyRenderer()
    },
  )
  ipcMain.on(
    UpdateChannel.UPDATE_CANCELED,
    (_, info: UpdateDownloadedEvent) => {
      commonLogger.info(
        'main',
        UPDATER_TAG,
        ON_UPDATE_CANCELLED_HANDLER,
        `Cancelled updating to ${info.version}`,
      )
      UpdatesStore.set(UpdaterStoreKey.STATUS, UpdateStatus.UPDATE_AVAILABLE)

      notifyRenderer()
    },
  )
  ipcMain.on(UpdateChannel.UPDATE_ON_PROGRESS, (_, info: ProgressInfo) => {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      ON_DOWNLOAD_PROGRESS_HANDLER_TAG,
      `Progress: ${info.percent}% (${info.total})`,
    )

    UpdatesStore.set(UpdaterStoreKey.PROGRESS, Math.round(info.percent || 0))

    notifyRenderer()
  })
  ipcMain.on(UpdateChannel.UPDATE_AVAILABLE, (_, info: UpdateInfo) => {
    const isAutomaticDownloadEnabled = UpdatesStore.get(
      UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED,
    )
    UpdatesStore.setMany({
      [UpdaterStoreKey.RELEASE_NOTES]:
        (info?.releaseNotes as unknown as string) ?? 'Исправления и улучшения',
      [UpdaterStoreKey.NEW_VERSION]: info.version,
      [UpdaterStoreKey.UPDATE_SIZE]: info.files[0]?.size,
      [UpdaterStoreKey.STATUS]: UpdateStatus.UPDATE_AVAILABLE,
    })

    if (isAutomaticDownloadEnabled) {
      commonLogger.info(
        'main',
        UPDATER_TAG,
        ON_UPDATE_AVAILABLE_HANDLER_TAG,
        `Downloading update to ${info.version}`,
      )

      downloadUpdate()
    } else {
      commonLogger.info(
        'main',
        UPDATER_TAG,
        ON_UPDATE_AVAILABLE_HANDLER_TAG,
        `Suggested downloading update to ${info.version}`,
      )

      notifyRenderer()
    }
  })
  ipcMain.on(UpdateChannel.UPDATE_NOT_AVAILABLE, (_) => {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      ON_UPDATE_NOT_AVAILABLE_HANDLER_TAG,
      'No updates',
    )

    const isForcedCheck = Boolean(
      UpdatesStore.get(UpdaterStoreKey.IS_FORCED_CHECK),
    )
    UpdatesStore.set(UpdaterStoreKey.STATUS, UpdateStatus.NO_UPDATES)
    if (isForcedCheck) {
      commonLogger.info(
        'main',
        UPDATER_TAG,
        ON_UPDATE_NOT_AVAILABLE_HANDLER_TAG,
        'Update check was called by the user',
      )
      UpdatesStore.set(UpdaterStoreKey.IS_FORCED_CHECK, false)
    }
    notifyRenderer()
  })
  ipcMain.on(
    UpdateChannel.UPDATE_ON_ERROR,
    (_, error: Error, message?: string) => {
      onError(error, message)
    },
  )
}
