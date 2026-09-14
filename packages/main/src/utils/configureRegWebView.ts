import { BrowserWindow, WebContentsView } from 'electron'
import { configureBrowserWindow } from './configureBrowserWindow'
import { commonLogger } from '../libs/logger'

export const configureRegWebView = (
  webView: WebContentsView,
  meWindow?: BrowserWindow,
): void => {
  if (meWindow) {
    configureBrowserWindow(webView)

    const setWebViewOnFullWindowSize = () => {
      const bounds = meWindow?.getBounds()
      if (bounds) {
        webView.setBounds({
          x: 0,
          y: 0,
          width: bounds.width,
          height: bounds.height,
        })
      }
    }

    meWindow?.on('resized', setWebViewOnFullWindowSize)

    /* расскоментировать для дебага и заменить на нужный урл */
    // const debugUrl = new URL('https://ngromov.login.cs7777.vk.com')
    // webView.webContents.session.cookies.set({
    //   url: debugUrl.origin,
    //   name: 'XDEBUG_SESSION',
    //   value: 'PHPSTORM',
    //   domain: debugUrl.hostname,
    //   path: '/',
    // })

    setWebViewOnFullWindowSize()
  } else {
    commonLogger.error(
      'main',
      'configureRegWebView',
      "Can't find Messenger Window",
    )
    throw new Error("Can't find Messenger Window")
  }
}
