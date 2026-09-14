import { LevelOption } from 'electron-log'
import { loggerSettingsStore } from './store'
import { ParameterizedElectronLogger } from './types'

export class LoggersManager {
  private isNetLogsActive: boolean = false
  private isDebugLevelActive: boolean = false

  public constructor(
    private commonLogger: ParameterizedElectronLogger,
    private netLogger: ParameterizedElectronLogger,
  ) {
    this.isNetLogsActive = loggerSettingsStore.get('isNetLogsActive')
    this.isDebugLevelActive = loggerSettingsStore.get('isDebugLevelActive')
    this.applySettings()
  }

  public setIsNetLogsActive(isActive: boolean): void {
    this.isNetLogsActive = isActive
    loggerSettingsStore.set('isNetLogsActive', isActive)
    this.applySettings()
  }

  public setIsDebugLevelActive(isActive: boolean): void {
    this.isDebugLevelActive = isActive
    loggerSettingsStore.set('isDebugLevelActive', isActive)
    this.applySettings()
  }

  public getIsNetLogsActive(): boolean {
    return this.isNetLogsActive
  }

  public getIsDebugLevelActive(): boolean {
    return this.isDebugLevelActive
  }

  private applySettings(): void {
    const level: LevelOption = this.isDebugLevelActive ? 'debug' : 'info'

    if (this.commonLogger.transports.file) {
      this.commonLogger.transports.file.level = level
    }

    if (this.commonLogger.transports.console) {
      this.commonLogger.transports.console.level = level
    }

    if (this.netLogger.transports.file) {
      this.netLogger.transports.file.level = this.isNetLogsActive
        ? level
        : 'error'
    }
  }
}
