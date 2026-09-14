/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// css из reforged.php
import './base.css'
import './vkui_me.css'
import './ui_search.css'
import './vk_sans_display.css'
// оверрайд десктопа
import '../assets/snackbar_override.css'
// css из reforged/vkme.tsx
import '@vkontakte-internal/messenger/dist/browser/styles/base.css'
import '@vkontakte-internal/messenger/dist/browser/styles/colors.css'
import '@vkontakte-internal/messenger/dist/browser/styles/fonts.css'
import '@vkontakte-internal/messenger/dist/browser/styles/emoji.css'
import '@superappkit/superappkit-widgets/dist/styles.css'
// Оверрайды reforged
import './vkme.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  STORAGE_DB_NAME,
  STORAGE_OWNER_ID_KEY,
  STORAGE_VIEWER_ID_KEY,
  STORAGE_APP_UNAVAILABLE_KEY,
  createStore,
  Engine,
  ChannelEngine,
  VideoEngine,
  Storage,
  Queue,
  ExternalEvents,
  type IEnv,
  initConfig,
  AudioStatsLogger,
  BotKeyboard,
  AppUnavailableFallback,
  BounceDisabler,
  AvatarAreaSelector,
  VideoStickers,
  AppUnavailableReason,
  COMMUNITY_ADMIN_NEED_2FA,
  type IOverrideILang,
  ThemeProvider,
  SferumOffboardingProcess,
} from '@vkontakte-internal/messenger'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import { AppPage } from './components/AppPage/AppPage'
import { BrowserNotifications } from './env/BrowserNotifications'
import { ElectronNotifications } from './env/ElectronNotifications'
import { ElectronRouter } from './env/ElectronRouter'
import { ElectronLang } from './env/ElectronLang'
import { miniAppsRenderer } from './components/MiniApp/MiniApp'
import { OfflinePage } from './components/OfflinePage/OfflinePage'
import { authWrapper } from './utils/authWrapper'
import { setUserEnv } from '@vkontakte-internal/sticker-picker'
import {
  rendererApi,
  request,
  webLogger,
  vkDomain,
  basePath,
} from './utils/api'

import { playSound } from './utils/playSound'
import { prepareBrowserEnv } from './utils/env'
import NotificationSound from '../assets/mp3/notification-sound.mp3?url'
import { Settings } from './libs/settings'
import { commonLogger } from './libs/logger'
import { callsDecorator } from './libs/calls'
import { API_ERROR_SECTION_DISABLED } from '@vkontakte-internal/api-schema-typescript'

import 'url-search-params-polyfill'
import { CallsEvent } from 'vkme-common'
import { createMediaWindow } from './components/MediaRenderer/components/MediaWindow/MediaWindow'
import { registerFullscreenController } from './utils/fullscreen'
import { Button } from '@vkontakte/vkui'
import { exhaustivenessCheck } from '@vkontakte-internal/messenger/dist/core/utils/misc'

export type Listener = (event: Event) => void
export type AsyncListener = (event: Event) => Promise<void>
initConfig()

/**
 * убираем index.html, чтобы рефоржед не сбрасывал локацию и сразу похватил диплинк
 */
if (window.location.pathname.includes('index.html')) {
  window.history.replaceState({}, '', `/${window.location.hash}`)
}

const REPEAT_INIT_TIMEOUT = 5000
const scope = 'init app'

document.addEventListener('auxclick', (e) => e.preventDefault(), false)

const rootContainer = document.getElementById('reforged-root') as HTMLElement
const root = createRoot(rootContainer, { identifierPrefix: 'vkme-root' })

const IS_APP_UNAVAILABLE =
  localStorage.getItem(STORAGE_APP_UNAVAILABLE_KEY) ?? false

