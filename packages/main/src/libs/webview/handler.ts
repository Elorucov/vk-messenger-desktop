import { ipcMain } from 'electron'
import { destroyWindow, getRegWebView } from './regWebViewWindow'
import { WEBVIEW_CHANNEL } from 'vkme-common'
import { handleOpenUrl } from '../../utils'

ipcMain.handle(WEBVIEW_CHANNEL.CLOSE_REG_WEB_VIEW, () => {
  const regWebView = getRegWebView()
  regWebView?.setVisible(false)
  regWebView?.webContents.session.clearStorageData()
  destroyWindow()
})

ipcMain.handle(
  WEBVIEW_CHANNEL.CLOSE_REG_WEB_VIEW_WITH_AUTH,
  (_, url: string) => {
    const regWebView = getRegWebView()
    regWebView?.setVisible(false)
    regWebView?.webContents.session.clearStorageData()
    destroyWindow()
    handleOpenUrl(url)
  },
)
