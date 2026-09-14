import React, {
  FC,
  useLayoutEffect,
  useMemo,
  useRef,
  ComponentProps,
  useEffect,
  useSyncExternalStore,
  useState,
} from 'react'
import { Store } from '@vkontakte-internal/messenger/dist/data/store/createStore'
import { IOverrideBrowserEnv } from '@vkontakte-internal/messenger'
import {
  ModalsProvider,
  ModalStack,
} from '@vkontakte-internal/messenger/dist/browser/ui/Modals/Modals'
import { useViewport } from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { LayerProvider } from '@vkontakte-internal/messenger/dist/browser/ui/Layer/Layer'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'
import { Stack } from '@vkontakte-internal/messenger/dist/data/env/Modals'
import { IModals } from '@vkontakte-internal/messenger/dist/data/env/IModals'
import { MiniAppRenderer } from '@vkontakte-internal/messenger/dist/browser/ui/MiniApp/MiniApp'
import { AppModals } from '../AppModals'
import { VKME_VKCALL_CONTAINER_ID } from 'vkme-common'
import { AvailableBurgerMenuActions } from '@vkontakte-internal/messenger/dist/browser/ui/BurgerMenu/BurgerMenu'
import './AppPage.css'
import { AppRenderer } from '../AppRenderer/AppRenderer'
import { BrowserEnvProvider } from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { AuthProvider } from '../../hooks/useAuth'
import { useDownloadSnackbar } from '../../hooks/useDownloadSnackbar'
import { useUpdater } from '../../hooks/useUpdater'
import { ActiveCallPanel } from '../../libs/calls'
import { RouterProvider } from '@vkontakte-internal/messenger/dist/browser/ui/Router/Router'
import { LangProvider } from '../../hooks/useLang'

type Props = {
  store: Store
  env: IOverrideBrowserEnv
  onPeerSelect: (peerId: number) => void
  onOwnerChange: (ownerId: Peer.UserId | Peer.GroupId) => void
  onAccountChange: (id: Peer.UserId) => void
  onLogout: () => Promise<void>
  miniAppsRenderer: MiniAppRenderer
  onRegisterAccount: ComponentProps<typeof AppRenderer>['onRegisterAccount']
  renderFinishCallback: () => void
}

export const AppPage: React.FC<Props> = (props) => {
  const { env, renderFinishCallback } = props
  const modalsStacks: Record<ModalStack, IModals.Stack> = useMemo(
    () => ({
      popup: env.modals.stack,
      rightPanel: new Stack(),
    }),
    [env.modals.stack],
  )

  useEffect(() => {
    renderFinishCallback()
  }, [renderFinishCallback])

  return (
    <LangProvider value={env.lang}>
      <ModalsProvider stacks={modalsStacks}>
        <AppPageView {...props} />
      </ModalsProvider>
    </LangProvider>
  )
}

const handleAppThemeChanged = () => {
  const root = document.querySelector('#reforged-root')
  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]')

  if (root && themeColorMetaTag) {
    const backgroundColor = getComputedStyle(root).getPropertyValue(
      '--vkui--color_background_content',
    )
    themeColorMetaTag.setAttribute('content', backgroundColor)
  }
}

const AppPageView: FC<Props> = ({
  store,
  env,
  onOwnerChange,
  onAccountChange,
  onLogout,
  miniAppsRenderer,
  onRegisterAccount,
}) => {
  const $modalLayer = useRef(document.getElementById('modal-root'))
  useDownloadSnackbar()
  useUpdater({ isMasterHook: true })

  const state = useSyncExternalStore(store.subscribe, store.getState)
  const [locale, setLocale] = useState(env.lang.locale)
  const [vWidth] = useViewport({ debounced: true })
  const layoutMode = vWidth < 640 ? 'mobile' : 'two-column'

  useEffect(() => {
    const unsub = env.lang.subscribe((locale) => setLocale(locale))
    return () => unsub()
  }, [env.lang])

  useLayoutEffect(() => {
    if (state.convoConn.status !== 'loading') {
      window._common.setElectronTheme(state.viewer.settings.theme)
    }
    window._credentials.updateBadgeCounter(
      state.organisers.filters.unread.unreadUnmutedCount,
    )
  }, [
    state.convoConn.status,
    state.viewer.settings.theme,
    state.organisers.filters.unread.unreadUnmutedCount,
  ])

  const availableBurgerMenuActions: Set<AvailableBurgerMenuActions> = new Set([
    'accounts',
    'groups',
    'help',
    'logout',
  ])

  return (
    <LayerProvider key={locale} layer={$modalLayer.current}>
      <AppRenderer
        env={env}
        store={store}
        layoutMode={layoutMode}
        miniAppsRenderer={miniAppsRenderer}
        setOwner={onOwnerChange}
        setAccount={onAccountChange}
        onLogout={onLogout}
        onThemeUpdated={handleAppThemeChanged}
        onRegisterAccount={onRegisterAccount}
        availableActions={availableBurgerMenuActions}
      />
      <div id={VKME_VKCALL_CONTAINER_ID} />
      <AuthProvider
        value={{
          onRegisterAccount,
          setAccount: onAccountChange,
        }}
      >
        <BrowserEnvProvider value={env}>
          <AppModals />
          <RouterProvider>
            <ActiveCallPanel
              isVerticalFoldersView={state.viewer.settings.verticalFoldersView}
            />
          </RouterProvider>
        </BrowserEnvProvider>
      </AuthProvider>
    </LayerProvider>
  )
}
