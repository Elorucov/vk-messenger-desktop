import path from 'path'
import os from 'os'
import fs, { constants } from 'fs'
import { ipcMain, shell, app, dialog, BrowserWindow } from 'electron'
import { PowerShell } from 'node-powershell'
import { getWindow, isMac, isMas, isWindows, quarantine } from '../../utils'
import {
  DownloadEndedStats,
  DownloadInfoStats,
  ErrorStats,
  Stats,
} from 'node-downloader-helper'
import { DocsDoc } from '@vkontakte-internal/api-schema-typescript'
import { DSnackbarOptions, FileDownloadingChannel } from 'vkme-common'
import { USER_AGENT } from '../../globals'
import { downloadsStore } from '../../storage/downloads.store'
import mime from 'mime-types'
import { DONWLOAD_POSTFIX, DownloadHelper } from './downloadHelper'
import { commonLogger } from '../logger'
import { userSettingsStore } from '../../storage/user-settings.store'
import { translationsStore } from '../../storage/translationsStore'
import { langUse } from '../translations/utils'

const scope = 'downloads manager'

type FFile = {
  filePath: string
  instance: DownloadHelper
  fileName: string
  totalSize: number
  downloaded: number
  snackbarId: string
  windowId: number | null
}

export type Options = {
  showDialog?: boolean
  windowId?: number
}

const TIMEOUT = 5000

export const getDefaultDownloadLocation = (): string => {
  if (isMas) {
    return app.getPath('downloads')
  }

  if (process.platform === 'linux' && process.env.XDG_DOWNLOAD_DIR) {
    return process.env.XDG_DOWNLOAD_DIR
  }

  return path.join(os.homedir(), 'Downloads')
}

export class DownloadsManager {
  private failed: Map<string, FFile>
  private willDownloadURLs: Map<string, FFile>
  private queue: Map<string, FFile>
  private commonSnackbarId: string | null = null

  constructor() {
    this.willDownloadURLs = new Map()
    this.queue = new Map()
    this.failed = new Map()
    this.init()
  }

  private init = () => {
    ipcMain.handle(FileDownloadingChannel.CANCEL_DOWNLOAD, (_, url) => {
      this.onCancel(url)
    })
    ipcMain.handle(
      FileDownloadingChannel.UPDATE_PREVIEW,
      (_, url, fileName) => {
        this.handleNewDownload(url, fileName)
      },
    )
    ipcMain.handle(FileDownloadingChannel.OPEN_BY_PATH, (_, path) => {
      this.openByPath(path)
    })
    ipcMain.handle(
      FileDownloadingChannel.DOWNLOAD_AS_FILE,
      (_, data: ArrayBuffer | string, mimeType: string, fileName?: string) => {
        if (typeof data === 'string') {
          this.saveToFile(data, mime.extension(mimeType) || undefined, fileName)
          return
        }
        this.handleData(data, fileName, mimeType)
      },
    )
    ipcMain.handle(
      FileDownloadingChannel.DOWNLOAD_ATTACH,
      async (_, doc: DocsDoc) => {
        if (!doc.url) {
          commonLogger.debug(
            'main',
            scope,
            'download attach error. doc.url does not exist',
          )
          throw new Error('download attach error. doc.url does not exist')
        } else {
          const options: Options = {}
          try {
            await this.getDownloadLocation(false)
          } catch (err) {
            options.showDialog = true
          }
          this.handleNewDownload(doc.url, doc.title, doc.size, options)
        }
      },
    )
  }

  public handleBlob = (url: string, fileName?: string): void => {
    const mainWindow = getWindow()
    mainWindow?.webContents.send(
      FileDownloadingChannel.DOWNLOAD_BLOB,
      url,
      fileName,
    )
  }

