import { FeatureFlagsFetcher } from '@vkontakte-internal/messenger/dist/browser/FeatureFlagsFetcher'
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from 'vkme-common'

class ElectronFeatureFlagsFetcher extends FeatureFlagsFetcher {
  // метод копирует полностью оригинальный из рефа,
  // разница лишь в том, что мы мапимся по другим дефолтным флагам.
  // можно поговорить с ребята из рефа, чтобы в их классе передавать
  // дефолтные флаги параметром
  override async fromApi(): Promise<FeatureFlags> {
    try {
      //приватное поле
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const res = await this.api.fetch(
        'account.getTogglesExternal',
        {
          toggles: Object.keys(DEFAULT_FEATURE_FLAGS)
            .map((key) => {
              if (key.startsWith('me_')) {
                return `vkm_${key.slice(3)}`
              } else {
                return key
              }
            })
            .join(','),
        },
        { retries: 1, usePrefetch: true },
      )
      // приватный метод
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.parse(res)
    } catch {
      return DEFAULT_FEATURE_FLAGS
    }
  }
}

export { ElectronFeatureFlagsFetcher }
