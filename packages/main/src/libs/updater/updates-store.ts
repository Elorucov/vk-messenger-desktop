import { app } from 'electron'
import { UpdateStatus, UpdaterStoreKey, UpdateState } from 'vkme-common'
import { userSettingsStore } from '../../storage/user-settings.store'
import path from 'path'
import { existsSync, readFileSync, rmSync } from 'fs'
import { commonLogger } from '../logger'

const migrateStore = () => {
  const oldStorePath = path.join(app.getPath('userData'), 'updater-state.json')
  if (existsSync(oldStorePath)) {
    const file = readFileSync(oldStorePath, 'utf8')
    const json = JSON.parse(file) as UpdateState
    const flag = json?.[UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED]
    if (flag) {
      userSettingsStore.set(
        'isAutoUpdates',
        json[UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED],
      )
      rmSync(oldStorePath)
      commonLogger.info('main', 'updater store', 'store migrated')
    }
  }
}
migrateStore()

let updatesStore: Omit<
  UpdateState,
  UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED
> = {
  [UpdaterStoreKey.STATUS]: UpdateStatus.NOOP,
  [UpdaterStoreKey.PROGRESS]: 0,
  [UpdaterStoreKey.PREVIOUS_VERSION]: app.getVersion(),
  [UpdaterStoreKey.RELEASE_NOTES]: null,
  [UpdaterStoreKey.NEW_VERSION]: null,
  [UpdaterStoreKey.UPDATE_SIZE]: null,
  [UpdaterStoreKey.IS_FORCED_CHECK]: false,
}

export const UpdatesStore = {
  has(key: UpdaterStoreKey): boolean {
    if (key === UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED) {
      return userSettingsStore.has('isAutoUpdates')
    }
    return key in updatesStore
  },
  set<K extends UpdaterStoreKey>(key: K, payload: UpdateState[K]): void {
    if (key === UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED) {
      userSettingsStore.set('isAutoUpdates', payload)
      return
    }
    updatesStore = { ...updatesStore, [key]: payload }
  },
  setMany(
    keyVal: Partial<{ [key in UpdaterStoreKey]: UpdateState[key] }>,
  ): void {
    if (UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED in keyVal) {
      userSettingsStore.set(
        'isAutoUpdates',
        keyVal[UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED],
      )
      delete keyVal[UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED]
    }

    updatesStore = { ...updatesStore, ...keyVal }
  },
  get<K extends UpdaterStoreKey>(key: K): UpdateState[K] {
    if (key === UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED) {
      return userSettingsStore.get('isAutoUpdates') as UpdateState[K]
    }
    return updatesStore[key as keyof typeof updatesStore] as UpdateState[K]
  },
  getStore(): UpdateState {
    return {
      ...updatesStore,
      [UpdaterStoreKey.IS_AUTOMATIC_DOWNLOAD_ENABLED]:
        userSettingsStore.get('isAutoUpdates'),
    }
  },
  reset(): void {
    this.setMany({
      [UpdaterStoreKey.PREVIOUS_VERSION]: app.getVersion(),
      [UpdaterStoreKey.RELEASE_NOTES]: undefined,
      [UpdaterStoreKey.NEW_VERSION]: undefined,
      [UpdaterStoreKey.UPDATE_SIZE]: undefined,
      [UpdaterStoreKey.STATUS]: UpdateStatus.NOOP,
    })
  },
}