  public handleData = (
    data: string | ArrayBuffer,
    fileName?: string,
    mimeTypeOrExtension?: string,
  ): void => {
    if (typeof data === 'object') {
      const uint8Array = new Uint8Array(data)
      const extension =
        mime.extension(mimeTypeOrExtension || '') || mimeTypeOrExtension

      this.saveToFile(uint8Array, extension, fileName)
      return
    }

    const arr = (data as string).split(',')
    const mimeFromData = arr?.[0]?.match(/:(.*?);/)?.[1]
    const extension = mime.extension(mimeFromData || '')

    if (extension === 'ics') {
      const decodedData = decodeURIComponent(
        (arr[1] as string).replace('data ', ''),
      )
      this.saveToFile(decodedData, extension, fileName)
      return
    }
    const bstr = atob(arr[1] as string)
    let length = bstr.length
    const uint8Array = new Uint8Array(length)
    while (length--) {
      uint8Array[length] = bstr.charCodeAt(length)
    }

    this.saveToFile(uint8Array, mimeTypeOrExtension, fileName)
  }

  private openByPath = (pathOrUrl: string): boolean => {
    let path = pathOrUrl
    if (pathOrUrl.startsWith('http')) {
      path = downloadsStore.get(pathOrUrl)?.filePath
      if (!path) {
        return false
      }
    }

    if (fs.existsSync(path)) {
      shell.showItemInFolder(path)
      return true
    }
    // файл не существует
    path !== pathOrUrl && downloadsStore.delete(path)

    return false
  }

  public handleNewDownload = async (
    url: string,
    _fileName?: string,
    size?: number,
    options?: Options,
  ): Promise<void> => {
    let fileName = _fileName
    const failed = this.failed.get(url)

    if (failed) {
      if (fs.existsSync(failed.filePath)) {
        failed.instance.resume()
        return
      } else {
        // файла нет, нечего продолжать. начинаем новую скачку
        this.failed.delete(url)
      }
    }

    if (this.queue.has(url) || this.willDownloadURLs.has(url)) {
      commonLogger.debug('main', scope, 'handleNewDownload already called')
      return
    }
    // если уже скачан, проверить на наличие и открыть в проводнике
    if (this.openByPath(url)) {
      return
    }

    if (!fileName) {
      try {
        const maybeFilename = path.basename(new URL(url).pathname)
        const mimeType = mime.lookup(maybeFilename)

        if (mimeType === false) {
          throw Error('Mime not found')
        }

        fileName = maybeFilename
      } catch (event) {
        commonLogger.debug('main', scope, event)

        const mainWindow = getWindow()
        mainWindow?.webContents.send(
          FileDownloadingChannel.GET_FILE_PREVIEW,
          url,
        )

        return
      }
    }

    const downloadLocation = await this.getDownloadLocation()
    const windowId = options?.windowId || null
    const window = windowId ? BrowserWindow.fromId(windowId) : getWindow()

    if (options?.showDialog && window) {
      const { filePath, canceled } = await dialog.showSaveDialog(window, {
        defaultPath: path.join(downloadLocation, fileName),
      })

      if (canceled || !filePath) {
        return
      }

      fileName = path.basename(filePath)
    }

    try {
      const instance = new DownloadHelper(url, downloadLocation, {
        headers: {
          // хук onBeforeSendHeaders дописывает заголовок User-Agent (с заглавными буквами)
          // обратите внимание, что в результате уйдет запрос с двумя хередрами User-Agent и user-agent.
          // Это должно быть исправлено на уровне бэка:
          //   - Трансляции ожидают заголовок вида "Chrome VKDesktop/$version"
          //   - При скачивании документов происходит редирект если заголовок "VKDesktopMessenger/$version"
          'user-agent': USER_AGENT,
        },
        // необходимо явно засеттить таймауты, чтобы при отстутствии сети вылетало событие
        requestOptions: { timeout: TIMEOUT },
        resumeIfFileExists: true,
        removeOnFail: false,
        removeOnStop: false,
        fallbackFileName: fileName,
        size,
      })

      this.queue.set(url, {
        filePath: downloadLocation,
        instance: instance,
        fileName,
        downloaded: 0,
        totalSize: size || 0,
        snackbarId: url,
        windowId,
      })

      instance.start().catch((error) => this.onError(url, error))
      this.sendSnackbar(
        {
          id: url,
          fileName,
          type: 'initial',
        },
        windowId,
      )
      instance.on('download', (stats) => this.onDownload(url, stats))
      instance.on('timeout', () => this.onError(url, new Error('timeout')))

      instance.on('end', (stats) => this.onEnd(url, stats))

      instance.on('error', (error) => this.onError(url, error))
      instance.on('progress.throttled', (stats) => this.onProgress(url, stats))
    } catch (error) {
      commonLogger.error('main', scope, 'onError', error)
      this.sendSnackbar({
        id: url,
        type: 'error',
        fileName: fileName,
        totalSize: 0,
        downloaded: 0,
      })
    }
  }

