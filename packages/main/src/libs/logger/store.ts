import Store from 'electron-store'
import { LoggerSettingsStore } from './types'

export const loggerSettingsStore = new Store<LoggerSettingsStore>({
  name: 'loggerSettingsStore',
})
