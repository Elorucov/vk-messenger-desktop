import { ipcMain } from 'electron'
import { Notifications, NotificationMessageOptions } from 'vkme-common'
import { displayMessage } from './displayMessage'

ipcMain.handle(
  Notifications.SHOW_MESSAGE,
  (_, options: NotificationMessageOptions) => {
    displayMessage(options)
  },
)
