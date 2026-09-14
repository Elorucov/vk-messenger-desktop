import { BrowserWindow } from 'electron'

const STEP = 0.05
const MAX_ZOOM = 1.3
const MIN_ZOOM = 0.8

/**
 * Хоткеи для зума. Только первый будет видимым
 */
export const zoomHotKeys = {
  in: ['CmdOrCtrl+Plus', 'CmdOrCtrl+=', 'CmdOrCtrl+numadd'],
  out: ['CmdOrCtrl+-', 'CmdOrCtrl+numsub'],
}

/**
 * Электрон нам не дает возможности ограничивать зум,
 * поэтому управляем зумом сами
 */
export const zoom = {
  in: (browserWindow?: BrowserWindow): void => {
    if (browserWindow) {
      const nextZoom = Math.min(
        browserWindow.webContents.getZoomFactor() + STEP,
        MAX_ZOOM,
      )
      browserWindow?.webContents.setZoomFactor(nextZoom)
    }
  },
  out: (browserWindow?: BrowserWindow): void => {
    if (browserWindow) {
      const nextZoom = Math.max(
        browserWindow.webContents.getZoomFactor() - STEP,
        MIN_ZOOM,
      )
      browserWindow?.webContents.setZoomFactor(nextZoom)
    }
  },
  reset: (browserWindow?: BrowserWindow): void => {
    if (browserWindow) {
      const nextZoom = 1
      browserWindow.webContents.setZoomFactor(nextZoom)
    }
  },
}
