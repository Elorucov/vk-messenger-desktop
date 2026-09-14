import React, { ComponentProps, useMemo } from 'react'
import { ColorScheme } from '@vkontakte/vkui'
import { MiniAppBase } from '@vk-ecosystem/mini-app'
import { authWrapper } from '../../utils/authWrapper'
import {
  MiniAppRendererProps,
  MiniAppRenderer,
  API_VERSION,
} from '@vkontakte-internal/messenger'
import { BASE_API_URL, CLIENT_ID } from 'vkme-common'

function getAppearanceByScheme(): (typeof ColorScheme)[keyof typeof ColorScheme] {
  const scheme = document.body.getAttribute('scheme')

  return scheme === 'space_gray' ? ColorScheme.DARK : ColorScheme.LIGHT
}

const MiniApp = ({
  id,
  url,
  title,
  onError,
  onMessage,
  handlers,
  hash,
  requestApiMethod,
  onModalRequest,
  onResizeWindow,
}: MiniAppRendererProps) => {
  const config: ComponentProps<typeof MiniAppBase> = useMemo(() => {
    return {
      app: {
        id,
        title,
        url,
        hash: hash || '',
        query: {},
      },
      config: {
        appearance: getAppearanceByScheme(),
      },
      host: {
        id: CLIENT_ID,
        title: window.location.host,
      },
      apiVersion: API_VERSION,
      onModalRequest,
      apiUrl: `${BASE_API_URL}/method`,
      authUrl: `https://id.vk.com/mini_app_token`,
      onGetHostToken: (refresh?: boolean) =>
        authWrapper.auth(refresh).catch((err) => {
          onError(err.message)

          throw err
        }),
      getLang: () => '',
      onMessage: ({ message }) => {
        onMessage({ event: message.handler, params: message.params })
      },
      handlers,
      requestApiMethod,
      onResizeWindow,
      userId: authWrapper.currentUserId || 0,
    }
  }, [
    id,
    title,
    url,
    hash,
    onModalRequest,
    handlers,
    requestApiMethod,
    onResizeWindow,
    onError,
    onMessage,
  ])

  return <MiniAppBase {...config} />
}

const miniAppsRenderer: MiniAppRenderer = (props) => <MiniApp {...props} />

export { miniAppsRenderer }
