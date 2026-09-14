import * as Sentry from '@sentry/electron/main'
import unhandled from 'electron-unhandled'
import { initSentry } from 'vkme-common'
import { isDev } from './utils/helpers'
import { commonLogger } from './libs/logger'

initSentry(Sentry.init)

unhandled({
  logger: (error: Error) => {
    if (isDev) {
      commonLogger.error('main', 'error handling', error)
    } else {
      Sentry.captureException(error)
    }
  },
  showDialog: true,
})
