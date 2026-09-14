import {
  BASE_API_URL,
  API_VERSION,
  CLIENT_ID,
  CLIENT_SECRET,
} from 'vkme-common'
import { invoke } from '../../utils/invoke'
import { commonLogger } from '../logger'
import {
  AnonymToken,
  ExchangeSilentTokenResponse,
  ExchangeTokenResponse,
  FetchQrAuthStatus,
  GetQRCodeData,
} from './types'
import credentialsStore from '../../storage/credentials.store'
import { getDeviceName } from '../../utils'

export const fetchAnonymToken = async (): Promise<AnonymToken> => {
  try {
    const query = new URLSearchParams()
    query.append('v', API_VERSION)
    query.append('client_id', String(CLIENT_ID))
    query.append('client_secret', CLIENT_SECRET)
    const response = await invoke(`https://oauth.vk.com/get_anonym_token`, {
      client_id: String(CLIENT_ID),
      client_secret: CLIENT_SECRET,
      v: API_VERSION,
    })

    return response
  } catch (e) {
    commonLogger.error('main', 'fetchAnonymToken', e)
    throw e
  }
}

export const fetchAuthQRData = async (): Promise<{
  response: GetQRCodeData
}> => {
  const anonymToken = await credentialsStore.getWithRefetchAnonymToken()

  const query = new URLSearchParams([
    ['v', API_VERSION],
    ['client_id', String(CLIENT_ID)],
  ])

  const device_name = getDeviceName()

  return await invoke(
    `https://api.vk.com/method/auth.getAuthCode?${query.toString()}`,
    {
      device_name,
      auth_code_flow: '0',
      anonymous_token: anonymToken.token,
    },
  )
}

export const fetchQRAuthStatus = async (): Promise<{
  response: FetchQrAuthStatus
}> => {
  const anonymToken = await credentialsStore.getWithRefetchAnonymToken()
  // этот запрос вызывается после fetchAuthQRData, а значит в сторе точно будет authHash
  const authHash = credentialsStore.getAuthHash() as string

  const query = new URLSearchParams([
    ['v', API_VERSION],
    ['client_id', String(CLIENT_ID)],
  ])

  return await invoke(
    `https://api.vk.com/method/auth.checkAuthCode?${query.toString()}`,
    {
      auth_hash: authHash,
      anonymous_token: anonymToken.token,
    },
  )
}

// метод для получения userId при авторизации по QR. токен передаем параметром, потому что в сторе его пока нет, тк нет userID
export const getUserInfo = async (
  accessToken: string,
): Promise<{ response: Array<{ id: number }> }> => {
  return await invoke(`${BASE_API_URL}/method/users.get`, {
    v: API_VERSION,
    access_token: accessToken,
  })
}

export const exchangeSilentAuthToken = async (
  anonym_token: string,
  token: string,
  uuid: string,
): Promise<ExchangeSilentTokenResponse> => {
  return await invoke(`${BASE_API_URL}/method/auth.exchangeSilentAuthToken`, {
    v: API_VERSION,
    token,
    uuid,
    access_token: anonym_token,
  })
}

export const getExchangeToken = async (
  access_token: string,
): Promise<ExchangeTokenResponse> => {
  const { response } = await invoke(
    `${BASE_API_URL}/method/auth.getExchangeToken`,
    {
      v: API_VERSION,
      access_token,
    },
  )
  return response
}

export const authByExchangeToken = async (
  common_token: string,
): Promise<{
  silent_token: string
  silent_token_uuid: string
  silent_token_ttl: number
}> => {
  return await invoke(`https://oauth.vk.com/auth_by_exchange_token`, {
    v: API_VERSION,
    client_id: String(CLIENT_ID),
    exchange_token: common_token,
  })
}

export const fetchAuthConfig = async (): Promise<{
  user_visible_auth: string
}> => {
  const query = new URLSearchParams()
  query.append('v', '0.0.0')
  query.append('app_id', String(CLIENT_ID))

  return await invoke(
    //`https://ngromov.id.cs7777.vk.com/get_config?${query.toString()}`,
    //`https://lgutenkova.id.cs7777.vk.com/get_config?${query.toString()}`,
    `https://id.vk.com/get_config?${query.toString()}`,
    {},
  )
}
