import { Tray, Menu, NativeImage, app, nativeImage } from 'electron'
import * as path from 'path'
import { isMac, isWindows } from './utils/helpers'
import { activateWindow, toggleWindow } from './mainWindow'
import { userSettingsStore } from './storage/user-settings.store'
import { translationsStore } from './storage/translationsStore'
import { langUse } from './libs/translations/utils'

const getTrayIcons = (): [
  defaultIcon: NativeImage,
  unreadIcon: NativeImage,
] => {
  if (isMac) {
    const defaultIconMac = nativeImage.createFromPath(
      path.join(
        app.getAppPath(),
        `packages/renderer/dist/icons/tray/trayIconDarkTemplate.png`,
      ),
    )
    const unreadIconMac = nativeImage.createFromPath(
      path.join(
        app.getAppPath(),
        `packages/renderer/dist/icons/tray/trayIconUnreadDarkTemplate.png`,
      ),
    )
    return [defaultIconMac, unreadIconMac]
  }

  const defaultIcon = nativeImage.createFromPath(
    path.join(
      app.getAppPath(),
      `packages/renderer/dist/icons/tray/trayIconColorTemplate.png`,
    ),
  )

  const unreadIcon = nativeImage.createFromPath(
    path.join(
      app.getAppPath(),
      `packages/renderer/dist/icons/tray/trayIconUnreadColorTemplate.png`,
    ),
  )

  return [defaultIcon, unreadIcon]
}

const [defaultIcon, unreadIcon] = getTrayIcons()

class VKMeTrayIcon {
  public isActive: boolean = true
  private core: Tray | undefined
  constructor() {
    this.isActive = userSettingsStore.get('isTrayActive') as boolean
  }

  public activateTray(): void {
    if (!this.isActive) {
      this.isActive = true
      this.init()
      userSettingsStore.set('isTrayActive', true)
    }
  }

  public deactivateTray(): void {
    if (this.isActive) {
      this.isActive = false
      this.core?.destroy()
      userSettingsStore.set('isTrayActive', false)
    }
  }

  public setDefaultIcon(): void {
    if (this.isActive && this.core) {
      this.core.setImage(defaultIcon)
    }
  }

  public setUnreadIcon(): void {
    if (this.isActive && this.core) {
      this.core.setImage(unreadIcon)
    }
  }

  public async buildMenu() {
    if (this.core && !this.core.isDestroyed()) {
      const translations = await translationsStore.getAfterLoad()
      const contextMenu = Menu.buildFromTemplate([
        {
          label: langUse(translations, 'me_tray_show'),
          click: () => {
            activateWindow()
            app.focus({ steal: true })
          },
        },
        { label: langUse(translations, 'me_tray_close'), role: 'quit' },
      ])

      this.core.setToolTip(
        langUse(translations, 'me_vkme_title') || 'VK Мессенджер',
      )
      this.core.setContextMenu(contextMenu)
    }
  }

  public async init(): Promise<void> {
    if (this.isActive) {
      this.core = new Tray(defaultIcon)
      this.buildMenu()

      this.core.on('click', () => {
        if (isWindows) {
          toggleWindow()
        }
      })
    }
  }
}

const VKMeTray = new VKMeTrayIcon()

export { VKMeTray }
