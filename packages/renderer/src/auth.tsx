import './base.css'
import './vkui_me.css'
import './ui_search.css'
import './vk_sans_display.css'

import '@vkontakte-internal/messenger/dist/browser/ui/MEApp/MEApp.css'
import '@vkontakte-internal/messenger/dist/browser/styles/base.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { AdaptivityProvider } from '@vkontakte/vkui'
import { UnauthorizedPage } from './components/UnauthorizedPage/UnauthorizedPage'
import { Provider } from '@vkontakte-internal/messenger/dist/browser/ui/Provider/Provider'
import {
  Modals,
  IOverrideILang,
  createStore,
  IApi,
  IEngine,
  IQueue,
  IStorage,
  IEnv,
  IIdle,
  IExternalEvents,
  BotKeyboard,
  GeoLocation,
  Uploader,
  IRecorder,
  MEAppMediaMediator,
  MEAppPlayer,
  MEAppVoicePlayer,
  IBrowserEnv,
} from '@vkontakte-internal/messenger'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import { ViewerReturn } from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import * as Sentry from '@sentry/electron/renderer'
import { initSentry } from 'vkme-common'
import { Settings } from './libs/settings'
import { LangProvider } from './hooks/useLang'
import { basePath, vkDomain, webLogger } from './utils/api'
import { ElectronLang } from './env/ElectronLang'
import { ElectronRouter } from './env/ElectronRouter'
import { AuthRouterProvider } from './hooks/useAuthRouter'
import { VideoMessagePlayer } from '@vkontakte-internal/messenger/dist/browser/env/VideoMessagePlayer/VideoMessagePlayer'
import {
  ConvoAudioTrack,
  ConvoVoiceTrack,
} from '@vkontakte-internal/messenger/dist/data/env/IPlayer'

const rootContainer = document.getElementById('root') as HTMLElement
const root = createRoot(rootContainer, { identifierPrefix: 'auth-root' })
window._settings = new Settings(window._common.getSettings)

initSentry(Sentry.init)

const scope = 'auth entry'

