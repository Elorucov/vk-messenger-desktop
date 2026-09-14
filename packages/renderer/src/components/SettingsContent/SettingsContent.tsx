import '@vkontakte-internal/messenger/dist/browser/ui/SettingsContent/SettingsContent.css'
import cx from 'classnames'
import React, {
  ComponentProps,
  FC,
  MouseEventHandler,
  useCallback,
  useMemo,
} from 'react'
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar'
import {
  Icon12Dropdown,
  Icon24Back,
  Icon16Done,
  Icon24CheckCircleOutline,
} from '@vkontakte/icons'
import {
  Button,
  Switch,
  Text,
  Separator,
  Spacing,
  PanelHeader,
  Title,
  Progress,
  Spinner,
} from '@vkontakte/vkui'
import {
  useBrowserEnv,
  useFeatureFlags,
  useOrganisers,
  useStoreState,
  useViewer,
} from '@vkontakte-internal/messenger/dist/browser/hooks/misc'
import { Link } from '@vkontakte-internal/messenger/dist/browser/ui/Link/Link'
import {
  FieldGroup,
  FieldGroupItem,
} from '@vkontakte-internal/messenger/dist/browser/ui/FieldGroup/FieldGroup'
import {
  ActionsMenu,
  ActionsMenuAction,
} from '@vkontakte-internal/messenger/dist/browser/ui/ActionsMenu/ActionsMenu'
import { exhaustivenessCheck } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import * as Viewer from '@vkontakte-internal/messenger/dist/core/model/Viewer'
import { IRouter } from '@vkontakte-internal/messenger/dist/data/env/IRouter'
import { Dropdown } from '@vkontakte-internal/messenger/dist/browser/ui/Dropdown/Dropdown'
import {
  SettingsNotifications,
  SettingsFolders,
  SettingsExperimental,
  SettingsTheme,
  SettingsEduOrganizations,
  SettingsPrivacy,
  SettingsMain,
} from '@vkontakte-internal/messenger/dist/browser/ui/SettingsContent/SettingsContent'
import { AppIcon } from '../AppIcon/AppIcon'
import './SettingsContent.css'
import { useUpdater } from '../../hooks/useUpdater'
import { getUpdateVersion } from '../../utils/updater'
import {
  AutoStartMode,
  DEFAULT_LOCALES,
  FeatureFlags,
  ISettings,
  Locales,
  PlatformName,
  UpdaterStoreKey,
  UpdateStatus,
} from 'vkme-common'
import { useSettings } from '../../hooks/useSettings'
import { ProxySettingsMenu } from '../../libs/proxy'
import { SettingsAccount } from './components/SettingsAccount'
import { useLang } from '../../hooks/useLang'
import { useAuthRouter } from '../../hooks/useAuthRouter'
import { SettingsSchedule } from '@vkontakte-internal/messenger/dist/browser/ui/SettingsSchedule/SettingsSchedule'
import { WebVkMeSettingsContent } from '@vkontakte-internal/messenger/dist/browser/ui/SettingsContent/SettingsContent'
import * as Peer from '@vkontakte-internal/messenger/dist/core/model/Peer'

type Props = ComponentProps<typeof WebVkMeSettingsContent>

