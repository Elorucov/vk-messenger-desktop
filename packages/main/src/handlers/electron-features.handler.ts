import { app, desktopCapturer, ipcMain, Event, shell } from 'electron'
import { ElectronFeatures, SHOW_MAIN_WINDOW } from 'vkme-common'
import { invoke } from '../utils/invoke'
import { VKMeTray } from '../tray'
import { checkIsOnline } from '../utils/checkIsOnline'
import { getHTMLPath, reloadPage, showMainWindow } from '../utils'
import { commonLogger } from '../libs/logger'

const scope = 'electron features handler'

ipcMain.on(ElectronFeatures.UPDATE_BADGE_COUNTER, (_, count: number) => {
  app.setBadgeCount(count)
  count > 0 ? VKMeTray.setUnreadIcon() : VKMeTray.setDefaultIcon()
})

ipcMain.handle(
  'invoke:api',
  async (_, url: string, params: Record<string, any>) => {
    return { result: await invoke(url, params, 31000) }
  },
)

ipcMain.handle(ElectronFeatures.GET_CAPTURER_SOURCE, () =>
  desktopCapturer
    .getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 800, height: 600 },
    })
    .then((sources) => {
      return sources.map(({ id, name, appIcon, thumbnail }) => ({
        id: id,
        name: name,
        appIcon: appIcon?.toDataURL(),
        thumbnail: thumbnail.toPNG().toString('base64'),
      }))
    })
    .catch((error) => {
      commonLogger.error('main', scope, 'get capture failed', error)

      return []
    }),
)

ipcMain.handle(ElectronFeatures.OPEN_URL, (_: Event, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle(ElectronFeatures.CHECK_IS_ONLINE, checkIsOnline)

ipcMain.handle(ElectronFeatures.RELOAD_PAGE, reloadPage)

ipcMain.handle(ElectronFeatures.GET_HTML_PATH, (_, fileName: string) =>
  getHTMLPath(fileName),
)
ipcMain.handle(SHOW_MAIN_WINDOW, () => {
  showMainWindow()
})
