/**
 * @module preload
 */

import { ipcRenderer } from 'electron'
import { Notifications, MEDIA_WINDOW } from 'vkme-common'
import '@sentry/electron/preload'
import './credentials'
import './calls'
import './common'
import './device'
import './download'
import './featureFlags'
import './invoker'
import './translations'
import './libs/updater/src/main-events'
import './libs/updater/src/renderer-events'
import './libs/proxy'
import './libs/media'
export { versions } from './versions'

ipcRenderer.on(
  'electron-patch-notes',
  (_, detail: { version: string; releaseNotes: string }) => {
    window.dispatchEvent(new CustomEvent('electron-patch-notes', { detail }))
  },
)

ipcRenderer.on(Notifications.ASK_NOTIFICATION_PERMISSIONS, (_) => {
  window.dispatchEvent(
    new CustomEvent(Notifications.ASK_NOTIFICATION_PERMISSIONS),
  )
})

ipcRenderer.on(MEDIA_WINDOW.ONCLOSE, (_) =>
  window.dispatchEvent(new CustomEvent(MEDIA_WINDOW.ONCLOSE)),
)
