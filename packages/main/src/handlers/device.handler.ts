import { ipcMain, IpcMainInvokeEvent, systemPreferences } from 'electron'
import { Device, PlatformName } from 'vkme-common'
import { isLinux, isSnap, isWindows } from '../utils/helpers'

const askSystem =
  <T>(
    fn: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | T,
    defaultValue: T,
  ) =>
  async (event: IpcMainInvokeEvent, ...args: any[]): Promise<T> => {
    return isLinux ? defaultValue : fn(event, ...args)
  }

ipcMain?.handle(
  Device.CHECK_MICROPHONE_ACCESS,
  askSystem<string>(
    () => systemPreferences.getMediaAccessStatus('microphone'),
    'granted',
  ),
)

ipcMain?.handle(
  Device.REQUEST_MICROPHONE_ACCESS,
  askSystem<boolean>(
    // askForMediaAccess существует только для macOS
    () => systemPreferences.askForMediaAccess?.('microphone'),
    true,
  ),
)

ipcMain?.handle(
  Device.CHECK_CAMERA_ACCESS,
  askSystem<string>(
    () => systemPreferences.getMediaAccessStatus('camera'),
    'granted',
  ),
)

ipcMain?.handle(
  Device.REQUEST_CAMERA_ACCESS,
  askSystem<boolean>(
    // askForMediaAccess существует только для macOS
    () => systemPreferences.askForMediaAccess?.('camera'),
    true,
  ),
)

ipcMain?.handle(Device.GET_PLATFORM_NAME, () => {
  if (isWindows) {
    return PlatformName.WINDOWS
  }

  if (isLinux) {
    return PlatformName.LINUX
  }

  return PlatformName.MAC
})

ipcMain?.handle(Device.GET_IS_SNAP, () => isSnap)
