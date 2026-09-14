import { ipcRenderer, contextBridge } from 'electron'
import { FeatureFlagsChannels, FeatureFlags } from 'vkme-common'

const api: Window['_featureFlags'] = {
  getFeatureFlags: (): Promise<FeatureFlags> =>
    ipcRenderer.invoke(FeatureFlagsChannels.GET_FEATURE_FLAGS),
  getAfterLoadFeatureFlags: (): Promise<FeatureFlags> =>
    ipcRenderer.invoke(FeatureFlagsChannels.GET_AFTER_LOAD_FEATURE_FLAGS),
  setFeatureFlags: (flags: FeatureFlags): Promise<void> =>
    ipcRenderer.invoke(FeatureFlagsChannels.SET_FEATURE_FLAGS, flags),
  setDefaultFeatureFlags: (): Promise<void> =>
    ipcRenderer.invoke(FeatureFlagsChannels.SET_DEFAULT_FEATURE_FLAGS),
  loadFeatureFlags: (): Promise<FeatureFlags> =>
    ipcRenderer.invoke(FeatureFlagsChannels.LOAD_FEATURE_FLAGS),
  clearFeatureFlags: (): Promise<void> =>
    ipcRenderer.invoke(FeatureFlagsChannels.CLEAR_FEATURE_FLAGS),
}
contextBridge.exposeInMainWorld('_featureFlags', api)
