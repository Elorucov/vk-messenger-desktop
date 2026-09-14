import { DEFAULT_FEATURE_FLAGS as DEFAULT_FEATURE_FLAGS_WEB } from '@vkontakte-internal/messenger/dist/core/config/featureFlags'

type WebFeatureFlags = typeof DEFAULT_FEATURE_FLAGS_WEB

/**
 * Флаги веб-мессенджера плюс те, что существуют только в десктопном клиенте.
 */
export type FeatureFlags = Omit<WebFeatureFlags, keyof DesktopFeatureFlags> &
  DesktopFeatureFlags

export type DesktopFeatureFlags = {
  vkm_update_url: string | null
  vkm_desktop_win10_update_url: string | boolean | null
  vkm_calls_history: boolean
  vkm_channels_sferum_url: boolean
  vkm_profile_channels: boolean
  vkm_channel_post_editting: boolean
  vkm_create_channel: boolean
  vkm_proxy_settings: boolean
  vkm_fullscreen_gallery: boolean
  vkm_multi_langs: boolean
  vkm_download: boolean
  vkm_enable_schedule_edu: boolean
  vkm_old_channels_mock: boolean
  vkm_profile_info_screen_name: boolean
  vkm_settings_experimental: boolean
  vkm_stickers_popup: boolean
}
