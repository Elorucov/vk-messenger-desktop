import { scope } from '@vkontakte-internal/di'
import { MetaData, MetaDataBody } from '@vkontakte-internal/plugins'

@scope.global()
export class BrowserMetaData implements MetaData {
  public setIsSPAPage(_isSPAPage: boolean): void {
    throw new Error('Method not implemented.')
  }
  public get(): MetaDataBody {
    return {} as MetaDataBody // не уважаем вккомные параметры
  }
}