export const SettingsContent: FC<React.PropsWithChildren<Props>> = ({
  route,
  showPanelHeader,
  onLogout,
  onNotificationPermissionChange,
  foldersView,
  notificationUnblockPics,
}) => {
  const locks = useStoreState('locks')
  const { folders, recommendedFolders } = useOrganisers()
  const { lang } = useBrowserEnv()
  const featureFlags = useFeatureFlags()
  const { viewer, profileType } = useViewer()
  const isEdu = Viewer.isEdu(profileType)

  const { section } = route

  const headerText = useMemo(() => {
    switch (section) {
      case 'account':
        return lang.use('me_account')
      case 'main':
      case 'start':
        return lang.use('me_settings_menu_main')
      case 'folders':
        return lang.use('me_settings_menu_folders')
      case 'notifications':
        return lang.use('me_settings_menu_notifications')
      case 'theme':
        return lang.use('me_settings_menu_theme')
      case 'experimental':
        return lang.use('me_settings_menu_experimental')
      case 'about':
        return lang.use('me_settings_menu_about')
      case 'edu':
        return lang.use('me_settings_menu_edu_organizations')
      case 'schedule':
        return lang.use('me_settings_menu_schedule')
      case 'achievements':
        return lang.use('me_settings_menu_achievements')
      case 'privacy':
        return lang.use('me_settings_menu_privacy')
      default:
        exhaustivenessCheck(section)
    }
  }, [section, lang])

  const backTo = useMemo(() => {
    return { kind: 'SettingsRoute', section: 'start', back: route.back }
  }, [route])

  const renderSection = () => {
    switch (section) {
      case 'account': {
        return <SettingsAccount onLogout={onLogout} />
      }

      case 'start':
      case 'main': {
        return (
          <SettingsMain>
            <DesktopMainSettings />
          </SettingsMain>
        )
      }

      case 'folders': {
        return (
          <SettingsFolders
            folders={folders}
            recommendedFolders={recommendedFolders}
            locks={locks}
            foldersView={foldersView}
          />
        )
      }

      case 'notifications': {
        return (
          <SettingsNotifications
            folders={folders}
            notificationUnblockPics={notificationUnblockPics}
            onPermissionChange={onNotificationPermissionChange}
            hasUnreadCountControls={false}
            hasSoundNotificationsControl
          />
        )
      }

      case 'theme': {
        return <SettingsTheme themeControl themeStylesControl />
      }

      case 'experimental': {
        return <SettingsExperimental />
      }

      case 'edu': {
        if (!isEdu) {
          return null
        }

        return <SettingsEduOrganizations />
      }

      case 'schedule': {
        if (
          featureFlags.vkm_enable_schedule_edu &&
          Peer.hasEduOrganizationalRoles(viewer)
        ) {
          return <SettingsSchedule />
        }
        return null
      }

      case 'privacy': {
        if (!isEdu) {
          return null
        }

        return <SettingsPrivacy />
      }

      case 'about': {
        return <SettingsAbout />
      }

      case 'achievements':
        return null

      default:
        exhaustivenessCheck(section)
    }
  }

  return (
    <ScrollbarProvider overflowX="hidden" className="SettingsContent">
      {showPanelHeader && (
        <PanelHeader
          fixed={false}
          delimiter="none"
          className="SettingsContent__panelHeader"
          before={
            <Button
              mode="tertiary"
              size="l"
              before={<Icon24Back fill={'var(--vkui--color_text_secondary)'} />}
              Component={Link}
              // @ts-expect-error не кастятся пропсы Link
              to={backTo}
            />
          }
        >
          <Title level="3" Component="h3">
            {headerText}
          </Title>
        </PanelHeader>
      )}
      <div className={cx({ SettingsContent__body: !showPanelHeader })}>
        {renderSection()}
      </div>
    </ScrollbarProvider>
  )
}

const DesktopMainSettings = () => {
  const desktopSettings = useSettings()
  const { lang } = useBrowserEnv()
  const { vkm_multi_langs } = useFeatureFlags() as FeatureFlags

  return (
    <>
      <FieldGroup title={lang.use('me_settings_desktop')}>
        <FieldGroupItem
          after={
            <Button
              mode="tertiary"
              appearance="accent-invariable"
              onClick={() => desktopSettings.toggle('downloadLocation')}
            >
              {lang.use('me_settings_download_path_action')}
            </Button>
          }
          subtitle={desktopSettings.state.downloadLocation}
        >
          {lang.use('me_settings_download_path')}
        </FieldGroupItem>
      </FieldGroup>
      <FieldGroup title={lang.use('me_settings_fast_action')}>
        {desktopSettings.platform !== PlatformName.MAC && (
          <FieldGroupItem
            after={
              <AutoStartOptionControl
                mode={desktopSettings.state.autoStartMode}
                onChange={(mode) => desktopSettings.toggle('autostart', mode)}
                platform={desktopSettings.platform}
              />
            }
            subtitle={lang.use('me_settings_autostart_description')}
          >
            {lang.use('me_settings_autostart')}
          </FieldGroupItem>
        )}
        <FieldGroupItem
          after={
            <Switch
              checked={desktopSettings.state.trayIsEnabled}
              onChange={() => desktopSettings.toggle('tray')}
            />
          }
          subtitle={lang.use('me_settings_tray_description')}
        >
          {lang.use('me_settings_tray')}
        </FieldGroupItem>
      </FieldGroup>
      <ProxySettingsMenu lang={lang} />
      {vkm_multi_langs && (
        <FieldGroup title={lang.use('me_settings_lang')}>
          <FieldGroupItem
            after={
              <LanguagesControl
                value={desktopSettings.state.lang}
                onChange={(locale) => desktopSettings.toggle('lang', locale)}
              />
            }
          >
            {lang.use('me_settings_lang_app')}
          </FieldGroupItem>
        </FieldGroup>
      )}
    </>
  )
}

