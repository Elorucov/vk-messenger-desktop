import Store from 'electron-store'
import { safeStorage } from 'electron'
import { fetchAnonymToken, openAuthPage } from '../utils'
import globalStore from './global.store'
import { UserExchangeToken } from 'vkme-common'
import { commonLogger } from '../libs/logger'
import { AnonymToken } from '../libs/auth/types'

const scope = 'credentials store'

const storeEncrypt = <T extends Record<string, unknown> = {}, K = keyof T>(
  store: Store<T>,
  location: K,
  string: string,
): void => {
  if (!isEncryptionAvailable()) {
    throw Error('Encryption is not available.')
  }

  const buffer = safeStorage.encryptString(string)
  store.set(location as string, buffer.toString('latin1'))
}

const storeDecrypt = <
  S extends DecryptedStore = DecryptedStore,
  K extends keyof S = keyof S,
>(
  store: Store<S>,
  location: K,
): string | undefined => {
  if (isEncryptionAvailable()) {
    const data = store.get(location) as string
    if (data) {
      return safeStorage.decryptString(Buffer.from(data, 'latin1'))
    }
    return
  }
  throw Error('Encryption is not available.')
}

enum StoreKeys {
  API_TOKENS = 'api-tokens',
  API_TOKEN = 'api-token',
  ANONYM_TOKEN = 'anonym-token',
  CURRENT_USER_ID = 'current-user-id',
  PROFILE_TYPE = 'profile-type',
  PHASE = 'phase',
  API_PAYLOAD = 'api-payload',
  AUTH_HASH = 'auth-hash',
}

type DecryptedStore = {
  [StoreKeys.API_TOKENS]: UserExchangeToken[]
  [StoreKeys.API_TOKEN]: string
  [StoreKeys.ANONYM_TOKEN]: AnonymToken
  [StoreKeys.CURRENT_USER_ID]: string
  [StoreKeys.PROFILE_TYPE]: string
  [StoreKeys.PHASE]: string
  [StoreKeys.API_PAYLOAD]: string
  [StoreKeys.AUTH_HASH]: string
}

const store = new Store<DecryptedStore>({
  name: 'credentialEncryptedStore',
  clearInvalidConfig: true,
  encryptionKey: '%)cR@9VhsF^U#97@',
  beforeEachMigration: (_store, context) => {
    commonLogger.info(
      'main',
      scope,
      `migrate from ${context.fromVersion} → ${context.toVersion}`,
    )
  },
  migrations: {
    '1.0.0': (store) => {
      store.set(StoreKeys.PHASE, '1.0.0')
    },
  },
})

const clearAndLogout = <T extends {}>(store: Store<T>) => {
  store.clear()
  openAuthPage()
}

const isEncryptionAvailable = () => safeStorage.isEncryptionAvailable()

const isEncryptionBrokenNow = (alreadyAvailable: boolean) =>
  !safeStorage.isEncryptionAvailable() && alreadyAvailable

const upsertOrLogout = <
  S extends Record<string, unknown>,
  K extends keyof S = keyof S,
>(
  store: Store<S>,
  location: K,
  string: string,
) => {
  try {
    if (isEncryptionBrokenNow(globalStore.get('is-encryption-available'))) {
      commonLogger.warn(
        'main',
        scope,
        'Encryption currently is not available more',
      )
      clearAndLogout(store)
    } else {
      globalStore.set('is-encryption-available', isEncryptionAvailable())

      if (isEncryptionAvailable()) {
        storeEncrypt(store, location, string)
      } else {
        store.set(location as string, string)
      }
    }
  } catch (error) {
    commonLogger.error('main', scope, error)
    clearAndLogout(store)
  }
}

const getValue = <
  S extends DecryptedStore = DecryptedStore,
  K extends keyof S = keyof S,
>(
  store: Store<S>,
  location: K,
): S[K] | undefined => {
  if (isEncryptionBrokenNow(globalStore.get('is-encryption-available'))) {
    commonLogger.warn(
      'main',
      scope,
      'Encryption currently is not available more',
    )
    clearAndLogout(store)
  } else {
    globalStore.set('is-encryption-available', isEncryptionAvailable())

    const value = isEncryptionAvailable()
      ? (storeDecrypt(store, location) as string)
      : (store.get(location) as string)

    try {
      return JSON.parse(value)
    } catch {
      return value as S[K]
    }
  }
  return
}

const getOrLogout = <
  S extends DecryptedStore = DecryptedStore,
  K extends keyof S = keyof S,
>(
  store: Store<S>,
  location: K,
): S[K] | undefined => {
  try {
    return getValue(store, location)
  } catch (error) {
    commonLogger.error('main', scope, error)
    clearAndLogout(store)
  }
  return
}

