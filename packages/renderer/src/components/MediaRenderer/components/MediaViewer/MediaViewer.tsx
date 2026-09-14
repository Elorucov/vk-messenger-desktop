import './MediaViewer.css'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cx from 'classnames'
import * as Attach from '@vkontakte-internal/messenger/dist/core/model/Attach'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import {
  Icon16Verified,
  Icon20DownloadOutline,
  Icon20MagnifierMinusOutline,
  Icon20MagnifierPlusOutline,
  Icon20RotateLeft,
  Icon20ShareOutline,
  Icon28CancelOutline,
  Icon48ChevronLeftOutline,
  Icon48ChevronRightOutline,
} from '@vkontakte/icons'
import { Spinner } from '@vkontakte/vkui'
import { BasicAvatar } from '@vkontakte-internal/messenger/dist/browser/ui/BasicAvatar/BasicAvatar'
import {
  useBrowserEnv,
  useOwner,
  usePeers,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { useNow } from '@vkontakte-internal/messenger/dist/browser/hooks/useNow'
import {
  Size,
  isSameYear,
} from '@vkontakte-internal/messenger/dist/core/utils/misc'
import { useMediaOwners } from '@vkontakte-internal/messenger/dist/browser/hooks/useMediaOwners'
import { useModuleKeyBoardHandlers } from '@vkontakte-internal/messenger/dist/browser/hooks/useKeyBoardHandlers'
import {
  MediaViewerPhoto,
  MediaViewerPhotoRef,
} from '@vkontakte-internal/messenger/dist/browser/ui/MediaViewer/MediaViewerPhoto'
import { MediaViewerVideo } from '@vkontakte-internal/messenger/dist/browser/ui/MediaViewer/MediaViewerVideo'
import { Tooltip } from '@vkontakte-internal/messenger/dist/browser/ui/Tooltip/Tooltip'
import { ExternalLink } from '@vkontakte-internal/messenger/dist/browser/ui/Link/Link'
import { useRouter } from '@vkontakte-internal/messenger/dist/browser/ui/Router/Router'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { useMediaViewport } from '../../hooks'
import {
  KeyDownHandler,
  onElementKeyDownFactory,
} from '@vkontakte-internal/messenger/dist/browser/utils/elementKeyDown'
import { useLayoutData } from '@vkontakte-internal/messenger/dist/browser/ui/LayoutDataProvider/LayoutDataProvider'

export type Props<MediaItem> = {
  mediaItems: MediaItem[]
  index?: number
  initialIdx?: number
  showCount?: boolean
  isLoading?: boolean
  hidePrev?: boolean
  hideNext?: boolean
  onPrev?: (item: MediaItem) => void
  onNext?: (item: MediaItem) => void
  onClose: () => void
  withPhotoContextMenu: boolean
}

type LoadedPhotos = Set<Attach.Photo['id']>

function MediaViewerComponent<MediaItem extends Attach.Photo | Attach.Video>({
  mediaItems,
  index,
  initialIdx = 0,
  showCount = true,
  isLoading = false,
  hidePrev = false,
  hideNext = false,
  onPrev,
  onNext,
  onClose,
  withPhotoContextMenu,
}: Props<MediaItem>): React.ReactElement {
  const now = useNow()
  const { lang, vkDomain, share } = useBrowserEnv()
  const { isMobileLayout } = useLayoutData()
  const owner = useOwner()

  const { modal } = useRouter()

  const shareSource = useMemo(() => {
    //Не может быть такого, мы сейчас в модалке
    if (!modal) {
      return null
    }

    //Другого пока в этом просмторощике нет
    if (
      (modal.kind !== 'PhotoModal' && modal.kind !== 'VideoModal') ||
      !modal.source
    ) {
      return null
    }

    //Только места откуда точно можно пошарить
    if (
      modal.source.kind !== IRouter.RouteSourceKind.Message &&
      modal.source.kind !== IRouter.RouteSourceKind.Post &&
      modal.source.kind !== IRouter.RouteSourceKind.Comment
    ) {
      return null
    }

    return modal.source
  }, [modal])

  const mediaViewerPhotoRef = useRef<MediaViewerPhotoRef | null>(null)
  const mediaViewerRef = useRef<HTMLDivElement | null>(null)

  const [viewportWidth, viewportHeight] = useMediaViewport({
    debounced: true,
  })
  const viewportSize: Size = useMemo(
    () => ({
      w: viewportWidth,
      h: viewportHeight,
    }),
    [viewportWidth, viewportHeight],
  )

  const { getMediaOwner } = useMediaOwners({ media: mediaItems })

  const [loadedPhotos, setLoadedPhotos] = useState<LoadedPhotos>(new Set())
  const loadedPhotosRef = useRef(loadedPhotos)
  loadedPhotosRef.current = loadedPhotos

  const USE_INTERNAL_INDEX = index === undefined
  const [internalIndex, setInternalIndex] = useState(initialIdx)

  const currentIndex = USE_INTERNAL_INDEX ? internalIndex : index

  const currentIndexRef = useRef(currentIndex)
  currentIndexRef.current = currentIndex

  const currentMedia = mediaItems[currentIndex]

  const currentMediaOwner = getMediaOwner(currentMedia?.ownerId)

  let publicVideo: Attach.Video | null = null

  if (
    currentMedia?.kind === 'Video' &&
    !currentMedia.isFromMessage &&
    currentMedia.platform === undefined &&
    currentMedia.type !== 'short_video'
  ) {
    publicVideo = currentMedia
  }

  const peers = usePeers()

  const publicVideoAuthor =
    publicVideo && Peer.safeGet(peers, Peer.resolveId(publicVideo.ownerId))

  const currentMediaUploadDate =
    !!currentMedia?.uploadDate &&
    lang.use(
      isSameYear(now, currentMedia.uploadDate)
        ? 'global_short_date'
        : 'global_date',
      {
        now,
        date: currentMedia.uploadDate,
      },
    )

  const handlePrev = useCallback(() => {
    onPrev?.(
      getMediaItemByIndex(
        mediaItems,
        getPrevIndex(currentIndexRef.current, mediaItems.length),
      ),
    )

    USE_INTERNAL_INDEX &&
      setInternalIndex((n) => getPrevIndex(n, mediaItems.length))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItems, onPrev])

  const handleNext = useCallback(() => {
    onNext?.(
      getMediaItemByIndex(
        mediaItems,
        getNextIndex(currentIndexRef.current, mediaItems.length),
      ),
    )

    USE_INTERNAL_INDEX &&
      setInternalIndex((n) => getNextIndex(n, mediaItems.length))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItems, onNext])

  const { subscribeKeyDown, focusHandlerElement } = useModuleKeyBoardHandlers({
    moduleName: 'MediaViewer',
    blockGlobalHandlers: false,
    handlerElementRef: mediaViewerRef,
  })

  useEffect(() => {
    focusHandlerElement()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Управление с клавиатуры
   */

  const onKeyDown: KeyDownHandler = useCallback(
    (keyCombo, event) => {
      event.stopPropagation()

      const photoScaler = mediaViewerPhotoRef.current?.photoScaler

      switch (keyCombo) {
        case 'ArrowRight':
          event.preventDefault()
          return handleNext()
        case 'ArrowLeft':
          event.preventDefault()
          return handlePrev()
        case 'Escape':
          event.preventDefault()
          return onClose()

        case 'Mod+Equal':
        case 'Mod+Shift+Equal':
          event.preventDefault()
          return photoScaler?.zoomIn()

        case 'Mod+Minus':
        case 'Mod+Shift+Minus':
          event.preventDefault()
          return photoScaler?.zoomOut()

        default:
          break
      }
    },
    [handleNext, handlePrev, mediaViewerPhotoRef, onClose],
  )

  useEffect(() => {
    return subscribeKeyDown(onKeyDown)
  }, [onKeyDown, subscribeKeyDown])

  /**
   * Подгрузка текущего, предыдущего и следующего фото
   */
  useEffect(() => {
    const imagesLoadCallbacks = new Map<HTMLImageElement, () => void>()

    const prevMedia = mediaItems[getPrevIndex(currentIndex, mediaItems.length)]
    const currMedia = mediaItems[currentIndex]
    const nextMedia = mediaItems[getNextIndex(currentIndex, mediaItems.length)]

    for (const media of [prevMedia, currMedia, nextMedia]) {
      if (
        !media ||
        media.kind !== 'Photo' ||
        loadedPhotosRef.current.has(media.id)
      ) {
        continue
      }

      const url = Attach.preview(media, viewportSize.w, viewportSize.h)?.url
      const id = media.id

      if (url) {
        const img = new Image()

        const onImgLoad = () => {
          setLoadedPhotos((loadedPhotos) => new Set(loadedPhotos).add(id))
        }
        img.addEventListener('load', onImgLoad)
        img.src = url
        imagesLoadCallbacks.set(img, onImgLoad)
      }
    }

    return () => {
      imagesLoadCallbacks.forEach((onImgLoad, img) => {
        img.removeEventListener('load', onImgLoad)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItems, currentIndex])

  const originalImage =
    currentMedia?.kind === 'Photo' &&
    (currentMedia.originalImage ||
      Attach.preview(currentMedia, Infinity, Infinity)?.url)

  const isCurrentMediaPhoto = currentMedia?.kind === 'Photo'
  const showLoading = isLoading || !currentMedia

  const canShare =
    true &&
    share &&
    shareSource &&
    currentMedia &&
    // Можем шарить любые фото. Видео только если они публичные или отправили мы
    (currentMedia.kind !== 'Video' ||
      !currentMedia.isFromMessage ||
      currentMedia.ownerId === owner.id)

  return (
    <div
      className={'DesktopMediaViewer'}
      ref={mediaViewerRef}
      tabIndex={-1}
      onKeyDown={onElementKeyDownFactory(onKeyDown)}
    >
      {showLoading && <Spinner />}

      {!showLoading &&
        (isCurrentMediaPhoto ? (
          <MediaViewerPhoto
            ref={mediaViewerPhotoRef}
            photo={currentMedia}
            isLoading={!loadedPhotos.has(currentMedia.id)}
            viewportSize={viewportSize}
            withContextMenu={withPhotoContextMenu}
          />
        ) : (
          <MediaViewerVideo video={currentMedia} />
        ))}

      {mediaItems.length > 1 && (
        <nav
          className={cx('DesktopMediaViewer__nav', {
            'DesktopMediaViewer__nav--touch': isMobileLayout,
          })}
        >
          {!hidePrev && (
            <button
              className="DesktopMediaViewer__prev"
              onClick={handlePrev}
              aria-label={lang.use('me_photo_prev_title')}
            >
              <Icon48ChevronLeftOutline className="DesktopMediaViewer__navIcon" />
            </button>
          )}
          {!hideNext && (
            <button
              className="DesktopMediaViewer__next"
              onClick={handleNext}
              aria-label={lang.use('me_photo_next_title')}
            >
              <Icon48ChevronRightOutline className="DesktopMediaViewer__navIcon" />
            </button>
          )}
        </nav>
      )}

      <footer className="DesktopMediaViewer__footer">
        <div className="DesktopMediaViewer__footerPeer">
          {!publicVideo && (
            <BasicAvatar
              className="DesktopMediaViewer__footerPeerAvatar"
              size={32}
              content={currentMediaOwner.name}
              picture={currentMediaOwner.photo}
            />
          )}
          {currentMediaOwner.name && !publicVideo && (
            <>
              <div className="DesktopMediaViewer__footerPeerName">
                {currentMediaOwner.name}
              </div>
              <div className="DesktopMediaViewer__footerPeerUploadDate">
                {currentMediaUploadDate}
              </div>
            </>
          )}
          {publicVideo && (
            <>
              {publicVideo.mainArtists && (
                <div className="DesktopMediaViewer__footerPeerName DesktopMediaViewer__footerPeerName--extended">
                  {publicVideo.mainArtists.map((artist, index, array) => {
                    return (
                      <ExternalLink
                        href={`https://${vkDomain}/artist/${artist.domain}`}
                        className="DesktopMediaViewer__footerPeerName--link"
                      >
                        <span>{artist.name}</span>
                        {index < array.length - 1 && <span>,&nbsp;</span>}
                      </ExternalLink>
                    )
                  })}
                </div>
              )}
              {!publicVideo.mainArtists && publicVideoAuthor && (
                <ExternalLink
                  href={`https://${vkDomain}/${
                    // eslint-disable-next-line i18next/no-literal-string
                    publicVideo.type === 'short_video' ? 'clips' : 'video/@'
                  }${Peer.linkVideo(publicVideoAuthor)}`}
                  className="DesktopMediaViewer__footerPeerName DesktopMediaViewer__footerPeerName--extended"
                >
                  <span className="MediaViewerAuthor">
                    <span className="DesktopMediaViewer__footerPeerNameValue">
                      {Peer.name(publicVideoAuthor)}
                    </span>
                    {'isVerified' in publicVideoAuthor &&
                      publicVideoAuthor.isVerified && (
                        <span>
                          <Icon16Verified className="DesktopMediaViewer__footerPeerName--verified" />
                        </span>
                      )}
                  </span>
                </ExternalLink>
              )}
              <div className="DesktopMediaViewer__footerPeerUploadDate">
                {currentMediaUploadDate}
              </div>
            </>
          )}
        </div>

        {showCount && !publicVideo && (
          <span className="DesktopMediaViewer__count">
            {mediaItems.length > 1 &&
              lang.use('me_n_from_c', {
                values: {
                  num: (currentIndex + 1).toString(),
                  count: mediaItems.length.toString(),
                },
              })}
          </span>
        )}

        <div className="DesktopMediaViewer__footerActions">
          {isCurrentMediaPhoto && (
            <>
              <Tooltip
                align="center"
                content={lang.use('me_photo_zoomout_title')}
                delay={500}
              >
                <button
                  className="DesktopMediaViewer__action"
                  type="button"
                  aria-label={lang.use('me_photo_zoomout_title')}
                  onClick={() => {
                    mediaViewerPhotoRef.current?.photoScaler.zoomOut()
                  }}
                >
                  <Icon20MagnifierMinusOutline />
                </button>
              </Tooltip>
              <Tooltip
                align="center"
                content={lang.use('me_photo_zoomin_title')}
                delay={500}
              >
                <button
                  className="DesktopMediaViewer__action"
                  type="button"
                  aria-label={lang.use('me_photo_zoomin_title')}
                  onClick={() => {
                    mediaViewerPhotoRef.current?.photoScaler.zoomIn()
                  }}
                >
                  <Icon20MagnifierPlusOutline />
                </button>
              </Tooltip>

              <Tooltip
                align="center"
                content={lang.use('me_photo_rotate_left_title')}
                delay={500}
              >
                <button
                  className="DesktopMediaViewer__action"
                  type="button"
                  aria-label={lang.use('me_photo_rotate_left_title')}
                  onClick={() => {
                    mediaViewerPhotoRef.current?.rotateLeft()
                  }}
                >
                  <Icon20RotateLeft />
                </button>
              </Tooltip>

              {/* @TODO Работает только для same-origin */}
              {originalImage && (
                <>
                  <div className="DesktopMediaViewer__actionDivider" />

                  <Tooltip
                    align="center"
                    content={lang.use('me_photo_open_original')}
                    delay={500}
                  >
                    <a
                      href={originalImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="DesktopMediaViewer__action"
                      aria-label={lang.use('me_photo_open_original')}
                    >
                      <Icon20DownloadOutline />
                    </a>
                  </Tooltip>
                </>
              )}
            </>
          )}

          {currentMedia && canShare && (
            <>
              {isCurrentMediaPhoto && (
                <div className="DesktopMediaViewer__actionDivider" />
              )}

              <Tooltip
                align="center"
                content={lang.use('me_media_share')}
                delay={500}
              >
                <button
                  className="DesktopMediaViewer__action"
                  type="button"
                  aria-label={lang.use('me_media_share')}
                  onClick={() => {
                    share.shareAttach(currentMedia, shareSource)
                  }}
                >
                  <Icon20ShareOutline />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </footer>

      <button
        className="DesktopMediaViewer__closer"
        onClick={onClose}
        aria-label={lang.use('me_close')}
      >
        <Icon28CancelOutline />
      </button>
    </div>
  )
}

export const MediaViewer = React.memo(
  MediaViewerComponent,
  /**
   * Это необходимо, так как React.memo теряет generic type parameters у компонента
   */
) as typeof MediaViewerComponent

const getMediaItemByIndex = <MediaItem extends Attach.Photo | Attach.Video>(
  items: MediaItem[],
  index: number,
) => {
  const item = items[index]

  if (!item) {
    throw new Error('Передан некорректный индекс медиа')
  }

  return item
}

const getPrevIndex = (currentIndex: number, maxLength: number) =>
  (maxLength + currentIndex - 1) % maxLength

const getNextIndex = (currentIndex: number, maxLength: number) =>
  (currentIndex + 1) % maxLength
