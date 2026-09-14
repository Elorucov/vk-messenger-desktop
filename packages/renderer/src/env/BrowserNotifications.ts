import type { IBrowserNotifications } from '@vkontakte-internal/messenger'

class BrowserNotifications
  implements IBrowserNotifications.IBrowserNotifications
{
  private state: boolean

  public constructor(isEnabled: boolean | undefined) {
    this.state = isEnabled ?? true
  }

  public readonly getPermission =
    (): IBrowserNotifications.BrowserNotificationsPermission => {
      if (!window.Notification) {
        return 'unknown'
      }

      return window.Notification.permission ?? 'default'
    }

  public readonly isExternal = (): boolean => {
    return false
  }

  public readonly isEnabled = (): boolean => this.state

  public onSystemSettingChange = (): void => {}

  public readonly getState = (): boolean => {
    return this.state
  }

  public readonly onChange = async (value: boolean): Promise<boolean> => {
    if (typeof value === 'boolean') {
      this.state = value
      return value
    }

    return value
  }

  public readonly onExternal = (): void => {}

  public isBrowserNotificationsEnabled = (): boolean | 'external' => {
    return this.state
  }

  public dispose(): void {}
}

export { BrowserNotifications }
