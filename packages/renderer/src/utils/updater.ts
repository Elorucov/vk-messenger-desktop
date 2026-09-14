import { IOverrideILang } from '@vkontakte-internal/messenger'

export const getUpdateVersion = (
  lang: IOverrideILang,
  version?: string,
  size?: number,
): string => {
  const textArray = []

  if (version) {
    textArray.push(
      lang.use('me_settings_update_version', { values: { version } }),
    )
  }

  if (size) {
    textArray.push(
      lang.use('me_settings_update_version_postfix', {
        values: {
          size: String(Math.ceil(size / 1024 / 1024)),
        },
      }),
    )
  }

  return textArray.join('')
}
