import './WelcomeAuthScreen.css'
import React from 'react'
import { authWrapper } from '../../utils/authWrapper'
import { Icon76LogoVkMeColor } from '@vkontakte-internal/icons-private'
import { Button, getVKSansDisplayClass } from '@vkontakte-internal/vkcom-kit'
import { classNames } from '@vkontakte/vkjs'
import { ScreenType } from '../UnauthorizedPage/UnauthorizedPage'
import { useLang } from '../../hooks/useLang'
import { IconButton, Spacing } from '@vkontakte/vkui'
import { Icon28SettingsOutline } from '@vkontakte/icons'
import { useAuthRouter } from '../../hooks/useAuthRouter'

interface WelcomeAuthScreenProps {
  setScreen: (screen: ScreenType) => void
  setQR: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const WelcomeAuthScreen = ({
  setScreen,
  setQR,
}: WelcomeAuthScreenProps): JSX.Element => {
  const lang = useLang()
  const { router } = useAuthRouter()
  const openQRLoginPage = async () => {
    const qrUrl = await window._credentials.generateAuthQRCode()
    setQR(qrUrl)
    setScreen(ScreenType.QR_AUTH)
  }

  const openSferumLoginPage = (profileType: 'edu' | 'normal') => {
    authWrapper.openLoginPage(profileType)
    setScreen(ScreenType.WAITING_FOR_AUTH)
  }

  const openSettings = () => {
    router.push({ kind: 'SettingsRoute', section: 'start' })
  }

  const handleRegisterAccount = () => {
    window._credentials.openRegisterAccountPage()
  }

  return (
    <div className="VkMeLogin">
      <IconButton
        label={lang.use('me_route_settings')}
        className="VkMeLogin__action"
        onClick={openSettings}
      >
        <Icon28SettingsOutline color="var(--vkui--color_icon_secondary)" />
      </IconButton>
      <Icon76LogoVkMeColor />
      <h1 className={classNames('VkMeLogin__title', getVKSansDisplayClass())}>
        {lang.use('me_vkme_title')}
      </h1>
      <p className="VkMeLogin__text">
        {lang.use('me_vkme_login_motivation_text')}
      </p>
      <div className="VkMeLogin__buttons">
        <Button
          size="l"
          mode="primary"
          stretched
          onClick={() => openQRLoginPage()}
        >
          {lang.use('me_login_extended')}
        </Button>
        <Spacing size={20} />
        <Button
          size="l"
          mode="primary"
          stretched
          className="VkMeLogin__sferumLoginButton"
          onClick={() => openSferumLoginPage('edu')}
        >
          {lang.use('me_vkme_login_sferum_account')}
        </Button>
        <Spacing size={20} />
        <Button
          size="l"
          mode="tertiary"
          stretched
          onClick={handleRegisterAccount}
        >
          {lang.use('me_vkme_account_registration')}
        </Button>
      </div>
    </div>
  )
}
