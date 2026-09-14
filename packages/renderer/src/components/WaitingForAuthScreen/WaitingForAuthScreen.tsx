import React, { FC, PropsWithChildren } from 'react'
import { Spacing } from '@vkontakte-internal/vkcom-kit'
import { CellButton, Spinner } from '@vkontakte/vkui'
import { Icon20HomeOutline } from '@vkontakte/icons'
import { ScreenType } from '../UnauthorizedPage/UnauthorizedPage'
import './WaitingForAuthScreen.css'
import { useLang } from '../../hooks/useLang'

interface WaitingForAuthScreenProps {
  setScreen: (screenType: ScreenType) => void
}

export const WaitingForAuthScreen: FC<
  PropsWithChildren<WaitingForAuthScreenProps>
> = (props) => {
  const lang = useLang()
  return (
    <div className="VkMeLogin">
      <Spacing size={16} />
      <div>
        <Spinner size="xl"></Spinner>
      </div>
      <Spacing size={16} />
      <span className="VkMeLogin__text">{lang.use('me_auth_access')}</span>
      <Spacing size={32} />
      <div>
        <CellButton
          appearance="accent"
          centered
          before={<Icon20HomeOutline />}
          onClick={() => props.setScreen(ScreenType.WELCOME)}
        >
          {lang.use('me_auth_return')}
        </CellButton>
      </div>
    </div>
  )
}
