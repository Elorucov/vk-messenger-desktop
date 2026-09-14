import React, { FC } from 'react'
import classnames from 'classnames'
import { AuthSettingsMenu } from '../SettingsMenu/SettingsMenu'
import { AuthSettingsContent } from '../SettingsContent/SettingsContent'
import { MEAppLayout } from '@vkontakte-internal/messenger/dist/browser/ui/MEApp/MEApp'
import { useLayoutData } from '@vkontakte-internal/messenger/dist/browser/ui/LayoutDataProvider/LayoutDataProvider'
import './ElectronAuthSettingsScreen.css'
import { IRouter } from '@vkontakte-internal/messenger'

type Props = {
  screenRoute: IRouter.SettingsRoute
}

export const ElectronAuthSettingsScreen: FC<Props> = ({ screenRoute }) => {
  const { isMobileLayout, isOneColumnLayout } = useLayoutData()

  return (
    <div
      className={classnames(
        'MEApp MEAppConfig MEConfig',
        'ElectronAuthSettingsScreen__fixed',
        {
          'ElectronAuthSettingsScreen--oneColumnMode': isOneColumnLayout,
          'ElectronAuthSettingsScreen--mobile': isMobileLayout,
          'MEApp--one-column': isOneColumnLayout,
          'MEApp--mobile': isMobileLayout,
        },
      )}
    >
      <div className="ElectronAuthSettingsScreen__fixed-inner">
        <MEAppLayout
          isCompactHistory={false}
          isPrimaryContent={screenRoute.section === 'start'}
          isCompact
          mainPanel={<AuthSettingsMenu route={screenRoute} />}
          mainContent={
            <AuthSettingsContent
              route={screenRoute}
              showPanelHeader={isMobileLayout || isOneColumnLayout}
            />
          }
        />
      </div>
    </div>
  )
}
