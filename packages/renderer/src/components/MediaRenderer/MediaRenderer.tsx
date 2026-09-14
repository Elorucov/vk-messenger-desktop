import React, { ComponentProps } from 'react'
import { MEApp } from '@vkontakte-internal/messenger'
import { exhaustivenessCheck } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import {
  MediaWrapper,
  ChannelMediaWrapper,
  PhotoWrapper,
  VideoPlayerWrapper,
} from './components'

export const mediaRenderer: ComponentProps<typeof MEApp>['mediaRenderer'] = ({
  modal,
  isHidden,
  contextClass,
  ...rest
}) => {
  // Сквозной просмотр в чате
  if (isModalSourceMessageWithMediaViewer(modal)) {
    return <MediaWrapper modal={modal} {...rest} />
  }

  // Сквозной просмотр в каналах
  if (isModalSourcePostWithMediaViewer(modal)) {
    return <ChannelMediaWrapper modal={modal} {...rest} />
  }

  switch (modal.kind) {
    case 'VideoModal':
      return <VideoPlayerWrapper routeVideo={modal} />

    case 'PhotoModal':
      return <PhotoWrapper photoModal={modal} {...rest} />

    default:
      return exhaustivenessCheck(modal)
  }
}

type RouteSourceMessageWithMediaViewer = IRouter.RouteSourceMessage & {
  mediaViewerItemPosition: number
}

function isModalSourceMessageWithMediaViewer(
  modal: IRouter.PhotoModal | IRouter.VideoModal,
): modal is
  | IRouter.PhotoModal<RouteSourceMessageWithMediaViewer>
  | IRouter.VideoModal<RouteSourceMessageWithMediaViewer> {
  return (
    modal.source?.kind === IRouter.RouteSourceKind.Message &&
    !!modal.source.mediaViewerItemPosition
  )
}

type RouteSourcePostWithMediaViewer = IRouter.RouteSourcePost & {
  mediaViewerItemPosition: number
}

function isModalSourcePostWithMediaViewer(
  modal: IRouter.PhotoModal | IRouter.VideoModal,
): modal is IRouter.PhotoModal<RouteSourcePostWithMediaViewer> {
  return (
    modal.source?.kind === IRouter.RouteSourceKind.Post &&
    !!modal.source.mediaViewerItemPosition &&
    // пока только для фото
    modal.kind === 'PhotoModal'
  )
}