  private sendSnackbar = (
    options: DSnackbarOptions,
    windowId?: FFile['windowId'],
  ): void => {
    const window = windowId ? BrowserWindow.fromId(windowId) : getWindow()
    window?.webContents.send(FileDownloadingChannel.ON_UPDATE, options)
  }

  private onError = (
    url: string,
    error: ErrorStats,
    removeFromFailed?: boolean,
  ): void => {
    commonLogger.error('main', scope, 'onError', error)

    const queueItem = this.queue.get(url)
    const downloadsItem = this.willDownloadURLs.get(url)
    const failedItem = this.failed.get(url)
    const file = queueItem || downloadsItem || failedItem

    if (file) {
      if (!failedItem && !removeFromFailed) {
        this.failed.set(url, { ...file, snackbarId: url })
      }
      this.sendSnackbar(
        {
          id: url,
          type: 'error',
          fileName: file.fileName,
          totalSize: removeFromFailed ? 0 : (file.totalSize as number),
          downloaded: removeFromFailed ? 0 : file.downloaded,
        },
        file.windowId,
      )

      if (queueItem) {
        this.queue.delete(url)
        this.sendSnackbar(
          {
            id: queueItem.snackbarId,
            type: 'close',
          },
          queueItem.windowId,
        )
      }
      if (downloadsItem) {
        this.willDownloadURLs.delete(url)
        if (this.commonSnackbarId && this.willDownloadURLs.size === 0) {
          this.sendSnackbar(
            {
              id: this.commonSnackbarId,
              type: 'close',
            },
            downloadsItem.windowId,
          )
          this.commonSnackbarId = null
          const mainWindow = getWindow()
          mainWindow?.setProgressBar(-1, { mode: 'error' })
        }
      }
    }
  }

  private onDownload = (url: string, stats: DownloadInfoStats): void => {
    const failed = this.failed.get(url)
    if (failed) {
      this.sendSnackbar(
        {
          id: failed.snackbarId,
          type: 'close',
        },
        failed.windowId,
      )
      // кейс, где восстанавливаются загрузки при отсутствии common снекбара
      if (this.willDownloadURLs.size === 0) {
        // failed.snackbarId = `common-${uuidv4()}`
        this.sendSnackbar(
          {
            id: failed.snackbarId,
            fileName: failed.fileName,
            type: 'initial',
          },
          failed.windowId,
        )
      }

      this.willDownloadURLs.set(url, failed)
      this.failed.delete(url)
    }

    const queueItem = this.queue.get(url)
    const item = failed || queueItem

    if (!item) {
      return
    }

    if (!failed) {
      this.queue.delete(url)
    }

    if (!this.commonSnackbarId) {
      this.commonSnackbarId = item.snackbarId
      // и сразу в этом же месте показываем процесс загрузки
      this.sendSnackbar(
        {
          id: this.commonSnackbarId,
          type: 'update',
          fileName: item.fileName,
          totalSize: stats.totalSize as number,
          downloaded: stats.downloadedSize,
          withPriority: true,
        },
        item.windowId,
      )
    } else {
      // удаляем initial снэкбар, ведь common обновится сам на onProgress
      this.sendSnackbar(
        {
          id: item.snackbarId,
          type: 'close',
        },
        item.windowId,
      )
    }
    this.willDownloadURLs.set(url, {
      filePath: stats.filePath,
      instance: item.instance,
      fileName: item.fileName,
      downloaded: stats.downloadedSize,
      // гарантировано сервер отдаст размер файла
      totalSize: stats.totalSize as number,
      snackbarId: this.commonSnackbarId,
      windowId: item.windowId,
    })
  }