const handleAppUnavailable = async () => {
  try {
    localStorage.removeItem(STORAGE_APP_UNAVAILABLE_KEY)

    const translations = await window._translations.getLang()
    const lang = new ElectronLang(webLogger, translations)

    let title, subtitle, buttons
    const reason = Number(IS_APP_UNAVAILABLE) as AppUnavailableReason

    switch (reason) {
      case COMMUNITY_ADMIN_NEED_2FA:
        localStorage.removeItem(STORAGE_OWNER_ID_KEY)
        title = lang.use('me_community_need2fa_title')
        subtitle = lang.use('me_community_need2fa_desc')
        buttons = [
          <Button
            key="link"
            size="m"
            href="https://id.vk.com/account/#/otp-settings"
          >
            {lang.use('me_community_need2fa_action')}
          </Button>,
          <Button
            key="refresh"
            mode="secondary"
            size="m"
            onClick={() => window._common.reloadPage()}
          >
            {lang.use('me_community_need2fa_hide')}
          </Button>,
        ]
        break
      case API_ERROR_SECTION_DISABLED:
      default:
        title = lang.use('me_unavailable_app_caption')
        subtitle = lang.use('me_unavailable_app_subtitle')
        buttons = [
          <Button
            key="refresh"
            size="m"
            onClick={() => window._common.reloadPage()}
          >
            {lang.use('me_refresh')}
          </Button>,
        ]
        break
    }

    root.render(
      <ThemeProvider theme="light" locale={lang.locale}>
        <AppUnavailableFallback
          title={title}
          subtitle={subtitle}
          buttons={buttons}
        />
      </ThemeProvider>,
    )
  } catch (e) {
    commonLogger.error('renderer', scope, 'Unavailable fallback loading failed')
    console.error(e)
  }
}

const engine = new Engine(webLogger, request)

const videoEngine = new VideoEngine(webLogger, request)
const queue = new Queue(webLogger, request)
const videoStickers = new VideoStickers()

registerFullscreenController()

