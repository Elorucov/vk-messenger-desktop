import { commonLogger } from '../logger'
import { getCapturerSourceData } from './getCapturerSourceData'
import { StreamManager } from './streamManager'

class MediaSharing {
  private isOverridden = false

  private originGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(
    navigator.mediaDevices,
  )

  init(): void {
    if (this.isOverridden) {
      return
    }

    navigator.mediaDevices.getDisplayMedia = async (
      streamOptions?: DisplayMediaStreamOptions,
    ): Promise<MediaStream> => {
      try {
        const selectedSource = await getCapturerSourceData()
        const platformName = await window._device.getPlatformName()

        const streamManager = new StreamManager(
          platformName,
          selectedSource,
          streamOptions,
          this.originGetDisplayMedia,
        )

        return streamManager.getStream()
      } catch (error) {
        commonLogger.error('renderer', 'media sharing', 'init', error)
        throw error
      }
    }

    this.isOverridden = true
  }
}

export const mediaSharing = new MediaSharing()
