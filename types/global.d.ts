/**
 * Мосты, которые preload прокидывает в окно через contextBridge.
 * Точные сигнатуры задаются реализациями в packages/preload/src.
 */
declare global {
  interface Window {
    _calls: any
    _callsActiveCall: any
    _common: any
    _credentials: any
    _device: any
    _downloader: any
    _featureFlags: any
    _invoke: any
    _isMediaWindowOpened: boolean
    _log: any
    _media: any
    _mediaSharingBridge: any
    _mediaWindow: any
    _proxy: any
    _settings: any
    _tmr: any[]
    _translations: any
    _updater: any
    _vkidCaptchaWidget: any
    versions: Record<string, unknown>
  }
}

export {}
