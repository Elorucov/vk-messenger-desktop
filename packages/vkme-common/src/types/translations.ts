export type TranslationValue = string | string[]

export type Translations = {
  keys: Record<string, TranslationValue>
  config: Record<string, unknown>
}
