import { ipcRenderer, contextBridge } from 'electron'
import { Translations, TranslationsChannels } from 'vkme-common'

const api: Window['_translations'] = {
  getLang: () => ipcRenderer.invoke(TranslationsChannels.GET_LANG),
  changeLang: (locale) =>
    ipcRenderer.invoke(TranslationsChannels.CHANGE_LANG, locale),
  onTranslationUpdate: (listener: (translations: Translations) => void) => {
    ipcRenderer.on(TranslationsChannels.ON_CHANGE, (_event, data) => {
      listener(data)
    })
  },
}

contextBridge.exposeInMainWorld('_translations', api)
