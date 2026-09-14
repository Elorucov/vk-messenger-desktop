import { featureFlagsStore } from '../storage/featureFlagsStore'
import { VKMeTray } from '../tray'
import { updateBadgeCount } from './badge'
import { getWindow } from './window'
import { callsWindow } from '../libs/calls'
import { BrowserWindow, app } from 'electron'
import { commonLogger } from '../libs/logger'
import { ElectronFeatures } from 'vkme-common'
import { isMac } from './helpers'
import path from 'path'
import { isDev } from './helpers'
import { fileURLToPath } from 'url'

/**
 * URL for window.
 * Vite dev server for development.
 * `file://../renderer/index.html` for production and test.
 */
export const getHTMLPath = (fileName: string): string =>
  isDev
    ? `http://localhost:8080/${fileName}`
    : path.resolve(app.getAppPath(), 'packages', 'renderer', 'dist', fileName)

export const isHTMLPath = (url: string, fileName: string): boolean => {
  const decodedUrl = decodeURIComponent(url)

  if (decodedUrl.startsWith('file://')) {
    return fileURLToPath(decodedUrl) === getHTMLPath(fileName)
  }

  return decodedUrl === getHTMLPath(fileName)
}

export const isLocalURL = (url: string): boolean => {
  const decodedUrl = decodeURIComponent(url)

  return isDev
    ? decodedUrl.startsWith('http://localhost:8080')
    : decodedUrl.startsWith('file://')
}

/**
 * На маке храним диплинк, который был произошел до создания BrowserWindow
 */
let memoryHash: string | undefined

const openPage = (
  fileName: string,
  browserWindow?: BrowserWindow,
  hash: string = '',
): void => {
  const window = browserWindow || getWindow()

  if (!hash && ['index.html', 'auth.html'].includes(fileName)) {
    if (memoryHash) {
      hash = memoryHash
      memoryHash = undefined
    } else {
      const currentUrl = window?.webContents.getURL()

      if (currentUrl) {
        hash = new URL(currentUrl).hash.replace('#', '')
      }
    }
  }

  if (window) {
    const location = getHTMLPath(fileName)
    if (import.meta.env.DEV) {
      window.loadURL(location.concat('#', hash))
    } else {
      window.loadFile(location, { hash })
    }
  }
}

export const openAuthPage = (
  browserWindow?: BrowserWindow,
  hash?: string,
): void => {
  openPage('auth.html', browserWindow, hash)
}

export const openIndexPage = (
  browserWindow?: BrowserWindow,
  hash?: string,
): void => {
  callsWindow.loadPage()
  openPage('index.html', browserWindow, hash)
}

export const openCallsPage = (browserWindow?: BrowserWindow): void => {
  openPage('calls.html', browserWindow)
}

export const reloadPage = (): void => {
  commonLogger.info('main', 'reloadPage')
  updateBadgeCount(0)
  VKMeTray.setDefaultIcon()
  featureFlagsStore.load()
  const window = getWindow()

  openIndexPage(window)
}

export const openDeepLink = (hash?: string): void => {
  commonLogger.debug('main', 'openDeepLink', hash)

  if (isMac && !getWindow()) {
    memoryHash = hash
    return
  }

  const window = getWindow()

  const currentUrl = window?.webContents.getURL()

  if (currentUrl?.includes('auth.html')) {
    openAuthPage(window, hash)
  } else {
    window?.webContents?.send(ElectronFeatures.LINK_INNER, hash)
  }
}
