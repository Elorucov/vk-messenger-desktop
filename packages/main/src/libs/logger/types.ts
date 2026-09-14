import type { LevelOption, MainLogger } from 'electron-log'

export type LoggerProcess = 'main' | 'preload' | 'renderer' | 'worker'

export type CreateLoggerArgs = {
  logId: string
  fileName: string
  fileLevel: LevelOption
  consoleLevel: LevelOption
  archiveSize: number
}

type ParameterizedLogFunction = (
  process: LoggerProcess,
  scope: string,
  ...params: unknown[]
) => void

export type ParameterizedElectronLogger = Omit<
  MainLogger,
  'error' | 'warn' | 'info' | 'debug'
> & {
  error: ParameterizedLogFunction
  warn: ParameterizedLogFunction
  info: ParameterizedLogFunction
  debug: ParameterizedLogFunction
}

export type LoggerSettingsStore = {
  isNetLogsActive: boolean
  isDebugLevelActive: boolean
}
