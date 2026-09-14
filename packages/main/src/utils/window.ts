import { BrowserWindow, app } from 'electron'
import { userSettingsStore } from '../storage/user-settings.store'
import { isMac } from './helpers'

export const getWindow = (): BrowserWindow | undefined => {
  return BrowserWindow.fromId(2) || undefined
}

const closeOrHide = (window: BrowserWindow) => {
  const isTrayActive = userSettingsStore.get('isTrayActive')

  if (isTrayActive || isMac) {
    // необходимо выставить фокус на следующее открытое окно
    window.blur()

    if (isMac) {
      app.hide()
    } else {
      window.hide()
    }
  } else {
    app.quit()
  }
}

export const handleWindowClose = (window: BrowserWindow): void => {
  // считаем, что стейт уже сохранен, тогда
  // на маке сначала нужно выйти из фулскрина + оно асинхронное
  // на остальных платформах достаточно вызвать hide
  if (window.isFullScreen() && isMac) {
    window.setFullScreen(false)
    window.once('leave-full-screen', () => closeOrHide(window))
  } else {
    closeOrHide(window)
  }
}

export const hideMainWindow = (): void => {
  const mainWindow = getWindow()
  mainWindow && handleWindowClose(mainWindow)
}

export const showMainWindow = (): void => {
  const mainWindow = getWindow()
  if (mainWindow) {
    mainWindow.show()
  }
}
