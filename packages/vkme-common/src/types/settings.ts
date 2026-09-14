import { Locales } from '../const/locales'
import { PlatformName } from './platformName'

export type Theme = 'system' | 'light' | 'dark'

export type AutoStartMode = 'disabled' | 'hidden' | 'visible'

export type SettingsState = {
  updater: {
    isEnabled: boolean
    isAutoUpdateEnabled: boolean
  }
  autoStartMode: AutoStartMode
  trayIsEnabled: boolean
  downloadLocation: string
  lang: Locales
}

export type SettingsToggleType =
  | 'autoupdate'
  | 'tray'
  | 'autostart'
  | 'downloadLocation'
  | 'lang'

export interface ISettings {
  platform: PlatformName
  state: SettingsState
  init(): Promise<ISettings>
  subscribe(listener: (state: SettingsState) => void): VoidFunction
  toggle(
    type: SettingsToggleType,
    param?: AutoStartMode | Locales,
  ): Promise<void>
}
