import { DEFAULT_FEATURE_FLAGS as DEFAULT_FEATURE_FLAGS_WEB } from '@vkontakte-internal/messenger/dist/core/config/featureFlags'
import { FeatureFlags } from '../types/featureFlagsType'

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  ...DEFAULT_FEATURE_FLAGS_WEB,
  vkm_update_url: null,
  vkm_calls_history: false,
  vkm_channels_sferum_url: true,
  vkm_profile_channels: true,
  vkm_channel_post_editting: true,
  vkm_create_channel: true,
  vkm_desktop_win10_update_url: false,
  // оверрайд тогла на дефолтное true, иначе с дефолтными
  // флагами вообще не будет никакого меню у сообщений
  vkm_proxy_settings: false,
  vkm_fullscreen_gallery: false,
  vkm_multi_langs: false,
} as const
