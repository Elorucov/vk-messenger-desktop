import { session } from 'electron'
import { CapturerSourceData } from 'vkme-common'

class MediaSharingWindows {
  private isInitialized = false
  private capturerSourceData: CapturerSourceData | null = null

  public setSource(source: CapturerSourceData): void {
    this.capturerSourceData = source
  }

  public init(): void {
    if (this.isInitialized) {
      return
    }

    // Обработка события при вызове getDisplayMedia
    session.defaultSession.setDisplayMediaRequestHandler(
      (request, callback) => {
        if (!this.capturerSourceData?.source) {
          return
        }

        callback({
          video: this.capturerSourceData.source,
          audio: this.capturerSourceData.isEnableSoundShare
            ? 'loopback'
            : undefined,
        })
      },
    )

    this.isInitialized = true
  }
}

export const mediaSharingWindows = new MediaSharingWindows()
