import { app } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { Translations } from 'vkme-common'
import { commonLogger } from '../libs/logger'
import { memoryStore } from './memory.store'

const scope = 'translations store'

class TranslationsStore {
  async getAfterLoad(): Promise<Translations> {
    const currentLocale = await memoryStore.getLang()

    try {
      const fileName = join(
        app.getAppPath(),
        'packages',
        'main',
        'dist',
        'lang',
        `${currentLocale}.json`,
      )
      const langContent = fs.readFileSync(fileName, { encoding: 'utf-8' })
      return JSON.parse(langContent)
    } catch (error) {
      commonLogger.error('main', scope, 'load', error)
    }

    return { keys: {}, config: {} } as Translations
  }
}

export const translationsStore = new TranslationsStore()
