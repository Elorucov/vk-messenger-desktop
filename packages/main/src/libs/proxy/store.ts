import Store from 'electron-store'
import { ProxyStore } from './types'
import { DEFAULT_SETTINGS } from 'vkme-common'

export const proxyStore = new Store<ProxyStore>({
  name: 'proxyStore',
  defaults: {
    settings: DEFAULT_SETTINGS,
  },
})
