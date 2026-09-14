import type { VKSilentAuthPayload } from '@vk-ecosystem/sdk'
import { dialog } from 'electron'
import { URL } from 'url'
import { openIndexPage } from './page-location'
import credentialsStore from '../storage/credentials.store'
import { getWindow } from './window'
import {
  authByExchangeToken,
  exchangeSilentAuthToken,
  fetchAnonymToken,
  getExchangeToken,
} from '../libs/auth/api.requests'
import { ExchangeSilentTokenResponsePayload } from '../libs/auth/types'
import { logout } from '../libs/auth/handlers'
import {
  Credentials,
  ResponseRedirectState,
  UserExchangeToken,
  UserProfileTypeEnumNames,
} from 'vkme-common'
import { featureFlagsStore } from '../storage/featureFlagsStore'
import { commonLogger } from '../libs/logger'
import { memoryStore } from '../storage/memory.store'
import { translationsStore } from '../storage/translationsStore'
import { langUse } from '../libs/translations/utils'

const scope = 'open url handler'

export const handleOpenUrl = (url?: string): string | undefined => {
  if (!url?.startsWith('vk://')) {
    return
  }
  try {
    const response = new URL(url)
    if (response.pathname.startsWith('/write')) {
      return response.pathname.replace('/write', '/convo/')
    }

    /**
     * Обработка короткой ссылки с паролем
     */
    if (response.searchParams.has('call')) {
      /**
       * Ну че вы не договоритесь чтоль сделать одинаковые ссылки момент
       */
      let route = `/call/${response.searchParams.get('call')}`
      if (response.searchParams.has('p')) {
        route += `?p=${response.searchParams.get('p')}`
      }
      return route
    }

    if (['me.sferum.ru', 'sferum.ru'].includes(response.hostname)) {
      const isChannel = response.searchParams.get('p') === 'channel'
      const isChat = response.searchParams.get('p') === 'messages'
      const isMiniApp = response.searchParams.get('p') === 'miniapp'
      const callIdFromSferum = response.searchParams.get('call_link')

      /**
       *  Обработка присоединения к каналам в сферуме
       */
      if (isChannel) {
        const channelIdFromSferum = response.searchParams.get('channelId')
        const postIdFromSferum = response.searchParams.get('postId')
        const params = new URLSearchParams({
          sferum: encodeURIComponent(true),
        })

        if (postIdFromSferum) {
          params.append('cmid', encodeURIComponent(postIdFromSferum))
        }

        if (channelIdFromSferum) {
          return `/channels/${channelIdFromSferum}?${params.toString()}`
        }
      }

      /**
       *  Обработка присоединения к чату в сферуме
       */
      if (isChat) {
        const chatIdFromSferum = response.searchParams.get('join')

        if (chatIdFromSferum) {
          return `/chat/join/${chatIdFromSferum}`
        }
      }

      /**
       *  Обработка присоединения к миниаппу в сферуме
       */
      if (isMiniApp) {
        const parsedUrl = new URL(url)
        const id = parsedUrl.searchParams.get('id')
        const hash =
          parsedUrl.searchParams.get('hash') || parsedUrl.hash || undefined

        if (id) {
          const searchParams = new URLSearchParams({
            modal: `miniapp${parseInt(id)}`,
            sferum: 'true',
          })

          if (hash) {
            searchParams.append('hash', hash.replace('#', ''))
          }

          return `/?${searchParams.toString()}`
        }
      }

      /**
       *  Обработка присоединения к звонку по полной ссылке в сферуме
       */
      if (callIdFromSferum) {
        return `/call/join/${callIdFromSferum}`
      }

      return
    }

    // TODO передать хеш из этого окна в следующее
    if (response.searchParams.has('payload') && response.pathname === '/auth') {
      const payload = JSON.parse(
        response.searchParams.get('payload') || '',
      ) as VKSilentAuthPayload

      const state = JSON.parse(
        response.searchParams.get('state') || '',
      ) as ResponseRedirectState

      const memoryCSRFToken = memoryStore.getCSRFToken()

      if (memoryCSRFToken !== state.csrfToken) {
        commonLogger.error(
          'main',
          scope,
          `Auth failed. Reason: Invalid CSRF token`,
        )
        translationsStore.getAfterLoad().then((translation) => {
          const mainWindow = getWindow()
          mainWindow?.webContents.send(
            Credentials.ON_AUTH_ERROR,
            langUse(translation, 'me_auth_error_csrf'),
          )
        })

        return
      }

      switch (payload.type) {
        case 'silent_token':
          defineClientCredentials(payload, state.profileType)
          break
        default:
        // do nothing
      }
      return
    }
  } catch (e) {
    // do nothing
  }
  return
}

