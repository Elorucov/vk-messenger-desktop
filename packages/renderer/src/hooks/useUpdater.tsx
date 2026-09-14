import { useSnackbar } from '@vkontakte-internal/messenger'
import React, { useEffect, useState } from 'react'
import {
  CallsEvent,
  CallsWindowToggleEventListener,
  UpdateEvent,
  UpdateState,
  UpdateStatus,
  UpdaterStoreKey,
} from 'vkme-common'
import { useLang } from './useLang'
import { Button, Link, Paragraph } from '@vkontakte/vkui'
import { getUpdateVersion } from '../utils/updater'
import { Icon24DownloadOutline, Icon24RefreshOutline } from '@vkontakte/icons'

type UpdaterReturn = {
  update: UpdateState | null
  cancel: VoidFunction
  start: VoidFunction
  install: VoidFunction
}

type Props = {
  isMasterHook: boolean
}

const updateModal = {
  isActive: false,
}

export const useUpdater = (props?: Props): UpdaterReturn => {
  const [update, setUpdate] = useState<UpdateState | null>(null)
  const snackbar = useSnackbar()
  const lang = useLang()
  const [downloadSnackId, setDownloadSnackId] = useState<ReturnType<
    ReturnType<typeof useSnackbar>
  > | null>(null)
  const [installSnackId, setInstallSnackId] = useState<ReturnType<
    ReturnType<typeof useSnackbar>
  > | null>(null)

  useEffect(() => {
    const settings = window._settings.state
    if (settings.updater.isEnabled) {
      window._updater.checkForUpdates()
    }
  }, [])

  useEffect(() => {
    const updateStore = (event: CustomEvent<UpdateState>) => {
      setUpdate(event.detail)
    }

    window.addEventListener(
      UpdateEvent.UPDATE_RENDERER_STATE,
      updateStore as EventListener,
    )

    return () => {
      window.removeEventListener(
        UpdateEvent.UPDATE_RENDERER_STATE,
        updateStore as EventListener,
      )
    }
  }, [])

  useEffect(() => {
    if (!props?.isMasterHook) {
      return
    }

    const handleToggle: CallsWindowToggleEventListener = (event) => {
      const state = event.detail.state
      const isCallActive = state !== 'none'
      const snackbarContainer =
        window.document.getElementsByClassName('SnackbarContainer')[0]
      if (isCallActive) {
        snackbarContainer?.setAttribute('style', 'bottom: 94px')
      } else {
        snackbarContainer?.removeAttribute('style')
      }
    }

    document.addEventListener(
      CallsEvent.TOGGLE_CALLS_WINDOW_STATE,
      handleToggle as EventListener,
    )

    return () => {
      document.removeEventListener(
        CallsEvent.TOGGLE_CALLS_WINDOW_STATE,
        handleToggle as EventListener,
      )
    }
  }, [props?.isMasterHook])

  useEffect(() => {
    if (!props?.isMasterHook) {
      return
    }

    const showInstallSnack = () => {
      if (installSnackId || updateModal.isActive) return

      if (downloadSnackId) {
        snackbar.close(downloadSnackId)
        setDownloadSnackId(null)
      }

      const id = snackbar({
        message: (
          <SnackBarMessage
            message={lang.use('me_settings_updates_downloaded')}
            link={lang.use('me_settings_updates_install')}
            onClick={() => {
              window._updater.installUpdate()
              snackbar.close(id)
            }}
          />
        ),
        className: 'update_snackbar',
        autoClose: false,
        isManuallyClosable: false,
        after: (
          <Button
            appearance="accent"
            mode="tertiary"
            style={{ minWidth: '30px' }}
            onClick={() => {
              window._updater.installUpdate()
              snackbar.close(id)
            }}
          >
            <Icon24RefreshOutline />
          </Button>
        ),
      })

      setInstallSnackId(id)
    }

    const showDownloadSnack = () => {
      if (!update || downloadSnackId || updateModal.isActive) return

      if (installSnackId) {
        snackbar.close(installSnackId)
        setInstallSnackId(null)
      }

      const id = snackbar({
        message: (
          <SnackBarMessage
            message={lang.use('me_settings_updates_available')}
            updateSize={update[UpdaterStoreKey.UPDATE_SIZE]}
            link={lang.use('me_settings_updates_download')}
            onClick={() => {
              window._updater.downloadUpdate()
              snackbar.close(id)
            }}
          />
        ),
        className: 'update_snackbar',
        autoClose: false,
        isManuallyClosable: false,
        after: (
          <Button
            appearance="accent"
            mode="tertiary"
            style={{ minWidth: '30px' }}
            onClick={() => {
              window._updater.downloadUpdate()
              snackbar.close(id)
            }}
          >
            <Icon24DownloadOutline />
          </Button>
        ),
      })

      setDownloadSnackId(id)
    }

    if (updateModal.isActive) {
      if (downloadSnackId) {
        snackbar.close(downloadSnackId)
        setDownloadSnackId(null)
      }

      if (installSnackId) {
        snackbar.close(installSnackId)
        setInstallSnackId(null)
      }
    } else {
      if (update?.[UpdaterStoreKey.STATUS] === UpdateStatus.UPDATE_DOWNLOADED) {
        showInstallSnack()
      }
      if (
        update?.[UpdaterStoreKey.STATUS] === UpdateStatus.UPDATE_AVAILABLE &&
        Number(update?.[UpdaterStoreKey.UPDATE_SIZE]) > 0
      ) {
        showDownloadSnack()
      }
    }
  }, [
    downloadSnackId,
    installSnackId,
    update,
    snackbar,
    lang,
    props?.isMasterHook,
  ])

  return {
    update,
    start: () => window._updater.downloadUpdate(),
    cancel: () => window._updater.cancelDownload(),
    install: () => window._updater.installUpdate(),
  }
}

type SnackBarProps = {
  message: string
  updateSize?: UpdateState[UpdaterStoreKey.UPDATE_SIZE]
  onClick?: () => void
  link?: string
}

const SnackBarMessage = ({
  message,
  updateSize,
  link,
  onClick,
}: SnackBarProps): JSX.Element => {
  const lang = useLang()
  return (
    <>
      <Paragraph weight="3" Component="div" useAccentWeight>
        {message}
        {updateSize ? getUpdateVersion(lang, undefined, updateSize) : ''}
      </Paragraph>
      {link && onClick ? (
        <Paragraph>
          <Link onClick={onClick} href="#">
            {link}
          </Link>
        </Paragraph>
      ) : null}
    </>
  )
}