const initAsync = () => {
  Promise.all([
    authWrapper.auth(),
    window._translations.getLang(),
    window._featureFlags.getAfterLoadFeatureFlags(),
    window._common.checkIsOnline(),
    new Settings(window._common.getSettings).init(),
  ])
    .then((results) => {
      const [, translations, featureFlags, isOnline, appSettings] = results
      if (!isOnline) {
        throw new Error('No internet connection')
      }
      window._settings = appSettings

      commonLogger.info(
        'renderer',
        scope,
        'feature toggles',
        JSON.stringify(featureFlags),
      )

      // используется в целях тестирования
      // TODO вынести в настройки
      const updateUrls = featureFlags.vkm_update_url
      if (updateUrls?.url) {
        window._updater.setUpdateUrl(updateUrls.url as string)
      }

      window._credentials.enableLogoutButton()

      const router = new ElectronRouter(featureFlags, vkDomain, basePath)

      try {
        setUserEnv({
          'stickers.ugc': true,
          'stickers.popup': featureFlags.vkm_stickers_popup,
          sticker_picker_fast_select_pack: true,
          static_updates_manager_in_sticker_picker: true,
        })
      } catch (error) {
        webLogger.error('[VKME STICKERS]: set Env failed', error)
      }

      const lang = new ElectronLang(webLogger, translations) as IOverrideILang
      const audioStatsLogger = new AudioStatsLogger(rendererApi.api)
      const imageAreaSelector = new AvatarAreaSelector()

      if (!authWrapper.currentUserId || authWrapper.profileType === undefined) {
        throw Error(
          'Данные о пользователе должны быть доступны до старта приложения',
        )
      }

      const viewerId = authWrapper.currentUserId
      const storedOwnerId = window.localStorage.getItem(STORAGE_OWNER_ID_KEY)
      const ownerId = storedOwnerId
        ? Peer.resolveId(Number(storedOwnerId))
        : undefined
      const resolvedOwnerId = checkOwnerId(viewerId, ownerId)

      const storageId = Peer.resolveId(resolvedOwnerId || viewerId)
      const storage = new Storage(STORAGE_DB_NAME, storageId, webLogger)

      const isBrowserNotificationsOn = storage.get(
        'settings-browser-notifications-on',
      ) as boolean | undefined

      if (isBrowserNotificationsOn == null) {
        storage.set('settings-browser-notifications-on', true)
      }

      const browserNotifications = new BrowserNotifications(
        isBrowserNotificationsOn == null ? true : isBrowserNotificationsOn,
      )

      const notification = new ElectronNotifications(
        vkDomain,
        browserNotifications,
        NotificationSound,
        undefined,
      )

      const botKeyboard = new BotKeyboard(router, vkDomain)
      const externalEvents = new ExternalEvents()

      const sferumOffboardingProcess = authWrapper.checkIsEducationProfile()
        ? new SferumOffboardingProcess(
            rendererApi.api,
            router,
            storage,
            webLogger,
          )
        : undefined

      const envFeatureFlags = {
        dispose(): void {},
        themeStyles: true,
        isVKCOMLayoutModeChangeAvailable: false,
        isPostponedMessagesAvailable: false,
        isChannelsFolderAvailable: false,
        isManagedGroupsFolderAvailable: false,
        isCommunityMessagingEnabled: false,
      }

      const browserEnv = prepareBrowserEnv(
        featureFlags,
        authWrapper.currentUserId,
        storageId,
        {
          lang,
          browserNotifications,
          calls: callsDecorator,
          imageAreaSelector,
          botKeyboard,
          router,
          externalEvents,
          storage,
          isEduAvailable: true,
          videoStickers,
          shouldOpenFilesPreview: false,
          envFeatureFlags,
          sferumOffboardingProcess,
        },
      )

      const channelEngine = featureFlags.vkm_old_channels_mock
        ? undefined
        : new ChannelEngine(webLogger, request)

      const env: IEnv = {
        api: rendererApi.api,
        engine,
        channelEngine,
        videoEngine,
        calls: callsDecorator,
        queue,
        logger: browserEnv.logger,
        storage: browserEnv.storage,
        stats: browserEnv.stats,
        notification,
        videoStickers,
        envFeatureFlags,
      }

      audioStatsLogger.observePlayer(browserEnv.player)
      audioStatsLogger.observeRouter(browserEnv.router)

      const bounceDisabler = BounceDisabler.supported()
        ? new BounceDisabler()
        : undefined
      bounceDisabler?.enable()

      const store = createStore(
        env,
        featureFlags,
        undefined,
        { isChannelRecommendationsEnabled: true, languageLocale: lang.locale },
        viewerId,
        ownerId,
        authWrapper.profileType,
      )
      const initEnv = () => {
        notification.setEnv(browserEnv, store)
        imageAreaSelector.setEnv(browserEnv, store)
        rendererApi.initCaptcha(lang, storage)
        rendererApi.initCua(rendererApi.api)
        // TODO: сделать сеттер для ленга в рефе в Api
        // @ts-expect-error
        rendererApi.api.lang = lang.locale
      }

      initEnv()

      // необходимо каждую смену языка выполнять инициализации, чтобы встали лангпаки
      lang.subscribe(() => {
        initEnv()
      })

      function selectPeer(peerId: number) {
        externalEvents.send('select-peer', {
          peerId,
          entrypoint: 'top_messenger_list_all',
        })
      }

      function changeAccount(viewerId: Peer.UserId) {
        window.localStorage.setItem(STORAGE_VIEWER_ID_KEY, String(viewerId))
        // Локально приходит только один токен, не обрабатываем смену аккаунта
        changeOwner(viewerId)
      }

      async function changeOwner(ownerId: number) {
        window.localStorage.setItem(STORAGE_OWNER_ID_KEY, String(ownerId))

        const resolvedOwnerId = Peer.resolveId(ownerId)

        if (
          !Peer.isUserPeerId(resolvedOwnerId) &&
          !Peer.isGroupPeerId(resolvedOwnerId)
        ) {
          return
        }

        if (
          !Peer.isGroupPeerId(resolvedOwnerId) &&
          resolvedOwnerId !== authWrapper.currentUserId
        ) {
          // асинхронное, подгрузим во время перезагрузки
          window._credentials.switchUser(resolvedOwnerId)
        }

        /**
         * Рефоржед самостоятельно хендлит роут перед сменой юзера\сообщества,
         * поэтому нам нужно передать путь в состояние после перезагрузки
         */
        window._common.reloadPage()
      }

      const registerAccount = (profileType: 'edu' | 'normal') => {
        window.localStorage.removeItem(STORAGE_OWNER_ID_KEY)
        authWrapper.openLoginPage(profileType)
      }

      const renderFinishCallback = () => {
        window.removeEventListener('online', initAsync)
        commonLogger.info('renderer', scope, 'Init messenger render finished')
      }

      root.render(
        <AppPage
          env={browserEnv}
          store={store}
          onPeerSelect={selectPeer}
          onOwnerChange={changeOwner}
          onAccountChange={changeAccount}
          onRegisterAccount={registerAccount}
          onLogout={authWrapper.handleLogout}
          miniAppsRenderer={miniAppsRenderer}
          renderFinishCallback={renderFinishCallback}
        />,
      )
      // В чем проблема метод history.push класса Router не сработает до тех пор, пока на обновления никто не подпишется
      // но у нас может быть диплинк при старте приложения и рефорж не может его определить
      // Этот костыль не опасный, потому что не влияет на логику рендера и будет отписан после старта
      // https://gitlab.mvk.com/messenger/reforged/-/blob/1a8224129b5ddfb11943121cc957ea14318dcc3b/src/data/env/Router.ts#L200
      const routerUnSub = router.subscribe(() => {
        commonLogger.info('renderer', scope, 'router subscribe')
      })
      setTimeout(routerUnSub, 1000)

      store.start()

      window.env = env
      window.browserEnv = browserEnv
      window.store = store

      if (featureFlags.vkm_fullscreen_gallery) {
        createMediaWindow(true)
      }

      window._common.onNavigate((path) => {
        commonLogger.debug('renderer', scope, 'navigated to', path)
        const route = router.fromUrl(path)
        router.push(route)
      })

      window._common?.onPlaySound(() => {
        playSound()
      })

      window._calls.onProcessRouterPush((args) => {
        router.push(args)
        window._common.showMainWindow()
      })

      window._calls.onToggleCallsWindowState((state) => {
        document.dispatchEvent(
          new CustomEvent(CallsEvent.TOGGLE_CALLS_WINDOW_STATE, {
            detail: { state },
          }),
        )
      })

      function checkOwnerId(viewerId: number, ownerId?: number) {
        if (ownerId && Peer.isGroupPeerId(Peer.resolveId(ownerId))) {
          const isAllowedOwnerId = true
          // TODO: implement fetch for the rights
          // const isAllowedOwnerId =
          //   window.vkmeGroups.findIndex((groupId: number) => ownerId === -groupId) >
          //   -1
          const resolvedViewerId = Peer.resolveId(viewerId)
          if (!isAllowedOwnerId && Peer.isUserPeerId(resolvedViewerId)) {
            changeAccount(resolvedViewerId)
            return
          }

          return ownerId
        }
        return
      }
    })
    .catch(async (error) => {
      const translations = await window._translations.getLang()
      const lang = new ElectronLang(webLogger, translations) as IOverrideILang

      commonLogger.error('renderer', scope, 'initAsync', error)
      root.render(<OfflinePage lang={lang} />)
      setTimeout(initAsync, REPEAT_INIT_TIMEOUT)
    })
}

if (IS_APP_UNAVAILABLE) {
  handleAppUnavailable()
} else {
  initAsync()
}
