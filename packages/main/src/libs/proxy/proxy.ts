import { app, session } from 'electron'
import { proxyStore } from './store'
import { ProxySettings } from 'vkme-common'
import { commonLogger } from '../logger'

const SCOPE = 'proxy'

class Proxy {
  public async init(): Promise<void> {
    try {
      app.on('login', (event, webContents, request, authInfo, callback) => {
        if (authInfo.isProxy) {
          const { username, password } = this.getSettings()
          callback(username, password)
        }
      })

      await this.applySettings()
    } catch (error) {
      commonLogger.error('main', SCOPE, error)
    }
  }

  public getSettings(): ProxySettings {
    return proxyStore.get('settings')
  }

  public setSettings(settings: ProxySettings): void {
    proxyStore.set('settings', settings)
    this.applySettings()
  }

  private async applySettings(): Promise<void> {
    try {
      const settings = this.getSettings()
      const { host, port } = settings

      if (settings.isActive) {
        let proxyRules: string | undefined = undefined

        if (settings.isManualProxyActive && host && port) {
          proxyRules = `${host}:${port}`
        }

        await session.defaultSession.setProxy({
          mode: proxyRules ? 'fixed_servers' : 'system',
          proxyRules,
        })
      } else {
        await session.defaultSession.setProxy({ mode: 'direct' })
      }
    } catch (error) {
      commonLogger.error('main', SCOPE, error)
    }
  }
}

export const proxy = new Proxy()
