import { ipcRenderer, contextBridge } from 'electron'
import { DeviceAccessStatus, Device, PlatformName } from 'vkme-common'

contextBridge.exposeInMainWorld('_device', {
  checkMicrophoneAccess: (): Promise<DeviceAccessStatus> =>
    ipcRenderer.invoke(Device.CHECK_MICROPHONE_ACCESS),
  checkCameraAccess: (): Promise<DeviceAccessStatus> =>
    ipcRenderer.invoke(Device.CHECK_CAMERA_ACCESS),
  requestMicrophoneAccess: (): Promise<boolean> =>
    ipcRenderer.invoke(Device.REQUEST_MICROPHONE_ACCESS),
  requestCameraAccess: (): Promise<boolean> =>
    ipcRenderer.invoke(Device.REQUEST_CAMERA_ACCESS),
  getPlatformName: (): Promise<PlatformName> =>
    ipcRenderer.invoke(Device.GET_PLATFORM_NAME),
  getIsSnap: (): Promise<boolean> => ipcRenderer.invoke(Device.GET_IS_SNAP),
})
