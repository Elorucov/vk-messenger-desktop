import React, { FC, useCallback, useEffect } from 'react'
import * as Message from '@vkontakte-internal/messenger/dist/core/model/Message'
import * as Convo from '@vkontakte-internal/messenger/dist/core/model/Convo'
import {
  useBrowserEnv,
  useDispatch,
  useOwner,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { MediaWindow } from '../MediaWindow'
import { MediaViewer } from '../MediaViewer'
import {
  fromApiPhoto,
  fromApiVideo,
} from '@vkontakte-internal/messenger/dist/data/converter/AttachConverter'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { getOwnerGroupId } from '@vkontakte-internal/messenger/dist/data/store/State'
import { useApiFetch } from '@vkontakte-internal/messenger/dist/browser/hooks/useApiFetch'
import { MediaViewerItem } from '@vkontakte-internal/messenger/dist/core/model/Convo'
import { useMediaWrapper } from '@vkontakte-internal/messenger/dist/browser/ui/MediaWrapper/hooks/useMediaWrapper'

type RouteSourceMessageWithMediaViewer = IRouter.RouteSourceMessage & {
  mediaViewerItemPosition: number
}

type Modal =
  | IRouter.PhotoModal<RouteSourceMessageWithMediaViewer>
  | IRouter.VideoModal<RouteSourceMessageWithMediaViewer>

type Props = {
  modal: Modal
  convos: Convo.Cache
}

type ConvoCacheKey = Parameters<Convo.Cache['get']>[0]

// Тип опорного элемента. Пока мы не получили даннные с сервера, у нас есть только данные из Route, от которых мы отталкиваемся
type PivotItem = Pick<MediaViewerItem, 'id' | 'cmid' | 'position'>

export const MediaWrapper: FC<Props> = ({ modal, convos }) => {
  const { router } = useBrowserEnv()
  const dispatch = useDispatch()
  const apiFetch = useApiFetch()
  const owner = useOwner()

  const getModalContextId = useCallback((modal: Modal) => {
    if (!modal.source) {
      throw new Error('Не можем получить modal source')
    }

    return modal.source.peerId
  }, [])

  const fetchAttachments = useCallback(
    async (
      { cmid, position }: PivotItem,
      modal: Modal,
      count: number,
      offset: number,
    ): Promise<MediaViewerItem[] | null> => {
      if (!modal.source) {
        return null
      }

      const response = await apiFetch(
        'messages.getHistoryAttachments',
        {
          extended: 1,
          peer_id: modal.source.peerId,
          cmid,
          attachment_position: position,
          count,
          offset,
          attachment_types: ['photo', 'video'].join(','),
          group_id: getOwnerGroupId(owner.id),
          message_video: 1,
        },
        { retries: 3 },
      )

      if (!response.items) {
        return null
      }

      return response.items
        .reverse()
        .reduce<MediaViewerItem[]>((acc, historyAttachItem) => {
          let media

          if (historyAttachItem.attachment.photo) {
            media = fromApiPhoto({
              apiPhoto: historyAttachItem.attachment.photo,
              position: historyAttachItem.position,
            })
          }
          if (historyAttachItem.attachment.video) {
            media = fromApiVideo({
              apiVideo: historyAttachItem.attachment.video,
              position: historyAttachItem.position,
            })
          }

          if (media) {
            acc.push({
              ...media,
              cmid: Message.resolveCmid(historyAttachItem.cmid),
              position: media.position ?? 1,
            })
          }

          return acc
        }, [])
    },
    [apiFetch, owner.id],
  )

  const changeRoute = useCallback(
    (mediaItem: MediaViewerItem) => {
      if (
        !modal.source ||
        (mediaItem.id === modal.id && mediaItem.cmid === modal.source.cmid)
      ) {
        return
      }

      router.replace({
        ...modal,
        id: mediaItem.id,
        accessKey: mediaItem.accessKey,
        source: {
          ...modal.source,
          cmid: mediaItem.cmid,
          mediaViewerItemPosition: mediaItem.position,
          messageAccessKey: undefined,
        },
      })
    },
    [modal, router],
  )

  const insertToMediaViewerCache = useCallback(
    (data: Partial<Convo.MediaViewerCache>, peerId: ConvoCacheKey) => {
      dispatch({
        type: 'ConvoMediaViewerCacheInserted',
        peerId,
        data,
      })
    },
    [dispatch],
  )

  const {
    mediaViewerItems,
    mediaViewerIndex,
    fetchAttachmentsWrapper,
    onFetchAttachmentsResolve,
    setMediaViewer,
    setPrevWithDispatch,
    setNextWithDispatch,
    closeMediaViewer,
    handlePrev,
    handleNext,
    hidePrev,
    hideNext,
    isMediaViewerLoading,
  } = useMediaWrapper<MediaViewerItem, PivotItem, Modal, Convo.Cache>({
    modal,
    getModalContextId,
    changeRoute,
    fetchAttachments,
    getMediaIndex,
    getMediaIndexByModal,
    insertToMediaViewerCache,
  })

  /**
   * Пытаемся найти и установить кеш всего MediaViewer'a
   */
  const findAndSetMediaViewerCache = (modal: Modal): boolean => {
    if (!modal.source) return false

    const convo = convos.get(modal.source.peerId)

    if (!convo) return false

    const cachedMediaViewer =
      Convo.findMediaViewerCacheItem(
        convo,
        modal.id,
        modal.source.cmid,
        modal.source.mediaViewerItemPosition,
      ) && convo.mediaViewerCache

    if (cachedMediaViewer) {
      setMediaViewer(cachedMediaViewer.items)
      setPrevWithDispatch(cachedMediaViewer.hasPrev)
      setNextWithDispatch(cachedMediaViewer.hasNext)

      // Кеш нашли и установили
      return true
    }

    if (!cachedMediaViewer && convo.mediaViewerCache.items.length) {
      // Очищаем кеш если не нашли вложение в кеше, но какой-то кеш при этом есть
      dispatch({ type: 'ConvoMediaViewerCacheRemoved', convo })
    }

    return false
  }

  const convo = modal.source && convos.get(modal.source.peerId)
  const isForwardingDisabled =
    convo && Convo.isMessagesForwardingDisabled(convo)

  /**
   * Пытаемся найти и установить медиа из кеша сообщения,
   * на время запроса за данными, чтобы сразу показать картинку
   */
  const findAndSetMediaFromMessageCache = (modal: Modal): boolean => {
    if (!modal.source) return false

    const convo = convos.get(modal.source.peerId)

    if (!convo) return false

    const message = Convo.findMessageByCmid(convo, modal.source.cmid)

    if (!message || message.kind === 'Service' || message.kind === 'Expired') {
      return false
    }

    const messageMedia = getMediaFromMessage(
      message,
      modal.kind === 'PhotoModal' ? 'photo' : 'video',
      modal.id,
      modal.source.mediaViewerItemPosition,
    )

    if (messageMedia) {
      setMediaViewer([messageMedia])

      // Кеш нашли и установили
      return true
    }

    return false
  }

  /**
   * mounted effect – внутри происходит 3 действия
   *
   * 1. Попытка найти кеш всего MediaViewer'a из Store Convo
   * 2. Если не нашли, делаем запрос в API
   * 3. На время запроса пытаемся установить медиа из кеша сообщения
   */
  useEffect(() => {
    if (!modal.source) {
      return closeMediaViewer()
    }

    // Сначала пытаемся получить кеш всего MediaViewer'a из Convo
    if (findAndSetMediaViewerCache(modal)) {
      return
    }

    // Если кеш MediaViewer'a в Convo не найден – делаем запрос
    fetchAttachmentsWrapper(
      {
        id: modal.id,
        cmid: modal.source.cmid,
        position: modal.source.mediaViewerItemPosition,
      },
      modal,
      'both',
    ).then(onFetchAttachmentsResolve.bind(null, 'both'))

    // Пока идет запрос в API, пытаемся достать сообщения из кеша
    findAndSetMediaFromMessageCache(modal)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MediaWindow onClose={closeMediaViewer}>
      <MediaViewer
        mediaItems={mediaViewerItems}
        index={mediaViewerIndex}
        showCount={false}
        isLoading={isMediaViewerLoading}
        hidePrev={hidePrev}
        hideNext={hideNext}
        onPrev={handlePrev}
        onNext={handleNext}
        onClose={closeMediaViewer}
        withPhotoContextMenu={!isForwardingDisabled}
      />
    </MediaWindow>
  )
}

/**
 * Так как в modal есть ссылка только на rootMessage, а аттач может быть открыт из форварда,
 * нам необходимо пройтись по всем форвардам и найти целевой аттач
 */
const getMediaFromMessage = (
  rootMessage: Message.Normal,
  mediaType: 'photo' | 'video',
  mediaId: number,
  mediaPosition: number,
): MediaViewerItem | undefined => {
  const queue: Array<Message.Normal | Message.Foreign> = [rootMessage]

  while (queue.length !== 0) {
    const currentItem = queue.shift()
    if (!currentItem) {
      // Невозможный сценарий
      return undefined
    }

    if (currentItem.forwardedMessages) {
      queue.push(...currentItem.forwardedMessages)
    }

    if (
      currentItem.replyMessage &&
      currentItem.replyMessage.kind !== 'ForeignExpired'
    ) {
      queue.push(currentItem.replyMessage)
    }

    const messageMedia =
      mediaType === 'photo'
        ? currentItem.attaches.photos
        : currentItem.attaches.videos

    const targetMediaIndex = messageMedia?.findIndex(
      (attach) => attach.id === mediaId && attach.position === mediaPosition,
    )

    const targetMedia =
      targetMediaIndex !== undefined && messageMedia?.[targetMediaIndex]

    if (targetMedia) {
      return {
        ...targetMedia,
        cmid: Message.resolveCmid(rootMessage.cmid),
        position: targetMedia.position ?? 1,
      }
    }
  }

  return undefined
}

const getMediaIndex = (
  mediaItems: MediaViewerItem[],
  { id, cmid, position }: PivotItem,
) =>
  mediaItems.findIndex(
    (attachMedia) =>
      attachMedia.id === id &&
      // Эти проверки необходимы, так как могут быть одинаковые аттачи в разных сообщениях
      attachMedia.cmid === cmid &&
      attachMedia.position === position,
  )

const getMediaIndexByModal = (mediaItems: MediaViewerItem[], modal: Modal) =>
  modal.source
    ? getMediaIndex(mediaItems, {
        id: modal.id,
        cmid: modal.source.cmid,
        position: modal.source.mediaViewerItemPosition,
      })
    : -1
