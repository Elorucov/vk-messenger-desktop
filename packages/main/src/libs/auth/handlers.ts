import { Menu, dialog, ipcMain, WebContentsView } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { Credentials, QRAuthStatus } from 'vkme-common'

import credentialsStore from '../../storage/credentials.store'
import {
  authByExchangeToken,
  exchangeSilentAuthToken,
  fetchAnonymToken,
  fetchAuthConfig,
  fetchAuthQRData,
  fetchQRAuthStatus,
} from './api.requests'
import { openAuthPage, reloadPage } from '../../utils/page-location'
import { getWindow } from '../../utils/window'
import { VKMeTray } from '../../tray'
import { featureFlagsStore } from '../../storage/featureFlagsStore'
import { updateBadgeCount } from '../../utils'
import { commonLogger } from '../logger'
import { memoryStore } from '../../storage/memory.store'
import { AnonymToken } from './types'
import { makeQRAuth } from './qrAuth'
import { langUse } from '../translations/utils'
import { translationsStore } from '../../storage/translationsStore'
import { getRegWebView } from '../webview/regWebViewWindow'

const scope = 'credentials handler'

export const logout = (): void => {
  const window = getWindow()

  updateBadgeCount(0)
  VKMeTray.setDefaultIcon()
  featureFlagsStore.clear()

  const logoutMenuItem = Menu.getApplicationMenu()?.getMenuItemById('logout')

  if (logoutMenuItem) {
    logoutMenuItem.enabled = false
  }

  if (window) {
    credentialsStore.flush()
    openAuthPage()
  }
}

const updateAccessToken = async (userId: number) => {
  try {
    const exchangeTokenPayload = credentialsStore
      .getTokenList()
      ?.find((e) => e.user_id === userId)
    if (exchangeTokenPayload) {
      const exchangeToken = await authByExchangeToken(
        exchangeTokenPayload.common_token,
      )

      let anonymToken = credentialsStore.getAnonymToken()

      if (typeof anonymToken === 'string') {
        anonymToken = await credentialsStore.getWithRefetchAnonymToken()
      }

      if (!anonymToken) {
        throw new Error('AnonymToken get error')
      }

      let accessResponse = await exchangeSilentAuthToken(
        anonymToken.token,
        exchangeToken.silent_token || '',
        exchangeToken.silent_token_uuid || '',
      )

      if (accessResponse.error && accessResponse.error.error_code === 1114) {
        const anonym = await fetchAnonymToken()
        credentialsStore.setAnonymToken(anonym)

        accessResponse = await exchangeSilentAuthToken(
          (credentialsStore.getAnonymToken() as AnonymToken).token,
          exchangeToken.silent_token || '',
          exchangeToken.silent_token_uuid || '',
        )
      }

      if (accessResponse.response) {
        credentialsStore.setAuthPayload(
          accessResponse.response.access_token,
          userId,
          exchangeTokenPayload.profile_type,
        )

        return
      }
    }
    const translations = await translationsStore.getAfterLoad()
    dialog.showErrorBox(
      langUse(translations, 'me_desktop_error'),
      langUse(translations, 'me_desktop_error_user_not_found'),
    )
    commonLogger.error('main', scope, 'user not found')
    logout()
  } catch (error) {
    commonLogger.error('main', scope, error)
  }
}

ipcMain?.handle(Credentials.GET_TOKENS, () => credentialsStore.getTokenList())

ipcMain?.handle(Credentials.SWITCH_USER, async (_, userId: number) => {
  await updateAccessToken(userId)
  // TODO переписать. Это вторая перезагрузка при смене аккаунта
  // Хотелось бы, чтобы updateAccessToken сбрасывал токен и entryVKM дожидался нового
  reloadPage()
})

ipcMain?.handle(Credentials.REFRESH_TOKEN, async (_, userId: number) => {
  await updateAccessToken(userId)
  return credentialsStore.getAuthPayload()
})

ipcMain?.handle(Credentials.GET_AUTH_PAYLOAD, () =>
  credentialsStore.hasAuthPayload()
    ? credentialsStore.getAuthPayload()
    : undefined,
)
ipcMain?.handle(Credentials.LOGOUT, logout)
ipcMain?.handle(Credentials.ENABLE_LOGOUT_BUTTON, () => {
  const logoutMenuItem = Menu.getApplicationMenu()?.getMenuItemById('logout')

  if (logoutMenuItem) {
    logoutMenuItem.enabled = true
  }
})

ipcMain?.handle(Credentials.REFRESH_CSRF_TOKEN, () => {
  return memoryStore.getCSRFToken(true)
})

ipcMain?.handle(Credentials.GENERATE_AUTH_QR, async () => {
  const {
    response: { auth_url, auth_hash },
  } = await fetchAuthQRData()

  credentialsStore.setAuthHash(auth_hash)

  //const qrCode = await generateAuthQRCode(auth_url)
  return auth_url
})

ipcMain?.handle(Credentials.GET_QR_AUTH_STATUS, async () => {
  const { response } = await fetchQRAuthStatus()
  switch (response.status) {
    case QRAuthStatus.APPROVED:
      await makeQRAuth(response)
      return response
    case QRAuthStatus.CREATED:
    case QRAuthStatus.OPENED:
    case QRAuthStatus.DECLINED:
    case QRAuthStatus.EXPIRED:
    default:
      return response
  }
})

ipcMain?.handle(Credentials.OPEN_REGISTRATION_ACCOUNT_PAGE, async () => {
  const meWindow = getWindow()

  const vkIdRegistarionView = getRegWebView(true) as WebContentsView

  const response = await fetchAuthConfig()

  if (!response) {
    commonLogger.error(
      'main',
      'open registration account page handler',
      'empty config',
    )
    return
  }

  const redirectState = encodeURIComponent(
    JSON.stringify({
      profileType: 0,
      csrfToken: await memoryStore.getCSRFToken(true),
    }),
  )

  const url = response.user_visible_auth
    .replace('{response_type}', 'silent_token')
    .replace('{uuid}', uuidv4())
    .replace('{redirect_uri}', 'vk://vk.com/auth')
    .concat(encodeURI(`&redirect_state=${redirectState}`))

  meWindow?.contentView.addChildView(vkIdRegistarionView)

  vkIdRegistarionView.webContents.loadURL(url)
  vkIdRegistarionView.setVisible(true)
  vkIdRegistarionView.webContents.focus()
  vkIdRegistarionView.webContents.openDevTools()
})
