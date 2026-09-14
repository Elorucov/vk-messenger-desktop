import { app } from 'electron'
import { resolve } from 'path'
import { getWindow, handleOpenUrl, openDeepLink } from './utils'
import { commonLogger } from './libs/logger'
import { activateWindow } from './mainWindow'

if (!app.isDefaultProtocolClient('vk')) {
  if (process.defaultApp) {
    const [, path] = process.argv
    if (path) {
      app.setAsDefaultProtocolClient('vk', process.execPath, [resolve(path)])
    }
  } else {
    app.setAsDefaultProtocolClient('vk')
  }
}

const openDeeplinkAndFocus = (hash: string) => {
  openDeepLink(hash)

  const window = getWindow()

  if (window) {
    if (window.isVisible && !window.isVisible()) {
      activateWindow()
    }

    if (window.isMinimized()) {
      window.restore()
    }

    window?.focus()
  }
}
app.on('open-url', (event, url) => {
  commonLogger.debug('main', 'protocol handler', 'app on open url', url)
  event.preventDefault()
  const hash = handleOpenUrl(url)

  if (hash) {
    if (app.isReady()) {
      openDeeplinkAndFocus(hash)
    } else {
      app.once('ready', () => openDeeplinkAndFocus(hash))
    }
  }
})
