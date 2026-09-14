import { Api } from '@vkontakte-internal/messenger/dist/data/env/Api'
import * as Sentry from '@sentry/electron/renderer'
import { invoke } from './invoke'
import credentialsStore from '../storage/credentials.store'
import { BASE_API_URL } from 'vkme-common'
import { commonLogger } from '../libs/logger'
import { userSettingsStore } from '../storage/user-settings.store'
import { Locales } from 'vkme-common'

const request = async (
  url: string,
  params: Record<string, string>,
  signal?: AbortSignal | undefined,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (signal) {
      signal.onabort = reject
    }
    invoke(url, params)
      .then((data) => {
        if (data?.error) {
          commonLogger.error(
            'main',
            'api',
            url,
            '| response data error',
            JSON.stringify(data.error),
          )
          reject()
        }

        return data
      })
      .then(resolve)
      .catch(reject)
  })
}

const translation = userSettingsStore.get('lang')

const api = new Api(
  {
    dispose(): void {},
    info: () => {},
    error: (message: string, err?: unknown) => {
      Sentry.captureException(err)
    },
  }, //logger
  BASE_API_URL,
  request,
  async () => credentialsStore.getApiToken() || '', //
  () => Promise.resolve(null), //onCaptcha
  () => Promise.resolve(null), //onCua
  () => Promise.resolve(null), // onApiUnavailable
  { rateLimit: 9, rateLimitWindow: 2000 },
  () => Promise.resolve(), //handleLogout,
  undefined, //prefetchCache
  undefined, // onOnline
  translation || Locales.RU,
)

export { api }
