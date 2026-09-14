import {
  ThemeProvider,
  useSnackbar,
  useViewport,
} from '@vkontakte-internal/messenger'
import React, { FC, useEffect, useState } from 'react'
import { SnackbarProvider } from '@vkontakte-internal/messenger/dist/browser/hooks/useSnackbar'
import { WelcomeAuthScreen } from '../WelcomeAuthScreen'
import { WaitingForAuthScreen } from '../WaitingForAuthScreen'
import { QRAuthScreen } from '../QRAuthScreen'
import { Icon28ErrorCircleOutline } from '@vkontakte/icons'
import { ElectronAuthSettingsScreen } from '../ElectronAuthSettingsScreen'
import { useUpdater } from '../../hooks/useUpdater'
import { useAuthRouter } from '../../hooks/useAuthRouter'
import { LayoutDataProvider } from '@vkontakte-internal/messenger/dist/browser/ui/LayoutDataProvider/LayoutDataProvider'

export const enum ScreenType {
  WELCOME = 'WELCOME',
  QR_AUTH = 'QR_AUTH',
  WAITING_FOR_AUTH = 'WAITING_FOR_AUTH',
}

type Props = {
  locale: string
}

export const UnauthorizedPage: FC<Props> = ({ locale }) => {
  const [screen, setScreen] = useState<ScreenType>(ScreenType.WELCOME)
  const [qr, setQR] = useState<string>()

  const snackbar = useSnackbar()
  useUpdater({ isMasterHook: true })
  const { screenRoute } = useAuthRouter()
  const [vWidth] = useViewport({ debounced: true })
  const layoutMode = vWidth < 640 ? 'mobile' : 'two-column'

  useEffect(() => {
    window._credentials.onAuthError((message) => {
      setScreen(ScreenType.WELCOME)
      snackbar({
        id: 'auth-error',
        autoClose: true,
        before: (
          <Icon28ErrorCircleOutline
            style={{ color: 'var(--vkui--color_icon_negative)' }}
          />
        ),
        message,
      })
    })
  }, [snackbar])

  const renderScreenRoute = () => {
    switch (screenRoute.kind) {
      case 'SettingsRoute':
        return <ElectronAuthSettingsScreen screenRoute={screenRoute} />
      default:
        return getScreen()
    }
  }

  const getScreen = () => {
    switch (screen) {
      case ScreenType.WELCOME:
        return <WelcomeAuthScreen setQR={setQR} setScreen={setScreen} />

      case ScreenType.QR_AUTH:
        return <QRAuthScreen setQR={setQR} qr={qr} setScreen={setScreen} />

      case ScreenType.WAITING_FOR_AUTH:
        return <WaitingForAuthScreen setScreen={setScreen} />

      default:
        return <WelcomeAuthScreen setQR={setQR} setScreen={setScreen} />
    }
  }

  return (
    <LayoutDataProvider mode={layoutMode}>
      <ThemeProvider theme="system" locale={locale}>
        {renderScreenRoute()}
        <SnackbarProvider />
      </ThemeProvider>
    </LayoutDataProvider>
  )
}
