import React, { FC, useCallback, useEffect } from 'react'
import * as Post from '@vkontakte-internal/messenger/dist/core/model/Post'
import * as Channel from '@vkontakte-internal/messenger/dist/core/model/Channel'
import * as History from '@vkontakte-internal/messenger/dist/core/model/History'
import { useRouter } from '@vkontakte-internal/messenger/dist/browser/ui/Router/Router'
import { useDispatch } from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { MediaWindow } from '../MediaWindow'
import { MediaViewer } from '../MediaViewer'
import { fromApiPhoto } from '@vkontakte-internal/messenger/dist/data/converter/AttachConverter'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { useApiFetch } from '@vkontakte-internal/messenger/dist/browser/hooks/useApiFetch'
import { MediaViewerItem } from '@vkontakte-internal/messenger/dist/core/model/Channel'
import { useMediaWrapper } from '@vkontakte-internal/messenger/dist/browser/ui/MediaWrapper/hooks/useMediaWrapper'

type RouteSourceMessageWithMediaViewer = IRouter.RouteSourcePost & {
  mediaViewerItemPosition: number
}

type Modal = IRouter.PhotoModal<RouteSourceMessageWithMediaViewer>

type Props = {
  modal: Modal
  channels: Channel.Cache
}

type ChannelCacheKey = Parameters<Channel.Cache['get']>[0]

// Тип опорного элемента. Пока мы не получили даннные с сервера, у нас есть только данные из Route, от которых мы отталкиваемся
type PivotItem = Pick<MediaViewerItem, 'id' | 'cmid'>

export const ChannelMediaWrapper: FC<Props> = ({ modal, channels }) => {
  const { replace } = useRouter()
  const dispatch = useDispatch()
  const apiFetch = useApiFetch()

  const getModalContextId = useCallback((modal: Modal) => {
    if (!modal.source) {
      throw new Error('Не можем получить modal source')
    }

    return modal.source.channelId
  }, [])

  const fetchAttachments = useCallback(
    async (
      { id, cmid }: PivotItem,
      modal: Modal,
      count: number,
      offset: number,
    ): Promise<MediaViewerItem[] | null> => {
      if (!modal.source) {
        return null
      }

      const response = await apiFetch(
        'channels.getHistoryAttachments',
        {
          extended: 1,
          channel_id: modal.source.channelId,
          attachment_id: `${modal.source.channelId}_${id}`,
          cmid,
          count,
          offset,
          // В текущий момент поддерживаем только photo в сквозном просмотре, в будущем добавится video
          attachment_types: 'photo',
        },
        { retries: 3 },
      )

      if (!response.items) {
        return null
      }

      return response.items
        .reverse()
        .reduce<MediaViewerItem[]>((acc, historyAttachItem) => {
          const photo =
            historyAttachItem.attachment.photo &&
            fromApiPhoto({
              apiPhoto: historyAttachItem.attachment.photo,
            })

          // В текущий момент поддерживаем только photo в сквозном просмотре, в будущем добавится video
          if (photo) {
            acc.push({
              ...photo,
              cmid: Post.resolveCmid(historyAttachItem.cmid),
            })
          }

          return acc
        }, [])
    },
    [apiFetch],
  )

  const changeRoute = useCallback(
    (mediaItem: MediaViewerItem) => {
      if (
        !modal.source ||
        (mediaItem.id === modal.id && mediaItem.cmid === modal.source.cmid)
      ) {
        return
      }

      replace({
        ...modal,
        id: mediaItem.id,
        accessKey: mediaItem.accessKey,
        source: {
          ...modal.source,
          cmid: mediaItem.cmid,
          mediaViewerItemPosition: 1,
        },
      })
    },
    [replace, modal],
  )

  const insertToMediaViewerCache = useCallback(
    (data: Partial<Channel.MediaViewerCache>, channelId: ChannelCacheKey) => {
      dispatch({
        type: 'ChannelMediaViewerCacheInserted',
        channelId,
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
  } = useMediaWrapper<MediaViewerItem, PivotItem, Modal, Channel.Cache>({
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

    const channel = channels.get(modal.source.channelId)

    if (!channel || channel.kind === 'ChannelRestricted') return false

    const cachedMediaViewer =
      Channel.findMediaViewerCacheItem(channel, modal.id, modal.source.cmid) &&
      channel.mediaViewerCache

    if (cachedMediaViewer) {
      setMediaViewer(cachedMediaViewer.items)
      setPrevWithDispatch(cachedMediaViewer.hasPrev)
      setNextWithDispatch(cachedMediaViewer.hasNext)

      // Кеш нашли и установили
      return true
    }

    if (!cachedMediaViewer && channel.mediaViewerCache.items.length) {
      // Очищаем кеш если не нашли вложение в кеше, но какой-то кеш при этом есть
      dispatch({ type: 'ChannelMediaViewerCacheRemoved', channel })
    }

    return false
  }

  /**
   * Пытаемся найти и установить медиа из кеша поста,
   * на время запроса за данными, чтобы сразу показать картинку
   */
  const findAndSetMediaFromPostCache = (modal: Modal): boolean => {
    if (!modal.source) return false

    const channel = channels.get(modal.source.channelId)

    if (!channel || channel.kind === 'ChannelRestricted') return false

    const cmid = Post.resolveCmid(modal.source.cmid)

    const nodeData = History.findNodeByCmid(channel.history, modal.source.cmid)

    const post = nodeData.status === 'Node' && nodeData.node.item
    const photo =
      post && post.attaches.photos?.find((photo) => photo.id === modal.id)
    const mediaViewerItem = photo && { ...photo, cmid }

    if (mediaViewerItem) {
      setMediaViewer([mediaViewerItem])

      // Кеш нашли и установили
      return true
    }

    return false
  }

  /**
   * mounted effect – внутри происходит 3 действия
   *
   * 1. Попытка найти кеш всего MediaViewer'a из Store Channel
   * 2. Если не нашли, делаем запрос в API
   * 3. На время запроса пытаемся установить медиа из кеша поста
   */
  useEffect(() => {
    if (!modal.source) {
      return closeMediaViewer()
    }

    const channel = channels.get(modal.source.channelId)

    if (!channel || channel.kind === 'ChannelRestricted') {
      return closeMediaViewer()
    }

    // Сначала пытаемся получить кеш всего MediaViewer'a из Channel
    if (findAndSetMediaViewerCache(modal)) {
      return
    }

    // Если кеш MediaViewer'a в Channel не найден – делаем запрос
    fetchAttachmentsWrapper(
      {
        id: modal.id,
        cmid: modal.source.cmid,
      },
      modal,
      'both',
    ).then(onFetchAttachmentsResolve.bind(null, 'both'))

    // Пока идет запрос в API, пытаемся достать пост из кеша
    findAndSetMediaFromPostCache(modal)

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
        withPhotoContextMenu
      />
    </MediaWindow>
  )
}

const getMediaIndex = (
  mediaItems: MediaViewerItem[],
  { id, cmid }: PivotItem,
) =>
  mediaItems.findIndex(
    (attachMedia) =>
      attachMedia.id === id &&
      // Эти проверки необходимы, так как могут быть одинаковые аттачи в разных сообщениях
      attachMedia.cmid === cmid,
  )

const getMediaIndexByModal = (mediaItems: MediaViewerItem[], modal: Modal) =>
  modal.source
    ? getMediaIndex(mediaItems, {
        id: modal.id,
        cmid: modal.source.cmid,
      })
    : -1
