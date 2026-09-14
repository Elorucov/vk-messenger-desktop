import { Lang } from '@vkontakte-internal/messenger/dist/browser/env/Lang'
import { initLang } from '@vkontakte-internal/vkjs/lib/Lang'
import { Locales, Translations } from 'vkme-common'
import { ILogger, IOverrideILang } from '@vkontakte-internal/messenger'

const scope = 'ElectronLang'

// @ts-expect-error Ошибка из-за оверрайда рид-онли полей
class ElectronLang extends Lang implements IOverrideILang {
  public override locale: Locales
  private override decodedKeys: Partial<Translations['keys']> = {}

  private listeners: Set<(locale: Locales) => void> = new Set()

  constructor(
    private override logger: ILogger.ILogger,
    private override translations: Translations,
  ) {
    super(logger, translations)
    this.locale = translations.config.locale

    window._translations.onTranslationUpdate((translations) => {
      window._log.debug(
        'renderer',
        scope,
        'onTranslationUpdate',
        translations.config?.locale,
      )
      initLang({
        source: () => translations.keys,
        config: () => translations.config,
      })
      this.translations = translations
      this.locale = translations.config.locale
      this.decodedKeys = {}
      this.notifyListeners()

      // для звонков
      window.langpack = translations.keys
      window.lang = translations.keys
    })
  }

  private notifyListeners = () => {
    const listeners = [...this.listeners]
    listeners.forEach((listener) => listener(this.locale))
  }

  public subscribe: IOverrideILang['subscribe'] = (listener) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }
}

export { ElectronLang }