  private onEnd = async (
    url: string,
    stats: DownloadEndedStats,
  ): Promise<void> => {
    let pathInDest = stats.filePath

    const queueItem = this.queue.get(url)
    const item = queueItem || this.willDownloadURLs.get(url)
    if (!item) {
      return
    }

    try {
      if (fs.existsSync(pathInDest) && pathInDest.endsWith(DONWLOAD_POSTFIX)) {
        const clearPath = pathInDest.replace(DONWLOAD_POSTFIX, '')
        const file = path.parse(clearPath)
        const newPathInDest = await this.getFilePath(
          file.ext.slice(1),
          file.name,
        )
        fs.renameSync(pathInDest, newPathInDest)
        pathInDest = newPathInDest
      }
    } catch (e) {
      commonLogger.error('main', scope, 'onEnd renaming failed')
      throw e
    }

    ;(queueItem ? this.queue : this.willDownloadURLs).delete(url)

    if (isMac) {
      quarantine(pathInDest)
    }

    if (isWindows) {
      PowerShell.$`Set-Content -Path '${pathInDest}' -Stream Zone.Identifier -Value '[ZoneTransfer]','ZoneId=3'`.catch(
        (error) =>
          commonLogger.error(
            'main',
            scope,
            'onEnd > PowerShell > error',
            error,
          ),
      )
    }
    if (this.willDownloadURLs.size === 0) {
      this.sendSnackbar(
        {
          id: (this.commonSnackbarId as string) || item.snackbarId,
          type: 'close',
        },
        item.windowId,
      )
      this.sendSnackbar(
        {
          id: (this.commonSnackbarId as string) || item.snackbarId,
          type: 'success',
          fileName: item.fileName,
          filePath: url,
        },
        item.windowId,
      )
      this.commonSnackbarId = null
      const mainWindow = getWindow()
      mainWindow?.setProgressBar(-1)
    }

    downloadsStore.set(url, {
      size: stats.totalSize,
      fileName: item?.fileName,
      filePath: pathInDest,
    })
  }

  private onProgress = async (url: string, stats: Stats): Promise<void> => {
    const item = this.willDownloadURLs.get(url)
    if (!item) {
      return
    }

    // если файл уже скачался, то просто отменяет обработку этого ивента
    // фикс для https://jira.mvk.com/browse/ME-55812
    if (stats.total === stats.downloaded) {
      return
    }

    if (stats.downloaded > 0 && !fs.existsSync(item.filePath)) {
      await item.instance.stop()
      this.onError(url, { message: 'File has been removed' }, true)
      return
    }

    this.willDownloadURLs.set(url, {
      ...item,
      downloaded: stats.downloaded,
    })

    const [downloaded, totalSize] = this.getProgress()
    // Logger.debug(downloaded, totalSize)
    this.sendSnackbar(
      {
        // гарантировано существует, поскольку onProgress существует только в нем
        id: this.commonSnackbarId as string,
        type: 'update',
        downloaded,
        totalSize,
        fileName: item.fileName,
        count: this.willDownloadURLs.size,
      },
      item.windowId,
    )

    const progress = downloaded / totalSize
    const mainWindow = getWindow()
    mainWindow?.setProgressBar(progress, { mode: 'normal' })
  }

  private getFilePath = async (
    ext: string,
    fileName: string,
  ): Promise<string> => {
    const downloadLocation = await this.getDownloadLocation()
    let name = `${fileName}.${ext}`
    let filePath = path.join(downloadLocation, name)
    let counter = 0
    // инкрементируем, если файл существует
    while (fs.existsSync(filePath)) {
      counter += 1
      name = `${fileName} (${counter}).${ext}`
      filePath = path.join(downloadLocation, name)
    }

    return filePath
  }

  private saveToFile = async (
    data: string | Uint8Array,
    mimeTypeOrExtension: string | undefined,
    _fileName: string = `download_${Date.now()}`,
  ): Promise<void> => {
    let extension = ''
    const defaultExtension = 'txt'
    const extensionFromFilename = _fileName.substring(
      _fileName.lastIndexOf('.') + 1,
    )
    if (mimeTypeOrExtension) {
      extension = mimeTypeOrExtension.includes('/')
        ? mimeTypeOrExtension.substring(
            mimeTypeOrExtension.lastIndexOf('/') + 1,
          )
        : mimeTypeOrExtension
    } else {
      extension = extensionFromFilename
        ? extensionFromFilename
        : defaultExtension
    }
    let fileName = _fileName
    // удаляем расширение, если файл пришел с ним
    if (_fileName.endsWith(`.${extension}`)) {
      fileName = _fileName.substring(0, _fileName.lastIndexOf('.'))
    }

    const filePath = await this.getFilePath(extension, fileName)

    fs.writeFile(filePath, data, {}, (error) => {
      if (error) {
        commonLogger.error(
          'main',
          scope,
          'saveToFile > writeFile > error',
          error,
        )

        this.sendSnackbar({
          id: fileName,
          type: 'error',
          fileName: fileName,
          totalSize: 0,
          downloaded: 0,
        })
      } else {
        this.sendSnackbar({
          id: filePath,
          type: 'success',
          fileName,
        })
      }
    })
  }

