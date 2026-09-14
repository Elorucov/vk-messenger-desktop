import { FetchQrAuthStatus } from './types'
import { getExchangeToken, getUserInfo } from './api.requests'
import { commonLogger } from '../logger'
import { CREDENTIALS_ERROR, openIndexPage } from '../../utils'
import credentialsStore from '../../storage/credentials.store'
import { UserExchangeToken, UserProfileTypeEnumNames } from 'vkme-common'
import { featureFlagsStore } from '../../storage/featureFlagsStore'

const scope = 'QR Auth'

export const makeQRAuth = async (
  response: FetchQrAuthStatus,
): Promise<void> => {
  const exchangeTokens = await getExchangeToken(response.access_token as string)

  if (exchangeTokens.error) {
    commonLogger.error(
      'main',
      scope,
      `Get Exchange Token error. Code ${exchangeTokens.error.error_code}. Message: ${exchangeTokens.error.error_msg}`,
    )
    throw new Error(CREDENTIALS_ERROR.EXCHANGE_TOKEN)
  }

  const { response: usersArray } = await getUserInfo(
    response.access_token as string,
  )

  credentialsStore.setTokenList(
    exchangeTokens.users_exchange_tokens as UserExchangeToken[],
  )

  credentialsStore.setAuthPayload(
    response.access_token as string,
    usersArray[0]?.id as number,
    UserProfileTypeEnumNames.NORMAL,
  )
  featureFlagsStore.load()
  openIndexPage()
}
