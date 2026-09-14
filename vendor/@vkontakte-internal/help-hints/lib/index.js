// Подсказки в десктопе не показываем: HelpHints оставлен заглушкой.
export { HelpHintsProvider } from './components/HelpHintsProvider/HelpHintsProvider.js'
export { useHelpHint } from './hooks/helpHint.js'
export { HelpHintId } from './types/index.js'
export { StickersUGCKeyboardOnboardingResourceKey } from './types/index.js'
export { useHelpHintResource } from './hooks/helpHintResource.js'
export { KeyboardStickersVmojiResourceKey } from './types/index.js'
export { Cache, CacheKey } from './cache.js'
export { HelpHint } from './hint.js'

export const HelpHints = {
  setAPI() {},
  getSync() {
    return undefined
  },
  async reload() {},
}
