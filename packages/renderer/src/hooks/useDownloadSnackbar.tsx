import React, { useEffect } from 'react'
import { useSnackbar, IOverrideILang } from '@vkontakte-internal/messenger'
import { Loader } from '@vkontakte-internal/messenger/dist/browser/ui/Loader/Loader'
import { Button } from '@vkontakte/vkui'
import '../components/DownloadedFileSnackbar/DownloadedFileSnackbar.css'
import {
  SnackbarId,
  snackbarStore,
} from '@vkontakte-internal/messenger/dist/data/store/snackbarStore'
import { DSnackbarOptions } from 'vkme-common'
import {
  Icon28CheckCircleOutline,
  Icon28ErrorCircleOutline,
} from '@vkontakte/icons'
import { formatFileSize } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import { DownloadedFileSnackbarContent } from '../components/DownloadedFileSnackbar/DownloadedFileSnackbar'
import { commonLogger } from '../libs/logger'
import { useLang } from './useLang'

const scope = 'useDownloadSnackbar'

const getBefore = (options: DSnackbarOptions) => {
  switch (options.type) {
    case 'update':
      if (options.totalSize === undefined || options.downloaded === undefined) {
        // спиннер
        return <Loader size="small" progress={0} />
      }
      const percent = (options.downloaded / options.totalSize) * 100
      return (
        <Loader size="small" progress={percent}>
          <></>
        </Loader>
      )
    case 'initial':
      return (
        // Обманываем Loader, чтобы он не показывал спиннер, при 0 прогрессе
        <Loader size="small" progress={0}>
          <></>
        </Loader>
      )
    case 'success':
      return (
        <Icon28CheckCircleOutline
          style={{ color: 'var(--vkui--color_icon_positive)' }}
        />
      )
    case 'error':
    case 'errorDirectory':
      return (
        <Icon28ErrorCircleOutline
          style={{ color: 'var(--vkui--color_icon_negative)' }}
        />
      )
    default: {
      return null
    }
  }
}

const getMessage = (options: DSnackbarOptions, lang: IOverrideILang) => {
  switch (options.type) {
    case 'update': {
      const title =
        options?.count && options?.count > 1
          ? lang
              .use('me_attaches_docs', {
                num: options.count,
              })
              .toLowerCase()
          : options.fileName

      const size = [formatFileSize(options.downloaded)]

      if (Number(options.totalSize) > 0) {
        size.push(formatFileSize(options.totalSize))
      }

      return (
        <DownloadedFileSnackbarContent
          title={title}
          message={lang.use('me_download_downloaded_multiple')}
          size={size.join(' / ')}
        />
      )
    }

    case 'error': {
      return (
        <DownloadedFileSnackbarContent
          title={options.fileName}
          message={lang.use('me_download_failed')}
          mode="destructive"
        />
      )
    }

    case 'initial':
      return (
        <DownloadedFileSnackbarContent
          title={options.fileName}
          message={lang.use('me_download_waiting')}
        />
      )

    case 'success':
      return (
        <DownloadedFileSnackbarContent
          title={options.fileName}
          message={lang.use('me_download_downloaded')}
        />
      )
    case 'errorDirectory':
      return (
        <DownloadedFileSnackbarContent
          title={options.fileName}
          message={lang.use('me_download_error_invalid_dir')}
        />
      )

    default: {
      return null
    }
  }
}

const getAfter = (options: DSnackbarOptions, lang: IOverrideILang) => {
  switch (options.type) {
    case 'errorDirectory':
    case 'update':
    case 'initial':
      return (
        <Button
          appearance="accent-invariable"
          mode="tertiary"
          size="m"
          onClick={() => {
            snackbarStore.close(options.id as SnackbarId)
            window?._downloader?.cancel(options.id)
          }}
        >
          {lang.use('me_download_cancel')}
        </Button>
      )

    case 'success':
      return (
        <Button
          appearance="accent-invariable"
          mode="tertiary"
          size="m"
          onClick={() => {
            window._downloader.openByPath(options?.filePath || options.id)
            snackbarStore.close(options.id as SnackbarId)
          }}
        >
          {lang.use('me_download_open')}
        </Button>
      )
    case 'error':
      return (
        <Button
          appearance="accent-invariable"
          mode="tertiary"
          size="m"
          onClick={() => {
            snackbarStore.close(options.id as SnackbarId)
          }}
          href={options.id}
        >
          {lang.use('me_download_restart')}
        </Button>
      )

    default: {
      return null
    }
  }
}
export const useDownloadSnackbar = (): void => {
  const snackbar = useSnackbar()
  const lang = useLang()

  useEffect(() => {
    window._downloader?.updateSnackbar((options) => {
      if (options.type === 'close') {
        snackbar.close(options.id as SnackbarId)
        return
      }

      const snackbarOptions: Parameters<typeof snackbar>[0] = {
        id: options.id,
        className: 'file_downloaded_snackbar',
        autoClose: ['error', 'success', 'errorDirectory'].includes(
          options.type,
        ),
        before: getBefore(options),
        message: getMessage(options, lang),
        after: getAfter(options, lang),
        duration: ['error', 'success, errorDirectory'].includes(options.type)
          ? 6000
          : 4000,
      }

      if (options.withPriority) {
        snackbarOptions.priority = 1
      }

      if (
        options.type === 'update' ||
        (options.type === 'success' && options.id.startsWith('common'))
      ) {
        snackbar.update(options.id as SnackbarId, snackbarOptions)
      } else {
        snackbar(snackbarOptions)
      }
    })
    window._downloader?.getFilePreview((url) => {
      // Мы не можем напрямую найти название файла, но может найти его в DOM
      const docAttachElement: HTMLHeadingElement | null =
        document.querySelector(`a[href="${url}"]`)

      if (!docAttachElement) {
        commonLogger.error(
          'renderer',
          scope,
          'File downloading failed, Attach not found',
        )
        return
      }

      let fileName = ''

      const textElements = docAttachElement.querySelectorAll('h4,img')

      textElements.forEach((element) => {
        if (element.tagName === 'IMG') {
          fileName = (element as HTMLImageElement)?.alt
        } else {
          fileName = (element as HTMLHeadingElement)?.innerText
        }
      })

      if (Boolean(fileName?.length)) {
        window?._downloader?.updatePreview(url, fileName)
      } else {
        commonLogger.error(
          'renderer',
          scope,
          `File downloading failed, empty fileName (trying ${url})`,
        )
        window?._downloader?.updatePreview(url, 'Без названия')
      }
    })

    window._downloader.downloadBlob(async (url, fileName) => {
      const res = await fetch(url)
      const blob = await res.blob()
      const buffer = await blob.arrayBuffer()
      window._downloader.downloadAsFile(buffer, blob.type, fileName)
    })
  }, [snackbar, lang])
}
