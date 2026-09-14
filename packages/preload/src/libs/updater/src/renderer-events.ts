import { ipcRenderer } from 'electron'
import { AUTOUPDATER_TAG } from '../'
import { UpdateEvent } from 'vkme-common'
import { commonLogger } from '../../logger'

ipcRenderer.on(UpdateEvent.UPDATE_RENDERER_STATE, (_, detail) => {
  window.dispatchEvent(
    new CustomEvent(UpdateEvent.UPDATE_RENDERER_STATE, { detail }),
  )
})

ipcRenderer.on(UpdateEvent.SHOW_PATCH_NOTES, (_, detail) => {
  commonLogger.info('preload', AUTOUPDATER_TAG, UpdateEvent.SHOW_PATCH_NOTES)

  window.dispatchEvent(
    new CustomEvent(UpdateEvent.SHOW_PATCH_NOTES, { detail }),
  )
})
