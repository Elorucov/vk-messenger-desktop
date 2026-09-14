import { ipcMain, shell } from 'electron'
import { ICalls, IRouter } from '@vkontakte-internal/messenger'
import {
  CallsFromMain,
  CallsFromPreload,
  CallsMethodParams,
  ShowHangupModalEventDetail,
} from 'vkme-common'
import { callsWindow } from './callsWindow'
import { getWindow } from '../../utils'

ipcMain.handle(CallsFromPreload.EDIT_VMOJI, () =>
  shell.openExternal(`https://vk.com/app7929683#character_id=avatar`),
)

ipcMain.on(CallsFromPreload.CLOSE_HISTORY, (_event) => {
  callsWindow.closeHistory()
})

ipcMain.on(
  CallsFromPreload.PROCESS_ROUTER_PUSH,
  (_event, params: IRouter.Entity) => {
    const mainWindow = getWindow()
    mainWindow?.webContents.send(CallsFromMain.PROCESS_ROUTER_PUSH, params)
  },
)

ipcMain.on(CallsFromPreload.HIDE_WINDOW, (_event) => {
  callsWindow.hide()
})

ipcMain.on(CallsFromPreload.COLLAPSE_WINDOW, (_event) => {
  callsWindow.showMiniView()
})

ipcMain.on(CallsFromPreload.RESTORE_WINDOW, (_event) => {
  callsWindow.showNormalView()
})

ipcMain.on(CallsFromPreload.FULLSCREEN_WINDOW, (_event) => {
  callsWindow.showFullScreenView()
})

ipcMain.on(CallsFromPreload.FOCUS_WINDOW, (_event) => {
  callsWindow.focus()
})

ipcMain.on(CallsFromPreload.MINIMIZE_WINDOW, (_event) => {
  callsWindow.minimize()
})

ipcMain.on(CallsFromPreload.SHOW_INCOMING_CALL, () => {
  callsWindow.showIncomingView()
})

ipcMain.on(
  CallsFromPreload.PROCESS_HISTORY,
  (_event, params: CallsMethodParams) => {
    if (callsWindow.isHistoryOpen) {
      callsWindow?.focus()
      return
    }

    callsWindow.processCallsMethod(params)
    callsWindow.showHistoryView()
  },
)

ipcMain.on(
  CallsFromPreload.PROCESS_CALLS_METHOD,
  (_event, params: CallsMethodParams) => callsWindow.processCallsMethod(params),
)

ipcMain.on(
  CallsFromPreload.PROCESS_SHOW_HANGUP_MODAL,
  (_event, options: ShowHangupModalEventDetail) => {
    const mainWindow = getWindow()
    mainWindow?.webContents.send(CallsFromMain.SHOW_HANGUP_MODAL, options)
  },
)

ipcMain.on(
  CallsFromPreload.PROCESS_SHOW_JOIN_POPUP,
  (_event, params: CallsMethodParams) => {
    callsWindow.processCallsMethod(params)
    callsWindow.showJoinPopupView()
  },
)

// колбэк на подписанное событие
ipcMain.on(CallsFromPreload.PROCESS_SUBSCRIBE_CALLBACK, (_event, ...args) => {
  const mainWindow = getWindow()
  mainWindow?.webContents.send(
    CallsFromMain.PROCESS_SUBSCRIBE_CALLBACK,
    ...args,
  )
})

ipcMain.on(
  CallsFromPreload.ACTIVE_CALL_CHANGE,
  (_, activeCall: ICalls.ActiveCall | null) => {
    const mainWindow = getWindow()
    mainWindow?.webContents.executeJavaScript(
      `window._callsActiveCall=JSON.parse('${JSON.stringify(activeCall)}');`,
    )
  },
)
