import { app, BrowserWindow, Display, screen } from 'electron'
import { CallsFromMain, CallsMethodParams, CallsWindowState } from 'vkme-common'
import { join } from 'path'
import GlobalStore from '../../storage/global.store'
import {
  configureBrowserWindow,
  getWindow,
  isDev,
  isDevToolsAllowed,
  isMac,
  openCallsPage,
} from '../../utils'
import { commonLogger } from '../logger'
import { isPositionWithinScreenBounds } from './isWindowWithinScreenBounds'
import { langUse } from '../translations/utils'
import { translationsStore } from '../../storage/translationsStore'

const scope = 'calls window'

type WindowBounds = {
  currentPosition?: { x: number; y: number }
  defaultPosition?: { x: number; y: number }
  size: { width: number; height: number }
}

class CallsWindow {
  public browserWindow: BrowserWindow | null = null
  private callsState: CallsWindowState = 'none'
  public isHistoryOpen: boolean = false
  private historyWindow: WindowBounds = { size: { width: 800, height: 660 } }
  private normalWindow: WindowBounds = { size: { width: 1000, height: 720 } }
  private miniWindow: WindowBounds = { size: { width: 265, height: 220 } }
  private incomingWindow: WindowBounds = { size: { width: 300, height: 410 } }
  private joinPopupWindow: WindowBounds = { size: { width: 680, height: 520 } }

  public async createWindow(): Promise<void> {
    if (this.browserWindow) {
      return
    }

    this.setDefaultPosition(
      50,
      50,
      this.miniWindow,
      screen.getPrimaryDisplay(),
      true,
    )
    this.setDefaultPosition(
      50,
      50,
      this.incomingWindow,
      screen.getPrimaryDisplay(),
      true,
    )
    const translations = await translationsStore.getAfterLoad()
    const browserWindow = new BrowserWindow({
      icon: join(app.getAppPath(), 'packages/renderer/dist/icons/icon@1x.png'),
      title: langUse(translations, 'me_vkme_title') || 'VK Мессенджер',
      show: false,
      frame: false,
      maximizable: false,
      alwaysOnTop: false,
      fullscreen: false,
      fullscreenable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        // TODO: установить в true - https://jira.mvk.com/browse/ME-54762
        sandbox: false,
        webviewTag: false,
        preload: join(app.getAppPath(), 'packages/preload/dist/entryCalls.js'),
        devTools: isDevToolsAllowed || isDev,
      },
    })

    // TODO: избавится от дублирования в рамках - https://jira.mvk.com/browse/ME-53111
    browserWindow.webContents.session.setUserAgent(
      browserWindow.webContents.session
        .getUserAgent()
        .replace('Мессенджер', 'Messenger'),
    )

    browserWindow.on('moved', () => {
      if (!this.isHistoryOpen && this.callsState === 'normal') {
        this.normalWindow.currentPosition = browserWindow.getBounds()
      }

      if (!this.isHistoryOpen && this.callsState === 'mini-view') {
        this.miniWindow.currentPosition = browserWindow.getBounds()
      }

      if (!this.isHistoryOpen && this.callsState === 'incoming') {
        this.incomingWindow.currentPosition = browserWindow.getBounds()
      }

      if (!this.isHistoryOpen && this.callsState === 'join-popup') {
        this.joinPopupWindow.currentPosition = browserWindow.getBounds()
      }

      if (this.isHistoryOpen) {
        this.historyWindow.currentPosition = browserWindow.getBounds()
      }
    })

    browserWindow.on('close', (event) => {
      if (!GlobalStore.get('readyToClose')) {
        event.preventDefault()
      }
    })

    browserWindow.on('enter-full-screen', () => {
      if (this.callsState !== 'full-screen') {
        this.browserWindow?.webContents.send(CallsFromMain.FULLSCREEN_WINDOW)
      }
    })

    browserWindow.on('leave-full-screen', () => {
      if (!this.isHistoryOpen && this.callsState === 'full-screen') {
        this.browserWindow?.webContents.send(CallsFromMain.RESTORE_WINDOW)
      }
    })

    configureBrowserWindow(browserWindow)

