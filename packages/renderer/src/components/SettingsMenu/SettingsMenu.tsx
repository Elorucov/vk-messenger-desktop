import '@vkontakte-internal/messenger/dist/browser/ui/SettingsMenu/SettingsMenu.css'
import React, { FC, useCallback, useId, useMemo } from 'react'
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar'
import cx from 'classnames'
import {
  Icon20FolderOutline,
  Icon20NotificationOutline,
  Icon20GearOutline,
  Icon20PalleteOutline,
  Icon20Stars,
  Icon24Back,
  Icon16Education,
  Icon16Verified,
  Icon20InfoCircleOutline,
  Icon24User,
  Icon24BankOutline,
  Icon20CupOutline,
  Icon20NotificationSlashOutline,
  Icon20LockOutline,
} from '@vkontakte/icons'
import {
  Avatar,
  Button,
  Group,
  Separator,
  SimpleCell,
  SimpleCellProps,
  Spacing,
  Title,
  PanelHeader,
} from '@vkontakte/vkui'
import {
  useBrowserEnv,
  useFeatureFlags,
  useViewer,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { resolveMiniAppId } from '@vkontakte-internal/messenger/dist/core/model/Attach'
import { EDU_ACHIEVEMENTS_MINI_APP_ID } from '@vkontakte-internal/messenger/dist/core/config/config'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { Link } from '@vkontakte-internal/messenger/dist/browser/ui/Link/Link'
import * as Viewer from '@vkontakte-internal/messenger/dist/core/model/Viewer'
import { exhaustivenessCheck } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import { useLang } from '../../hooks/useLang'
import { useAuthRouter } from '../../hooks/useAuthRouter'
import { PeerAvatar } from '@vkontakte-internal/messenger/dist/browser/ui/PeerAvatar/PeerAvatar'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'

type Props = {
  route: IRouter.SettingsRoute
  hasNotificationsMark?: boolean
  hasAccountSection?: boolean
}

export const SettingsMenu: FC<React.PropsWithChildren<Props>> = ({
  route,
  hasNotificationsMark = false,
  hasAccountSection,
}) => {
  const { lang, router, stats } = useBrowserEnv()
  const { profileInfo, profileType, viewer } = useViewer()
  const featureFlags = useFeatureFlags()
  const phone = useMemo(
    () => profileInfo?.phoneNumber?.replace(/\*/g, '•'),
    [profileInfo?.phoneNumber],
  )

  const hasPhoto = Boolean(viewer.photoId)
  const isEdu = Viewer.isEdu(profileType)
  const uid = useId()

  const getCommonProps = (
    section: IRouter.SettingsRouteSection,
  ): Partial<SimpleCellProps> => {
    const props = {
      className: 'SettingsMenu__item',
      onClick: () =>
        router.push({
          kind: 'SettingsRoute',
          section,
          back: route.back,
        }),
    }

    switch (section) {
      case 'start':
      case 'main':
      case 'account':
      case 'about':
      case 'edu':
      case 'experimental':
      case 'folders':
      case 'notifications':
      case 'theme':
      case 'privacy':
        props.className = cx(props.className, {
          'SettingsMenu__item--active': route.section === section,
        })
        break

      case 'schedule':
        props.onClick = () => {
          stats.logEvent({
            type: 'type_navgo',
            type_navgo: {
              subtype: 'go',
              screen: 'im_settings',
              screen_to: 'im_settings_do_not_disturb',
            },
          })

          router.push({
            kind: 'SettingsRoute',
            section,
            back: route.back,
          })
        }

        props.className = cx(props.className, {
          'SettingsMenu__item--active': route.section === section,
        })
        break

      case 'achievements':
        props.className = cx(props.className, {
          'SettingsMenu__item--active': route.section === section,
        })
        props.onClick = () => {
          router.push({
            kind: 'MiniAppModal',
            miniAppId: resolveMiniAppId(EDU_ACHIEVEMENTS_MINI_APP_ID),
            hash: `user_id=${profileInfo.id}`,
          })
        }
        break

      default:
        exhaustivenessCheck(section)
    }

    return props
  }

  return (
    <ScrollbarProvider className="SettingsMenu" overflowX="hidden">
      <Group
        aria-labelledby={uid}
        className="SettingsMenu__group"
        mode="card"
        separator="auto"
        padding="m"
        header={
          <PanelHeader
            fixed={false}
            delimiter="none"
            transparent={true}
            before={
              <Button
                mode="tertiary"
                size="l"
                before={
                  <Icon24Back fill={'var(--vkui--color_text_secondary)'} />
                }
                Component={Link}
                // @ts-expect-error не кастятся пропсы Link
                to={route.back || { kind: 'MainRoute' }}
                aria-label={lang.use('me_back')}
              />
            }
            className="SettingsMenu__header"
          >
            <Title level="3" Component="h3">
              {lang.use('me_route_settings')}
            </Title>
          </PanelHeader>
        }
      >
        <Separator className="SettingsMenu__separator" />
        <Spacing size={4} />
        {hasAccountSection && (
          <SimpleCell
            {...getCommonProps('account')}
            before={
              isEdu && !hasPhoto ? (
                <Avatar className="Settings__profileAvatar" size={48}>
                  <Icon24User />
                </Avatar>
              ) : (
                <PeerAvatar peer={viewer} size={48} />
              )
            }
            subtitle={
              !isEdu ? (
                <>
                  {phone && <div>{phone}</div>}
                  {profileInfo.screenName && (
                    <div className="SettingsMenu__accent">
                      @{profileInfo.screenName}
                    </div>
                  )}
                </>
              ) : (
                <div className="SettingsMenu__accent">
                  {lang.use('me_route_settings_edu_profile_sferum')}
                </div>
              )
            }
          >
            {!isEdu ? (
              <p className="SettingsMenu__name">
                <span>
                  {profileInfo.firstName} {profileInfo.lastName}
                </span>
                {viewer.isVerified && (
                  <Icon16Verified className="SettingsMenu__accent" />
                )}
              </p>
            ) : (
              <p className="SettingsMenu__name">
                <span className="SettingsMenu__nameText">
                  {profileInfo.lastName} {profileInfo.firstName}{' '}
                  {profileInfo.nickName}
                </span>
                {viewer.isVerified && (
                  <div>
                    <Icon16Education className="SettingsMenu__accent" />
                  </div>
                )}
              </p>
            )}
          </SimpleCell>
        )}
        {isEdu && (
          <SimpleCell
            {...getCommonProps('edu')}
            before={<Icon24BankOutline width={20} height={20} />}
          >
            {lang.use('me_settings_menu_edu_organizations')}
          </SimpleCell>
        )}

        {isEdu && (
          <SimpleCell
            {...getCommonProps('achievements')}
            before={<Icon20CupOutline />}
          >
            {lang.use('me_settings_menu_achievements')}
          </SimpleCell>
        )}

        {isEdu && (
          <>
            <Spacing size={1} />
            <Separator className="SettingsMenu__separator" />
            <Spacing size={1} />
          </>
        )}

        <SimpleCell {...getCommonProps('main')} before={<Icon20GearOutline />}>
          {lang.use('me_settings_menu_main')}
        </SimpleCell>
        <SimpleCell
          {...getCommonProps('folders')}
          before={<Icon20FolderOutline />}
        >
          {lang.use('me_settings_menu_folders')}
        </SimpleCell>
        <Spacing size={1} />
        <Separator className="SettingsMenu__separator" />
        <Spacing size={1} />
        <SimpleCell
          {...getCommonProps('notifications')}
          before={<Icon20NotificationOutline />}
          after={
            hasNotificationsMark && <span className="SettingsMenu__mark" />
          }
        >
          {lang.use('me_settings_menu_notifications')}
        </SimpleCell>
        {featureFlags.vkm_enable_schedule_edu &&
          Peer.hasEduOrganizationalRoles(viewer) && (
            <SimpleCell
              {...getCommonProps('schedule')}
              before={<Icon20NotificationSlashOutline />}
            >
              {lang.use('me_settings_menu_schedule')}
            </SimpleCell>
          )}
        {isEdu && (
          <SimpleCell
            {...getCommonProps('privacy')}
            before={<Icon20LockOutline />}
          >
            {lang.use('me_settings_menu_privacy')}
          </SimpleCell>
        )}
        <SimpleCell
          {...getCommonProps('theme')}
          before={<Icon20PalleteOutline />}
        >
          {lang.use('me_settings_menu_theme')}
        </SimpleCell>
        {featureFlags.vkm_settings_experimental && (
          <SimpleCell
            {...getCommonProps('experimental')}
            before={<Icon20Stars />}
          >
            {lang.use('me_settings_menu_experimental')}
          </SimpleCell>
        )}

        <Spacing size={1} />
        <Separator />
        <Spacing size={1} />
        <SimpleCell
          {...getCommonProps('about')}
          before={<Icon20InfoCircleOutline />}
        >
          {lang.use('me_settings_menu_about')}
        </SimpleCell>
      </Group>
    </ScrollbarProvider>
  )
}

type AuthSettingsMenuProps = {
  route: IRouter.SettingsRoute
}

export const AuthSettingsMenu: FC<AuthSettingsMenuProps> = ({ route }) => {
  const lang = useLang()
  const uid = useId()
  const { router } = useAuthRouter()

  const getCommonProps = (
    section: IRouter.SettingsRouteSection,
  ): Partial<SimpleCellProps> => {
    const props = {
      className: 'SettingsMenu__item',
      onClick: () =>
        router.push({
          kind: 'SettingsRoute',
          section,
          back: route.back,
        }),
    }

    switch (section) {
      case 'main':
      case 'about':
        props.className = cx(props.className, {
          'SettingsMenu__item--active': route.section === section,
        })
        break

      default:
        break
    }

    return props
  }

  const onBack = useCallback(() => {
    router.push(route.back || { kind: 'MainRoute' })
  }, [route.back, router])

  return (
    <ScrollbarProvider className="SettingsMenu" overflowX="hidden">
      <Group
        aria-labelledby={uid}
        className="SettingsMenu__group"
        mode="card"
        separator="auto"
        padding="m"
        header={
          <PanelHeader
            fixed={false}
            delimiter="none"
            transparent={true}
            before={
              <Button
                mode="tertiary"
                size="l"
                before={
                  <Icon24Back fill={'var(--vkui--color_text_secondary)'} />
                }
                onClick={onBack}
              />
            }
            className="SettingsMenu__header"
          >
            <Title level="3" Component="h3">
              {lang.use('me_route_settings')}
            </Title>
          </PanelHeader>
        }
      >
        <Separator className="SettingsMenu__separator" />
        <Spacing size={4} />
        <SimpleCell {...getCommonProps('main')} before={<Icon20GearOutline />}>
          {lang.use('me_settings_menu_main')}
        </SimpleCell>
        <Separator className="SettingsMenu__separator" />
        <Spacing size={1} />
        <SimpleCell
          {...getCommonProps('about')}
          before={<Icon20InfoCircleOutline />}
        >
          {lang.use('me_settings_menu_edu_about_app')}
        </SimpleCell>
      </Group>
    </ScrollbarProvider>
  )
}
