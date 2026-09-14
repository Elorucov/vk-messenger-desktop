import { app, BrowserWindow, nativeTheme, screen } from 'electron'
import { join } from 'path'
import {
  isClientCredentialsExists,
  handleOpenUrl,
  getWindow,
  handleWindowClose,
  isDevToolsAllowed,
  isDev,
  configureBrowserWindow,
  openAuthPage,
  openIndexPage,
  isMac,
} from './utils'
import Badge from 'electron-windows-badge'
import GlobalStore from './storage/global.store'
import { Theme } from 'vkme-common'
import { initContextMenu, initMenu } from './menu'
import { commonLogger } from './libs/logger'
import { userSettingsStore } from './storage/user-settings.store'
import { callsWindow } from './libs/calls'
import { openDeepLink } from './utils'
import { MediaWindow } from './mediaWindow'
import { translationsStore } from './storage/translationsStore'
import { langUse } from './libs/translations/utils'

const scope = 'main window'

async function createWindow(hash?: string) {
  let windowBounds = {}
  let isFullScreenMode = false
  let isMaximized = false
  try {
    windowBounds = GlobalStore.has('window-bounds')
      ? JSON.parse(GlobalStore.get('window-bounds'))
      : {}
    isFullScreenMode =
      GlobalStore.has('is-full-screen-mode') &&
      GlobalStore.get('is-full-screen-mode')
    isMaximized =
      GlobalStore.has('is-maximized') && GlobalStore.get('is-maximized')
  } catch (e) {}

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  const translations = await translationsStore.getAfterLoad()
  const browserWindow = new BrowserWindow({
    width: Math.min(width, 1280),
    height: Math.min(height, 1024),
    minHeight: 600,
    minWidth: 390,
    icon: join(app.getAppPath(), 'packages/renderer/dist/icons/icon@1x.png'),
    title: langUse(translations, 'me_vkme_title') || 'VK Мессенджер',
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    fullscreen: isFullScreenMode,
    fullscreenable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // TODO: установить в true - https://jira.mvk.com/browse/ME-54762
      sandbox: false,
      webviewTag: false,
      preload: join(app.getAppPath(), 'packages/preload/dist/entryVkm.js'),
      devTools: isDevToolsAllowed || isDev,
    },
    ...windowBounds,
  })

  // TODO: избавится от дублирования в рамках - https://jira.mvk.com/browse/ME-53111
  browserWindow.webContents.session.setUserAgent(
    browserWindow.webContents.session
      .getUserAgent()
      .replace('Мессенджер', 'Messenger'),
  )

  browserWindow.webContents.session.setSpellCheckerLanguages(
    browserWindow.webContents.session.availableSpellCheckerLanguages,
  )

  if (isMaximized) {
    browserWindow.maximize()
  }

  browserWindow.on('resized', () => {
    // мы не обновляем bounds, чтобы иметь возможность вернуться к нему после релогаута из фулл скрина
    if (!browserWindow.isFullScreen()) {
      GlobalStore.set(
        'window-bounds',
        JSON.stringify(browserWindow.getBounds()),
      )
    }
  })

  browserWindow.on('moved', () => {
    GlobalStore.set('window-bounds', JSON.stringify(browserWindow.getBounds()))
  })
  browserWindow.on('maximize', () => {
    GlobalStore.set('is-maximized', true)
    GlobalStore.set('window-bounds', JSON.stringify(browserWindow.getBounds()))
  })
  browserWindow.on('unmaximize', () => {
    GlobalStore.set('is-maximized', false)
    GlobalStore.set('window-bounds', JSON.stringify(browserWindow.getBounds()))
  })

  browserWindow.on('close', (event) => {
    if (GlobalStore.get<boolean>('readyToClose')) {
      MediaWindow.closeIfExists()
    } else {
      MediaWindow.window?.close()
    }

    if (!browserWindow.isFullScreen()) {
      GlobalStore.set(
        'window-bounds',
        JSON.stringify(browserWindow.getBounds()),
      )
    }

    if (GlobalStore.get<boolean>('readyToClose')) {
      commonLogger.info('main', scope, 'Closing app window')

      return
    }

    commonLogger.info('main', scope, 'Minimizing app window')

    event.preventDefault()
    handleWindowClose(browserWindow)
  })

  browserWindow.on('enter-full-screen', () => {
    GlobalStore.set('is-full-screen-mode', true)
    // на Windows после срабатывания событий enter/leave-full-screen
    // функция mainWindow.isFullScreen возвращает устаревшее значение
    setTimeout(initMenu)

    // прячем меню при переходе в фулскрин. оно все еще доступно по нажатию на alt
    if (!isMac) {
      browserWindow.setAutoHideMenuBar(true)
      browserWindow.setMenuBarVisibility(false)
    }
  })

  browserWindow.on('leave-full-screen', () => {
    GlobalStore.set('is-full-screen-mode', false)
    // на Windows после срабатывания событий enter/leave-full-screen
    // функция mainWindow.isFullScreen возвращает устаревшее значение
    setTimeout(initMenu)

    if (!isMac) {
      browserWindow.setMenuBarVisibility(true)
      browserWindow.setAutoHideMenuBar(false)
    }
  })

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */

  browserWindow.on('ready-to-show', () => {
    if (
      app.commandLine.hasSwitch('hidden') &&
      userSettingsStore.get('autoStartMode') === 'hidden'
    ) {
      if (!userSettingsStore.get('isTrayActive')) {
        browserWindow?.showInactive()
        browserWindow?.minimize()
      }
    } else {
      browserWindow?.show()
    }

    if (isDev) {
      // browserWindow?.webContents.openDevTools()
    }
  })

  isClientCredentialsExists()
    ? openIndexPage(browserWindow, hash)
    : openAuthPage(browserWindow, hash)

  if (isClientCredentialsExists()) {
    callsWindow.loadPage()
  }

  configureBrowserWindow(browserWindow)

  if (GlobalStore.has('theme')) {
    nativeTheme.themeSource = GlobalStore.get<Theme>('theme')
  }

  return browserWindow
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateMeWindow(
  argv: string[] = process.argv,
): Promise<void> {
  GlobalStore.set('readyToClose', false)
  let hash: string | undefined

  if (!isMac) {
    const deeplinkingUrl = argv.find((arg) => arg.startsWith('vk://'))
    if (deeplinkingUrl) {
      commonLogger.debug('main', scope, 'handle restoreOrCreateWindow')
      hash = handleOpenUrl(deeplinkingUrl)
    }
  }
  let window = getWindow()

  if (window === undefined) {
    window = await createWindow(hash)

    new Badge(window, {
      font: '18px arial',
    })
  } else {
    if (hash && !isMac) {
      openDeepLink(hash)
    }
    // активация окна относится только к кейсу открытия приложения во второй раз
    if (window.isVisible && !window.isVisible()) {
      activateWindow()
    }

    if (window.isMinimized()) {
      window.restore()
    }

    window.focus()
  }

  initContextMenu()
}

export async function activateWindow(): Promise<void> {
  const window = getWindow()
  if (window) {
    !window.isVisible() && window.show()
    window.focus()
  }
}

export async function toggleWindow(): Promise<void> {
  const window = getWindow()
  if (window) {
    if (!window.isVisible()) {
      window.show()
      window.focus()
    } else {
      window.hide()
    }
  }
}
