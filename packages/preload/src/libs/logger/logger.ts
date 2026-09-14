import { ipcRenderer } from 'electron'
import { LoggerChannels, ParameterizedLogger } from 'vkme-common'

export const commonLogger: ParameterizedLogger = {
  error: (...args) => ipcRenderer.send(LoggerChannels.ERROR_COMMON, ...args),
  warn: (...args) => ipcRenderer.send(LoggerChannels.WARN_COMMON, ...args),
  info: (...args) => ipcRenderer.send(LoggerChannels.INFO_COMMON, ...args),
  debug: (...args) => ipcRenderer.send(LoggerChannels.DEBUG_COMMON, ...args),
}
