import { ipcMain } from 'electron'
import { translationsStore } from '../storage/translationsStore'
import { Locales, TranslationsChannels } from 'vkme-common'
import { getWindow } from '../utils'
import { commonLogger } from '../libs/logger'
import { userSettingsStore } from '../storage/user-settings.store'
import { callsWindow } from '../libs/calls'
import { VKMeTray } from '../tray'
import { initMenu, initContextMenu } from '../menu'
import { memoryStore } from '../storage/memory.store'

const scope = 'translations handler'

ipcMain?.handle(TranslationsChannels.GET_LANG, () =>
  translationsStore.getAfterLoad(),
)

ipcMain.handle(TranslationsChannels.CHANGE_LANG, async (_, locale: Locales) => {
  commonLogger.debug('main', scope, TranslationsChannels.CHANGE_LANG)
  memoryStore.setLang(locale)
  userSettingsStore.set('lang', locale)
  const translations = await translationsStore.getAfterLoad()

  // в мейн окно
  getWindow()?.webContents.send(TranslationsChannels.ON_CHANGE, translations)
  // в звонки
  callsWindow?.browserWindow?.webContents.send(
    TranslationsChannels.ON_CHANGE,
    translations,
  )
  // локализация трея
  VKMeTray.buildMenu()
  // локализация меню
  initMenu()
  // локализация контекстного меню
  initContextMenu()
})
