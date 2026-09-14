import React, { FC, PropsWithChildren, useEffect, useState } from 'react'
import { ScreenType } from '../UnauthorizedPage/UnauthorizedPage'
import { Spacing } from '@vkontakte/vkui'
import {
  Icon24Back,
  Icon28Replay,
  Icon56CheckCircleDeviceOutline,
} from '@vkontakte/icons'
import { IconLogoVkid24h } from '@vkontakte-internal/icons-private'
import './QRAuthScreen.css'
import { Header, Button, IconButton } from '@vkontakte/vkui'
import { QRAuthStatus } from 'vkme-common'
import { QRCode } from '@vkontakte-internal/vkcom-kit'
import { authWrapper } from '../../utils/authWrapper'
import { formatLangKey } from '../../utils/translation'
import { useLang } from '../../hooks/useLang'

interface QRAuthScreenProps {
  setScreen: (screen: ScreenType) => void
  setQR: React.Dispatch<React.SetStateAction<string | undefined>>
  qr?: string
}

export const QRAuthScreen: FC<PropsWithChildren<QRAuthScreenProps>> = ({
  setScreen,
  qr,
  setQR,
}) => {
  const lang = useLang()
  const [qrStatus, setQRStatus] = useState<QRAuthStatus>()
  const handleRefreshQRClick = async () => {
    const qrUrl = await window._credentials.generateAuthQRCode()
    setQR(qrUrl)
  }

  const openBrowserLogin = () => {
    authWrapper.openLoginPage('normal')
    setScreen(ScreenType.WAITING_FOR_AUTH)
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const getQRAuthStatus = async () => {
      const qrStatus = await window._credentials.getQRAuthStatus()
      setQRStatus(qrStatus.status)
      switch (qrStatus.status) {
        case QRAuthStatus.OPENED:
          timeout = setTimeout(getQRAuthStatus, 3000)
          break
        case QRAuthStatus.CREATED:
          timeout = setTimeout(getQRAuthStatus, 3000)
          break
        case QRAuthStatus.APPROVED:
          break
        case QRAuthStatus.EXPIRED:
          break
        default:
          throw new Error('Exhaustivness failure! This should never happen.')
      }
    }
    getQRAuthStatus()
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [qr])

  const getDefaultView = () => (
    <>
      <Button
        className="qrContent_backarrow"
        mode="tertiary"
        size="l"
        before={<Icon24Back fill={'var(--vkui--color_text_secondary)'} />}
        onClick={() => setScreen(ScreenType.WELCOME)}
      />
      <div className={'qrContent_container'}>
        {qr && (
          <QRCode
            text={qr}
            options={{
              isShowLogo: true,
            }}
            size={160}
          />
        )}
        {qrStatus === QRAuthStatus.EXPIRED && (
          <>
            <div className="qrRefresh_background" />
            <IconButton
              onClick={handleRefreshQRClick}
              borderRadiusMode="auto"
              className="qrRefresh_button"
              aria-label={lang.use('me_auth_qrcode_refresh_aria')}
            >
              <Icon28Replay />
            </IconButton>
          </>
        )}
      </div>
      <div>
        <Header
          size="l"
          className="qrHeader"
          multiline
          Component="h1"
          subtitle={formatLangKey({
            langkey: 'me_auth_qrcode_login_description',
            lang,
            values: { bold: (text) => <b>{text}</b> },
          })}
        >
          {lang.use('me_auth_qrcode_login')}
        </Header>
        <div className="qrContent__link">
          <Button mode="tertiary" href={lang.use('me_auth_qrcode_how_to_link')}>
            {lang.use('me_auth_qrcode_how_to')}
          </Button>
        </div>
        <Spacing size={16} />
      </div>
      <Button
        width={'100%'}
        mode="secondary"
        stretched
        onClick={openBrowserLogin}
      >
        {lang.use('me_auth_qrcode_browser')}
      </Button>
    </>
  )

  const openedView = () => {
    return (
      <>
        <Button
          className="qrContent_backarrow"
          mode="tertiary"
          size="l"
          before={<Icon24Back fill={'var(--vkui--color_text_secondary)'} />}
          onClick={() => setScreen(ScreenType.WELCOME)}
        />
        <div>
          <Icon56CheckCircleDeviceOutline
            fill={'var(--vkui--color_text_accent)'}
          />
        </div>
        <div>
          <Header
            size="l"
            className="qrHeader"
            multiline
            Component={'h1'}
            subtitle={formatLangKey({
              langkey: 'me_auth_approve_login_description',
              lang,
              values: { bold: (text) => <b>{text}</b> },
            })}
          >
            {lang.use('me_auth_approve_login')}
          </Header>
          <Spacing size={16} />
        </div>
        <Button
          width={'100%'}
          mode="secondary"
          stretched
          onClick={openBrowserLogin}
        >
          {lang.use('me_auth_qrcode_browser')}
        </Button>
      </>
    )
  }

  const getContent = () => {
    switch (qrStatus) {
      case QRAuthStatus.OPENED:
        return openedView()

      case QRAuthStatus.CREATED:
        return getDefaultView()

      default:
        return getDefaultView()
    }
  }

  return (
    <div className="vkmeLoginQR">
      <div>
        <IconLogoVkid24h
          fill={'var(--vkui--color_text_primary)'}
          width={32}
          height={32}
        />
      </div>
      <Spacing size={32} />
      <div className="qrContent">
        {getContent()}
        <Spacing size={10} />
      </div>
    </div>
  )
}
