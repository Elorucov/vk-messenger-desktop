import { ipcMain, nativeTheme } from 'electron'
import {
  Theme,
  GlobalSettings,
  SettingsState,
  UpdaterStoreKey,
  AutoStartMode,
} from 'vkme-common'
import globalStore from '../storage/global.store'
import { updateAllowedByPlatform } from '../utils'
import { UpdatesStore } from '../libs/updater/updates-store'
import { autoLauncher } from '../libs/autoLaunch'
import { commonLogger } from '../libs/logger'
import { VKMeTray } from '../tray'
import { userSettingsStore } from '../storage/user-settings.store'
import { downloadsManager } from '../libs/FileDownloader/manager'
import { memoryStore } from '../storage/memory.store'

type GlobalAppSettings = {
  readyToClose: boolean
  'window-bounds': any
  theme: string
}

const scope = 'settings handler'

ipcMain.handle(GlobalSettings.SET_ELECTRON_THEME, (_, theme: Theme) => {
  nativeTheme.themeSource = theme
  globalStore.set<Theme>('theme', theme)
})

ipcMain.handle(
  GlobalSettings.SET_GLOBAL_APP_SETTINGS,
  (_, settingsToUpdate: Partial<GlobalAppSettings>) => {
    let setting: keyof GlobalAppSettings
    for (setting in settingsToUpdate) {
      globalStore.set<GlobalAppSettings>(setting, settingsToUpdate[setting])
    }
  },
)

ipcMain.handle(
  GlobalSettings.GET_SETTINGS,
  async (_): Promise<SettingsState> => {
    commonLogger.debug('main', scope, 'get settings')

    return {
      updater: {
        isEnabled: updateAllowedByPlatform,
        isAutoUpdateEnabled: Boolean(
          UpdatesStore.get(UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED),
        ),
      },
      autoStartMode: autoLauncher.get(),
      trayIsEnabled: userSettingsStore.get('isTrayActive'),
      downloadLocation: userSettingsStore.get('downloadLocation'),
      lang: await memoryStore.getLang(),
    }
  },
)

ipcMain.handle(GlobalSettings.SET_AUTOSTART, async (_, mode: AutoStartMode) => {
  commonLogger.debug('main', scope, 'SET_AUTOSTART', mode)
  return autoLauncher.onChange(mode)
})

ipcMain.handle(GlobalSettings.TOGGLE_TRAY, async (_) => {
  commonLogger.debug('main', scope, 'TOGGLE_TRAY', VKMeTray.isActive)
  VKMeTray.isActive ? VKMeTray.deactivateTray() : VKMeTray.activateTray()
})

ipcMain.handle(GlobalSettings.CHANGE_DOWNLOAD_LOCATION, async (_) => {
  commonLogger.debug('main', scope, GlobalSettings.CHANGE_DOWNLOAD_LOCATION)
  await downloadsManager.selectDownloadDirectory().catch(() => {})
})
