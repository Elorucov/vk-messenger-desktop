import { ipcMain } from 'electron'
import { proxy } from './proxy'
import { ProxyChannels, ProxySettings } from 'vkme-common'

ipcMain?.on(ProxyChannels.SET_SETTINGS, (_event, settings: ProxySettings) => {
  proxy.setSettings(settings)
})

ipcMain?.handle(ProxyChannels.GET_SETTINGS, () => proxy.getSettings())