if (root) {
  const asyncInit = async () => {
    const [translations, appSettings, featureFlags] = await Promise.all([
      window._translations.getLang(),
      new Settings(window._common.getSettings).init(),
      window._featureFlags.getAfterLoadFeatureFlags(),
    ])
    window._settings = appSettings

    const modals = {
      stack: new Modals.Stack(),
      dispose(): void {},
    }

    const lang = new ElectronLang(webLogger, translations) as IOverrideILang
    const isMemoryHistory = true // для наглядности
    const router = new ElectronRouter(
      featureFlags,
      vkDomain,
      basePath,
      isMemoryHistory,
    )

    window._common.onNavigate((path) => {
      window._log.debug('renderer', scope, 'navigated to', path)
      const route = router.fromUrl(path)
      router.push(route)
    })

    const mockApi: IApi.IApi = {
      dispose(): void {},
      async fetch() {
        return Promise.reject(
          'Нет никакого апи для незалогиненного пользователя',
        )
      },
      fetchMany() {
        return Promise.reject(
          'Нет никакого апи для незалогиненного пользователя',
        )
      },
      fetchSeq() {
        return Promise.reject(
          'Нет никакого апи для незалогиненного пользователя',
        )
      },
      fetchForExternalLibs() {
        return Promise.reject(
          'Нет никакого апи для незалогиненного пользователя',
        )
      },
      dangerouslyAbort() {
        return Promise.reject(
          'Нет никакого апи для незалогиненного пользователя',
        )
      },
    }

    const mockEngine = {
      dispose(): void {},
      connect(_config: IEngine.Config) {},
      disconnect() {},
      poll(): Promise<IEngine.Next> {
        return Promise.resolve({
          kind: 'Failure',
        })
      },
      isConnected(): boolean {
        return true
      },
      version: 0,
    }

    const mockLogger = {
      error: console.error,
      info: console.info,
      dispose(): void {},
    }

    const mockQueue = {
      dispose(): void {},
      connect(_config: IQueue.Config) {},
      poll(): Promise<IQueue.Next> {
        return Promise.resolve({
          kind: 'Reconnecting',
        })
      },
      disconnect(): void {},
      reconnect(): void {},
      isConnected(): boolean {
        return false
      },
    }

    const mock = new Map()
    const mockStorage: IStorage.IStorage = {
      dispose(): void {},
      del(key) {
        mock.delete(key)
      },
      get(key) {
        return mock.get(key) as IStorage.LSEntries[typeof key]
      },
      set(key, value) {
        mock.set(key, value)
      },
      async getIDB(key) {
        return mock.get(key) as IStorage.IDBEntries[typeof key]
      },
      async setIDB(key, value) {
        mock.set(key, value)
      },
      async updateIDB(key, updater) {
        const value = updater(mock.get(key) as IStorage.IDBEntries[typeof key])

        mock.set(key, value)
      },
      async delIDB(key) {
        mock.delete(key)
      },
    }

    const mockStats = {
      dispose(): void {},
      init() {},
      logEvent: () => {},
      trackExternalEvent: () => {},
    }

    const mockNotification = {
      dispose(): void {},
      notify: () => {},
      notifyListeners: () => {},
      playSound: () => {},
      setCounters: () => {},
      setIdleCounter: () => {},
      removeNotification: () => {},
    }

    const envFeatureFlags = {
      dispose(): void {},
      themeStyles: true,
      isVKCOMLayoutModeChangeAvailable: false,
      isPostponedMessagesAvailable: false,
    }

    const mockIdle: IIdle.IIdle = {
      dispose(): void {},
      isIdle() {
        return false
      },
      subscribe(_listener) {
        return () => {}
      },
    }

    const mockExternalEvents: IExternalEvents.ISubscribe = {
      dispose(): void {},
      subscribe(_listener) {
        return () => {}
      },
    }

    const mockVoiceRecorder: IRecorder.IRecorder = {
      dispose(): void {},
      start: () => Promise.resolve(),
      stop: () => Promise.resolve(),
      pause: () => Promise.resolve(),
      resume: () => Promise.resolve(),

      onStart: () => {},
      onPause: () => {},
      onResume: () => {},
      onStop: () => {},

      onDataAvailable: () => {},
      subscribeToAnalyzer: () => [],
    }

    const anonymViewer = {
      accounts: [],
      id: 0.1, // очень грязный хак, но иначе анонимный экран в деве не запустить
      settings: {},
      viewer: {},
    } as unknown as ViewerReturn

    const mediaMediator = new MEAppMediaMediator(anonymViewer.id)
    const player = new MEAppPlayer<ConvoAudioTrack>(
      mediaMediator,
      anonymViewer.id,
    )
    const voicePlayer = new MEAppVoicePlayer<ConvoVoiceTrack>(
      mediaMediator,
      anonymViewer.id,
    )

    const videoMessagePlayer = new VideoMessagePlayer(mockStorage)

    const env: IEnv = {
      api: mockApi,
      engine: mockEngine,
      queue: mockQueue,
      logger: mockLogger,
      storage: mockStorage,
      stats: mockStats,
      notification: mockNotification,
      envFeatureFlags,
    }

    const browserEnv: IBrowserEnv = {
      vkDomain: 'vk.com',
      storage: mockStorage,
      api: mockApi,
      lang: lang,
      logger: mockLogger,
      stats: mockStats,
      modals,
      envFeatureFlags,
      router: router,
      idle: mockIdle,
      externalEvents: mockExternalEvents,
      botKeyboard: new BotKeyboard(router, 'vk.com'),
      geoLocation: new GeoLocation(),
      uploader: new Uploader(env.api, featureFlags),
      voiceRecorder: mockVoiceRecorder,
      player,
      voicePlayer,
      videoMessagePlayer,
    }

    const store = createStore(
      env,
      featureFlags,
      undefined,
      undefined,
      anonymViewer.id,
    )

    const state = store.getState()

    const owner = Peer.safeGet(state.peers, state.ownerId)

    root.render(
      <React.StrictMode>
        <AdaptivityProvider>
          <LangProvider value={lang}>
            <AuthRouterProvider router={router}>
              <Provider
                env={browserEnv}
                state={state}
                store={store}
                owner={owner}
                layoutMode="two-column"
                imagesLayoutEdgeSizes={{
                  width: 250,
                  minHeight: 50,
                  maxSingleHeight: 250,
                  preferredRatio: 1,
                }}
              >
                <UnauthorizedPage locale={lang.locale} />
              </Provider>
            </AuthRouterProvider>
          </LangProvider>
        </AdaptivityProvider>
      </React.StrictMode>,
    )
  }
  asyncInit()
}