// eslint-disable-next-line import/no-anonymous-default-export, import/no-default-export
export default {
  //api_token = access_token
  setApiToken(token: string): void {
    upsertOrLogout(store, StoreKeys.API_TOKEN, token)
  },
  getApiToken(): DecryptedStore[StoreKeys.API_TOKEN] | undefined {
    return getOrLogout(store, StoreKeys.API_TOKEN)
  },
  hasAuthPayload(): boolean {
    return (
      (store.has(StoreKeys.CURRENT_USER_ID) &&
        store.has(StoreKeys.PROFILE_TYPE) &&
        store.has(StoreKeys.ANONYM_TOKEN)) ||
      // TODO: remove next line after full migration from old auth process to new
      // (new auth began from 6.0.11)
      this.hasApiPayload()
    )
  },
  getAuthPayload(): {} {
    const payload = {
      apiToken: this.getApiToken(),
      currentUserId: this.getCurrentUserId(),
      anonymToken: this.getAnonymToken(),
      profileType: this.getProfileType(),
    }
    return payload
  },
  setAuthPayload(
    accessToken: string,
    userId: number,
    profileType: number,
  ): void {
    this.setApiToken(accessToken)
    this.setCurrentUserId(userId)
    this.setProfileType(profileType)
  },
  hasApiToken(): boolean {
    return store.has(StoreKeys.API_TOKEN)
  },
  hasApiPayload(): boolean {
    return store.has(StoreKeys.API_PAYLOAD)
  },
  flush(): any {
    store.clear()
  },
  setTokenList(tokens: UserExchangeToken[]): void {
    upsertOrLogout(store, StoreKeys.API_TOKENS, JSON.stringify(tokens))
  },
  getTokenList(): DecryptedStore[StoreKeys.API_TOKENS] | undefined {
    const tokenlist = getOrLogout(store, StoreKeys.API_TOKENS)
    return tokenlist
  },
  switchUser(userId: number): void {
    const exchanged = this.getTokenList()?.find((e) => e.user_id === userId)
    if (exchanged) {
      this.setApiToken(exchanged.common_token)
      this.setCurrentUserId(exchanged.user_id)
      this.setProfileType(exchanged.profile_type)
    }
  },
  setAnonymToken(token: AnonymToken): void {
    upsertOrLogout(store, StoreKeys.ANONYM_TOKEN, JSON.stringify(token))
  },
  getAnonymToken(): AnonymToken | undefined {
    return getValue(store, StoreKeys.ANONYM_TOKEN)
  },
  async getWithRefetchAnonymToken(): Promise<AnonymToken> {
    let anonymToken = this.getAnonymToken()
    if (
      !anonymToken ||
      typeof anonymToken === 'string' ||
      new Date() >= new Date(anonymToken.expired_at * 1000)
    ) {
      anonymToken = await fetchAnonymToken()
      this.setAnonymToken(anonymToken)
    }
    return anonymToken
  },
  setCurrentUserId(userId: number): void {
    upsertOrLogout(store, StoreKeys.CURRENT_USER_ID, userId.toString())
  },
  getCurrentUserId(): number {
    let userId = Number(getOrLogout(store, StoreKeys.CURRENT_USER_ID))
    // code from old auth process
    // TODO: remove next line after full migration from old auth process to new
    // (new auth began from 6.0.11)
    if (!userId || Number.isNaN(userId)) {
      const apiPayload = this.getApiPayload()
      if (apiPayload && typeof apiPayload === 'string') {
        userId = JSON.parse(apiPayload).id
      }
      //hotfix для старых юзеров
      //TODO: сделать нормальную миграцию для тех юзеров, у которых
      //данные все еще берутся из API_PAYLOAD по какой-то причине
      else if (apiPayload && typeof apiPayload === 'object') {
        userId = (apiPayload as unknown as { id: number }).id
      } else {
        commonLogger.error(
          'main',
          scope,
          'getCurrentUserId',
          'Can not parse apiPayload',
        )
      }
    }
    commonLogger.info('main', scope, 'getCurrentUserId > userId', userId)
    return userId
  },
  setProfileType(profileType: number): void {
    upsertOrLogout(store, StoreKeys.PROFILE_TYPE, profileType.toString())
  },
  getProfileType(): number | undefined {
    const profileType = Number(getOrLogout(store, StoreKeys.PROFILE_TYPE))
    // code from old auth process
    // TODO: remove next line after full migration from old auth process to new
    // (new auth began from 6.0.11)
    if (Number.isNaN(profileType)) {
      const userId = this.getCurrentUserId()
      if (!userId) {
        return
      }
      return this.getTokenList()?.find((token) => token.user_id === userId)
        ?.profile_type
    }
    commonLogger.info(
      'main',
      scope,
      'getProfileType > profileType',
      profileType,
    )
    return profileType
  },
  getPhase(): DecryptedStore[StoreKeys.PHASE] | undefined {
    return getOrLogout(store, StoreKeys.PHASE)
  },
  getApiPayload(): DecryptedStore[StoreKeys.API_PAYLOAD] | undefined {
    return getOrLogout(store, StoreKeys.API_PAYLOAD)
  },
  // auth_hash используется для авторизации по qr
  getAuthHash(): DecryptedStore[StoreKeys.AUTH_HASH] | undefined {
    return getValue(store, StoreKeys.AUTH_HASH)
  },
  setAuthHash(authHash: string): void {
    upsertOrLogout(store, StoreKeys.AUTH_HASH, authHash)
  },
}
