export type LoggerProcessName = 'main' | 'preload' | 'renderer' | 'worker'

export type LoggerFunction = (
  process: LoggerProcessName,
  scope: string,
  ...params: unknown[]
) => void

export type ParameterizedLogger = {
  error: LoggerFunction
  warn: LoggerFunction
  info: LoggerFunction
  debug: LoggerFunction
}
