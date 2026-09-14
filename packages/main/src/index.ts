import { app, session } from 'electron'
import * as path from 'path'
import * as os from 'os'

import './error-handling'
import './protocol-handler'
import './libs/auth/handlers'
import './handlers/electron-features.handler'
import './handlers/device.handler'
import './security-restrictions'
import './handlers/settings.handler'
import './libs/notifications/handler'
import './handlers/featureFlagsHandler'
import './handlers/translationsHandler'
import './libs/webview/handler'
import { activateWindow, restoreOrCreateMeWindow } from './mainWindow'
import { callsWindow } from './libs/calls'
import { initMenu } from './menu'
import {
  isDev,
  isMac,
  isMas,
  isProd,
  isDevToolsAllowed,
  isWindows,
} from './utils/helpers'
import globalStore from './storage/global.store'
import { updateOrCreateDesktopEntry } from './utils'
import { initAutoUpdater } from './libs/updater'
import { VKMeTray } from './tray'
import { featureFlagsStore } from './storage/featureFlagsStore'
import { mediaSharingWindows } from './libs/mediaSharing'
import './libs/mediaSharing'
import { downloadsStore } from './storage/downloads.store'
import { commonLogger } from './libs/logger'
import { proxy } from './libs/proxy'
import { userSettingsStore } from './storage/user-settings.store'
import { OSParams } from './globals'

const scope = 'init app'
// вызов app.requestSingleInstanceLock() приводит к крашу на mac 12ой версии из AppStore
const isMainInstance = isMas ? undefined : app.requestSingleInstanceLock()

const versions = {
  version: import.meta.env.PACKAGE_VERSION,
  build: import.meta.env.VITE_BUILD_NUMBER || 'DEV',
  OS: OSParams,
  reforged: import.meta.env.REFORGED_VERSION,
  calls: import.meta.env.CALLS_VERSION,
}

if (isMas || isMainInstance !== false) {
  updateOrCreateDesktopEntry()

  commonLogger.info('main', scope, `App started. isDev: ${isDev}, isProd: ${isProd}`)
  commonLogger.info(
    'main',
    scope,
    Object.entries(versions)
      .map((entry) => `${entry[0]}=${entry[1]}`)
      .join('; '),
  )

  if (isWindows) {
    app.setAppUserModelId('com.vk.medesktop')
  }

  if (isDevToolsAllowed && isDev) {
    const reactDevToolsPath = path.join(
      os.homedir(),
      '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.25.0_1',
    )

    app.whenReady().then(async () => {
      try {
        if (!isProd) {
          commonLogger.info('main', scope, 'Dev tools enabled')

          await session.defaultSession.loadExtension(reactDevToolsPath)
        }
      } catch (error) {
        commonLogger.error('main', scope, error)
      }
    })
  }

  /**
   * Disable Hardware Acceleration to save more system resources.
   */

  userSettingsStore.get('disableHardwareAcceleration') &&
    app.disableHardwareAcceleration()
  userSettingsStore.get('disableInProcessGPU') &&
    app.commandLine.appendSwitch('--in-process-gpu')
  userSettingsStore.get('disableHTTP2') &&
    app.commandLine.appendSwitch('--disable-http2')

  // меню должно быть инициализировано до ready события
  // https://github.com/electron/electron/issues/35512#issuecomment-1232466819
  initMenu()

  if (isDev) {
    downloadsStore.clear()
  }

  app
    .on('second-instance', (_, argv) => restoreOrCreateMeWindow(argv))
    .on('activate', activateWindow)
    .on('before-quit', () => {
      commonLogger.info('main', scope, 'App closed')

      globalStore.set('readyToClose', true)
    })
    .on('window-all-closed', () => {
      /**
       * Shout down background process if all windows was closed
       */
      if (!isMac) {
        commonLogger.info(
          'main',
          scope,
          'Closing the app since the user closed all windows',
        )

        app.quit()
      }
    })
    .whenReady()
    .then(() => proxy.init())
    .then(() => {
      featureFlagsStore.load()
    })
    .then(() => mediaSharingWindows.init())
    .then(() => {
      // необходимо исправить старт после обновления электрона
      // https://github.com/electron/electron/issues/36545
      const isManifestV3Released =
        Number(process.versions.electron.split('.')?.[0]) >= 26

      if (isDev && isManifestV3Released) {
        const electronDevToolsInstaller = require('electron-devtools-installer')

        const installExtension = electronDevToolsInstaller.default
        const REACT_DEVELOPER_TOOLS =
          electronDevToolsInstaller.REACT_DEVELOPER_TOOLS
        const REDUX_DEVTOOLS = electronDevToolsInstaller.REDUX_DEVTOOLS
        return Promise.all([
          installExtension(REDUX_DEVTOOLS)
            .then((name: any) =>
              commonLogger.info('main', scope, `Added Extension:  ${name}`),
            )
            .catch((err: any) =>
              commonLogger.info('main', scope, 'An error occurred: ', err),
            ),
          installExtension(REACT_DEVELOPER_TOOLS)
            .then((name: any) =>
              commonLogger.info('main', scope, `Added Extension:  ${name}`),
            )
            .catch((err: any) =>
              commonLogger.info('main', scope, 'An error occurred: ', err),
            ),
        ])
      }
      return
    })
    .then(() => {
      callsWindow.createWindow()
      restoreOrCreateMeWindow()
    })
    .then(() => VKMeTray.init())
    .then(() => initAutoUpdater())
    .catch((e) => commonLogger.error('main', scope, 'Failed create window', e))
} else {
  commonLogger.error('main', scope, 'Electron is running multiple instances!')
  app.quit()
  process.exit(0)
}
