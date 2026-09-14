import { ipcMain } from 'electron'
import { ElectronFeatures } from 'vkme-common'

export const updateBadgeCount = (count: number): void => {
  ipcMain.emit(
    ElectronFeatures.UPDATE_BADGE_COUNTER,
    // фейковый ивент
    { returnValue: '' },
    count,
  )
}
