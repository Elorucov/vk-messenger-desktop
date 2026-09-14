import './proxySettingsMenu.css'

import React, { useEffect, useState } from 'react'
import { Switch, Input } from '@vkontakte/vkui'
import {
  FieldGroup,
  FieldGroupItem,
} from '@vkontakte-internal/messenger/dist/browser/ui/FieldGroup/FieldGroup'
import { debounce } from '@vkontakte/vkjs'
import { DEFAULT_SETTINGS, FeatureFlags, ProxySettings } from 'vkme-common'
import { IOverrideILang } from '@vkontakte-internal/messenger'

const UPDATE_SETTINGS_DELAY = 1000
const updateSettings = debounce(
  window._proxy?.setSettings,
  UPDATE_SETTINGS_DELAY,
)

type Props = {
  lang: IOverrideILang
  isSimpleView?: boolean
}

export const ProxySettingsMenu: React.FC<Props> = ({ isSimpleView, lang }) => {
  const [isInit, setIsInit] = useState(false)
  const [settings, setSettings] = useState<ProxySettings>(DEFAULT_SETTINGS)
  const [isManualSettingsAllowed, setIsManualSettingsAllowed] = useState(false)

  const isManualFormActive = settings.isActive && settings.isManualProxyActive
  const isAuthFormActive = isManualFormActive && settings.isPasswordRequired
  const isSettingsVisible = !isSimpleView && isManualSettingsAllowed

  useEffect(() => {
    if (isInit) {
      updateSettings(settings)
    }
  }, [settings, isInit])

  useEffect(() => {
    window._featureFlags.getFeatureFlags().then((flags: FeatureFlags) => {
      setIsManualSettingsAllowed(flags.vkm_proxy_settings)
    })

    window._proxy.getSettings().then((settings) => {
      setSettings(settings)
      setIsInit(true)
    })
  }, [])

  const form = (
    <>
      <FieldGroupItem
        after={
          <Switch
            checked={settings.isActive}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                isActive: event.target.checked,
              }))
            }
          />
        }
      >
        {lang.use('me_settings_proxy_toggle')}
      </FieldGroupItem>

      {isSettingsVisible && (
        <>
          <FieldGroupItem
            after={
              <Switch
                checked={settings.isManualProxyActive}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    isManualProxyActive: event.target.checked,
                  }))
                }
                disabled={!settings.isActive}
              />
            }
            subtitle={lang.use('me_settings_proxy_manual_description')}
          >
            {lang.use('me_settings_proxy_manual')}
          </FieldGroupItem>

          <FieldGroupItem
            after={
              <Input
                value={settings.host}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, host: event.target.value }))
                }
                disabled={!isManualFormActive}
                placeholder={lang.use('me_settings_proxy_server_placeholder')}
              />
            }
          >
            {lang.use('me_settings_proxy_server')}
          </FieldGroupItem>

          <FieldGroupItem
            after={
              <Input
                value={settings.port}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, port: event.target.value }))
                }
                disabled={!isManualFormActive}
                placeholder={lang.use('me_settings_proxy_port_placeholder')}
              />
            }
          >
            {lang.use('me_settings_proxy_port')}
          </FieldGroupItem>

          <FieldGroupItem
            after={
              <Switch
                checked={settings.isPasswordRequired}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    isPasswordRequired: event.target.checked,
                  }))
                }
                disabled={!isManualFormActive}
              />
            }
          >
            {lang.use('me_settings_proxy_use_password')}
          </FieldGroupItem>

          <FieldGroupItem
            after={
              <Input
                value={settings.username}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
                disabled={!isAuthFormActive}
              />
            }
          >
            {lang.use('me_settings_proxy_user')}
          </FieldGroupItem>

          <FieldGroupItem
            after={
              <Input
                value={settings.password}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                disabled={!isAuthFormActive}
                type="password"
              />
            }
          >
            {lang.use('me_settings_proxy_password')}
          </FieldGroupItem>
        </>
      )}
    </>
  )

  return isSimpleView ? (
    form
  ) : (
    <FieldGroup title={lang.use('me_settings_proxy')} children={form} />
  )
}
