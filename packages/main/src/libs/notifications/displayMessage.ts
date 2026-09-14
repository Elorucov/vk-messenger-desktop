import {
  BrowserWindow,
  nativeImage,
  Notification,
  NotificationConstructorOptions,
} from 'electron'
import { NotificationMessageOptions, ElectronFeatures } from 'vkme-common'
import { commonLogger } from '../logger/logger'
import { activateWindow } from '../../mainWindow'
import { getWindow, isLinux } from '../../utils'
import { api } from '../../utils/api'

const scope = 'notifications display message'
const currentNotifications = new Map<number, Notification>()

export async function displayMessage({
  id,
  icon,
  silent = false,
  body,
  title = 'Новое сообщение',
  replyData,
}: NotificationMessageOptions): Promise<void> {
  if (!Notification.isSupported()) {
    commonLogger.debug('main', scope, 'not supported')
    return
  }

  if (BrowserWindow.getFocusedWindow()) {
    return
  }

  const options: NotificationConstructorOptions = {
    title,
    body,
    // @ts-expect-error
    id,
    silent,
    icon: icon ? nativeImage.createFromDataURL(icon as string) : undefined,
    hasReply: Boolean(replyData),
  }

  const customSound = !options.silent && isLinux

  if (customSound) {
    options.silent = true
  }

  const message = new Notification(options)
  const messageKey = id

  const mainWindow = getWindow()

  message.on('show', () => {
    commonLogger.debug('main', scope, 'show')

    // On Windows, manually dismiss notifications from the same channel and only show the latest one
    if (process.platform === 'win32') {
      if (currentNotifications.has(messageKey)) {
        commonLogger.debug('main', scope, 'close previous')

        currentNotifications.get(messageKey)?.close()
        currentNotifications.delete(messageKey)
      }
    }
    currentNotifications.set(messageKey, message)

    if (customSound) {
      mainWindow?.webContents.send(ElectronFeatures.PLAY_SOUND)
    }
  })

  message.on('click', () => {
    commonLogger.debug('main', scope, 'click ', `peer: ${messageKey}`)
    activateWindow()

    mainWindow?.webContents.send(ElectronFeatures.LINK_INNER, `/convo/${id}`)
    currentNotifications.delete(messageKey)
  })

  message.on('reply', (_, text) => {
    if (replyData) {
      api
        .fetch('messages.send', {
          group_id: replyData.groupId,
          peer_id: replyData.peerId,
          random_id: replyData.randomId,
          message: text,
          forward: replyData.foreign
            ? JSON.stringify(replyData.foreign)
            : undefined,
        })
        .catch((error) => {
          commonLogger.info('main', scope, 'send reply', error)
        })
    }
  })

  message.show()
}
