import React, { FC, PropsWithChildren } from 'react'
import '../../vkui_me.css'
import '../../base.css'
import '../../vk_sans_display.css'

import { Title, Headline, Spinner, Spacing } from '@vkontakte/vkui'

import './OfflinePage.css'
import { IOverrideILang } from '@vkontakte-internal/messenger'

type Props = { lang: IOverrideILang }

const OfflinePage: FC<PropsWithChildren<Props>> = ({ lang }): JSX.Element => {
  return (
    <div className="offline-page">
      <div className="offline-page__panel">
        <Spacing size={48} />
        <Spinner size="xl" className="offline-page__spinner" />
        <Spacing size={24} />
        <Title weight="2" useAccentWeight>
          {lang.use('me_offline_connecting')}
        </Title>
        <Spacing size={16} />

        <Headline weight="3" className="offline-page__headline" useAccentWeight>
          {lang.use('me_offline_check_connection')}
        </Headline>
        <Spacing size={44} />
      </div>
    </div>
  )
}
export { OfflinePage }
