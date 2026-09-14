import { ipcMain } from 'electron'
import { LoggerChannels } from 'vkme-common'
import { commonLogger } from './logger'

ipcMain?.on(
  LoggerChannels.ERROR_COMMON,
  (_event, process, scope, ...args: string[]) => {
    commonLogger.error(process, scope, ...args)
  },
)

ipcMain?.on(
  LoggerChannels.WARN_COMMON,
  (_event, process, scope, ...args: string[]) => {
    commonLogger.warn(process, scope, ...args)
  },
)

ipcMain?.on(
  LoggerChannels.INFO_COMMON,
  (_event, process, scope, ...args: string[]) => {
    commonLogger.info(process, scope, ...args)
  },
)

ipcMain?.on(
  LoggerChannels.DEBUG_COMMON,
  (_event, process, scope, ...args: string[]) => {
    commonLogger.debug(process, scope, ...args)
  },
)
