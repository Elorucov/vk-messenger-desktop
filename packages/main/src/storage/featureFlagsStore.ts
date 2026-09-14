import { ElectronFeatureFlagsFetcher } from '../libs/featureFlags/electronFeatureFlagFetcher'
import Store from 'electron-store'
import { api } from '../utils/api'
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from 'vkme-common'
import credentialsStore from './credentials.store'
import { commonLogger } from '../libs/logger'

const scope = 'feature flags store'

class FeatureFlagsStore {
  private store = new Store<{ featureFlags: FeatureFlags }>({
    name: 'featureFlagsStore',
    clearInvalidConfig: true,
  })

  private requestInProgress: Promise<FeatureFlags> | null = null

  constructor() {
    if (!credentialsStore.hasApiToken()) {
      this.clear()
    }
  }

  get(): FeatureFlags {
    if (!this.store.has('featureFlags')) {
      this.setDefault()
    }

    return this.store.get('featureFlags')
  }

  async getAfterLoad(): Promise<FeatureFlags> {
    if (!this.requestInProgress) {
      return this.get()
    }

    try {
      await this.requestInProgress
      return this.get()
    } catch (error) {
      commonLogger.error('main', scope, 'getAfterLoad', error)
      return this.get()
    }
  }

  set(flags: FeatureFlags): void {
    this.store.set('featureFlags', flags)
  }

  setDefault(): void {
    this.store.set('featureFlags', DEFAULT_FEATURE_FLAGS)
  }

  async load(): Promise<FeatureFlags> {
    if (this.requestInProgress !== null || !credentialsStore.hasApiToken()) {
      return this.get()
    }

    try {
      const flagsFetcher = new ElectronFeatureFlagsFetcher(api)

      this.requestInProgress = flagsFetcher.fromApi()

      const flags = await this.requestInProgress

      this.store.set('featureFlags', flags)
      this.requestInProgress = null

      return flags
    } catch (error) {
      commonLogger.error('main', scope, 'load', error)
      return this.get()
    }
  }

  clear(): void {
    this.store.clear()
  }
}

export const featureFlagsStore = new FeatureFlagsStore()
