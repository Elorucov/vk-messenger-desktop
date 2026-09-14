import {
  app,
  BrowserWindow,
  DownloadItem,
  Event,
  WebContentsView,
} from 'electron'
import { downloadFile } from '../libs/FileDownloader'
import { commonLogger } from '../libs/logger'

function headersToMap(headers: Record<string, string | string[]>) {
  return new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  )
}

const onWillDownload = (event: Event, item: DownloadItem) => {
  event.preventDefault()
  const url = item.getURL()
  const fileName = item.getFilename()
  if (url.startsWith('https://vk.com/doc')) {
    downloadFile(url)
  } else {
    downloadFile(url, fileName)
  }
}

export function configureBrowserWindow(
  browserWindow: BrowserWindow | WebContentsView,
): void {
  /**
   * Фильтр CDN: здесь видео, фотки, аплоад и многое другое, что хочет
   * видит своим origin - vk.com
   */
  const filter = {
    urls: [
      '*://*.mycdn.me/*',
      '*://*.vk.com/*',
      '*://*.vkuser.net/*',
      '*://*.okcdn.ru/*',
    ],
  }

  browserWindow.webContents?.session.webRequest.onBeforeSendHeaders(
    filter,
    (details, callback) => {
      if (
        browserWindow instanceof BrowserWindow &&
        browserWindow.isDestroyed()
      ) {
        return
      }

      browserWindow.webContents.session.cookies
        .get({
          url: details.url,
        })
        .then((cookies) => {
          const headers = headersToMap(details.requestHeaders)
          const referer = headers.get('referer')

          const origin = referer?.includes('static.vk.com')
            ? 'https://static.vk.com'
            : //: referer?.includes('id.cs7777.vk.com')
            referer?.includes('id.vk.com')
            ? //? 'https://ngromov.id.cs7777.vk.com'
              //? 'https://lgutenkova.cs7777.vk.com'
              'https://id.vk.com'
            : 'https://vk.com'

          const requestHeaders = {
            ...details.requestHeaders,
            Origin: origin,
            'User-Agent': `Chrome VKDesktop/${app.getVersion()}`,
            'Accept-Language': 'ru,en;q=0.9,it;q=0.8,en-US;q=0.7',
            Cookie: cookies
              ?.map((cookie) => `${cookie.name}=${cookie.value}`)
              .join('; '),
          }
          callback({
            requestHeaders,
          })
        })
        .catch((error) => {
          commonLogger.error('main', 'configure browser window', error)
        })
    },
  )

  /**
   * Session постоянная для наших основных страниц, поэтому прежде чем подписаться,
   * надо сначала отписаться
   */
  typeof browserWindow.webContents?.session?.off == 'function' &&
    browserWindow.webContents?.session?.off('will-download', onWillDownload)
  typeof browserWindow.webContents?.session?.on == 'function' &&
    browserWindow.webContents?.session?.on('will-download', onWillDownload)

  browserWindow.webContents?.session.webRequest.onHeadersReceived(
    (details, callback) => {
      if (details.responseHeaders) {
        const acao = 'access-control-allow-origin'
        const csp = 'content-security-policy'
        const headers = headersToMap(details.responseHeaders)

        const isNotRobotCaptchaDoc = details.url.includes('/not_robot_captcha?')
        const isVkIdRequest = headers.get(acao)?.includes('https://id.vk.com')

        if (isNotRobotCaptchaDoc && headers.has(csp)) {
          /**
           * Удаляем csp для запроса html документа капчи "Я не робот",
           * т.к. невозможно установить уникальное значение для мессенджера
           * (текущее значение - "file://")
           */
          delete details.responseHeaders[csp]
        }

        if (isVkIdRequest) {
          /**
           * Для запросов внутри iframe капчи "Я не робот" модификация хедеров не требуется
           */
          callback({ responseHeaders: details.responseHeaders })
          return
        }

        if (headers.has(acao) || details.resourceType !== 'xhr') {
          /**
           * Если это не XHR запрос и/или присутствует политика безопасности с
           * установленным выше ориджином vk.com - перезаписываем.
           */
          if (headers.get(acao)?.includes('https://vk.com')) {
            /**
             * Избегаем неразберихи с low-upper кейсом написания политики ориджинов
             */
            delete details.responseHeaders[acao]

            callback({
              responseHeaders: {
                ...details.responseHeaders,
                /**
                 * Ставим в качестве origin точный адрес, ввиду ошибки с credentials
                 * https://vk.cc/cjJmss
                 */
                'Access-Control-Allow-Origin': ['http://localhost:8080'],
              },
            })

            return
          }

          if (headers.get(acao)?.includes('https://static.vk.com')) {
            delete details.responseHeaders[acao]

            callback({
              responseHeaders: {
                ...details.responseHeaders,
                'Access-Control-Allow-Origin': ['https://static.vk.com'],
              },
            })

            return
          }

          callback({ responseHeaders: details.responseHeaders })
        } else {
          callback({
            responseHeaders: {
              'Access-Control-Allow-Origin': ['*'],
              ...details.responseHeaders,
            },
          })
        }
      }
    },
  )
}
