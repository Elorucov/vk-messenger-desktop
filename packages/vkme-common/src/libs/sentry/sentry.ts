import { ElectronMainOptions } from '@sentry/electron/main'
import { BrowserOptions } from '@sentry/electron/renderer'

const sensitiveKeys = ['token', 'access_token', 'exchange_token', 'key']

function scrubQueryParams(query: string): string {
  const queryEntries = Object.fromEntries(new URLSearchParams(query))
  const fixedQueryEntrie = Object.entries(queryEntries).map((entry) => {
    if (sensitiveKeys.includes(entry[0])) {
      return [entry[0], '[Filtered]']
    }
    return entry
  })

  return new URLSearchParams(fixedQueryEntrie).toString()
}

export const initSentry = (
  initFunction: (options: ElectronMainOptions | BrowserOptions) => void,
): void => {
  initFunction({
    release: import.meta.env.PACKAGE_VERSION,
    environment: import.meta.env.MODE,
    dsn: 'https://ecac1128499a413bbd0734e16ddda1a3@stacks.vk-portal.net/72',
    tracesSampleRate: 0,
    beforeBreadcrumb: (breadcrumb) => {
      if (breadcrumb.category === 'http' && breadcrumb.data) {
        breadcrumb.data['http.query'] = scrubQueryParams(
          breadcrumb.data['http.query'],
        )
      }

      return breadcrumb
    },
    beforeSend: (event) => {
      delete event.dist
      return event
    },
    maxBreadcrumbs: 5,
    enabled: import.meta.env.PROD,
  })
}
