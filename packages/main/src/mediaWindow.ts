import {
  BrowserWindow,
  WebContents,
  app,
  ipcMain,
  screen,
  Rectangle,
  Display,
  Event,
} from 'electron'
import { commonLogger } from './libs/logger'
import * as ActiveWin from 'active-win'
import { MEDIA_WINDOW } from 'vkme-common'
import { getWindow, isMac, isWindows } from './utils'
import GlobalStore from './storage/global.store'
import { join } from 'path'
import { isShallowEqual } from '@vkontakte-internal/messenger/dist/core/utils/misc'

const scope = 'Media Window'

const activeWin: typeof ActiveWin = require('active-win')

export class MediaWindow {
  private displayMemory!: Display
  private boundsMemory!: Rectangle
  private parent!: BrowserWindow
  static window: BrowserWindow | null = null
  private isSubscribed = false

  private isWaitingForFocus = false
  private isOpened = false
  private isUnmountWaiting = false

  init = (): this => {
    if (MediaWindow.window) {
      return this
    }

    const window = getWindow()

    if (!window) {
      commonLogger.error('main', 'mediaWindow init', 'window doesnt exist')
      throw new Error("Window is doesn't exists")
    }

    this.parent = window
    this.displayMemory = screen.getDisplayMatching(this.parent.getBounds())
    this.boundsMemory = this.displayMemory.bounds

    this.enableSubscriptions()

    return this
  }

  public static closeIfExists = (): void => {
    if (MediaWindow.window) {
      MediaWindow.window.close()
      MediaWindow.window = null
    }
  }

  private enableSubscriptions = () => {
    if (this.isSubscribed) {
      return
    }

    app.whenReady().then(() => {
      screen.on('display-metrics-changed', (_, display) => {
        commonLogger.debug('main', scope, 'display-metrics-changed')

        if (display.id === this.displayMemory?.id) {
          this.recalcBounds()
        }
      })
      screen.on('display-removed', (_, display) => {
        commonLogger.debug('main', scope, 'display-removed')
        if (display.id === this.displayMemory?.id) {
          this.recalcBounds()
        }
      })
      screen.on('display-added', (_) => {
        commonLogger.debug('main', scope, 'display-added')
        this.recalcBounds()
      })
    })

    ipcMain.handle(MEDIA_WINDOW.RESTORE, () => {
      commonLogger.debug('main', scope, MEDIA_WINDOW.RESTORE)
      if (isMac) {
        this.parent.setFocusable(false)
      }
      this.showMediaPage(false, true)
      // чтобы работала панель управления плеером
      this.parent.webContents.setBackgroundThrottling(false)
    })

    // Единственный верный способ закрыть модалку -- вернуть это событие из рендерера
    ipcMain.handle(MEDIA_WINDOW.HIDE, () => {
      commonLogger.debug('main', scope, 'HIDE')
      this.closeMedia(false)
      this.parent.webContents.setBackgroundThrottling(true)
    })

    ipcMain.handle(MEDIA_WINDOW.UNMOUNTED, () => {
      commonLogger.debug('main', scope, 'unmounted')
      MediaWindow.window?.hide()
      this.isUnmountWaiting = false

      if (isMac) {
        this.parent.setFocusable(true)
      }
    })
  }

  get bounds(): Rectangle {
    return this.boundsMemory
  }

  /**
   * пересчет размера экрана
   * @param isFocus событие вызвано фокусом
   * @param isRestore событие вызвано открытием
   */
  private recalcBounds = async (isFocus?: boolean, isRestore?: boolean) => {
    try {
      commonLogger.debug('main', scope, 'bounds check')
      let isWindowChanged = false

      let display = isRestore
        ? screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
        : screen.getDisplayMatching(this.parent.getBounds())

      if (isMac && isFocus) {
        try {
          const focusedWindow = activeWin.sync()
          if (focusedWindow) {
            display = screen.getDisplayMatching(focusedWindow.bounds)
          }
        } catch (e) {
          commonLogger.error('main', 'recalc bound', e)
        }
      }

      const shouldRecalc =
        display.id !== this.displayMemory?.id ||
        !isShallowEqual(this.boundsMemory, display.bounds)

      if (shouldRecalc) {
        commonLogger.debug(
          'main',
          scope,
          'display bounds changed, should recalc',
        )

        this.displayMemory = display
        this.boundsMemory = display.bounds
        isWindowChanged = true

        commonLogger.debug('main', scope, 'bounds', display.bounds)

        MediaWindow.window?.setBounds({
          height: display.bounds.height,
          width: display.bounds.width,
          x: display.bounds.x,
          y: display.bounds.y,
        })
      }
      return isWindowChanged
    } catch (e) {
      commonLogger.error('main', scope, 'recalcBounds', e)
      return false
    }
  }

