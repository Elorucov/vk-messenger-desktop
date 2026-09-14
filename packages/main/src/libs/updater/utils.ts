import { UpdatesStore } from './updates-store'
import {
  UpdateEvent,
  UpdateStatus,
  UpdaterStoreKey,
  ElectronFeatures,
} from 'vkme-common'
import { Platform, getWindow } from '../../utils'
import { UPDATER_TAG } from './updater-tag'
import { checkIsOnline } from '../../utils/checkIsOnline'
import { updaterInstance } from './init'
import { commonLogger } from '../logger'

const CHECK_FOR_UPDATES_TAG = 'checkForUpdates'
const ON_ERROR_HANDLER = 'onErrorHandler'

export const notifyRenderer = (): void => {
  const window = getWindow()
  if (window) {
    window.webContents.send(
      UpdateEvent.UPDATE_RENDERER_STATE,
      UpdatesStore.getStore(),
    )
  }
}
export const onError = (error: Error, message?: string): void => {
  commonLogger.error('main', UPDATER_TAG, ON_ERROR_HANDLER, error)

  if (message) {
    commonLogger.error(
      'main',
      UPDATER_TAG,
      ON_ERROR_HANDLER,
      `Error message: ${message}`,
    )
  }
  // TODO нужно подумать над отображением состояний ошибок: ошибка обновления\скачивания
  UpdatesStore.set(UpdaterStoreKey.STATUS, UpdateStatus.ERROR)
  notifyRenderer()

  const isOnline = checkIsOnline()
  const window = getWindow()

  if (!isOnline && window) {
    window.webContents.send(UpdateEvent.SHOW_CONNECTION_ERROR)
  }
}

export const checkForUpdates = (force?: boolean): void => {
  if (force) {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      CHECK_FOR_UPDATES_TAG,
      'is forced by user',
    )
    UpdatesStore.set(UpdaterStoreKey.IS_FORCED_CHECK, true)

    getWindow()?.webContents?.send(
      ElectronFeatures.LINK_INNER,
      `/settings/about`,
    )
  }
  // если какой-то движ уже идет, тогда присылаем инфу о нем
  if (
    [
      UpdateStatus.CHECKING_FOR_UPDATES,
      UpdateStatus.DOWNLOADING_UPDATE,
    ].includes(UpdatesStore.get(UpdaterStoreKey.STATUS))
  ) {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      CHECK_FOR_UPDATES_TAG,
      'aborted by current status',
    )
    notifyRenderer()
    return
  }

  UpdatesStore.set(UpdaterStoreKey.STATUS, UpdateStatus.CHECKING_FOR_UPDATES)
  notifyRenderer()

  updaterInstance.checkForUpdates().catch(onError)
}

export const getLatestName = (): string => {
  const latests = {
    [Platform.LINUX]: 'latest-linux.yml',
    [Platform.MAC]: 'latest-mac.yml',
    [Platform.WINDOWS]: 'latest.yml',
  }
  return latests[process.platform] as string
}
