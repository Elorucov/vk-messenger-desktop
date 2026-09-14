import React, { FC, useCallback, useState } from 'react'
import classnames from 'classnames'
import '@vkontakte-internal/messenger/dist/browser/ui/WebVkMeSettingsScreen/WebVkMeSettingsScreen.css'
import { SettingsMenu } from '../SettingsMenu/SettingsMenu'
import { SettingsContent } from '../SettingsContent/SettingsContent'
import { State } from '@vkontakte-internal/messenger/dist/data/store/State'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { useBrowserEnv } from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { MEAppLayout } from '@vkontakte-internal/messenger/dist/browser/ui/MEApp/MEApp'
import { useLayoutData } from '@vkontakte-internal/messenger/dist/browser/ui/LayoutDataProvider/LayoutDataProvider'

type WebVkMeSettingsScreenProps = {
  state: State
  screenRoute: IRouter.SettingsRoute
  foldersView: 'auto' | 'vertical' | 'horizontal'
  onLogout: () => Promise<void>
  notificationUnblockPics?: [string, string]
}

export const ElectronSettingsScreen: FC<WebVkMeSettingsScreenProps> = ({
  screenRoute,
  foldersView,
  onLogout,
  notificationUnblockPics,
}) => {
  const { browserNotifications } = useBrowserEnv()
  const [hasNotificationsMark, setNotificationsMark] = useState(
    () => browserNotifications?.getPermission() === 'denied',
  )
  const handleNotificationsPermissionsChange = useCallback(() => {
    setNotificationsMark(browserNotifications?.getPermission() === 'denied')
  }, [browserNotifications])

  const { isOneColumnLayout, isMobileLayout } = useLayoutData()

  return (
    <div
      className={classnames(
        'WebVkMeSettingsScreen__fixed',
        isOneColumnLayout && 'WebVkMeSettingsScreen--oneColumnMode',
        isMobileLayout && 'WebVkMeSettingsScreen--mobile',
      )}
    >
      <div className="WebVkMeSettingsScreen__fixed-inner">
        <MEAppLayout
          isCompactHistory={false}
          isPrimaryContent={screenRoute.section === 'start'}
          isCompact
          mainPanel={
            <SettingsMenu
              route={screenRoute}
              hasNotificationsMark={hasNotificationsMark}
              hasAccountSection
            />
          }
          mainContent={
            <SettingsContent
              onLogout={onLogout}
              showPanelHeader={isMobileLayout || isOneColumnLayout}
              route={screenRoute}
              foldersView={foldersView}
              notificationUnblockPics={notificationUnblockPics}
              onNotificationPermissionChange={
                handleNotificationsPermissionsChange
              }
            />
          }
        />
      </div>
    </div>
  )
}
