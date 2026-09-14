import { CapturerSourceData, PlatformName } from 'vkme-common'
import { ElectronVideoConstraints } from './types'
import { userMedia } from '../../utils/userMedia'
import { getMacMediaDevice } from './utils/getMacMediaDevice'
import { commonLogger } from '../logger'

const scope = 'stream manager'

export class StreamManager {
  private videoConstraints: ElectronVideoConstraints

  public constructor(
    private platformName: PlatformName,
    private selectedSource: CapturerSourceData,
    private streamOptions: DisplayMediaStreamOptions | undefined,
    private originGetDisplayMedia: (
      options?: DisplayMediaStreamOptions | undefined,
    ) => Promise<MediaStream>,
  ) {
    if (!selectedSource.source) {
      throw new Error('Source is not selected')
    }

    const video = streamOptions?.video || false

    const maxWidth =
      typeof video !== 'boolean' &&
      (typeof video?.width === 'object'
        ? video.width.ideal || video.width.exact || video.width.max
        : video.width)

    const maxHeight =
      typeof video !== 'boolean' &&
      (typeof video?.height === 'object'
        ? video.height.ideal || video.height.exact || video.height.max
        : video.height)

    this.videoConstraints =
      typeof video === 'boolean'
        ? video
        : {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: selectedSource.source.id,
              minWidth: 640,
              maxWidth: maxWidth || window.screen.width,
              minHeight: 310,
              maxHeight: maxHeight || window.screen.height,
            },
            cursor: 'motion',
          }
  }

  private async createStreamForUnixSystems(audioInput?: MediaDeviceInfo) {
    const [videoStream, audioStream] = await Promise.all([
      userMedia.originGetUserMedia({
        video: this.videoConstraints,
      } as MediaStreamConstraints),
      this.selectedSource.isEnableSoundShare && audioInput
        ? userMedia.originGetUserMedia({
            audio: {
              deviceId: {
                exact: audioInput.deviceId,
              },
            },
          } as MediaStreamConstraints)
        : null,
    ])

    const tracks = audioStream?.getAudioTracks()

    if (tracks?.[0]) {
      videoStream.addTrack(tracks[0])
    }

    return videoStream
  }

  private async getLinuxStream(): Promise<MediaStream> {
    let audioInput: MediaDeviceInfo | undefined

    if (this.selectedSource.isEnableSoundShare) {
      await window._mediaSharingBridge.createPulseAudioSource()
      const mediaDevices = await navigator.mediaDevices.enumerateDevices()

      audioInput = mediaDevices.find(
        (device) => device.label === 'VK-MESSENGER-SHARE-AUDIO',
      )

      if (!audioInput) {
        commonLogger.warn(
          'renderer',
          scope,
          'getLinuxStream',
          'share sound is enable, but virtual source is not defined',
        )
      }
    }

    return await this.createStreamForUnixSystems(audioInput)
  }

  private async getMacStream(): Promise<MediaStream> {
    const audioInput = await getMacMediaDevice()

    if (!audioInput) {
      commonLogger.warn(
        'renderer',
        scope,
        'getMacStream',
        'share sound is enable, but virtual source is not defined',
      )
    }

    return await this.createStreamForUnixSystems(audioInput)
  }

  private async getWindowsStream(): Promise<MediaStream> {
    await window._mediaSharingBridge.setSource(this.selectedSource)

    return this.originGetDisplayMedia({
      video: this.streamOptions?.video,
      audio: this.selectedSource.isEnableSoundShare
        ? {
            ...this.streamOptions,
            echoCancellation: true,
          }
        : false,
    })
  }

  public getStream(): Promise<MediaStream> {
    switch (this.platformName) {
      case PlatformName.WINDOWS:
        return this.getWindowsStream()

      case PlatformName.LINUX:
        return this.getLinuxStream()

      case PlatformName.MAC:
        return this.getMacStream()

      default:
        throw new Error(`is not implemented for ${this.platformName}`)
    }
  }
}
