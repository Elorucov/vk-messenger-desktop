import React from 'react'
import { createRoot } from 'react-dom/client'

// css из reforged.php
import './base.css'
import './vkui_me.css'
import './ui_search.css'
import './vk_sans_display.css'

// css из reforged/vkme.tsx
import '@vkontakte-internal/messenger/dist/browser/styles/base.css'
import '@vkontakte-internal/messenger/dist/browser/styles/colors.css'
import '@vkontakte-internal/messenger/dist/browser/styles/fonts.css'
import '@vkontakte-internal/messenger/dist/browser/styles/emoji.css'

// Необходимо импортировать @vkontakte-internal/calls/calls.css через css файл из-за особенности резолва пакетов с exports
import './calls.css'

import '../assets/callsWindowOverrides.css'

import { getEmojiConfig } from './emoji'
import { Calls } from './calls'
import {
  ExternalEvents,
  BotKeyboard,
  STORAGE_DB_NAME,
  Storage,
  IOverrideILang,
  STORAGE_OWNER_ID_KEY,
} from '@vkontakte-internal/messenger'
import { authWrapper } from './utils/authWrapper'
import { CallsEvent, CallsMethodParams } from 'vkme-common'
import { basePath, rendererApi, vkDomain, webLogger } from './utils/api'
import { CallsPage } from './libs/calls'
import { prepareBrowserEnv } from './utils/env'
import { ElectronRouter } from './env/ElectronRouter'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import { enableMapSet } from 'immer'
import { ElectronLang } from './env/ElectronLang'
import { CallStatSource } from '@vkontakte-internal/calls-core'
import { initCallsDi } from './diCalls'

enableMapSet()

Promise.all([
  authWrapper.auth(),
  window._translations.getLang(),
  window._featureFlags.getAfterLoadFeatureFlags(),
]).then(([, translations, featureFlags]) => {
  if (!authWrapper.currentUserId || authWrapper.profileType === undefined) {
    throw Error(
      'Данные о пользователе должны быть доступны до старта приложения',
    )
  }

  const viewerId = authWrapper.currentUserId

  initCallsDi(viewerId)

  const storedOwnerId = window.localStorage.getItem(STORAGE_OWNER_ID_KEY)
  const ownerId = storedOwnerId
    ? Peer.resolveId(Number(storedOwnerId))
    : undefined
  const resolvedOwnerId = ownerId // скипаем checkOwnerId, потому что она выполняются в vkmEntry

  const storageId = Peer.resolveId(resolvedOwnerId || viewerId)
  const storage = new Storage(STORAGE_DB_NAME, storageId, webLogger)

  const lang = new ElectronLang(webLogger, translations) as IOverrideILang
  rendererApi.initCaptcha(lang, storage)
  rendererApi.initCua(rendererApi.api)
  const externalEvents = new ExternalEvents()

  const router = new ElectronRouter(featureFlags, vkDomain, basePath)
  const botKeyboard = new BotKeyboard(router, vkDomain)

  const envFeatureFlags = {
    dispose(): void {},
    themeStyles: true,
    isVKCOMLayoutModeChangeAvailable: false,
    isPostponedMessagesAvailable: false,
  }

  const browserEnv = prepareBrowserEnv(
    featureFlags,
    authWrapper.currentUserId,
    storageId,
    {
      lang,
      botKeyboard,
      router,
      externalEvents,
      storage,
      envFeatureFlags,
    },
  )

  const calls = new Calls(
    CallStatSource.VKME_JOIN,
    authWrapper.currentUserId || 0,
    authWrapper.checkIsEducationProfile(),
    rendererApi.api,
    browserEnv.stats,
    translations,
    featureFlags,
  )

  window._calls.onProcessCallsMethod((params: CallsMethodParams) => {
    // в onProcessCallsMethod всегда передается связка: метод + аргументы
    // @ts-expect-error
    calls[params.method]?.apply(null, params.args)
  })

  window._calls.window.onFullscreen(() => {
    calls.fullscreenCall()
  })

  window._calls.window.onRestore(() => {
    calls.restoreCall()
  })

  window._calls.onToggleCallsWindowState((state) => {
    document.dispatchEvent(
      new CustomEvent(CallsEvent.TOGGLE_CALLS_WINDOW_STATE, {
        detail: { state },
      }),
    )
  })

  window.Emoji = getEmojiConfig(
    rendererApi.api.fetchForExternalLibs.bind(rendererApi.api),
  )

  const rootContainer = document.getElementById('calls-root') as HTMLElement
  const root = createRoot(rootContainer, { identifierPrefix: 'calls-root' })

  root.render(<CallsPage lang={lang} />)
})
