import { app, ipcMain, net } from 'electron'
import { load as parseYaml } from 'js-yaml'
import * as os from 'os'
import { UPDATER_TAG } from './updater-tag'
import {
  getWindow,
  updateAllowedByPlatform,
  isWindows10OrHigher,
  isDev,
  isWindows,
  isMac,
} from '../../utils'
import { featureFlagsStore } from '../../storage/featureFlagsStore'
import {
  UpdateChannel,
  UpdateEvent,
  UpdaterStoreKey,
  UpdateInfoExtended,
} from 'vkme-common'
import { initHandlers } from './updater.handler'
import { UpdatesStore } from './updates-store'
import { autoUpdater } from 'electron-updater'
import { mockUpdater } from './mock'
import { checkForUpdates, getLatestName } from './utils'
import { commonLogger } from '../logger'
import { memoryStore } from '../../storage/memory.store'

export const updaterInstance = isDev ? mockUpdater : autoUpdater

export const initAutoUpdater = (): void => {
  if (!updateAllowedByPlatform) {
    return
  }

  let updateUrl = import.meta.env.VITE_APP_UPDATE_URL
  commonLogger.info('main', UPDATER_TAG, 'Current updater url is ', updateUrl)

  // в связи с обновлением electron, чтобы не сломать юзерам на старых windows приложение,
  // мы модифицируем урл для апдейтов, по которому лежит exe с новой версией electron
  const featureFlags = featureFlagsStore.get()
  if (featureFlags.vkm_desktop_win10_update_url) {
    if (isWindows10OrHigher) {
      if (updateUrl.charAt(updateUrl.length - 1) === '/') {
        updateUrl = updateUrl.slice(0, -1)
      }
      const newUpdateUrl = `${updateUrl}/win10`
      memoryStore.setUpdateUrl(newUpdateUrl)
      updaterInstance.setFeedURL(newUpdateUrl)
      commonLogger.info(
        'main',
        UPDATER_TAG,
        'AutoUpdater url updated. Reason: windows 10 or higher. New update url is ' +
          newUpdateUrl,
      )
    }
  }

  updaterInstance.autoDownload = false
  updaterInstance.autoInstallOnAppQuit = false

  updaterInstance.requestHeaders = {
    'Cache-Control':
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  }

  const twentyFourHours = 1000 * 60 * 60 * 24
  setInterval(() => {
    commonLogger.info(
      'main',
      UPDATER_TAG,
      'Recurring check for updates started',
    )
    checkForUpdates()
  }, twentyFourHours)

  const fiveSeconds = 1000 * 5
  setTimeout(() => {
    commonLogger.info('main', UPDATER_TAG, 'Initial check for updates started')
    checkForUpdates()
  }, fiveSeconds)

  initHandlers()

  commonLogger.info('main', UPDATER_TAG, 'AutoUpdater initialised')

  const previousVersion = UpdatesStore.get(UpdaterStoreKey.PREVIOUS_VERSION)

  if (previousVersion != null && previousVersion !== app.getVersion()) {
    commonLogger.info('main', UPDATER_TAG, 'App successfully updated')
    const window = getWindow()

    if (window) {
      const releaseNotes = UpdatesStore.get(UpdaterStoreKey.RELEASE_NOTES)

      setTimeout(() => {
        commonLogger.info('main', UPDATER_TAG, 'Showing release notes')

        window.webContents.send(UpdateEvent.SHOW_PATCH_NOTES, {
          version: app.getVersion(),
          releaseNotes,
        })

        UpdatesStore.reset()
      }, 10000)
    }
  }

  updaterInstance
    .on('update-available', async (info) => {
      if (isDev) {
        return ipcMain.emit(UpdateChannel.UPDATE_AVAILABLE, {}, info)
      }
      //тк функционала проверки версии нет в electron-builder'e,
      //то мы руками после сборки прописываем минимальную версию ос для работы приложения
      //когда нам приходит инфа, что апдейт доступный, заново запрашиваем latest и проверяем этот параметр
      const latestInfoRaw = await net
        .fetch(`${memoryStore.getUpdateUrl()}/${getLatestName()}`)
        .then((res) => res.blob())
        .then((res) => res.text())
      const latestInfo = parseYaml(latestInfoRaw) as UpdateInfoExtended
      const version = os.release()

      if (isWindows && latestInfo.minimalRequiredOSVersion) {
        const [majoOSVersion] = version.split('.')
        // для 28го электрона минимальная поддерживаемая версия windows - 10
        if (
          Number(majoOSVersion) >= Number(latestInfo.minimalRequiredOSVersion)
        ) {
          commonLogger.info(
            'main',
            UPDATER_TAG,
            `Update available event fired. os version: ${version}. minimalversion: ${latestInfo.minimalRequiredOSVersion}`,
          )
          return ipcMain.emit(UpdateChannel.UPDATE_AVAILABLE, {}, info)
        } else {
          commonLogger.info(
            'main',
            UPDATER_TAG,
            `Update not available event fired. os version: ${version}. minimalversion: ${latestInfo.minimalRequiredOSVersion}`,
          )
          return ipcMain.emit(UpdateChannel.UPDATE_NOT_AVAILABLE, {}, info)
        }
      } else if (isMac && latestInfo.minimalRequiredOSVersion) {
        const [majorOSVersion, minorOSVersion] = version.split('.')
        const [majorMinimalVersion, minorMinialVersion] = version.split('.')
        // для 28го электрона минимальная поддерживаемая версия мака - 10.15 (darwin 19.*)
        if (
          Number(majorOSVersion) < Number(majorMinimalVersion) ||
          (Number(majorOSVersion) === Number(majorMinimalVersion) &&
            Number(minorOSVersion) < Number(minorMinialVersion))
        ) {
          commonLogger.info(
            'main',
            UPDATER_TAG,
            `Update not available event fired. os version: ${version}. minimalversion: ${latestInfo.minimalRequiredOSVersion}`,
          )
          return ipcMain.emit(UpdateChannel.UPDATE_NOT_AVAILABLE, {}, info)
        } else {
          commonLogger.info(
            'main',
            UPDATER_TAG,
            `Update available event fired. os version: ${version}. minimalversion: ${latestInfo.minimalRequiredOSVersion}`,
          )
          return ipcMain.emit(UpdateChannel.UPDATE_AVAILABLE, {}, info)
        }
      } else {
        commonLogger.info(
          'main',
          UPDATER_TAG,
          `Update available event fired. os version: ${version}. minimalversion: ${latestInfo.minimalRequiredOSVersion}`,
        )
        return ipcMain.emit(UpdateChannel.UPDATE_AVAILABLE, {}, info)
      }
    })
    .on('update-not-available', (info) =>
      ipcMain.emit(UpdateChannel.UPDATE_NOT_AVAILABLE, {}, info),
    )
    .on('update-downloaded', (info) =>
      ipcMain.emit(UpdateChannel.UPDATE_DOWNLOADED, {}, info),
    )
    .on('update-cancelled', (info) =>
      ipcMain.emit(UpdateChannel.UPDATE_CANCELED, {}, info),
    )
    .on('download-progress', (info) =>
      ipcMain.emit(UpdateChannel.UPDATE_ON_PROGRESS, {}, info),
    )
    .on('error', (error, message) =>
      ipcMain.emit(UpdateChannel.UPDATE_ON_PROGRESS, {}, error, message),
    )
}
