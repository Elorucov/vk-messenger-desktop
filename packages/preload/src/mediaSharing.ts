import { ipcRenderer, contextBridge } from 'electron'
import { MediaSharingChannels, CapturerSourceData } from 'vkme-common'

contextBridge.exposeInMainWorld('_mediaSharingBridge', {
  setSource(source: CapturerSourceData): Promise<void> {
    return ipcRenderer.invoke(MediaSharingChannels.SET_SOURCE, source)
  },
  createPulseAudioSource(): Promise<void> {
    return ipcRenderer.invoke(MediaSharingChannels.CREATE_PULSE_AUDIO_SOURCE)
  },
} as Window['_mediaSharingBridge'])
