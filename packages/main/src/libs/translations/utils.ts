import { Locales, LoggerFunction, Translations } from 'vkme-common'
import { existsSync, promises } from 'fs'
import { join } from 'path'
import type { IOverrideLangParams } from '@vkontakte-internal/messenger'

const LANG_PACK_URL = 'https://vk.com/js/lang-pack.js?format=json'
const scope = 'TRANSLATION'

const { mkdir, writeFile } = promises

const combineKeys = (meKeys: Translations, callsKeys: Translations) => ({
  ...meKeys,
  keys: {
    ...meKeys.keys,
    ...callsKeys.keys,
  },
})

export const getLang = async (
  locales: Locales[],
  logger?: LoggerFunction,
): Promise<Record<Locales, Translations>> => {
  const fetchLangPackByName = async (name: string, lang: Locales) => {
    logger?.('main', scope, `Fetching for '${name}' section for lang '${lang}'`)
    const response = await fetch(`${LANG_PACK_URL}&name=${name}&lang=${lang}`)
    return response.json()
  }

  const langs = await Promise.all(
    locales.map((lang) =>
      Promise.all([
        fetchLangPackByName('me', lang),
        fetchLangPackByName('calls', lang),
      ]),
    ),
  )

  return langs.reduce((acc, keys, index) => {
    const lang = locales[index] as Locales

    return {
      ...acc,
      [lang]: combineKeys(keys[0], keys[1]),
    }
  }, {} as Record<Locales, Translations>)
}

export const downloadLangs = async (
  distDirPath: string,
  locales: Locales[],
  logger?: LoggerFunction,
): Promise<void> => {
  if (!existsSync(distDirPath)) {
    await mkdir(distDirPath, { recursive: true })
  }

  const translations = await getLang(locales, logger)

  await Promise.all(
    Object.entries(translations).map(([lang, keys]) => {
      const filePath = join(distDirPath, `${lang}.json`)
      logger?.('main', scope, `Saving '${lang}' to ${filePath}`)
      const value = JSON.stringify(keys)
      return writeFile(filePath, value, { encoding: 'utf-8' })
    }),
  )

  logger?.('main', scope, 'DONE')
}

export const langUse = (
  translation: Translations,
  key: keyof IOverrideLangParams<string>,
): string => {
  const value = translation.keys?.[key]
  if (typeof value === 'undefined') {
    return key
  }

  return Array.isArray(value) ? value.join('') : value
}
