import electronLog from 'electron-log/main'
import { CreateLoggerArgs, ParameterizedElectronLogger } from './types'
import { FORMAT, MAX_SIZE } from './constants'
import { join, parse } from 'path'
import fs, { promises } from 'fs'
import { app } from 'electron'

export function createLogger({
  logId,
  fileName,
  fileLevel,
  consoleLevel,
  archiveSize,
}: CreateLoggerArgs): ParameterizedElectronLogger {
  const customLogger = electronLog.create({ logId })

  customLogger.levels = ['error', 'warn', 'info', 'debug']

  customLogger.transports.file.level = fileLevel
  customLogger.transports.file.format = FORMAT
  customLogger.transports.file.fileName = fileName
  customLogger.transports.file.maxSize = MAX_SIZE
  customLogger.transports.file.sync = false

  customLogger.transports.file.archiveLogFn = async (logFile) => {
    const logsDir = app.getPath('logs')
    const file = logFile.toString()
    const parsedFilePath = parse(file)

    try {
      // Требование удалять файл синхронно указано в доках electron-log
      // https://github.com/megahertz/electron-log/blob/master/docs/transports/file.md
      fs.renameSync(
        file,
        join(
          parsedFilePath.dir,
          `${parsedFilePath.name}.${Date.now()}${parsedFilePath.ext}`,
        ),
      )

      const files = await promises.readdir(logsDir)
      const logFiles = files
        .filter((item) => item.includes(parsedFilePath.name))
        .sort((a, b) => b.localeCompare(a))

      if (logFiles.length > archiveSize) {
        for (const logFile of logFiles.slice(archiveSize)) {
          await promises.unlink(join(logsDir, logFile))
        }
      }
    } catch (error) {
      electronLog.error('Log files rotation error', error)
    }
  }

  customLogger.transports.console.level = consoleLevel
  customLogger.transports.console.format = FORMAT

  return {
    ...customLogger,
    error: (process, scope, ...params) =>
      customLogger.error(`${process} | ${scope} |`, ...params),
    warn: (process, scope, ...params) =>
      customLogger.warn(`${process} | ${scope} |`, ...params),
    info: (process, scope, ...params) =>
      customLogger.info(`${process} | ${scope} |`, ...params),
    debug: (process, scope, ...params) =>
      customLogger.debug(`${process} | ${scope} |`, ...params),
  }
}
