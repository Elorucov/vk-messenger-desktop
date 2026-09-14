import { decodeHTMLEntities, decodeHTMLEntitiesDeep } from '@vkontakte/vkjs'
import {
  langNumeric,
  langDate,
  langSex,
} from '@vkontakte-internal/vkjs/lib/Lang'
import { type IInitParams } from '@vkontakte-internal/calls/index'
import { commonLogger } from './libs/logger'

const scope = 'lang'

// https://gitlab.mvk.com/vkcom/vkcom/-/blob/master/static/js/modules/shared/lib/langs.ts

function getLangKeyFromGlobal(key: string): any {
  const raw =
    (window.cur &&
      (window.cur as Dictionary<any>).lang &&
      (window.cur as Dictionary<any>).lang[key]) ||
    (window.lang && window.lang[key]) ||
    (window.langpack && window.langpack[key]) ||
    (window as any)[key]

  if (!raw) {
    commonLogger.error(
      'renderer',
      scope,
      new ReferenceError(`No value for lang key "${key}" is specified`),
    )
  }

  return raw
}

export function getLang(key: string): string[]

export function getLang(key: string, type: 'raw'): string | string[]

export function getLang(
  key: string,
  type?: 'raw' | number,
  formatNum?: number, // в звонках стоит тип boolean. оставил number для совместимости
): string | string[] | Record<string, string> {
  if (!key) {
    return '...'
  }

  try {
    const raw = getLangKeyFromGlobal(key)
    if (!raw) {
      const parts = key.split('_')
      parts.shift()
      return parts.join(' ')
    }

    let result
    if (typeof raw === 'function') {
      result = String(raw.apply(null, [...arguments]))
    } else if ((type !== undefined || Array.isArray(raw)) && type !== 'raw') {
      result = langNumeric(type as number, raw, formatNum)
    } else if (typeof raw === 'string') {
      result = raw
    } else {
      return decodeHTMLEntitiesDeep(raw)
    }

    return decodeHTMLEntities(result as string)
  } catch (e: any) {
    const message =
      'getLang error: ' + e.message + '(' + [...arguments].join(', ') + ')'

    commonLogger.error('renderer', scope, new ReferenceError(message))

    return '...'
  }
}

const escapeTokensValues = (
  tokens: Record<string, string>,
): Record<string, string> => {
  const escapedEntries = Object.entries(tokens).map(([key, value]) => [
    key,
    escape(value),
  ])

  return Object.fromEntries(escapedEntries)
}

/**
 * Специальные langUtils для звонков
 */
export const langUtils: IInitParams['langUtils'] = {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getLang,
  // Не меняйте формат langSex() на такой как в vkcom!
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  langSex: (gender: any, key: string, text: string): string => {
    return langSex(gender, text)
  },
  // Не меняйте формат langNumeric() на такой как в vkcom!
  langNumeric: (
    count: number,
    key: string,
    vars: string[],
    formatNum?: boolean,
  ): string => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return langNumeric(count, vars, formatNum)
  },

  // Не передавайте langDate()!
  // Передавайте методы под отдельные юзкейсы
  langShortDateTime: (time: number): string => {
    return langDate(
      time,
      getLang('global_short_date_time', 'raw'),
      0,
      getLang('months_of'),
      true,
    )
  },
  langShortDate: (time: number, onlyDate = true): string => {
    return langDate(
      time,
      getLang('global_short_date', 'raw'),
      0,
      getLang('months_sm_of'),
      onlyDate,
    )
  },
  langReplace: (
    string: string,
    tokens: Record<string, string>,
    params: { escapeTokens?: boolean } = {},
  ): string => {
    const tokensToReplace: typeof tokens = params.escapeTokens
      ? escapeTokensValues(tokens)
      : tokens

    for (const token in tokensToReplace) {
      if (!tokensToReplace.hasOwnProperty(token)) {
        continue
      }
      const tokenName = `{${token}}`
      string = string.replace(tokenName, tokensToReplace[token] as string)
    }
    return string
  },
}
