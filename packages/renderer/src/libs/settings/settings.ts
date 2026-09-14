import { exhaustivenessCheck } from '@vkontakte-internal/messenger/dist/core/utils/misc'
import {
  SettingsState,
  ISettings,
  AutoStartMode,
  PlatformName,
  Locales,
} from 'vkme-common'

export class Settings implements ISettings {
  private listeners: Set<(state: SettingsState) => void> = new Set()
  private _state: SettingsState | null = null
  public platform!: PlatformName

  constructor(private _getSettings: () => Promise<SettingsState>) {}

  public init = async (): Promise<Settings> => {
    window._common.updateSettingsState(() => this.updateStateAndNotify())
    const [state, platform] = await Promise.all([
      this._getSettings(),
      window._device.getPlatformName(),
    ])
    this._state = state
    this.platform = platform
    return this
  }

  get state(): SettingsState {
    if (!this._state) {
      throw new Error('Settings initialization failed')
    }
    return { ...this._state }
  }

  private updateStateAndNotify = async () => {
    this._state = await this._getSettings()
    this.notifyListeners(this.state)
  }

  private notifyListeners = (state: SettingsState) => {
    const listeners = [...this.listeners]
    listeners.forEach((listener) => listener(state))
  }

  public subscribe = (
    listener: (state: SettingsState) => void,
  ): VoidFunction => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  public toggle: ISettings['toggle'] = async (type, param): Promise<void> => {
    switch (type) {
      case 'autoupdate':
        window._updater.toggleAutomaticUpdates()
        break
      case 'tray':
        window._common.toggleTray()
        break
      case 'autostart':
        window._common.setAutoStart(param as AutoStartMode)
        break
      case 'downloadLocation':
        window._common.changeDownloadLocation()
        break
      case 'lang':
        window._translations.changeLang(param as Locales)
        break
      default:
        exhaustivenessCheck(type)
    }
  }
}
