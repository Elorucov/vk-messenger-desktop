import React from 'react'
import { createRoot } from 'react-dom/client'
import { initSentry, BASE_API_URL, Locales } from 'vkme-common'
import {
  Api,
  AppUnavailableReason,
  CuaModal,
  IApi,
  ILang,
  Storage,
} from '@vkontakte-internal/messenger'
import { CaptchaReturn } from '@vkontakte-internal/messenger/dist/data/env/Api'
import { CaptchaModal } from '@vkontakte-internal/messenger/dist/browser/ui/CaptchaModal/CaptchaModal'
import { STORAGE_APP_UNAVAILABLE_KEY } from '@vkontakte-internal/messenger/dist/core/config/config'
import * as Sentry from '@sentry/electron/renderer'
import { CaptchaData } from '@vk-ecosystem/api'
import { commonLogger } from '../libs/logger'
import '../libs/vkid/captcha'
import { authWrapper } from './authWrapper'
import { CuaData, CuaResult } from '@vkontakte-internal/api-client'

type ApiResponse = {
  error: { error_code: number; error_msg: string }
  [key: string]: any
}

const vkDomain = 'vk.com'
const pathname = window.location.pathname
const basePath = new RegExp('^(/[A-Z]:/)').test(pathname)
  ? `${pathname.substring(0, 3)}/#`
  : '/#'

const tapRequest =
  (action: (data: ApiResponse) => void) => (data: ApiResponse) => {
    action(data)
    return data
  }

const handleRequestError = tapRequest((data) => {
  switch (data?.error?.error_code) {
    case 3610:
      window._credentials.logout()
      break
    default:
      void 0
  }
})

const request = async (
  url: string,
  params: Record<string, string>,
  signal?: AbortSignal | undefined,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (signal) {
      signal.onabort = reject
    }

    window._invoke
      .invoke(url, params)
      .then(handleRequestError)
      .then(resolve)
      .catch(reject)
  })
}

const webLogger = {
  dispose(): void {},
  info: (...args: unknown[]): void => {
    if (import.meta.env.DEV) {
      console.info(args)
    }
  },
  error: (message: string, err?: unknown): void => {
    if (import.meta.env.DEV) {
      console.error(message, err)
    } else {
      Sentry.withScope(function (scope) {
        scope.setTag('reforged', true)
        Sentry.captureException(err)
      })
    }
  },
}

initSentry(Sentry.init)

const setAppUnavailable = (reason: AppUnavailableReason) => {
  localStorage.setItem(STORAGE_APP_UNAVAILABLE_KEY, String(reason))

  commonLogger.warn('renderer', 'api', 'Setup App Unavailable Fallback')
  window._common.reloadPage()
}

const onOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const isOnline = window.navigator.onLine

      if (isOnline || isOnline === undefined) {
        resolve()
      }

      window.addEventListener('online', () => resolve(), { once: true })
    } catch (e) {
      resolve()
    }
  })
}

const CaptchaSDK = window._vkidCaptchaWidget
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore временный фикс до перехода на полноценный npm-пакет
const notRobotCaptcha = new CaptchaSDK()

let translationLocale = ''

try {
  const translation = await window._translations.getLang()
  translationLocale = translation.config.locale
} catch (e) {
  commonLogger.error('renderer', 'api', 'translations.getlang', e)
  translationLocale = Locales.RU
}

export const apiToken = async (isExpired = false): Promise<string> =>
  authWrapper.auth(isExpired)

class RendererApi {
  private onCaptcha:
    | ((captchaData: CaptchaData) => Promise<CaptchaReturn | null>)
    | null = null
  private onCua: ((cuaData: CuaData) => Promise<CuaResult | null>) | null = null
  public api = new Api(
    webLogger,
    BASE_API_URL,
    request,
    apiToken,
    (data) => {
      if (!this.onCaptcha) {
        return Promise.resolve(null)
      }

      return this.onCaptcha(data)
    },
    (data) => {
      if (!this.onCua) {
        return Promise.resolve(null)
      }

      return this.onCua(data)
    },
    setAppUnavailable,
    { rateLimit: 9, rateLimitWindow: 2000 },
    authWrapper.handleLogout,
    undefined,
    onOnline,
    translationLocale,
  )

  public initCaptcha(lang: ILang.ILang, storage: Storage): void {
    this.onCaptcha = (data) => {
      const captchaContainer = document.getElementById(
        'captcha-root',
      ) as HTMLElement
      const captchaRoot = createRoot(captchaContainer, {
        identifierPrefix: 'captchacontainer-root',
      })
      const modalRoot = document.getElementById('modal-root')

      if (!captchaRoot || !modalRoot) {
        // Исключительный сценарий когда неожиданно не был найден контейнер под каптчу
        return Promise.reject(null)
      }

      const promise = new Promise<CaptchaReturn | null>(async (resolve) => {
        const onClose = () => {
          resolve(null)
        }

        const redirectUri = data.redirect_uri

        if (redirectUri) {
          try {
            const successToken = await notRobotCaptcha.show({
              container: document.body,
              iframeSrc: redirectUri,
              view: 'popup',
            })
            resolve({
              key: '',
              isAudio: false,
              successToken,
            })
            return
          } catch (e) {
            if (e === 'close') {
              onClose()
              return
            } else {
              console.error(e)
            }
          }
        }

        try {
          const deviceId = storage.get('reforged-device-id') || ''

          captchaRoot.render(
            <React.StrictMode>
              <CaptchaModal
                onClose={onClose}
                deviceId={deviceId}
                lang={lang}
                modalRoot={modalRoot}
                data={data}
                onCaptcha={resolve}
              />
            </React.StrictMode>,
          )
        } catch (e: unknown) {
          console.error(e)
          resolve(null)
        }
      })

      promise.then((result) => {
        captchaRoot.unmount()
        return result
      })

      return promise
    }
  }
  public initCua(api: IApi.IApi): void {
    this.onCua = (data) => {
      const cuaContainer = document.getElementById('reforged-cua-root')
      const modalContainer = document.getElementById('modal-root')

      if (!cuaContainer || !modalContainer) {
        // Исключительный сценарий когда неожиданно не был найден контейнер под каптчу
        return Promise.reject(null)
      }

      const cuaRoot = createRoot(cuaContainer, {
        identifierPrefix: 'vkmcua',
      })

      const promise = new Promise<CuaResult | null>((resolve) => {
        const onClose = () => {
          resolve(null)
        }

        const onApiRequest = <P, R>(method: string, params: P): Promise<R> => {
          return api.fetch.call(
            api,
            method as keyof IApi.Request,
            params as IApi.Request[keyof IApi.Request]['params'],
          )
        }
        cuaRoot.render(
          <CuaModal
            modalRoot={modalContainer}
            session={data.cua_session}
            onApiRequest={onApiRequest}
            onSuccess={resolve}
            onClose={onClose}
          />,
        )
      })

      promise.then((result) => {
        cuaRoot.unmount()
        return result
      })

      return promise
    }
  }
}

const rendererApi = new RendererApi()

export { rendererApi, request, webLogger, vkDomain, basePath }
