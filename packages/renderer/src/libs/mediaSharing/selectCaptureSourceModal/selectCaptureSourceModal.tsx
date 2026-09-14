import React, { useCallback, useEffect, useState } from 'react'
import {
  CardGrid,
  Card,
  Div,
  Footnote,
  Button,
  Checkbox,
  Link,
} from '@vkontakte/vkui'
import './selectCaptureSourceModal.css'
import Modal from '@vkontakte-internal/calls/components/CallsModal/CallsModal'
import { useModal } from '@vkontakte-internal/messenger/dist/browser/hooks/useModal'
import { MediaSharingEvents, CapturerSource, PlatformName } from 'vkme-common'
import { MacMediaDeviceChecker } from '../utils/macMediaDeviceChecker'
import { useLang } from '../../../hooks/useLang'

const macMediaDeviceChecker = new MacMediaDeviceChecker()

const MAC_SHARE_SOUND_FAQ_URL =
  'https://upload.object2.vk-apps.com/vk-me-desktop-dev-5837a06d-5f28-484a-ac22-045903cb1b1a/misc/mac-share-sound.pdf'

const isEmptyImage = (image: string) => {
  if (!Boolean(image)) {
    return false
  }
  return !Boolean(image.length) || image === 'data:image/png;base64,'
}

const hasImage = (thumbnail: string) => thumbnail && !isEmptyImage(thumbnail)

const SelectCapturerSourceModal: React.FC = () => {
  const modal = useModal()
  const lang = useLang()

  const [platformName, setPlatformName] = useState<PlatformName>()
  const [isSoundShareAllow, setIsSoundShareAllow] = useState(false)
  const [isSoundShareCheckboxVisible, setIsSoundShareCheckboxVisible] =
    useState(false)
  const [isEnableSoundShare, setIsEnableSoundShare] = useState(false)
  const [sources, setSources] = useState<CapturerSource[]>()
  const [selectedSource, setSelectedSource] = useState<CapturerSource>()

  const dispatchSelectEvent = useCallback(
    (source?: CapturerSource | null) => {
      window.dispatchEvent(
        new CustomEvent(MediaSharingEvents.SELECTED_CAPTURER_SOURCE, {
          detail: { source, isEnableSoundShare },
        }),
      )
    },
    [isEnableSoundShare],
  )

  const clearStateAndHideModal = useCallback(() => {
    setSelectedSource(undefined)
    setSources([])

    if (modal.isActive) {
      modal.close()
    }
  }, [modal])

  const close = useCallback(() => {
    dispatchSelectEvent(null)
    clearStateAndHideModal()
  }, [clearStateAndHideModal, dispatchSelectEvent])

  const handleOpenCaptureSourceModalEvent = useCallback(() => {
    window._common.getCapturerSources().then((availableSources) => {
      if (availableSources.length) {
        setSources(availableSources)
        modal.open()
      } else {
        close()
      }
    })
  }, [close, modal])

  const confirm = () => {
    dispatchSelectEvent(selectedSource)
    clearStateAndHideModal()
  }

  const handleSharedSoundToggle: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setIsEnableSoundShare(event.target.checked)
  }

  useEffect(() => {
    Promise.all([
      window._device.getPlatformName(),
      window._device.getIsSnap(),
    ]).then(([platform, isSnap]) => {
      setPlatformName(platform)
      setIsSoundShareAllow(platform !== PlatformName.MAC)
      setIsSoundShareCheckboxVisible(!isSnap)
    })
  }, [])

  useEffect(() => {
    window.addEventListener(
      MediaSharingEvents.OPEN_SELECT_CAPTURER_SOURCE_MODAL,
      handleOpenCaptureSourceModalEvent,
    )

    return () => {
      window.removeEventListener(
        MediaSharingEvents.OPEN_SELECT_CAPTURER_SOURCE_MODAL,
        handleOpenCaptureSourceModalEvent,
      )
    }
  }, [handleOpenCaptureSourceModalEvent])

  useEffect(() => {
    if (platformName !== PlatformName.MAC || isSoundShareAllow) {
      return
    }

    if (modal.isActive) {
      macMediaDeviceChecker
        .check()
        .then((hasDevice) => setIsSoundShareAllow(hasDevice))
    } else {
      macMediaDeviceChecker.stopChecking()
    }

    return () => {
      macMediaDeviceChecker.stopChecking()
    }
  }, [modal.isActive, platformName, isSoundShareAllow])

  return modal.isActive ? (
    <Modal
      className="select-capture-source-modal"
      title={lang.use('me_capture_source_title')}
      onClose={close}
      onBackdropClick={close}
      onBack={close}
      actionButtons={
        <>
          {isSoundShareCheckboxVisible && (
            <Checkbox
              checked={isEnableSoundShare}
              onChange={handleSharedSoundToggle}
              hasActive={false}
              className="share-sound-checkbox"
              disabled={!isSoundShareAllow}
            >
              {`${lang.use('me_capture_source_share_sound_toggle')} `}
              {!isSoundShareAllow && (
                <Link
                  onClick={() =>
                    window._common.openUrl(MAC_SHARE_SOUND_FAQ_URL)
                  }
                >
                  {lang.use('me_capture_source_share_sound_doc')}
                </Link>
              )}
            </Checkbox>
          )}
          <Button
            onClick={confirm}
            style={{ alignSelf: 'center' }}
            disabled={!selectedSource}
          >
            {lang.use('me_capture_source_start')}
          </Button>
        </>
      }
    >
      <CardGrid size={'s'} padding>
        {sources?.map((source) => (
          <Card
            className={source.id === selectedSource?.id ? 'active' : ''}
            onClick={() => setSelectedSource(source)}
            key={source.id}
            mode="shadow"
          >
            <Div className="screen-capture__inner-card">
              <Div
                style={{
                  padding: 0,
                  minHeight: 108,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundSize: 'contain',
                  backgroundImage: `url(data:image/png;base64,${source.thumbnail})`,
                }}
              />

              <Footnote
                className={
                  !isEmptyImage(source.appIcon) ? 'footnote-with-icon' : ''
                }
                weight={source.id.startsWith('screen') ? '2' : '3'}
                style={{
                  marginTop: 8,
                  letterSpacing: 0.2,
                  justifyContent: 'center',
                }}
                useAccentWeight
              >
                {hasImage(source.appIcon) && (
                  <img src={source.appIcon} width={16} height={16} alt="" />
                )}
                {source.name.length >= 18
                  ? source.name.slice(0, 18) + '...'
                  : source.name}
              </Footnote>
            </Div>
          </Card>
        ))}
      </CardGrid>
    </Modal>
  ) : null
}

export { SelectCapturerSourceModal }
