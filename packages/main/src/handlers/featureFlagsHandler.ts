import { ipcMain } from 'electron'
import { featureFlagsStore } from '../storage/featureFlagsStore'
import { FeatureFlagsChannels, FeatureFlags } from 'vkme-common'

ipcMain?.handle(FeatureFlagsChannels.GET_FEATURE_FLAGS, () =>
  featureFlagsStore.get(),
)

ipcMain?.handle(FeatureFlagsChannels.GET_AFTER_LOAD_FEATURE_FLAGS, () =>
  featureFlagsStore.getAfterLoad(),
)

ipcMain?.handle(
  FeatureFlagsChannels.SET_FEATURE_FLAGS,
  (_, flags: FeatureFlags) => featureFlagsStore.set(flags),
)

ipcMain?.handle(FeatureFlagsChannels.SET_DEFAULT_FEATURE_FLAGS, () =>
  featureFlagsStore.setDefault(),
)

ipcMain?.handle(FeatureFlagsChannels.LOAD_FEATURE_FLAGS, () =>
  featureFlagsStore.load(),
)

ipcMain?.handle(FeatureFlagsChannels.CLEAR_FEATURE_FLAGS, () =>
  featureFlagsStore.clear(),
)
