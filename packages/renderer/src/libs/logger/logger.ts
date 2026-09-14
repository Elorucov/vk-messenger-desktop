import { ParameterizedLogger } from 'vkme-common'

export const commonLogger: ParameterizedLogger = {
  error: (...args) => window._log.error(...args),
  warn: (...args) => window._log.warn(...args),
  info: (...args) => window._log.info(...args),
  debug: (...args) => window._log.debug(...args),
}
