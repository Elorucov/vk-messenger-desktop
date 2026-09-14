import { scope } from '@vkontakte-internal/di'
import { Langs } from '@vkontakte-internal/plugins'
import { langUtils } from '../../lang'
import { Locales } from 'vkme-common'
import {
  langNumeric,
  langDate,
  langSex,
} from '@vkontakte-internal/vkjs/lib/Lang'

@scope.platform()
export class BrowserLangs extends Langs {
  public numeric(
    count: number,
    langVariants: string | string[],
    formatNumber?: boolean,
  ): string {
    // @ts-expect-error 3 параметр используется как булеан, игнорируем
    return langNumeric(count, langVariants, formatNumber)
  }

  public sex(sex: number, langVariants: string | string[]): string {
    // @ts-expect-error так надо, в новой реализации кастинг происходит под капотом
    return langSex(Number(sex), langVariants)
  }

  public date(
    dateValue: Date,
    langVariants: string | string[],
    monthVariants: string | string[],
    options: Parameters<Langs['date']>[3] = {},
  ): string {
    return langDate(
      dateValue,
      langVariants,
      options.offset ?? 0,
      // @ts-expect-error в вкком такое же поведение, но другая типизация
      monthVariants,
      options.onlyDate,
    )
  }

  public getLang(key: string, raw?: true): string | string[]
  public getLang(key: string, raw: false): string
  public getLang(key: string, raw = false): string | string[] {
    if (raw) {
      return langUtils.getLang(key, 'raw')
    } else {
      return langUtils.getLang(key)
    }
  }

  public get locale(): string {
    return window.langConfig?.locale || Locales.RU
  }
  public get localeId(): number {
    if (this.locale === Locales.EN) {
      return 3
    }

    return 0
  }
}
