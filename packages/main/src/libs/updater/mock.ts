import { app } from 'electron'
import {
  AppUpdater,
  CancellationToken,
  ProgressInfo,
  UpdateCheckResult,
  UpdateInfo,
} from 'electron-updater'

const listeners: Record<string, any[]> = {
  'update-available': [], //
  'download-progress': [],
  'update-cancelled': [], //
  'update-downloaded': [],
  'update-not-available': [], //
  login: [],
  'checking-for-update': [], //
  error: [],
}

const fileSize = 128000

const versionNumbers = app.getVersion().split('.')
versionNumbers[2] = String(Number(versionNumbers[2]) + 1)

const fakeUpdate = {
  updateInfo: {
    releaseNotes: 'releaseNotes',
    files: [{ size: fileSize }],
    version: versionNumbers.join('.'),
  } as UpdateInfo,
  versionInfo: {} as UpdateInfo,
} as UpdateCheckResult

const isUpdateEnabled = false
const updateMock = isUpdateEnabled ? fakeUpdate : null

const TIMEOUT = 2500

let cancelToken: CancellationToken | null = null
let downloaded = 0
let downloaderTimeout: ReturnType<typeof setTimeout>

const continueFakeDownload = () => {
  listeners?.['download-progress']?.forEach((fn) => {
    fn({
      percent: Math.ceil((downloaded / fileSize) * 100),
      total: fileSize,
    } as ProgressInfo)
  })

  downloaderTimeout = setTimeout(() => {
    if (downloaded >= fileSize) {
      listeners?.['update-downloaded']?.forEach((fn) => {
        fn(updateMock?.updateInfo)
      })
    } else {
      downloaded = Math.min(downloaded + 10000, fileSize)
      continueFakeDownload()
    }
  }, 1000)
}
export const mockUpdater = {
  on(event, listener) {
    listeners[event]?.push(listener)
    return this
  },
  downloadUpdate(cancellationToken: CancellationToken): Promise<string[]> {
    cancelToken = cancellationToken
    cancelToken.addListener('cancel', () => {
      listeners?.['update-cancelled']?.forEach((fn) => {
        fn(updateMock?.updateInfo)
        cancelToken = null
        downloaded = 0
        clearTimeout(downloaderTimeout)
      })
    })
    continueFakeDownload()
    return Promise.resolve([])
  },
  quitAndInstall(_isSilent?: boolean, _isForceRunAfter?: boolean): void {},
  checkForUpdates(): Promise<UpdateCheckResult | null> {
    listeners?.['checking-for-update']?.forEach((fn) => {
      fn()
    })

    return new Promise((resolve) => {
      setTimeout(() => {
        if (updateMock === null) {
          listeners?.['update-not-available']?.forEach((fn) => {
            fn(null)
          })
        } else {
          listeners?.['update-available']?.forEach((fn) => {
            fn(updateMock.updateInfo)
          })
        }

        resolve(updateMock)
      }, TIMEOUT)
    })
  },
  setFeedURL: (_) => {},
  autoDownload: true,
  autoInstallOnAppQuit: false,
  requestHeaders: {},
} as Pick<
  AppUpdater,
  | 'on'
  | 'downloadUpdate'
  | 'quitAndInstall'
  | 'checkForUpdates'
  | 'setFeedURL'
  | 'autoDownload'
  | 'autoInstallOnAppQuit'
  | 'requestHeaders'
>
