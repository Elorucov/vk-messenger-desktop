import { rootContainer as diRootContainer } from '@vkontakte-internal/di'
import { AuthService, Analytics, MetaData } from '@vkontakte-internal/plugins'
import { getDomain, getLoginUrl } from './calls'
import { BrowserAnalytics } from './libs/diImplementations/BrowserAnalytics'
import { BrowserMetaData } from './libs/diImplementations/BrowserMetaData'

let inited = false

export const initCallsDi = (userId: number): void => {
  if (inited) {
    return
  }

  window.vk = {
    id: userId,
    __domain: getDomain(),
    apiConfigDomains: { loginDomain: getLoginUrl() },
  }

  diRootContainer.replace(Analytics, BrowserAnalytics)
  diRootContainer.replace(MetaData, BrowserMetaData)

  diRootContainer.resolve(AuthService).setUserId(userId)

  inited = true
}
