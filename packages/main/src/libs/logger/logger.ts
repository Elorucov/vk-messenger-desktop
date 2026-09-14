import { createLogger } from './createLogger'
import { LoggersManager } from './loggerManager'

export const commonLogger = createLogger({
  logId: 'common-log',
  fileName: 'common.log',
  fileLevel: 'info',
  consoleLevel: 'info',
  archiveSize: 2,
})

export const netLogger = createLogger({
  logId: 'net-log',
  fileName: 'network.log',
  fileLevel: 'error',
  consoleLevel: false,
  archiveSize: 3,
})

export const loggerSettings = new LoggersManager(commonLogger, netLogger)