  private getProgress = (failed?: boolean): [number, number] => {
    const source = failed ? this.failed : this.willDownloadURLs
    return Array.from(source).reduce(
      (sum, [_, file]) => [sum[0] + file.downloaded, sum[1] + file.totalSize],
      [0, 0] as [number, number],
    )
  }

  private onCancel = async (snackBarId: string): Promise<void> => {
    const file = this.willDownloadURLs.get(snackBarId)
    if (file) {
      if (this.willDownloadURLs.size > 1) {
        this.onCancelAll()
      } else {
        await file?.instance?.stop()
        this.commonSnackbarId = null
        fs.rm(file.instance.getDownloadPath(), (err) => {
          this.willDownloadURLs.delete(snackBarId)
          if (err)
            commonLogger.debug('main', scope, 'unable to delete temp file')
        })
      }
      const mainWindow = getWindow()
      mainWindow?.setProgressBar(-1)
      this.commonSnackbarId = null
      this.willDownloadURLs.clear()
    } else {
      const fileInQueue = this.queue.get(snackBarId)
      if (fileInQueue) {
        fileInQueue.instance.stop()
        this.queue.delete(snackBarId)
      } else {
        commonLogger.debug(
          'main',
          scope,
          'unable to find instance for canceling',
        )
      }
    }
  }

  private onCancelAll = async (): Promise<void> => {
    await Promise.all(
      Array.from(this.willDownloadURLs).map(async (entry) => {
        await entry[1].instance.stop()
        fs.rm(entry[1].instance.getDownloadPath(), (err) => {
          if (err)
            commonLogger.debug(
              'main',
              scope,
              `unable to delete ${entry[1].instance.getDownloadPath()} file`,
            )
        })
      }),
    )
  }

  private setDownloadPath = (location: string): void => {
    app.setPath('downloads', location)
    userSettingsStore.set('downloadLocation', location)
    commonLogger.debug('main', scope, 'Download location changed to', location)
  }

  public selectDownloadDirectory = async (
    location?: string,
  ): Promise<string> => {
    const mainWindow = getWindow()
    commonLogger.debug(
      'main',
      scope,
      'Download selection modal opened',
      location,
    )
    const defaultPath = location || userSettingsStore.get('downloadLocation')

    const translations = await translationsStore.getAfterLoad()
    const result = await dialog.showOpenDialog(mainWindow as BrowserWindow, {
      defaultPath,
      message: langUse(translations, 'me_download_provide_path'),
      properties: [
        'openDirectory',
        'createDirectory',
        'dontAddToRecent',
        'promptToCreate',
      ],
    })

    let newPath = result.filePaths[0]

    if (!newPath) {
      throw new Error('User did not select a folder')
    }
    try {
      await fs.promises.access(newPath, fs.constants.W_OK)
    } catch (err) {
      this.sendSnackbar({
        id: newPath as string,
        type: 'errorDirectory',
        fileName: path.basename(newPath as string), // в тайтле используется имя файла
      })
      newPath = defaultPath
    }
    this.setDownloadPath(newPath)
    return newPath
  }

  private getDownloadLocation = async (
    returnDefault = true,
  ): Promise<string> => {
    let downloadLocation = userSettingsStore.get('downloadLocation')
    try {
      // если все ок, то access вернет undefined, если нет, то кинет ошибку в catch
      await fs.promises.access(
        downloadLocation,
        constants.R_OK | constants.W_OK,
      )
    } catch (e) {
      if (returnDefault) {
        downloadLocation = getDefaultDownloadLocation()
        this.setDownloadPath(downloadLocation)
      } else {
        throw new Error('Cant get download location')
      }
    }
    return downloadLocation
  }
}

export const downloadsManager = new DownloadsManager()
