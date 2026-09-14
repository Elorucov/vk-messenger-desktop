import { app, shell } from 'electron'
import { URL } from 'url'
import {
  isHTMLPath,
  getWindow,
  isDev,
  isWindows,
  shouldDownloadFile,
  reloadPage,
} from './utils'
import { getDomain } from 'tldts'
import { downloadFile } from './libs/FileDownloader'
import { ElectronFeatures } from 'vkme-common'
import { commonLogger } from './libs/logger'
import { MediaWindow, openMediaWindow } from './mediaWindow'

type Permission =
  | 'clipboard-read'
  | 'clipboard-sanitized-write'
  | 'media'
  | 'display-capture'
  | 'mediaKeySystem'
  | 'geolocation'
  | 'notifications'
  | 'midi'
  | 'midiSysex'
  | 'pointerLock'
  | 'fullscreen'
  | 'openExternal'
  | 'localStorage'
  | 'screen-wake-lock'
  | 'window-placement'
  | 'unknown'
const ALLOWED_APP_PERMISSION: Permission[] = [
  'media',
  'fullscreen',
  'clipboard-sanitized-write',
  'screen-wake-lock',
]

const ALLOWED_MEDIA_WINDOW_PERMISSION: Permission[] = [
  'fullscreen',
  'screen-wake-lock',
]

const scope = 'security restrictions'

/**
 * A list of hostnames that you allow open INSIDE the application and permissions for them.
 *
 * In development mode you need allow open `VITE_DEV_SERVER_URL`.
 */
const ALLOWED_DOMAINS_AND_PERMISSIONS = new Map<string, Set<Permission>>([
  [
    getDomain('https://vk.com') as string,
    new Set(['openExternal', 'notifications']),
  ],
  [
    getDomain('https://vk.ru') as string,
    new Set(['openExternal', 'notifications']),
  ],
  [
    getDomain('https://vk.me') as string,
    new Set(['openExternal', 'notifications']),
  ],
  [
    getDomain('https://vk.cc') as string,
    new Set(['openExternal', 'notifications']),
  ],
  [getDomain('https://userapi.com') as string, new Set(['openExternal'])],
  [getDomain('https://sferum.ru') as string, new Set(['openExternal'])],
  [getDomain('https://sys.mail.ru') as string, new Set(['openExternal'])],
  [
    getDomain('https://calendar.google.com') as string,
    new Set(['openExternal']),
  ],
  [
    getDomain('https://editboard.team/sferum/create/') as string,
    new Set(['openExternal']),
  ],
  ...(isDev
    ? [
        [
          getDomain('http://localhost') as string,
          new Set<Permission>([
            'media',
            'screen-wake-lock',
            'clipboard-sanitized-write',
            'fullscreen',
          ]),
        ] as const,
        [
          getDomain('http://localhost:8080') as string,
          new Set<Permission>([
            'media',
            'screen-wake-lock',
            'clipboard-sanitized-write',
            'fullscreen',
          ]),
        ] as const,
      ]
    : []),
])
/**
 * A list of hostnames that you allow open IN BROWSER.
 * Navigation to the hostnames below is only possible if the link opens in a new window.
 *
 * @example
 * <a
 *   target="_blank"
 *   href="https://github.com/"
 * >
 */
const ALLOWED_EXTERNAL_DOMAINS = new Set<string>(
  ALLOWED_DOMAINS_AND_PERMISSIONS.keys(),
)

const NEW_WINDOW_PREFIX = isDev ? 'http://localhost:8080/#/' : 'file:///#/'

