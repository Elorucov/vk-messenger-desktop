import { ipcRenderer, contextBridge } from 'electron'
import { ProxyChannels, ProxySettings } from 'vkme-common'

contextBridge.exposeInMainWorld('_proxy', {
  setSettings(rules: ProxySettings): void {
    ipcRenderer.send(ProxyChannels.SET_SETTINGS, rules)
  },
  getSettings(): Promise<ProxySettings> {
    return ipcRenderer.invoke(ProxyChannels.GET_SETTINGS)
  },
} as Window['_proxy'])
