import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import * as Attach from '@vkontakte-internal/messenger/dist/core/model/Attach'
import * as Message from '@vkontakte-internal/messenger/dist/core/model/Message'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import * as Convo from '@vkontakte-internal/messenger/dist/core/model/Convo'
import {
  useBrowserEnv,
  useConvos,
  useFeatureFlags,
  useViewer,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import {
  exhaustivenessCheck,
  isDev,
} from '@vkontakte-internal/messenger/dist/core/utils/misc'
import { fromApiVideo } from '@vkontakte-internal/messenger/dist/data/converter/AttachConverter'
import { MediaWindow } from '../MediaWindow'
import { MediaViewer } from '../MediaViewer'
import { useApiFetch } from '@vkontakte-internal/messenger/dist/browser/hooks/useApiFetch'
import { Spinner } from '@vkontakte/vkui'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { fromApiMessage } from '@vkontakte-internal/messenger/dist/data/converter/MessageConverter'

type Props = {
  routeVideo?: IRouter.VideoModal
}

export const VideoPlayerWrapper: FC<Props> = ({ routeVideo }) => {
  const viewer = useViewer()
  const { router } = useBrowserEnv()
  const apiFetch = useApiFetch()
  const featureFlags = useFeatureFlags()
  const convos = useConvos()
  const [video, setVideo] = useState<Attach.Video | null>(null)
  const convo =
    routeVideo?.source && 'peerId' in routeVideo.source
      ? convos.get(routeVideo.source.peerId)
      : undefined
  const isForwardingDisabled =
    !!convo && Convo.isMessagesForwardingDisabled(convo)
  const onClose = useCallback(() => router.pop(), [router])

  const setLoadedVideo = useCallback(
    (loadedApiVideos: Attach.Video[], video: IRouter.VideoModal) => {
      const targetVideo = loadedApiVideos.find(
        (attachVideo) => attachVideo.id === video.id,
      )

      if (!targetVideo) {
        return onClose()
      }

      setVideo(targetVideo)
    },
    [onClose],
  )

  const loadVideoByMessageCmid = useCallback(
    async (peerId: Peer.Id, cmid: Message.Cmid, videoId: number) => {
      const response = await apiFetch('messages.getByConversationMessageId', {
        peer_id: peerId,
        conversation_message_ids: cmid.toString(),
        extended: 1,
        group_id: Peer.isGroupPeerId(viewer.id) ? Peer.toRealId(viewer.id) : 0,
      })

      const apiMessage = response.items[0]

      if (!apiMessage) {
        throw new Error('Не удалось получить сообщение')
      }

      const message = fromApiMessage(featureFlags, apiMessage).message

      if (message.kind !== 'Normal') {
        return undefined
      }

      return findMessageVideoLayer(message, videoId)
    },
    [apiFetch, featureFlags, viewer.id],
  )

  const loadVideoById = useCallback(
    async (video: IRouter.VideoModal) => {
      const { ownerId, id, accessKey } = video

      try {
        const response = await apiFetch('video.get', {
          owner_id: ownerId,
          videos: `${ownerId}_${id}${accessKey ? `_${accessKey}` : ''}`,
          extended: 0,
        })

        const loadedVideos = response.items.reduce<Attach.Video[]>(
          (acc, apiVideo) => {
            const video = fromApiVideo({ apiVideo })
            if (video) {
              acc.push(video)
            }
            return acc
          },
          [],
        )

        setLoadedVideo(loadedVideos, video)
      } catch (err) {
        if (isDev) {
          throw err
        }
        onClose()
      }
    },
    [apiFetch, onClose, setLoadedVideo],
  )

  useEffect(() => {
    if (!routeVideo) {
      return onClose()
    }

    const { source } = routeVideo

    if (!source) {
      loadVideoById(routeVideo)
      return () => {}
    }

    const loadVideoFromApi = async (
      videoPromise: Promise<Attach.Video | undefined>,
    ) => {
      try {
        const apiVideo = await videoPromise
        if (!apiVideo) {
          return onClose()
        }
        setLoadedVideo([apiVideo], routeVideo)
      } catch (err: unknown) {
        loadVideoById(routeVideo)
        if (isDev) {
          throw err
        }
      }
    }

    switch (source.kind) {
      case IRouter.RouteSourceKind.Message: {
        const convo = convos.get(source.peerId)
        const nodeData =
          convo && Convo.findHistoryNodeByCmid(convo, source.cmid)

        if (nodeData === undefined || nodeData.status === 'NotLoaded') {
          loadVideoFromApi(
            loadVideoByMessageCmid(source.peerId, source.cmid, routeVideo.id),
          )
          break
        }

        if (
          nodeData.status === 'Deleted' ||
          nodeData.node.item.kind !== 'Normal'
        ) {
          return onClose()
        }
        const message = nodeData.node.item
        const videoAttach = findMessageVideoLayer(message, routeVideo.id)

        if (!videoAttach) {
          return onClose()
        }

        setLoadedVideo([videoAttach], routeVideo)
        break
      }

      case IRouter.RouteSourceKind.Post:
      case IRouter.RouteSourceKind.Comment:
      case IRouter.RouteSourceKind.Composer:
      case IRouter.RouteSourceKind.ChannelComposer:
      case IRouter.RouteSourceKind.CommentsComposer: {
        loadVideoById(routeVideo)
        break
      }

      default:
        exhaustivenessCheck(source as never)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mediaItems = useMemo(() => (video ? [video] : []), [video])

  return (
    <MediaWindow onClose={onClose}>
      {video && (
        <MediaViewer
          mediaItems={mediaItems}
          onClose={onClose}
          withPhotoContextMenu={!isForwardingDisabled}
        />
      )}
      {routeVideo && !video && <Spinner />}
    </MediaWindow>
  )
}

const spreadAttachVideos = (attaches: Attach.Attaches) => {
  return [
    ...(attaches.videos || []),
    ...(attaches.wall?.attaches.videos || []),
    ...(attaches.wallReply?.attaches.videos || []),
  ]
}

const findMessageVideoLayer = (message: Message.Normal, videoId: number) =>
  findVideoLayer<Message.Normal | Message.Foreign>(
    message,
    (item) => [
      ...(item.forwardedMessages ?? []),
      ...(item.replyMessage && item.replyMessage.kind !== 'ForeignExpired'
        ? [item.replyMessage]
        : []),
    ],
    videoId,
  )

const findVideoLayer = <TreeItem extends { attaches: Attach.Attaches }>(
  root: TreeItem,
  getItemTree: (item: TreeItem) => TreeItem[],
  videoId: number,
): Attach.Video | undefined => {
  const queue: TreeItem[] = [root]

  while (queue.length !== 0) {
    const currentItem = queue.shift()
    if (!currentItem) {
      // Невозможный сценарий
      return undefined
    }
    queue.push(...getItemTree(currentItem))

    const spreadedVideos = spreadAttachVideos(currentItem.attaches)
    const targetVideo = spreadedVideos.find((video) => video.id === videoId)

    if (targetVideo) {
      return targetVideo
    }
  }

  return undefined
}