  private showMediaPage = async (isFocus?: boolean, isRestore?: boolean) => {
    commonLogger.debug('main', scope, 'showMediaPage')

    const mediaWindow = MediaWindow.window

    if (mediaWindow) {
      const isWindowChanged = await this.recalcBounds(isFocus, isRestore)

      if (isWindowChanged && isMac) {
        mediaWindow.setOpacity(0)

        setTimeout(() => {
          commonLogger.debug('main', scope, 'opacity reset')
          mediaWindow.setOpacity(1)
        }, 500)
      }

      this.isOpened = true
      mediaWindow.show()
    }
  }

  public onCreate = (window: BrowserWindow): void => {
    commonLogger.info('main', scope, 'media window created')

    MediaWindow.window = window

    if (isMac) {
      window.setAlwaysOnTop(true, 'screen-saver')
    }

    if (isMac) {
      window.setHiddenInMissionControl(true)
    }

    window.on('show', this.onShow)
    window.on('blur', this.onBlur)
    window.on('hide', this.onHide)
    window.on('close', this.onClose)

    // если на винде юзер вызовет закрытие фулскрина, закрываем
    window.on('leave-full-screen', () => {
      window.setFullScreen(true)
    })

    this.parent.on('focus', () => {
      if (!this.isWaitingForFocus || this.isUnmountWaiting || !this.isOpened) {
        return
      }
      commonLogger.debug('main', scope, 'parent focus')

      if (isMac) {
        this.parent.setFocusable(false)
      }
      this.isWaitingForFocus = false

      this.showMediaPage(true)
    })
  }

  private onShow = () => {
    commonLogger.debug('main', scope, 'show\n')

    if (!isMac) {
      MediaWindow.window?.setFullScreen(true)
    }
  }

  //
  private onBlur = () => {
    commonLogger.debug('main', scope, 'blur')

    if (this.isUnmountWaiting || !this.isOpened) {
      return
    }

    if (this.isWaitingForFocus) {
      commonLogger.debug('main', scope, 'isWaitingForFocus', 'skip')
      if (isMac) {
        this.parent.setFocusable(true)
      }
      return
    }

    if (this.isOpened) {
      const isBlur =
        !this.parent.isFocused() && !MediaWindow.window?.isFocused()
      const isMC =
        isMac && !this.parent.isFocused() && MediaWindow.window?.isFocused()
      commonLogger.debug(
        'main',
        scope,
        'blur',
        `isBlur: ${isBlur}`,
        `isMC: ${isMC}`,
      )
      if (isBlur || isMC) {
        commonLogger.debug('main', scope, 'blur', 'FORCE  hide from blur')
        if (isMac) {
          MediaWindow.window?.hide()
        }
        this.isWaitingForFocus = true

        if (isBlur && isMac) {
          this.parent.setFocusable(true)
        }
      }
    }
  }

  private onHide = () => {
    commonLogger.debug('main', scope, 'hide')

    if (this.isOpened) {
      const isMC =
        isMac && !this.parent.isFocused() && MediaWindow.window?.isFocused()

      if (isMC) {
        commonLogger.debug('main', scope, 'hide', 'MC DETECTED', 'onBlur')
        this.onBlur()
      }
    }
  }

  private onClose = (event: Event) => {
    commonLogger.debug('main', scope, 'close')

    if (!GlobalStore.get<boolean>('readyToClose')) {
      event.preventDefault()
    }

    this.closeMedia(true)
  }

  private closeMedia = (initByMediaWindow: boolean) => {
    commonLogger.debug('main', scope, 'closeMedia')

    // если не initByMediaWindow, то, вероятно, событие уже не нужно отправлять
    if (initByMediaWindow) {
      this.parent.webContents.send(MEDIA_WINDOW.ONCLOSE)
    } else {
      MediaWindow.window?.webContents.send(MEDIA_WINDOW.UNMOUNT)
    }

    if (isMac) {
      this.parent.setFocusable(true)
    }
    this.isUnmountWaiting = true

    // если по какой то причине пришло второй раз, то закрываем
    if (!this.isOpened) {
      MediaWindow.window?.hide()
    }

    this.isWaitingForFocus = false
    this.isOpened = false
  }
}

export const mediaWindow = new MediaWindow()

export const openMediaWindow = (): ReturnType<
  Parameters<WebContents['setWindowOpenHandler']>[0]
> => {
  mediaWindow.init()

  app.once('browser-window-created', (_, window) => {
    mediaWindow.onCreate(window)
  })

  return {
    action: 'allow',
    overrideBrowserWindowOptions: {
      ...mediaWindow.bounds,
      frame: false,
      transparent: true,
      movable: false,
      hasShadow: false,
      resizable: false,
      enableLargerThanScreen: true,
      roundedCorners: false,
      fullscreen: isWindows, // на windows открываем сразу, на линуксе после show события из-за открытия окна при show = false
      fullscreenable: !isMac,
      hiddenInMissionControl: true,
      show: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webviewTag: false,
        backgroundThrottling: false,
        devTools: false,
        preload: join(app.getAppPath(), 'packages/preload/dist/entryMedia.js'),
      },
    },
  }
}
