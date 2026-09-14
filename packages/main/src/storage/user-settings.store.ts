import Store from 'electron-store'
import { JSONSchemaType } from 'json-schema-typed'
import { AutoStartMode, Locales, UPDATE_SETTINGS_STATE } from 'vkme-common'
import { getDefaultDownloadLocation } from '../libs/FileDownloader/manager'
import { getWindow } from '../utils'
import { app } from 'electron'

const schema = {
  isTrayActive: {
    type: JSONSchemaType.Boolean,
    default: true,
  },
  isAutoUpdates: { type: JSONSchemaType.Boolean, default: true },
  autoStartMode: { type: JSONSchemaType.String, default: 'disabled' },
  downloadLocation: {
    type: JSONSchemaType.String,
    default: getDefaultDownloadLocation(),
  },
  disableHTTP2: {
    type: JSONSchemaType.Boolean,
    default: false,
  },
  disableHardwareAcceleration: {
    type: JSONSchemaType.Boolean,
    default: false,
  },
  disableInProcessGPU: {
    type: JSONSchemaType.Boolean,
    default: false,
  },
  lang: {
    type: JSONSchemaType.String,
    /**
     *  TODO: при расширении списка языков расширить логику
     */
    default: app.getLocaleCountryCode().toLowerCase().startsWith('ru')
      ? Locales.RU
      : Locales.EN,
  },
}

type UserSettingsStoreType = {
  isTrayActive: boolean
  isAutoUpdates: boolean
  autoStartMode: AutoStartMode
  downloadLocation: string
  disableHTTP2: boolean
  disableHardwareAcceleration: boolean
  disableInProcessGPU: boolean
  lang: Locales
}

const userSettingsStore = new Store<UserSettingsStoreType>({
  schema,
  name: 'user-settings',
})

userSettingsStore.onDidAnyChange(() => {
  const mainWindow = getWindow()
  mainWindow?.webContents.send(UPDATE_SETTINGS_STATE)
})

export { userSettingsStore }
