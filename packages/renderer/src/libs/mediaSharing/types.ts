/**
 * Нестандартные ограничения захвата экрана, которые понимает Chromium в Electron.
 */
export type ElectronVideoConstraints =
  | boolean
  | {
      mandatory: {
        chromeMediaSource: 'desktop' | 'screen'
        chromeMediaSourceId?: string
        minWidth?: number
        maxWidth?: number
        minHeight?: number
        maxHeight?: number
        minFrameRate?: number
        maxFrameRate?: number
      }
      cursor?: 'always' | 'motion' | 'never'
    }
