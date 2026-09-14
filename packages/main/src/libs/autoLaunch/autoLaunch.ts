import AutoLaunch from 'auto-launch'
import { app } from 'electron'
import { isAppImage, isDev, isLinux, isMac, isWindows } from '../../utils'
import { AutoStartMode } from 'vkme-common'
import { userSettingsStore } from '../../storage/user-settings.store'
import { commonLogger } from '../logger'

const scope = 'autolauncher'

class AutoLauncher {
  private appLauncher: AutoLaunch | null = null

  constructor() {
    if (isMac) {
      // На маке предполагаем, что юзер включит автозапуск через меню в доке
      return
    }

    if (isWindows) {
      // юзаем loginItem в onChange
      return
    }

    let path = process.execPath

    // TODO пакет давно не выпускал новую версию, фиксим самостоятельно
    // на линуксе из-за пробела не находит путь до файла
    if (isAppImage) {
      path = process.env.APPIMAGE as string
    }
    if (isLinux) {
      path = path.replace(/(\s+)/g, '\\$1')
    }

    this.appLauncher = new AutoLaunch({
      name: app.name,
      isHidden: true,
      path,
    })
  }

  public async onChange(mode: AutoStartMode): Promise<void> {
    if (isDev) {
      commonLogger.debug('main', scope, 'Not working in dev mode')
      return
    }

    if (isWindows) {
      app.setLoginItemSettings({
        openAtLogin: mode !== 'disabled',
      })
    }

    if (mode === 'disabled') {
      this.appLauncher?.disable()
    }

    if (['visible', 'hidden'].includes(mode)) {
      this.appLauncher?.enable()
    }

    userSettingsStore.set('autoStartMode', mode)
  }

  public get(): AutoStartMode {
    const configState = userSettingsStore.get('autoStartMode')

    if (isWindows) {
      const loginItem = app.getLoginItemSettings()

      const isEnabledInSystem = loginItem.openAtLogin
      const maybeState: AutoStartMode = isEnabledInSystem
        ? 'visible'
        : 'disabled'

      if (maybeState !== configState) {
        const nextState = maybeState
        this.onChange(maybeState)
        return nextState
      }
    }

    return configState
  }
}

export const autoLauncher = new AutoLauncher()