const SettingsAbout: FC = () => {
  const { update, start, cancel, install } = useUpdater()
  const lang = useLang()
  const desktopSettings = useSettings()
  const isAutoUpdateEnabled = desktopSettings.state.updater.isAutoUpdateEnabled
  const isEnabled = desktopSettings.state.updater.isEnabled
  return (
    <>
      <FieldGroup>
        <FieldGroupItem
          before={<AppIcon width={34} />}
          subtitle={
            <span className="SettingsContent__accent">
              {lang.use('me_settings_about_app_version', {
                values: {
                  packageVersion: import.meta.env.PACKAGE_VERSION,
                  buildNumber: import.meta.env.VITE_BUILD_NUMBER,
                },
              })}
            </span>
          }
        >
          {lang.use('me_vkme_title')}
        </FieldGroupItem>
        {isEnabled && (
          <>
            <Spacing size={0}>
              <Separator />
            </Spacing>
            <FieldGroupItem
              after={
                <Switch
                  checked={isAutoUpdateEnabled}
                  onChange={() => desktopSettings.toggle('autoupdate')}
                />
              }
            >
              {lang.use('me_settings_updates_auto')}
            </FieldGroupItem>
          </>
        )}
      </FieldGroup>
      {isEnabled && (
        <>
          {(!update ||
            update[UpdaterStoreKey.STATUS] ===
              UpdateStatus.CHECKING_FOR_UPDATES) && (
            <FieldGroup>
              <FieldGroupItem after={<Spinner size="s" />}>
                {lang.use('me_settings_updates_checking')}
              </FieldGroupItem>
            </FieldGroup>
          )}
          {update?.[UpdaterStoreKey.STATUS] === UpdateStatus.NO_UPDATES && (
            <FieldGroup>
              <FieldGroupItem
                after={
                  <Icon24CheckCircleOutline className="SettingsContent__accent" />
                }
              >
                {lang.use('me_settings_updates_not_found')}
              </FieldGroupItem>
            </FieldGroup>
          )}
          {update &&
            [
              UpdateStatus.UPDATE_AVAILABLE,
              UpdateStatus.DOWNLOADING_UPDATE,
              UpdateStatus.UPDATE_DOWNLOADED,
            ].includes(update?.[UpdaterStoreKey.STATUS]) && (
              <FieldGroup>
                <div className="SettingsContent__Subgroup SettingsContent__Subgroup--header">
                  {update[UpdaterStoreKey.STATUS] ===
                    UpdateStatus.UPDATE_AVAILABLE && (
                    <>
                      <div className="SettingsContent__Subgroup--header__Content">
                        <Text className="Subgroup__Title">
                          {lang.use('me_settings_updates_available')}
                        </Text>
                        <Spacing size={4} />
                        <Text className="Subgroup__Subtitle">
                          {getUpdateVersion(
                            lang,
                            update[UpdaterStoreKey.NEW_VERSION] as string,
                            update[UpdaterStoreKey.UPDATE_SIZE] as number,
                          )}
                        </Text>
                      </div>
                      <Button size="m" mode="secondary" onClick={start}>
                        {lang.use('me_settings_updates_download')}
                      </Button>
                    </>
                  )}
                  {update[UpdaterStoreKey.STATUS] ===
                    UpdateStatus.DOWNLOADING_UPDATE && (
                    <>
                      <div className="SettingsContent__Subgroup--header__Content">
                        <Text className="Subgroup__Title">
                          {lang.use('me_settings_updates_downloading')}
                        </Text>
                        <Progress value={update[UpdaterStoreKey.PROGRESS]} />
                        <Text className="Subgroup__Subtitle--progress">
                          {update[UpdaterStoreKey.PROGRESS]}%
                        </Text>
                      </div>
                      <Button size="m" mode="secondary" onClick={cancel}>
                        {lang.use('me_cancel')}
                      </Button>
                    </>
                  )}
                  {update[UpdaterStoreKey.STATUS] ===
                    UpdateStatus.UPDATE_DOWNLOADED && (
                    <>
                      <div className="SettingsContent__Subgroup--header__Content">
                        <Text className="Subgroup__Title">
                          {lang.use('me_settings_updates_downloaded')}
                        </Text>
                        <Spacing size={4} />
                        <Text className="Subgroup__Subtitle">
                          {getUpdateVersion(
                            lang,
                            update[UpdaterStoreKey.NEW_VERSION] as string,
                            update[UpdaterStoreKey.UPDATE_SIZE] as number,
                          )}
                        </Text>
                      </div>
                      <Button size="m" mode="secondary" onClick={install}>
                        {lang.use('me_settings_updates_install')}
                      </Button>
                    </>
                  )}
                </div>
                <div className="SettingsContent__Subgroup SettingsContent__Patch-notes">
                  <span>{update[UpdaterStoreKey.RELEASE_NOTES]}</span>
                  <Spacing size={8} />
                  <span className="SettingsContent__Patch-notes__Footer">
                    {lang.use('me_settings_updates_footer')}
                  </span>
                </div>
              </FieldGroup>
            )}
        </>
      )}
    </>
  )
}