export const enum CREDENTIALS_ERROR {
  EXCHANGE_SILENT_TOKEN_ALREADY_USED = 'Silent token problem (is already used)',
  EXCHANGE_SILENT_TOKEN = 'Exchange Silent Auth Token error',
  EXCHANGE_TOKEN = 'Get Exchange Token error',
}

export const defineClientCredentials = async (
  payload: Partial<VKSilentAuthPayload>,
  profileType: UserProfileTypeEnumNames,
): Promise<void> => {
  const window = getWindow()
  if (window) {
    try {
      const token = payload.token || ''
      const uuid = payload.uuid || ''

      const anonymToken = await fetchAnonymToken()
      const accessResponse = await exchangeSilentAuthToken(
        anonymToken.token,
        token,
        uuid,
      )

      if (accessResponse.error) {
        commonLogger.error(
          'main',
          scope,
          `Exchange Silent Auth Token error. Code ${accessResponse.error.error_code}. Message: ${accessResponse.error.error_msg}`,
        )
        if (accessResponse.error.error_code === 104) {
          throw new Error(CREDENTIALS_ERROR.EXCHANGE_SILENT_TOKEN_ALREADY_USED)
        } else {
          throw new Error(CREDENTIALS_ERROR.EXCHANGE_SILENT_TOKEN)
        }
      }

      const accessResponsePayload =
        accessResponse.response as ExchangeSilentTokenResponsePayload

      const exchangeTokens = await getExchangeToken(
        accessResponsePayload.access_token,
      )

      if (exchangeTokens.error) {
        commonLogger.error(
          'main',
          scope,
          `Get Exchange Token error. Code ${exchangeTokens.error.error_code}. Message: ${exchangeTokens.error.error_msg}`,
        )
        throw new Error(CREDENTIALS_ERROR.EXCHANGE_TOKEN)
      }

      credentialsStore.setAnonymToken(anonymToken)

      const profiledAccount = (
        exchangeTokens.users_exchange_tokens as UserExchangeToken[]
      ).find(
        (token: any) => token.profile_type === profileType,
      ) as UserExchangeToken

      if (!profiledAccount) {
        commonLogger.error(
          'main',
          scope,
          `Пользователь не имеет аккаунтов с profileType = ${profileType}`,
        )

        const translations = await translationsStore.getAfterLoad()
        dialog.showErrorBox(
          langUse(translations, 'me_desktop_error'),
          langUse(
            translations,
            profileType === UserProfileTypeEnumNames.NORMAL
              ? 'me_auth_error_no_profile_type'
              : 'me_auth_error_no_profile_type_sferum',
          ),
        )
        return
      }

      const { user_id: currentUserId, common_token } = profiledAccount
      let currentAccessToken = accessResponsePayload.access_token

      if (profileType === UserProfileTypeEnumNames.EDU) {
        const exchangeToken = await authByExchangeToken(common_token)
        const eduAccessResponse = await exchangeSilentAuthToken(
          anonymToken.token,
          exchangeToken.silent_token,
          exchangeToken.silent_token_uuid,
        )

        if (eduAccessResponse.response) {
          currentAccessToken = eduAccessResponse.response.access_token
        }
      }

      credentialsStore.setAuthPayload(
        currentAccessToken,
        currentUserId,
        profileType,
      )

      credentialsStore.setTokenList(
        exchangeTokens.users_exchange_tokens as UserExchangeToken[],
      )

      featureFlagsStore.load()
      const mainWindow = getWindow()
      openIndexPage(mainWindow)
      mainWindow?.focus()
    } catch (error: any) {
      commonLogger.error('main', scope, error)

      if (
        error.message === CREDENTIALS_ERROR.EXCHANGE_SILENT_TOKEN_ALREADY_USED
      ) {
        return
      }
      const translations = await translationsStore.getAfterLoad()
      dialog.showErrorBox(
        langUse(translations, 'me_desktop_error'),
        langUse(translations, 'me_auth_unknown_error'),
      )
      logout()
    }
  }
}

export const isClientCredentialsExists = (): boolean => {
  return credentialsStore.hasAuthPayload() && credentialsStore.hasApiToken()
}
