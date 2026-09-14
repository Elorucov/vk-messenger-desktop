/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { DownloaderHelper as ElectronDownloadHelper } from './electronDownloadHelper'
import { DocsDoc } from '@vkontakte-internal/api-schema-typescript'
import { api } from '../../utils/api'
import fs from 'fs'
import path from 'path'
import { commonLogger } from '../logger'

export const DONWLOAD_POSTFIX = '.vkm_download'

const scope = 'downloads manager helper'

/**
 * Ищет файлы с одним размером и названием среди файлов по типу "документ (2).docx"
 */
function searchFile(originalFilePath: string, total: number): string {
  const parsedFile = path.parse(originalFilePath)
  const files = fs.readdirSync(parsedFile.dir)

  for (const file of files) {
    if (file.startsWith(parsedFile.name) && !file.endsWith(DONWLOAD_POSTFIX)) {
      const filePath = path.join(parsedFile.dir, file)
      const fileStat = fs.statSync(filePath)

      if (fileStat.size === total) {
        return filePath
      }
    }
  }
  return originalFilePath
}

export class DownloadHelper extends ElectronDownloadHelper {
  private shouldSumTotal = false

  // переписываем, чтобы поддержать временное название файла
  override __getFilePath(fileName: string): string {
    const currentPath = path.join(
      this.__destFolder,
      fileName + DONWLOAD_POSTFIX,
    )
    let filePath = currentPath

    if (!this.__opts.override && this.state !== this.__states.RESUMED) {
      filePath = this.__uniqFileNameSync(filePath)

      if (currentPath !== filePath) {
        this.emit('renamed', {
          path: filePath,
          fileName: filePath.split(path.sep).pop(),
          prevPath: currentPath,
          prevFileName: currentPath.split(path.sep).pop(),
        })
      }
    }

    return filePath
  }
  // вместо названия из хедеров берем из выполненного запроса
  override __getFileNameFromHeaders(_: unknown, __: unknown): string {
    return this.__fileName
  }

  override start(): Promise<unknown> {
    const startPromise = () =>
      new Promise((resolve, reject) => {
        this.__promise = { resolve, reject }
        this.__start()
      })

    // this will determine the file path from the headers
    // and attempt to get the file size and resume if possible
    if (
      this.__opts.resumeIfFileExists &&
      this.state !== this.__states.RESUMED
    ) {
      return this.getTotalSize().then(({ name, total }) => {
        const override = this.__opts.override
        this.__opts.override = true
        this.__filePath = this.__getFilePath(name)
        const originalFilePath = this.__filePath.replace(DONWLOAD_POSTFIX, '')
        this.__fileName = name
        this.__opts.override = override

        // если существует временный файл
        if (this.__filePath && fs.existsSync(this.__filePath)) {
          if (!total) {
            this.shouldSumTotal = true
          }
          return this.resumeFromFile(this.__filePath, {
            total: total || fs.statSync(this.__filePath).size,
            fileName: name,
          })
        }

        this.__filePath = originalFilePath

        /**
         * Возможно, файл существует с инкрементым постфиксом, нужно проверить это
         */
        try {
          this.__filePath = searchFile(originalFilePath, total)
        } catch (e) {
          commonLogger.error('main', scope, 'searchFile failed', e)
          throw e
        }

        /**
         * если существует итоговый файл, значит пытаемся либо скачать текущий файл заново,
         * либо файл с таким же названием
         */
        if (this.__filePath && fs.existsSync(this.__filePath)) {
          const fileSize = this.__getFilesizeInBytes(this.__filePath)
          /**
           * пропускаем файлы, которые имеют одно название и разный вес
           */
          if (total > 0 && fileSize === total) {
            return new Promise((resolve, reject) => {
              this.__promise = { resolve, reject }
              this.__setState(this.__states.FINISHED)
              this.__pipes = []
              this.emit('end', {
                fileName: this.__fileName,
                filePath: this.__filePath,
                totalSize: total,
                incomplete: false,
                onDiskSize: fileSize,
                downloadedSize: fileSize,
              })
              return resolve(fileSize === total)
            })
          }
        }

        // иначе начинаем новую загрузку
        return startPromise()
      })
    }
    return startPromise()
  }

  // переписываем, чтобы сохранить логику
  // дефолтное не работает, потому что у нас HEAD не возвращает размер и имя файла
  override getTotalSize(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        if (this.__opts.size) {
          return resolve({
            name: this.__opts.fallbackFileName,
            total: this.__opts.size,
          })
        }

        const docId = new URL(this.url).pathname.replace('/doc', '')
        api
          .fetch(
            'docs.getById',
            {
              docs: docId,
            },
            { retries: 3 },
          )
          .then((docs: DocsDoc[]) => {
            const fileName = docs?.[0]?.title
            if (!fileName) {
              resolve({
                name: this.__opts.fallbackFileName,
                total: 0,
              })
            } else {
              resolve({
                name: fileName,
                total: docs?.[0]?.size,
              })
            }
          })
      } catch (error) {
        return reject(new Error(`docs.getById failed`))
      }
    })
  }

  override __startDownload(
    response: unknown,
    resolve: unknown,
    reject: unknown,
  ): void {
    if (this.shouldSumTotal) {
      this.__total += parseInt(response.headers['content-length']) || 0
    }
    super.__startDownload(response, resolve, reject)
  }
}
