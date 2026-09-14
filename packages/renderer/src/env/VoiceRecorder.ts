import { MEAppRecorder } from '@vkontakte-internal/messenger/dist/browser/env/MEAppRecorder'
import { DeviceAccessStatus } from 'vkme-common'
import { userMedia } from '../utils/userMedia'

export class VoiceRecorder extends MEAppRecorder {
  protected override async initSourceNode(): Promise<void> {
    const accessStatus = await window._device.checkMicrophoneAccess()
    let isRequestApproved = false

    if (accessStatus !== DeviceAccessStatus.GRANTED) {
      isRequestApproved = await window._device.requestMicrophoneAccess()
    }

    if (accessStatus !== DeviceAccessStatus.GRANTED && !isRequestApproved) {
      throw new Error('Microphone Permission denied')
    }

    const stream = await userMedia.originGetUserMedia({
      audio: true,
      video: false,
    })

    this.stream = stream
    this.sourceNode = this.audioContext.createMediaStreamSource(stream)
  }
}
