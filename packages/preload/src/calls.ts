import { IRouter } from '@vkontakte-internal/messenger'
import { ipcRenderer, contextBridge } from 'electron'
import {
  CallsFromMain,
  CallsFromPreload,
  CallsMethodParams,
  CallsWindowState,
  ShowHangupModalEventDetail,
} from 'vkme-common'

const api: Window['_calls'] = {
  window: {
    restore: () => ipcRenderer.send(CallsFromPreload.RESTORE_WINDOW),
    collapse: () => ipcRenderer.send(CallsFromPreload.COLLAPSE_WINDOW),
    fullscreen: () => ipcRenderer.send(CallsFromPreload.FULLSCREEN_WINDOW),
    hide: () => ipcRenderer.send(CallsFromPreload.HIDE_WINDOW),
    focus: () => ipcRenderer.send(CallsFromPreload.FOCUS_WINDOW),
    minimize: () => ipcRenderer.send(CallsFromPreload.MINIMIZE_WINDOW),
    showIncomingCall: () =>
      ipcRenderer.send(CallsFromPreload.SHOW_INCOMING_CALL),
    onFullscreen: (listener: () => void) => {
      ipcRenderer.on(CallsFromMain.FULLSCREEN_WINDOW, (_event) => {
        listener()
      })
    },
    onRestore: (listener: () => void) => {
      ipcRenderer.on(CallsFromMain.RESTORE_WINDOW, (_event) => {
        listener()
      })
    },
  },
  closeHistory: () => ipcRenderer.send(CallsFromPreload.CLOSE_HISTORY),
  processRouterPush: (args: IRouter.Entity) =>
    ipcRenderer.send(CallsFromPreload.PROCESS_ROUTER_PUSH, args),
  processHistory: (params: CallsMethodParams) =>
    ipcRenderer.send(CallsFromPreload.PROCESS_HISTORY, params),
  processCallsMethod: (params: CallsMethodParams) =>
    ipcRenderer.send(CallsFromPreload.PROCESS_CALLS_METHOD, params),
  processShowJoinPopup: (params: CallsMethodParams) =>
    ipcRenderer.send(CallsFromPreload.PROCESS_SHOW_JOIN_POPUP, params),
  editVmoji: (): Promise<void> =>
    ipcRenderer.invoke(CallsFromPreload.EDIT_VMOJI),
  onProcessCallsMethod: (callback: (params: CallsMethodParams) => void) => {
    ipcRenderer.on(
      CallsFromMain.PROCESS_CALLS_METHOD,
      (_event, params: CallsMethodParams) => {
        callback(params)
      },
    )
  },
  onProcessRouterPush: (listener: (args: IRouter.Entity) => void) => {
    ipcRenderer.on(CallsFromMain.PROCESS_ROUTER_PUSH, (_event, args) => {
      listener(args)
    })
  },
  onToggleCallsWindowState: (listener: (state: CallsWindowState) => void) => {
    ipcRenderer.on(CallsFromMain.TOGGLE_CALLS_WINDOW_STATE, (_event, state) => {
      listener(state)
    })
  },
  processHangupModal: (options: ShowHangupModalEventDetail) => {
    ipcRenderer.send(CallsFromPreload.PROCESS_SHOW_HANGUP_MODAL, options)
  },
  onShowHangupModal: (
    listener: (options: ShowHangupModalEventDetail) => void,
  ) => {
    ipcRenderer.on(CallsFromMain.SHOW_HANGUP_MODAL, (_event, options) => {
      listener(options)
    })
  },
  processSubscribeCallback: (eventType, id) =>
    ipcRenderer.send(
      CallsFromPreload.PROCESS_SUBSCRIBE_CALLBACK,
      eventType,
      id,
    ),
  onProcessSubscribeCallback: (listener) => {
    ipcRenderer.on(
      CallsFromMain.PROCESS_SUBSCRIBE_CALLBACK,
      (_event, eventType, id) => {
        listener(eventType, id)
      },
    )
  },
  onActiveCallChange: (activeCall) =>
    ipcRenderer.send(CallsFromPreload.ACTIVE_CALL_CHANGE, activeCall),
}

contextBridge.exposeInMainWorld('_calls', api)
