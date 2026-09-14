import Store from 'electron-store'

const store = new Store<Record<string, unknown>>({
  name: 'globalStore',
  clearInvalidConfig: true,
})

type GlobalStoreValue =
  | 'readyToClose'
  | 'window-bounds'
  | 'theme'
  | 'is-encryption-available'
  | 'isFirstStart'
  | 'is-full-screen-mode'
  | 'is-maximized'

// eslint-disable-next-line import/no-anonymous-default-export, import/no-default-export
export default {
  has(key: GlobalStoreValue): boolean {
    return store.has(key)
  },
  set<T>(key: GlobalStoreValue, payload: T): void {
    store.set(key, payload)
  },
  get<T>(key: GlobalStoreValue): T {
    return store.get(key) as T
  },
  delete(key: GlobalStoreValue): void {
    return store.delete(key)
  },
}