app.on('web-contents-created', (_, contents) => {
  /**
   * Block navigation to hostnames not on the allowlist.
   *
   * Navigation exploits are quite common. If an attacker can convince the app to navigate away from its current page,
   * they can possibly force the app to open arbitrary web resources/websites on the web.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
   */
  contents.on('will-navigate', (event, url) => {
    const { hostname, protocol, pathname } = new URL(url)
    const domain = getDomain(hostname)

    if (domain && ALLOWED_DOMAINS_AND_PERMISSIONS.has(domain)) {
      if (!!ALLOWED_DOMAINS_AND_PERMISSIONS.get(domain)?.has('openExternal')) {
        event.preventDefault()
        if (shouldDownloadFile(url)) {
          downloadFile(url)
        } else {
          // Open url in default browser.
          shell.openExternal(url).catch((error) => {
            commonLogger.error('main', scope, error)
          })
        }
      }
      return
    }

    if (isHTMLPath(url, 'media.html')) {
      return
    }

    if (protocol === 'file:' && !domain) {
      event.preventDefault()

      // разрешаем location.reload()
      if (pathname === '/') {
        reloadPage()
        return
      }

      const mainWindow = getWindow()
      if (isWindows) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, __, ...pathnames] = pathname.split('/') // [epmty space, disk name, ...way to go]

        mainWindow?.webContents?.send(
          ElectronFeatures.LINK_INNER,
          `/${pathnames.join('/')}`,
        )
      } else {
        mainWindow?.webContents?.send(ElectronFeatures.LINK_INNER, pathname)
      }

      return
    }

    if (import.meta.env.DEV && hostname === 'localhost') {
    } else {
      // Prevent navigation
      event.preventDefault()

      commonLogger.warn(
        'main',
        scope,
        `Blocked navigating to disallowed hostname: ${hostname}`,
      )
    }
  })

  /**
   * Block requests for disallowed permissions.
   * By default, Electron will automatically approve all permission requests.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content
   */
  contents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const { hostname, protocol, href } = new URL(webContents.getURL())
      const domain = getDomain(hostname) as string

      if (
        protocol === 'file:' &&
        ALLOWED_APP_PERMISSION.includes(permission as Permission)
      ) {
        return callback(true)
      }

      if (
        isHTMLPath(href, 'media.html') &&
        ALLOWED_MEDIA_WINDOW_PERMISSION.includes(permission as Permission)
      ) {
        return callback(true)
      }

      const permissionGranted = !!ALLOWED_DOMAINS_AND_PERMISSIONS.get(
        domain,
      )?.has(permission as Permission)
      callback(permissionGranted)

      if (!permissionGranted) {
        commonLogger.warn(
          'main',
          scope,
          `${hostname} requested permission for '${permission}', but was rejected.`,
        )
      }
    },
  )

  /**
   * Hyperlinks leading to allowed sites are opened in the default browser.
   *
   * The creation of new `webContents` is a common attack vector. Attackers attempt to convince the app to create new windows,
   * frames, or other renderer processes with more privileges than they had before; or with pages opened that they couldn't open before.
   * You should deny any unexpected window creation.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
   * @see https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-openexternal-with-untrusted-content
   */
  contents.setWindowOpenHandler(({ url, referrer, frameName }) => {
    const { hostname, protocol, pathname } = new URL(url)
    const domain = getDomain(hostname)

    // обработка cmd+click на ссылках, которые можно открыть внутри
    if (url.startsWith(NEW_WINDOW_PREFIX)) {
      contents.send(
        ElectronFeatures.LINK_INNER,
        url.replace(NEW_WINDOW_PREFIX, '/'),
      )
      return { action: 'deny' }
    }

    /**
     * Открытие окна галереи
     */
    if (isHTMLPath(url, 'media.html')) {
      return openMediaWindow()
    }

    // TODO удалить, вероятно, не используется
    if (protocol === 'file:' && !domain) {
      if (!isWindows) {
        shell.openExternal(`https://vk.com${pathname}`).catch((error) => {
          commonLogger.error('main', scope, error)
        })
      } else {
        const [, , ...pathnames] = pathname.split('/') // [epmty space, disk name, ...way to go]
        shell
          .openExternal(`https://vk.com/${pathnames.join('/')}`)
          .catch((error) => {
            commonLogger.error('main', scope, error)
          })
      }
      return { action: 'deny' }
    }

    if (protocol === 'mailto:') {
      shell.openExternal(url).catch((error) => {
        commonLogger.error('main', scope, error)
      })
      return { action: 'deny' }
    }

    if (domain && ALLOWED_EXTERNAL_DOMAINS.has(domain)) {
      if (shouldDownloadFile(url)) {
        if (isHTMLPath(contents.getURL(), 'media.html') && MediaWindow.window) {
          downloadFile(url, undefined, { windowId: MediaWindow.window.id })
        } else {
          downloadFile(url)
        }
      } else {
        // Open url in default browser.
        shell.openExternal(url).catch((error) => {
          commonLogger.error('main', scope, error)
        })
        return { action: 'deny' }
      }
    }

    if (
      referrer.url.startsWith('https://www.youtube.com/') ||
      frameName === 'YouTube'
    ) {
      commonLogger.debug('main', scope, 'youtube handler')
      shell.openExternal(url).catch((error) => {
        commonLogger.error('main', scope, error)
      })

      return {
        action: 'deny',
      }
    }
    // Prevent creating a new window.
    commonLogger.debug('main', scope, 'new window denied')
    return { action: 'deny' }
  })

  /**
   * Verify webview options before creation.
   *
   * Strip away preload scripts, disable Node.js integration, and ensure hostnames are on the allowlist.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
   */
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    if (!params.src) {
      return
    }
    const { hostname } = new URL(params.src)
    const domain = getDomain(hostname)

    if (domain && !ALLOWED_DOMAINS_AND_PERMISSIONS.has(domain)) {
      commonLogger.error(
        'main',
        scope,
        `A webview tried to attach ${params.src}, but was blocked.`,
      )

      event.preventDefault()
      return
    }

    // Strip away preload scripts if unused or verify their location is legitimate.
    delete webPreferences.preload
    // @ts-expect-error `preloadURL` exists. - @see https://www.electronjs.org/docs/latest/api/web-contents#event-will-attach-webview
    delete webPreferences.preloadURL

    // Disable Node.js integration
    webPreferences.nodeIntegration = false

    // Enable contextIsolation
    webPreferences.contextIsolation = true
  })
})
