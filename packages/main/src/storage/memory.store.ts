import { v4 } from 'uuid'
import { Locales } from 'vkme-common'
import { userSettingsStore } from './user-settings.store'
import { featureFlagsStore } from './featureFlagsStore'

enum MemoryStoreKeys {
  CSRF_TOKEN = 'CSRF_TOKEN',
  UPDATE_URL = 'UPDATE_URL',
  XDEBUG = 'XDEBUG',
  LANG = 'LANG',
}

const memoryStoreMap = new Map<MemoryStoreKeys, string>()
memoryStoreMap.set(
  MemoryStoreKeys.UPDATE_URL,
  import.meta.env.VITE_APP_UPDATE_URL,
)

export const memoryStore = {
  getCSRFToken(forceRefresh?: boolean): string {
    if (!forceRefresh && memoryStoreMap.has(MemoryStoreKeys.CSRF_TOKEN)) {
      return memoryStoreMap.get(MemoryStoreKeys.CSRF_TOKEN) as string
    }
    const token = v4()
    memoryStoreMap.set(MemoryStoreKeys.CSRF_TOKEN, token)
    return token
  },
  getUpdateUrl(): string {
    return memoryStoreMap.get(MemoryStoreKeys.UPDATE_URL) as string
  },
  setUpdateUrl(url: string): void {
    memoryStoreMap.set(MemoryStoreKeys.UPDATE_URL, url)
  },
  getXDebug(): boolean {
    return Boolean(memoryStoreMap.get(MemoryStoreKeys.XDEBUG))
  },
  setXDebug(flag: boolean): void {
    if (flag) {
      memoryStoreMap.set(MemoryStoreKeys.XDEBUG, String(true))
    } else {
      memoryStoreMap.delete(MemoryStoreKeys.XDEBUG)
    }
  },
  async getLang(): Promise<Locales> {
    // если значения нет, ждем тоглы и сетим по ним
    if (!memoryStoreMap.has(MemoryStoreKeys.LANG)) {
      const { vkm_multi_langs } = await featureFlagsStore.getAfterLoad()
      memoryStoreMap.set(
        MemoryStoreKeys.LANG,
        vkm_multi_langs ? userSettingsStore.get('lang') : Locales.RU,
      )
    }

    return memoryStoreMap.get(MemoryStoreKeys.LANG) as Locales
  },
  setLang(locale: Locales): void {
    memoryStoreMap.set(MemoryStoreKeys.LANG, locale)
  },
}
