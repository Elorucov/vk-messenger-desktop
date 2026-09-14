import { DeviceAccessStatus, PlatformName } from 'vkme-common'
import { commonLogger } from '../libs/logger'

class UserMedia {
  private isOverridden = false

  public originGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
    navigator.mediaDevices,
  )

  public init() {
    if (this.isOverridden) {
      return
    }

    navigator.mediaDevices.getUserMedia = async (
      constraints?: MediaStreamConstraints | undefined,
    ) => {
      try {
        const stream = await this.originGetUserMedia(constraints)
        const isVideo = !!constraints?.video
        const accessStatus = isVideo
          ? await window._device.checkCameraAccess()
          : await window._device.checkMicrophoneAccess()

        if (stream && accessStatus !== DeviceAccessStatus.GRANTED) {
          const platformName = await window._device.getPlatformName()
          if (platformName === PlatformName.MAC) {
            const requestStatus = isVideo
              ? await window._device?.requestCameraAccess()
              : await window._device?.requestMicrophoneAccess()

            if (requestStatus !== true) {
              throw new DOMException(
                `${isVideo ? 'Camera' : 'Microphone'} access denied`,
                'NotReadableError',
              )
            }
          } else {
            throw new DOMException(
              `${isVideo ? 'Camera' : 'Microphone'} access denied`,
              'NotReadableError',
            )
          }
        }

        return stream
      } catch (error) {
        commonLogger.error(
          'renderer',
          'user media',
          'getUserMedia',
          (error as Record<string, unknown>)?.message,
        )

        throw error
      }
    }

    this.isOverridden = true
  }
}

export const userMedia = new UserMedia()
