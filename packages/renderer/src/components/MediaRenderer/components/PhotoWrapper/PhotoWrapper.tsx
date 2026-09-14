import React, { FC, useCallback, useEffect, useState } from 'react'
import {
  useBrowserEnv,
  useFeatureFlags,
  useViewer,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { MediaWindow } from '../MediaWindow'
import { MediaViewer } from '../MediaViewer'
import { Spinner } from '@vkontakte/vkui'
import * as Attach from '@vkontakte-internal/messenger/dist/core/model/Attach'
import * as Message from '@vkontakte-internal/messenger/dist/core/model/Message'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import * as Convo from '@vkontakte-internal/messenger/dist/core/model/Convo'
import * as Channel from '@vkontakte-internal/messenger/dist/core/model/Channel'
import * as History from '@vkontakte-internal/messenger/dist/core/model/History'
import * as Post from '@vkontakte-internal/messenger/dist/core/model/Post'
import * as Comment from '@vkontakte-internal/messenger/dist/core/model/Comment'
import {
  exhaustivenessCheck,
  isDev,
} from '@vkontakte-internal/messenger/dist/core/utils/misc'
import {
  fromApiPhoto,
  fromApiWallAttach,
} from '@vkontakte-internal/messenger/dist/data/converter/AttachConverter'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { State } from '@vkontakte-internal/messenger/dist/data/store/State'
import { useApiFetch } from '@vkontakte-internal/messenger/dist/browser/hooks/useApiFetch'
import { fromApiMessage } from '@vkontakte-internal/messenger/dist/data/converter/MessageConverter'
import { fromApiComment } from '@vkontakte-internal/messenger/dist/data/converter/CommentConverter'

type Props = {
  photoModal?: IRouter.PhotoModal
  /**
   * Кэш бесед
   */
  convos: Convo.Cache
  /**
   * Кэш каналов
   */
  channels: Channel.Cache
  /**
   * Черновики сообщений
   */
  composerDrafts: State['composerDrafts']
  /**
   * Черновики постов каналов
   */
  channelComposerDrafts: State['channelComposerDrafts']
  /**
   * Черновики комментов постов
   */
  commentsComposerDrafts: State['commentsComposerDrafts']
}

export const PhotoWrapper: FC<Props> = ({
  photoModal,
  convos,
  channels,
  composerDrafts,
  channelComposerDrafts,
  commentsComposerDrafts,
}) => {
  const viewer = useViewer()
  const { router } = useBrowserEnv()
  const { screenRoute } = router
  const apiFetch = useApiFetch()
  const featureFlags = useFeatureFlags()

  const [photoViewer, setPhotoViewer] = useState<{
    photos: Attach.Photo[]
    initialPhotoIdx: number
  }>({
    photos: [],
    initialPhotoIdx: 0,
  })

  const closePhotoViewer = useCallback(() => {
    router.pop()
  }, [router])

  const peerId: Peer.Id | undefined =
    screenRoute.kind === 'ConvoRoute' ? screenRoute.peerId : undefined
  const channelId: Channel.Id | undefined =
    screenRoute.kind === 'ChannelRoute' ? screenRoute.channelId : undefined
  const postCmid: Post.Cmid | undefined =
    screenRoute.kind === 'ChannelRoute' ? screenRoute.postCmid : undefined

  const convo = peerId && convos.get(peerId)
  const isForwardingDisabled =
    !!convo && Convo.isMessagesForwardingDisabled(convo)

  /** Осуществляет переход к следующей фотографии */
  const handleMediaViewerMove = useCallback(
    (newMedia: Attach.Photo) => {
      if (!photoModal || newMedia.id === photoModal?.id) {
        return
      }
      router.replace({ ...photoModal, id: newMedia.id })
    },
    [router, photoModal],
  )

  /** Передает на отображение в PhotoViewer загруженные фотографии */
  const setLoadedPhotos = useCallback(
    (loadedPhotos: Attach.Photo[], photoModal: IRouter.PhotoModal) => {
      const targetPhotoIdx = loadedPhotos.findIndex(
        (attachPhoto) => attachPhoto.id === photoModal.id,
      )
      if (targetPhotoIdx === -1) {
        return closePhotoViewer()
      }

      setPhotoViewer({
        photos: loadedPhotos,
        initialPhotoIdx: targetPhotoIdx,
      })
    },
    [closePhotoViewer],
  )

  /**
   * Загрузка фотографий по messageId из messageAccessKey
   */
  const loadPhotosByMessageAccessKey = useCallback(
    async (messageAccessKey: string, photoId: number) => {
      const { messageIdMatch } =
        /mail(?<messageIdMatch>\d+-\d+)/gi.exec(messageAccessKey)?.groups || {}

      if (!messageIdMatch) {
        throw new Error('Передан некорректный messageAccessKey')
      }

      const [rawPeerId, rawCmid] = messageIdMatch.split('-')

      const peerId = Peer.resolveId(Number(rawPeerId))
      const cmid = Message.resolveCmid(Number(rawCmid))

      const response = await apiFetch('messages.getById', {
        peer_id: peerId,
        cmids: cmid.toString(),
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

      return getPhotosFromMessage(message, photoId)
    },
    [apiFetch, featureFlags, viewer],
  )

  /**
   * Загрузка фотографий по postCmid
   */
  const loadPhotosByPostCmid = useCallback(
    async (source: IRouter.RouteSourcePost) => {
      const response = await apiFetch('channels.getMessagesById', {
        channel_id: source.channelId,
        extended: 1,
        cmids: source.cmid.toString(),
      })

      const apiPostWall = response.items?.[0]?.attachments?.[0]?.wall

      if (!apiPostWall) {
        throw new Error('Не удалось получить пост')
      }

      return fromApiWallAttach(apiPostWall).photos
    },
    [apiFetch],
  )

  /**
   * Загрузка фотографий по commentCmid
   */
  const loadPhotosByCommentCmid = useCallback(
    async (source: IRouter.RouteSourceComment, photoId: number) => {
      const response = await apiFetch('wall.getComments', {
        owner_id: source.channelId,
        post_id: source.postCmid,
        start_comment_id: source.commentCmid,
        count: 1,
        offset: 0,
        extended: 1,
      })

      const apiComment = response.items[0]

      if (!apiComment) {
        throw new Error('Не удалось получить комментарий')
      }
      const comment = fromApiComment(apiComment)

      if (comment.kind !== 'Normal') {
        return undefined
      }
      return getPhotosFromComment(comment, photoId)
    },
    [apiFetch],
  )

  /**
   * Загрузка фотографий по photoId
   */
  const loadPhotosById = useCallback(
    async (photoModal: IRouter.PhotoModal) => {
      const { ownerId, id, accessKey } = photoModal

      try {
        const response = await apiFetch('photos.getById', {
          photos: `${ownerId}_${id}${accessKey ? `_${accessKey}` : ''}`,
          extended: 1,
          photo_sizes: 1,
        })

        const loadedPhotos = response.reduce<Attach.Photo[]>(
          (acc, apiPhoto) => {
            const photo = fromApiPhoto({ apiPhoto })
            if (photo) {
              acc.push(photo)
            }
            return acc
          },
          [],
        )

        setLoadedPhotos(loadedPhotos, photoModal)
      } catch (err) {
        if (isDev) {
          throw err
        }
        closePhotoViewer()
      }
    },
    [apiFetch, closePhotoViewer, setLoadedPhotos],
  )

  useEffect(() => {
    if (!photoModal) {
      return closePhotoViewer()
    }

    const { source } = photoModal

    if (!source) {
      loadPhotosById(photoModal)
      return () => {}
    }

    const loadPhotosFromApi = async (
      photosPromise: Promise<Attach.Photo[] | undefined>,
    ) => {
      try {
        const apiPhotos = await photosPromise
        if (!apiPhotos) {
          return closePhotoViewer()
        }

        setLoadedPhotos(apiPhotos, photoModal)
      } catch (err: unknown) {
        loadPhotosById(photoModal)
        if (isDev) {
          throw err
        }
      }
    }

    switch (source.kind) {
      case IRouter.RouteSourceKind.Message: {
        const convo = convos.get(source.peerId)
        const message = convo && Convo.findMessageByCmid(convo, source.cmid)

        if (!message) {
          if (source.messageAccessKey) {
            loadPhotosFromApi(
              loadPhotosByMessageAccessKey(
                source.messageAccessKey,
                photoModal.id,
              ),
            ).catch(() => {
              // @todo разобраться почему прилетает неправильный source.messageAccessKey
              loadPhotosById(photoModal)
            })
            break
          }
          loadPhotosById(photoModal)
          break
        }

        if (message.kind === 'Service' || message.kind === 'Expired') {
          return closePhotoViewer()
        }

        const messagePhotos = getPhotosFromMessage(message, photoModal.id)

        if (!messagePhotos) {
          return closePhotoViewer()
        }

        setLoadedPhotos(messagePhotos, photoModal)
        break
      }

      case IRouter.RouteSourceKind.Post: {
        const channel = channels.get(source.channelId)

        if (channel === undefined) {
          loadPhotosFromApi(loadPhotosByPostCmid(source))
          break
        }

        if (channel.kind === 'ChannelRestricted') {
          return closePhotoViewer()
        }

        const nodeData = History.findNodeByCmid(channel.history, source.cmid)

        if (nodeData.status === 'NotLoaded') {
          loadPhotosFromApi(loadPhotosByPostCmid(source))
          break
        }

        if (nodeData.status === 'Deleted') {
          return closePhotoViewer()
        }

        const post = nodeData.node.item
        setLoadedPhotos(spreadAttachPhotos(post.attaches), photoModal)
        break
      }

      case IRouter.RouteSourceKind.Comment: {
        const channel = channels.get(source.channelId)

        if (!channel) {
          return closePhotoViewer()
        }

        if (channel.kind === 'ChannelRestricted') {
          return closePhotoViewer()
        }

        const nodeData = History.findNodeByCmid(
          channel.history,
          source.postCmid,
        )

        if (nodeData?.status === 'Deleted') {
          return closePhotoViewer()
        }

        const post = nodeData?.status === 'Node' && nodeData.node.item
        const comment = post && Post.findCommentByCmid(post, source.commentCmid)
        if (!comment) {
          loadPhotosFromApi(loadPhotosByCommentCmid(source, photoModal.id))
          break
        }

        if (comment.kind === 'Deleted') {
          return closePhotoViewer()
        }

        const commentPhotos = getPhotosFromComment(comment, photoModal.id)

        if (!commentPhotos) {
          return closePhotoViewer()
        }

        setLoadedPhotos(commentPhotos, photoModal)
        break
      }

      case IRouter.RouteSourceKind.Composer: {
        if (!peerId) {
          return closePhotoViewer()
        }

        const composerPeerDrafts = composerDrafts[peerId]
        const composerDraft =
          composerPeerDrafts &&
          composerPeerDrafts[composerPeerDrafts.length - 1]
        if (!composerDraft) {
          return closePhotoViewer()
        }

        setLoadedPhotos(spreadAttachPhotos(composerDraft.attaches), photoModal)
        break
      }

      case IRouter.RouteSourceKind.ChannelComposer: {
        if (!channelId) {
          return closePhotoViewer()
        }

        const composerDraft = channelComposerDrafts[channelId]
        if (!composerDraft) {
          return closePhotoViewer()
        }

        setLoadedPhotos(spreadAttachPhotos(composerDraft.attaches), photoModal)
        break
      }

      case IRouter.RouteSourceKind.CommentsComposer: {
        if (!channelId || !postCmid) {
          return closePhotoViewer()
        }

        const composerDraft = commentsComposerDrafts[`${channelId}-${postCmid}`]
        if (!composerDraft) {
          return closePhotoViewer()
        }

        setLoadedPhotos(spreadAttachPhotos(composerDraft.attaches), photoModal)
        break
      }

      default:
        exhaustivenessCheck(source as never)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MediaWindow onClose={closePhotoViewer}>
      {photoViewer.photos.length ? (
        <MediaViewer
          mediaItems={photoViewer.photos}
          initialIdx={photoViewer.initialPhotoIdx}
          onPrev={handleMediaViewerMove}
          onNext={handleMediaViewerMove}
          onClose={closePhotoViewer}
          withPhotoContextMenu={!isForwardingDisabled}
        />
      ) : (
        <Spinner />
      )}
    </MediaWindow>
  )
}

/** Вытаскивает фотографии из всех уровней атачей */
const spreadAttachPhotos = (attaches: Attach.Attaches) => {
  return [
    ...(attaches.photos || []),
    ...(attaches.wall?.attaches.photos || []),
    ...(attaches.wallReply?.attaches.photos || []),
  ]
}

const getPhotosFromMessage = (message: Message.Normal, photoId: number) =>
  findPhotoLayer<Message.Normal | Message.Foreign>(
    message,
    (item) => {
      const layer = []

      if (item.forwardedMessages) {
        layer.push(...item.forwardedMessages)
      }

      if (item.replyMessage && item.replyMessage.kind !== 'ForeignExpired') {
        layer.push(item.replyMessage)
      }

      return layer
    },
    photoId,
  )

const getPhotosFromComment = (
  comment: Comment.Normal | Comment.MarkedDeleted,
  photoId: number,
) =>
  findPhotoLayer<Comment.Normal | Comment.MarkedDeleted>(
    comment,
    (item) =>
      item.replies.history.filter(
        (reply): reply is Comment.Normal => reply.kind === 'Normal',
      ) || [],
    photoId,
  )

/** Собирает фотографии с переданного объекта, имеющего attaches */
const findPhotoLayer = <TreeItem extends { attaches: Attach.Attaches }>(
  root: TreeItem,
  getItemTree: (item: TreeItem) => TreeItem[],
  photoId: number,
): Attach.Photo[] | undefined => {
  const queue: TreeItem[] = [root]

  while (queue.length !== 0) {
    const currentItem = queue.shift()
    if (!currentItem) {
      // Невозможный сценарий
      return undefined
    }
    queue.push(...getItemTree(currentItem))

    const spreadedPhotos = spreadAttachPhotos(currentItem.attaches)
    const hasTargetPhoto =
      spreadedPhotos.findIndex((attachPhoto) => attachPhoto.id === photoId) !==
      -1

    if (hasTargetPhoto) {
      return spreadedPhotos
    }
  }

  return undefined
}
