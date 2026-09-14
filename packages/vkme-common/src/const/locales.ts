export enum Locales {
  RU = 'ru',
  EN = 'en',
}

/**
 * https://dev.vk.com/ru/api/api-requests?ref=old_portal
 */
export const API_LOCALES: Record<Locales, string> = {
  [Locales.RU]: '0',
  [Locales.EN]: '3',
}

export const DEFAULT_LOCALES = Object.values(Locales)
