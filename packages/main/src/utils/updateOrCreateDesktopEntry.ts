import fs from 'fs'
import path from 'path'
import { isAppImage } from './helpers'
import { exec } from 'child_process'
import { app } from 'electron'
import { commonLogger } from '../libs/logger'

const scope = 'update or create desktop entry'

export const updateOrCreateDesktopEntry = (): void => {
  if (isAppImage) {
    try {
      commonLogger.info('main', scope, 'started')

      const appImagePath = path.resolve(
        process.cwd(),
        process.env.APPIMAGE || 'vk-messenger',
      )

      // создаем скрипт запуска
      const appDataDir = app.getPath('userData')
      const scriptPath = path.resolve(appDataDir, 'start.sh')

      if (fs.existsSync(scriptPath)) {
        fs.rmSync(scriptPath)
      }

      fs.writeFileSync(
        scriptPath,
        `
      #!/bin/bash
      ${appImagePath} $1
      `,
      )
      fs.chmodSync(scriptPath, fs.constants.S_IRWXU)

      const xdgDir = path.resolve(
        process.env.HOME || '~',
        '.local/share/applications',
      )

      // корневая директория образа
      const iconPathDir = path.join(app.getAppPath(), '../..')

      // подготавливаем иконку для desktop файла
      const iconsDir = path.resolve(process.env.HOME || '~', '.icons')

      if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir)
      }

      const iconFilePath = path.resolve(iconsDir, 'vk-messenger.png')

      if (fs.existsSync(iconFilePath)) {
        fs.rmSync(iconFilePath)
      }

      fs.copyFileSync(`${iconPathDir}/vk-messenger.png`, iconFilePath)
      commonLogger.debug('main', scope, 'xdg icon updated')

      // подготавливаем desktop файл
      if (fs.existsSync(xdgDir)) {
        const desktopFilePath = path.resolve(xdgDir, 'vk-messenger.desktop')

        if (fs.existsSync(desktopFilePath)) {
          fs.rmSync(desktopFilePath)
        }
      }

      fs.writeFileSync(
        path.resolve(xdgDir, 'vk-messenger.desktop'),
        `[Desktop Entry]
Name=VK Messenger
Exec=bash "${appDataDir}/start.sh" %U
Terminal=false
Type=Application
Icon=vk-messenger.png
Comment=Лёгкий и быстрый в любых условиях
MimeType=x-scheme-handler/vk;`,
      )
      commonLogger.debug('main', scope, 'vk-messenger.desktop created')

      const xHandlerString = 'x-scheme-handler/vk=vk-messenger.desktop'

      const defaultsListPath = path.resolve(xdgDir, 'defaults.list')
      if (!fs.existsSync(defaultsListPath)) {
        fs.writeFileSync(defaultsListPath, '[Default Applications]\n')
      }

      const defaultsListRaw = fs.readFileSync(defaultsListPath).toString('utf8')
      if (defaultsListRaw.indexOf(xHandlerString) < 0) {
        fs.appendFileSync(defaultsListPath, `${xHandlerString}\n`)
      }

      const mimeCachePath = path.resolve(xdgDir, 'mimeinfo.cache')
      if (!fs.existsSync(mimeCachePath)) {
        fs.writeFileSync(mimeCachePath, '[MIME Cache]\n')
      }

      const mimeCacheRaw = fs.readFileSync(mimeCachePath).toString('utf8')
      if (mimeCacheRaw.indexOf(xHandlerString) < 0) {
        fs.appendFileSync(mimeCachePath, `${xHandlerString}\n`)
      }

      commonLogger.info('main', scope, 'desktop entry created successful')

      // создаем иконку для файла

      exec(
        `
      APPDIR=${iconPathDir}
      APPIMAGE=${appImagePath}
      if [ ! -z "$APPIMAGE" ] && [ ! -z "$APPDIR" ]; then
          # иконка проверяется совпадением хеша
          MD5=$(echo -n "file://$APPIMAGE" | md5sum | cut -d' ' -f1)
          cp "$APPDIR/vk-messenger.png" "$HOME/.cache/thumbnails/normal/$MD5.png"
          cp "$APPDIR/vk-messenger.png" "$HOME/.cache/thumbnails/large/$MD5.png"
          xdg-icon-resource forceupdate
      fi
  
      update-desktop-database $HOME/.local/share/applications
  
      exit 0
      `,
        function (err, stdout, stderr) {
          err && commonLogger.error('main', scope, 'icon update error', stderr)
        },
      )

      commonLogger.info('main', scope, 'file icon updated')
    } catch (event) {
      commonLogger.error('main', scope, event)
    }
  }
}
