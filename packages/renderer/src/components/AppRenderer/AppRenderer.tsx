import React, { FC, useSyncExternalStore } from 'react'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import {
  AvailableBurgerMenuActions,
  IBrowserEnv,
  MEApp,
  MiniAppRenderer,
  Store,
  ThemeProvider,
} from '@vkontakte-internal/messenger'
import { ActualTheme } from '@vkontakte-internal/messenger/dist/browser/ui/ThemeProvider/ThemeProvider'
import { MEAppLoader } from '@vkontakte-internal/messenger/dist/browser/ui/MEAppLoader/MEAppLoader'
import { ElectronSettingsScreen } from '../ElectronSettingsScreen'
import { mediaRenderer } from '../MediaRenderer'
import { FeatureFlags } from 'vkme-common'
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'
import { LayoutMode } from '@vkontakte-internal/messenger/dist/browser/ui/LayoutDataProvider/LayoutDataProvider'
import { noop } from '@vkontakte/vkjs'

type Props = {
  store: Store
  env: IBrowserEnv
  availableActions: Set<AvailableBurgerMenuActions>
  setOwner: (ownerId: Peer.UserId | Peer.GroupId) => void
  setAccount: (id: Peer.UserId) => void
  onLogout: () => Promise<void>
  miniAppsRenderer: MiniAppRenderer
  onThemeUpdated?: (value: ActualTheme) => void
  onRegisterAccount: (profileType: 'edu' | 'normal') => void
  foldersView?: 'auto' | 'vertical' | 'horizontal'
  hidePlayerOnMusicPlayback?: boolean
  logoVariant?: 'vkme' | 'none'
  layoutMode: LayoutMode
}

const getBrowserColorScheme = (): ActualTheme => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const loadingTheme: ActualTheme = getBrowserColorScheme()

export const AppRenderer: FC<Props> = ({
  store,
  env,
  availableActions,
  setOwner,
  setAccount,
  onLogout,
  onRegisterAccount,
  miniAppsRenderer,
  onThemeUpdated,
  hidePlayerOnMusicPlayback,
  layoutMode,
}) => {
  const state = useSyncExternalStore(store.subscribe, store.getState)

  if (state.convoConn.status === 'loading') {
    return (
      /**
       * ME-38760 Форсим тему, которая была на момент инициализации скрипта,
       * чтобы бэкграунд не блинкал
       */
      <ConfigProvider locale={env.lang.locale} colorScheme={loadingTheme}>
        <AdaptivityProvider>
          <AppRoot>
            <div className="MEApp__loading">
              <MEAppLoader />
            </div>
          </AppRoot>
        </AdaptivityProvider>
      </ConfigProvider>
    )
  }

  return (
    <ThemeProvider
      theme={state.viewer.settings.theme}
      locale={env.lang.locale}
      onThemeUpdated={onThemeUpdated}
    >
      <MEApp
        env={env}
        state={state}
        store={store}
        SettingsRoute={ElectronSettingsScreen}
        setOwner={setOwner}
        setAccount={setAccount}
        registerAccount={onRegisterAccount}
        availableActions={availableActions}
        onLogout={onLogout}
        miniAppsRenderer={miniAppsRenderer}
        hidePlayerOnMusicPlayback={hidePlayerOnMusicPlayback}
        mode={layoutMode}
        mediaRenderer={
          (store.featureFlags as FeatureFlags).vkm_fullscreen_gallery
            ? mediaRenderer
            : undefined
        }
        // @ts-expect-error
        callRoomChatAppRenderer={noop}
      />
    </ThemeProvider>
  )
}
