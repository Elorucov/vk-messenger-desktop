/**
 * Источник захвата, отданный desktopCapturer главного процесса.
 */
export type CapturerSource = {
  id: string
  name: string
  /** base64 без data-префикса */
  thumbnail: string
  appIcon: string
  display_id?: string
}

export type CapturerSourceData = {
  source: CapturerSource | null
  isEnableSoundShare: boolean
}
