import { ipcRenderer, contextBridge } from 'electron'
import { Credentials, ElectronFeatures, UserExchangeToken } from 'vkme-common'
import { commonLogger } from './libs/logger'

contextBridge.exposeInMainWorld('_credentials', {
  getAuthPayload: () => ipcRenderer.invoke(Credentials.GET_AUTH_PAYLOAD),
  switchUser: (userId: number) =>
    ipcRenderer.invoke(Credentials.SWITCH_USER, userId),
  logout: () => ipcRenderer.invoke(Credentials.LOGOUT),
  enableLogoutButton: () => {
    commonLogger.debug('preload', 'credentials', 'Enable logout button')
    return ipcRenderer.invoke(Credentials.ENABLE_LOGOUT_BUTTON)
  },
  updateBadgeCounter: (count: number | null) => {
    // sendSync для работы библиотеки electron-windows-badge
    return ipcRenderer.sendSync(
      ElectronFeatures.UPDATE_BADGE_COUNTER,
      count || 0,
    )
  },
  getAuthTokens: (): Promise<UserExchangeToken[]> =>
    ipcRenderer.invoke(Credentials.GET_TOKENS),
  refreshCSRFToken: () => ipcRenderer.invoke(Credentials.REFRESH_CSRF_TOKEN),
  onAuthError: (listener) =>
    ipcRenderer.on(Credentials.ON_AUTH_ERROR, (_, message) =>
      listener(message),
    ),
  refreshToken: (userId: number) =>
    ipcRenderer.invoke(Credentials.REFRESH_TOKEN, userId),
  generateAuthQRCode: () => ipcRenderer.invoke(Credentials.GENERATE_AUTH_QR),
  getQRAuthStatus: () => ipcRenderer.invoke(Credentials.GET_QR_AUTH_STATUS),
  openRegisterAccountPage: () =>
    ipcRenderer.invoke(Credentials.OPEN_REGISTRATION_ACCOUNT_PAGE),
} as Window['_credentials'])