    this.browserWindow = browserWindow
  }

  public loadPage(): void {
    if (this.browserWindow) {
      this.browserWindow.hide()
      openCallsPage(this.browserWindow)
    }
  }

  public processCallsMethod(params: CallsMethodParams) {
    this.browserWindow?.webContents.send(
      CallsFromMain.PROCESS_CALLS_METHOD,
      params,
    )
  }

  public showMiniView(): void {
    commonLogger.debug('main', scope, 'showMiniView')
    this.callsState = 'mini-view'

    this.leaveFullScreenAndExecuteCallback(() => {
      this.browserWindow?.setVisibleOnAllWorkspaces(true)
      this.browserWindow?.setMinimumSize(
        this.miniWindow.size.width,
        this.miniWindow.size.height,
      )
      this.browserWindow?.setSize(
        this.miniWindow.size.width,
        this.miniWindow.size.height,
      )

      const normalWindowDisplay = this.getDisplay(this.normalWindow)
      const miniWindowDisplay = this.getDisplay(this.miniWindow)

      // Если окно в обычном режиме и минивью на разных экранах,
      // сбрасываем сохраненную позицию минивью и устанавливаем
      // позицию по умолчанию на экран с обычным режимом
      if (normalWindowDisplay.id !== miniWindowDisplay.id) {
        this.miniWindow.currentPosition = undefined
        this.setDefaultPosition(
          50,
          50,
          this.miniWindow,
          normalWindowDisplay,
          true,
        )
      }

      this.setWindowPosition(this.miniWindow)
      this.browserWindow?.show()
      this.browserWindow?.setAlwaysOnTop(true)
      this.browserWindow?.setFullScreenable(false)
      this.browserWindow?.setResizable(false)
      this.miniWindow.currentPosition = this.browserWindow?.getBounds()
      this.sendToggleCallsWindowStateEvent()
    })
  }

  public showNormalView(): void {
    commonLogger.debug('main', scope, 'showNormalView')
    this.callsState = 'normal'

    this.leaveFullScreenAndExecuteCallback(() => {
      this.browserWindow?.setVisibleOnAllWorkspaces(false)
      this.browserWindow?.setSize(
        this.normalWindow.size.width,
        this.normalWindow.size.height,
      )
      this.setWindowPosition(this.normalWindow)
      this.browserWindow?.show()
      this.browserWindow?.focus()
      this.browserWindow?.setAlwaysOnTop(false)
      this.browserWindow?.setFullScreenable(true)
      this.browserWindow?.setResizable(true)
      this.browserWindow?.setMinimumSize(680, 480)
      this.normalWindow.currentPosition = this.browserWindow?.getBounds()
      this.sendToggleCallsWindowStateEvent()
    })
  }

  public showFullScreenView(): void {
    commonLogger.debug('main', scope, 'showFullScreenView')

    if (this.isHistoryOpen) {
      commonLogger.debug(
        'main',
        scope,
        'showFullScreenView',
        'skipped because of history open',
      )
      this.browserWindow?.setFullScreen(false)
      return
    }

    this.callsState = 'full-screen'
    this.browserWindow?.setVisibleOnAllWorkspaces(false)
    this.browserWindow?.setFullScreenable(true)
    this.browserWindow?.setFullScreen(true)
    this.browserWindow?.show()
    this.browserWindow?.focus()
    this.browserWindow?.setAlwaysOnTop(false)
    this.sendToggleCallsWindowStateEvent()
  }

  public showIncomingView(): void {
    commonLogger.debug('main', scope, 'showIncomingView')
    this.callsState = 'incoming'

    this.leaveFullScreenAndExecuteCallback(() => {
      this.browserWindow?.setVisibleOnAllWorkspaces(false)
      this.browserWindow?.setMinimumSize(
        this.incomingWindow.size.width,
        this.incomingWindow.size.height,
      )
      this.browserWindow?.setSize(
        this.incomingWindow.size.width,
        this.incomingWindow.size.height,
      )
      this.setWindowPosition(this.incomingWindow)
      this.browserWindow?.show()
      this.browserWindow?.focus()
      this.browserWindow?.setAlwaysOnTop(true)
      this.browserWindow?.setFullScreenable(false)
      this.browserWindow?.setResizable(false)
      this.incomingWindow.currentPosition = this.browserWindow?.getBounds()
      this.sendToggleCallsWindowStateEvent()
    })
  }

  public showHistoryView(): void {
    commonLogger.debug('main', scope, 'showHistoryView')
    this.isHistoryOpen = true

    this.leaveFullScreenAndExecuteCallback(() => {
      this.browserWindow?.setVisibleOnAllWorkspaces(false)
      this.browserWindow?.setSize(
        this.historyWindow.size.width,
        this.historyWindow.size.height,
      )
      this.setWindowPosition(this.historyWindow)
      this.browserWindow?.show()
      this.browserWindow?.focus()
      this.browserWindow?.setAlwaysOnTop(false)
      this.browserWindow?.setFullScreenable(false)
      this.browserWindow?.setResizable(true)
      this.browserWindow?.setMinimumSize(680, 480)
      this.historyWindow.currentPosition = this.browserWindow?.getBounds()
      this.sendToggleCallsWindowStateEvent()
    })
  }

  public showJoinPopupView(): void {
    commonLogger.debug('main', scope, 'showJoinPopupView')
    this.callsState = 'join-popup'

    this.leaveFullScreenAndExecuteCallback(() => {
      this.browserWindow?.setVisibleOnAllWorkspaces(false)
      this.browserWindow?.setSize(
        this.joinPopupWindow.size.width,
        this.joinPopupWindow.size.height,
      )
      this.setWindowPosition(this.joinPopupWindow)
      this.browserWindow?.show()
      this.browserWindow?.focus()
      this.browserWindow?.setAlwaysOnTop(false)
      this.browserWindow?.setFullScreenable(false)
      this.browserWindow?.setResizable(false)
      this.joinPopupWindow.currentPosition = this.browserWindow?.getBounds()
      this.sendToggleCallsWindowStateEvent()
    })
  }

  public closeHistory(): void {
    commonLogger.debug('main', scope, 'closeHistory')

    this.isHistoryOpen = false

    switch (this.callsState) {
      case 'full-screen':
        this.showFullScreenView()
        break

      case 'incoming':
        this.showIncomingView()
        break

      case 'mini-view':
        this.showMiniView()
        break

      case 'normal':
        this.showNormalView()
        break

      case 'join-popup':
        this.showJoinPopupView()
        break

      default:
        this.hide()
        break
    }
  }

  public focus(): void {
    this.browserWindow?.show()
    this.browserWindow?.focus()
  }

  public minimize(): void {
    this.browserWindow?.minimize()
  }

  public hide(): void {
    commonLogger.debug('main', scope, 'hide')

    this.callsState = 'none'

    this.leaveFullScreenAndExecuteCallback(() => {
      this.browserWindow?.hide()

      // need to reset to avoid race condition at start
      this.browserWindow?.setVisibleOnAllWorkspaces(false)
      this.browserWindow?.setFullScreenable(false)
      this.browserWindow?.setAlwaysOnTop(false)

      this.sendToggleCallsWindowStateEvent()
    })
  }

  private leaveFullScreenAndExecuteCallback(callback: () => void): void {
    if (!this.browserWindow?.isFullScreen()) {
      callback()
      return
    }

    this.browserWindow?.setFullScreen(false)

    if (isMac) {
      this.browserWindow?.once('leave-full-screen', callback)
    } else {
      callback()
    }
  }

  private setWindowPosition(bounds: WindowBounds) {
    if (
      bounds.currentPosition &&
      isPositionWithinScreenBounds({
        ...bounds.currentPosition,
        ...bounds.size,
      })
    ) {
      const { x, y } = bounds.currentPosition
      this.browserWindow?.setPosition(x, y)
    } else {
      if (bounds.defaultPosition) {
        const { x, y } = bounds.defaultPosition
        this.browserWindow?.setPosition(x, y)
      } else {
        this.browserWindow?.center()
      }
    }
  }

  private sendToggleCallsWindowStateEvent(newState?: CallsWindowState) {
    getWindow()?.webContents.send(
      CallsFromMain.TOGGLE_CALLS_WINDOW_STATE,
      newState || this.callsState,
    )

    this.browserWindow?.webContents.send(
      CallsFromMain.TOGGLE_CALLS_WINDOW_STATE,
      newState || this.callsState,
    )
  }

  private setDefaultPosition(
    x: number,
    y: number,
    bounds: WindowBounds,
    display: Display,
    startFromRight?: boolean,
  ): void {
    const { width: screenWidth } = display.workAreaSize

    bounds.defaultPosition = {
      x:
        display.bounds.x +
        (startFromRight ? screenWidth - x : x) -
        this.miniWindow.size.width,
      y: display.bounds.y + y,
    }
  }

  private getDisplay(bounds: WindowBounds): Display {
    return screen.getDisplayMatching({
      ...(bounds.currentPosition || { x: 0, y: 0 }),
      ...bounds.size,
    })
  }
}

export const callsWindow = new CallsWindow()
