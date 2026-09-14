import { contextBridge } from 'electron'
import { commonLogger } from './logger'

contextBridge.exposeInMainWorld('_log', {
  error: commonLogger.error,
  warn: commonLogger.warn,
  info: commonLogger.info,
  debug: commonLogger.debug,
} as Window['_log'])
