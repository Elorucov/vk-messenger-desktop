import { Config, Auth } from '@vk-ecosystem/sdk'

import * as Sentry from '@sentry/electron/renderer'
import {
  AuthPayload,
  ResponseRedirectState,
  UserProfileTypeEnumNames,
} from 'vkme-common'
import { CLIENT_ID } from 'vkme-common'

class AuthWrapper {
  private token: string | null = null
  public currentUserId: number | null = null
  public profileType: UserProfileTypeEnumNames | undefined

  public async auth(isExpired = false): Promise<string> {
    if (isExpired || !this.token) {
      let payload: AuthPayload | undefined

      if (!this.token) {
        payload = await window._credentials.getAuthPayload()
      }

      if (isExpired && this.currentUserId) {
        payload = await window._credentials.refreshToken(this.currentUserId)
      }

      if (payload) {
        this.token = payload.apiToken
        this.currentUserId = payload.currentUserId
        this.profileType = payload.profileType
        Sentry.setUser({ id: payload.currentUserId })

        // отправляем стату по юзеру в mytracker
        const _tmr = window._tmr || (window._tmr = [])
        _tmr.push({ type: 'setUserID', userid: this.currentUserId })
      }
    }

    //токен будет всегда, потому что если мы не смогли получить его по какой-то причине, то произойдет разлогин
    return this.token as string
  }

  public async openLoginPage(profileType: 'edu' | 'normal') {
    Config.init({
      appId: CLIENT_ID,
      redirectUrl: 'vk://vk.com/auth',
      state: await this.getRedirectState(
        profileType === 'edu'
          ? UserProfileTypeEnumNames.EDU
          : UserProfileTypeEnumNames.NORMAL,
      ),
    })

    if (profileType === 'edu') {
      Auth.login({
        action: {
          name: 'login_with_multi_user',
          params: {
            flow_name: 'edu',
          },
        },
      })
      return
    }

    Auth.login({})

    //window._credentials.openVKID()
  }

  public async handleLogout(): Promise<void> {
    window.location.replace('/')
    await window._credentials.logout()
  }

  public checkIsEducationProfile(): boolean {
    return this.profileType === UserProfileTypeEnumNames.EDU
  }

  private async getRedirectState(profileType: UserProfileTypeEnumNames) {
    const state: ResponseRedirectState = {
      profileType,
      csrfToken: await window._credentials.refreshCSRFToken(),
    }

    return encodeURIComponent(JSON.stringify(state))
  }
}

const authWrapper = new AuthWrapper()

export { authWrapper }
