import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { HistoryScreen } from '@vkontakte-internal/calls-history'
import {
  type Bridge,
  HistoryScreenSections,
  type IHistoryConfig,
  type INavigateToConvo,
  type INavigateToProfile,
  type QueueService,
  type CallsQueueServiceUnsubscribe,
} from '@vkontakte-internal/calls-core'
import { BrowserLangs } from './libs/diImplementations/BrowserLangs'
import type { IApi } from '@vkontakte-internal/messenger'
import { createAPIClientImplementation } from './libs/diImplementations/BrowserAPIClient'

export function renderCallHistory({
  api,
  rootElement,
  bridge,
  navigateToProfile,
  navigateToConvo,
  config,
  subscribe = (): CallsQueueServiceUnsubscribe => () => {},
  section = HistoryScreenSections.ALL,
}: {
  api: IApi.IApi
  rootElement: Element
  bridge: Bridge
  navigateToConvo: INavigateToConvo
  navigateToProfile: INavigateToProfile
  config: IHistoryConfig
  subscribe?: QueueService['subscribe']
  section?: HistoryScreenSections
}): Root {
  const root = createRoot(rootElement)
  root.render(
    <HistoryScreen
      dependencies={{
        APIClientImpl: createAPIClientImplementation(api),
        LangsImpl: BrowserLangs,
        subscribe,
        Bridge: bridge,
        navigateToConvo,
        navigateToProfile,
      }}
      config={config}
      messenger={{
        isMessengerEnv: true,
        onNavigate: () => {
          root.unmount()
        },
        startedSection: section,
      }}
    />,
  )
  return root
}
