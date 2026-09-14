import { ipcRenderer, contextBridge } from 'electron'

import {
  ElectronFeatures,
  CapturerSource,
  Theme,
  GlobalSettings,
  Notifications,
  UPDATE_SETTINGS_STATE,
  SHOW_MAIN_WINDOW,
} from 'vkme-common'

import type { NotificationConstructorOptions } from 'electron'

contextBridge.exposeInMainWorld('_common', {
  updateSettingsState: (listener) =>
    ipcRenderer.on(UPDATE_SETTINGS_STATE, (_, params) => {
      listener(params)
    }),
  showMainWindow: () => ipcRenderer.invoke(SHOW_MAIN_WINDOW),
  showSystemNotification: (
    params: Pick<
      NotificationConstructorOptions & { id: number },
      'title' | 'body' | 'id' | 'icon' | 'silent'
    >,
  ) => ipcRenderer.invoke(Notifications.SHOW_MESSAGE, params),
  onNavigate: (listener: (path: string) => void) =>
    ipcRenderer.on(ElectronFeatures.LINK_INNER, (_, params) =>
      listener(params),
    ),
  getCapturerSources: (): Promise<CapturerSource[]> =>
    ipcRenderer.invoke(ElectronFeatures.GET_CAPTURER_SOURCE),
  setElectronTheme: (theme: Theme): Promise<void> =>
    ipcRenderer.invoke(GlobalSettings.SET_ELECTRON_THEME, theme),
  onPlaySound: (listener: () => void) =>
    ipcRenderer.on(ElectronFeatures.PLAY_SOUND, (_) => listener()),
  openUrl: (url: string): Promise<void> =>
    ipcRenderer.invoke(ElectronFeatures.OPEN_URL, url),
  checkIsOnline: (): Promise<boolean> =>
    ipcRenderer.invoke(ElectronFeatures.CHECK_IS_ONLINE),
  reloadPage: () => ipcRenderer.invoke(ElectronFeatures.RELOAD_PAGE),
  getSettings: () => ipcRenderer.invoke(GlobalSettings.GET_SETTINGS),
  setAutoStart: (mode) =>
    ipcRenderer.invoke(GlobalSettings.SET_AUTOSTART, mode),
  toggleTray: () => ipcRenderer.invoke(GlobalSettings.TOGGLE_TRAY),
  changeDownloadLocation: () =>
    ipcRenderer.invoke(GlobalSettings.CHANGE_DOWNLOAD_LOCATION),
  getHTMLPath: (fileName) =>
    ipcRenderer.invoke(ElectronFeatures.GET_HTML_PATH, fileName),
} as Window['_common'])