const AutoStartOptionControl: FC<
  React.PropsWithChildren<{
    mode: AutoStartMode
    onChange: (mode: AutoStartMode) => void
    platform: ISettings['platform']
  }>
> = ({ mode, onChange, platform }) => {
  const lang = useLang()
  const text: Record<AutoStartMode, string> = {
    disabled: lang.use('me_settings_autostart_disabled'),
    hidden: lang.use('me_settings_autostart_trayed'),
    visible: lang.use('me_settings_autostart_visible'),
  }

  if (platform === PlatformName.LINUX) {
    return (
      <Dropdown
        openType="click"
        hideOnClick
        content={
          <ActionsMenu>
            {Object.entries(text).map((entry) => (
              <ActionsMenuAction
                key={entry[0]}
                onClick={() => onChange(entry[0] as AutoStartMode)}
                title={entry[1]}
                rightIcon={
                  <Icon16Done
                    style={{
                      visibility: mode === entry[0] ? 'visible' : 'hidden',
                    }}
                  />
                }
                type="primary"
              />
            ))}
          </ActionsMenu>
        }
        align="right"
        position="bottom"
      >
        <Button mode="tertiary" after={<Icon12Dropdown />}>
          <Text className="SettingsContent__drop-down-text">{text[mode]}</Text>
        </Button>
      </Dropdown>
    )
  }

  return (
    <Switch
      checked={mode === 'visible'}
      onChange={(event) =>
        onChange(event.target.checked ? 'visible' : 'disabled')
      }
    />
  )
}

const LanguagesControl: FC<
  React.PropsWithChildren<{
    value: Locales
    onChange: (value: Locales) => void
  }>
> = ({ value, onChange }) => {
  const { lang } = useBrowserEnv()

  return (
    <Dropdown
      openType="click"
      hideOnClick
      content={
        <ActionsMenu>
          {DEFAULT_LOCALES.map((locale) => (
            <ActionsMenuAction
              key={locale}
              onClick={() => onChange(locale)}
              title={lang.use(`me_settings_locales_${locale}`)}
              type="primary"
              rightIcon={
                <Icon16Done
                  style={{
                    visibility: value === locale ? 'visible' : 'hidden',
                  }}
                />
              }
            />
          ))}
        </ActionsMenu>
      }
      align="right"
      position="bottom"
    >
      <Button mode="tertiary" after={<Icon12Dropdown />}>
        <Text className="SettingsContent__drop-down-text">
          {lang.use(`me_settings_locales_${value}`)}
        </Text>
      </Button>
    </Dropdown>
  )
}

type AuthSettingsContentProps = {
  route: IRouter.SettingsRoute
  showPanelHeader: boolean
}

export const AuthSettingsContent: FC<AuthSettingsContentProps> = ({
  route,
  showPanelHeader,
}) => {
  const lang = useLang()
  const { router } = useAuthRouter()
  const { section } = route

  const headerText = useMemo(() => {
    switch (section) {
      case 'about':
        return lang.use('me_settings_menu_about')
      default:
        return lang.use('me_settings_menu_main')
    }
  }, [section, lang])

  const renderSection = () => {
    switch (section) {
      case 'about': {
        return <SettingsAbout />
      }
      default:
        return <SettingsMain />
    }
  }

  const back: MouseEventHandler<HTMLElement> = useCallback(() => {
    router.push({ kind: 'SettingsRoute', section: 'start', back: route.back })
  }, [route.back, router])

  return (
    <ScrollbarProvider overflowX="hidden" className="SettingsContent">
      {showPanelHeader && (
        <PanelHeader
          fixed={false}
          delimiter="none"
          className="SettingsContent__panelHeader"
          before={
            <Button
              mode="tertiary"
              size="l"
              before={<Icon24Back fill={'var(--vkui--color_text_secondary)'} />}
              onClick={back}
            />
          }
        >
          <Title level="3" Component="h3">
            {headerText}
          </Title>
        </PanelHeader>
      )}
      <div className="SettingsContent__body">{renderSection()}</div>
    </ScrollbarProvider>
  )
}
