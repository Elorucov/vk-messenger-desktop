import {
  app,
  Menu,
  shell,
  MenuItem,
  dialog,
  session,
  systemPreferences,
} from 'electron'
import {
  hideMainWindow,
  isMac,
  isDevToolsAllowed,
  isDev,
  getWindow,
  updateAllowedByPlatform,
} from './utils'
import { logout } from './libs/auth/handlers'
import contextMenu from 'electron-context-menu'
import type { MenuItemConstructorOptions } from 'electron'
import { join } from 'path'
import { getHeapSnapshot } from './libs/dev-tools'
import { VKMeTray } from './tray'
import GlobalStore from './storage/global.store'
import { checkForUpdates } from './libs/updater/utils'
import { commonLogger, loggerSettings } from './libs/logger'
import { userSettingsStore } from './storage/user-settings.store'
import { BASE_API_URL, ElectronFeatures } from 'vkme-common'
import { memoryStore } from './storage/memory.store'
import { translationsStore } from './storage/translationsStore'
import { langUse } from './libs/translations/utils'
import { zoom, zoomHotKeys } from './libs/zoom'

const resetDefaults = () => {
  if (isMac) {
    systemPreferences.setUserDefault(
      'NSDisabledDictationMenuItem',
      'boolean',
      true,
    )
    systemPreferences.setUserDefault(
      'NSDisabledCharacterPaletteMenuItem',
      'boolean',
      true,
    )
    systemPreferences.setUserDefault(
      'NSFullScreenMenuItemEverywhere',
      'boolean',
      false,
    )
  }
}

let disposeContextMenu: VoidFunction | undefined

export async function initContextMenu(): Promise<void> {
  disposeContextMenu?.()

  const translations = await translationsStore.getAfterLoad()

  disposeContextMenu = contextMenu({
    shouldShowMenu: (_, params) =>
      // если это инпут
      params.isEditable,
    // TODO: если это ссылки, но не на урлы роутера
    // || (Boolean(params.linkURL) && !isLocalURL(params.linkURL)),
    showInspectElement: false,
    showCopyImage: false,
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    labels: {
      copy: langUse(translations, 'me_desktop_menu_copy'),
      cut: langUse(translations, 'me_desktop_menu_cut'),
      paste: langUse(translations, 'me_desktop_menu_paste'),
      selectAll: langUse(translations, 'me_desktop_menu_select_all'),
      learnSpelling: langUse(translations, 'me_desktop_menu_learn_spelling'),
    },
    menu(
      defaultActions,
      parameters,
      _browserWindow,
      dictionarySuggestions,
      _event,
    ) {
      if (parameters.isEditable) {
        // из описания options.showSelectAll
        const shouldShowSelectAll = process.platform !== 'darwin'
        const fixedDictionarySuggestions = dictionarySuggestions.map((item) => {
          // Библиотека не дает возможности заменить лейбл, костылим
          if (item.label === 'No Guesses Found') {
            item.label = langUse(
              translations,
              'me_desktop_menu_learn_not_found',
            )
          }
          return item
        })
        // https://github.com/sindresorhus/electron-context-menu/blob/d48f868597a78b9faa51b3c48229466f22bfa913/index.js#L267
        return [
          ...fixedDictionarySuggestions,
          defaultActions.separator(),
          defaultActions.learnSpelling({}),
          defaultActions.separator(),
          defaultActions.cut({}),
          defaultActions.copy({}),
          defaultActions.paste({}),
          ...(shouldShowSelectAll ? [defaultActions.selectAll({})] : []),
        ]
      }

      return []
    },
  })
}

export async function initMenu(): Promise<void> {
  resetDefaults()

  const translations = await translationsStore.getAfterLoad()

  const editMenuSection: MenuItemConstructorOptions[] = [
    {
      label: langUse(translations, 'me_desktop_menu_edit'),
      submenu: [
        { role: 'undo', label: langUse(translations, 'me_desktop_menu_undo') },
        { role: 'redo', label: langUse(translations, 'me_desktop_menu_redo') },
        { type: 'separator' },
        { role: 'cut', label: langUse(translations, 'me_desktop_menu_cut') },
        { role: 'copy', label: langUse(translations, 'me_desktop_menu_copy') },
        {
          role: 'paste',
          label: langUse(translations, 'me_desktop_menu_paste'),
        },
        ...(isMac
          ? ([
              {
                role: 'delete',
                label: langUse(translations, 'me_desktop_menu_delete'),
              },
              {
                role: 'selectAll',
                label: langUse(translations, 'me_desktop_menu_select_all'),
              },
              { type: 'separator' },
              {
                label: langUse(translations, 'me_desktop_menu_speaking'),
                submenu: [
                  {
                    role: 'startSpeaking',
                    label: langUse(
                      translations,
                      'me_desktop_menu_speaking_start',
                    ),
                  },
                  {
                    role: 'stopSpeaking',
                    label: langUse(
                      translations,
                      'me_desktop_menu_speaking_stop',
                    ),
                  },
                ],
              },
            ] as const)
          : ([
              {
                role: 'delete',
                label: langUse(translations, 'me_desktop_menu_delete'),
              },
              { type: 'separator' },
              {
                role: 'selectAll',
                label: langUse(translations, 'me_desktop_menu_select_all'),
              },
            ] as const)),
      ] as MenuItemConstructorOptions[],
    },
  ]

  const isFullScreenMode =
    GlobalStore.has('is-full-screen-mode') &&
    GlobalStore.get('is-full-screen-mode')

  const viewMenuSection: MenuItemConstructorOptions[] = [
    {
      label: langUse(translations, 'me_desktop_menu_zoon_view'),
      submenu: [
        { type: 'separator' },
        {
          click: (_, window) => zoom.reset(window),
          accelerator: `${process.platform === 'darwin' ? 'Cmd' : 'Ctrl'}+0`,
          label: langUse(translations, 'me_desktop_menu_zoon_reset'),
        },
        ...zoomHotKeys.in.map(
          (accelerator, index): MenuItemConstructorOptions => ({
            click: (_, window) => zoom.in(window),
            accelerator,
            label: langUse(translations, 'me_desktop_menu_zoom_in'),
            visible: index === 0,
          }),
        ),
        ...zoomHotKeys.out.map(
          (accelerator, index): MenuItemConstructorOptions => ({
            click: (_, window) => zoom.out(window),
            accelerator,
            label: langUse(translations, 'me_desktop_menu_zoom_out'),
            visible: index === 0,
          }),
        ),
        { type: 'separator' },
        {
          role: 'togglefullscreen',
          label: isFullScreenMode
            ? langUse(translations, 'me_desktop_menu_fullscreen_leave')
            : langUse(translations, 'me_desktop_menu_fullscreen_enter'),
        },
        ...(isDevToolsAllowed || isDev
          ? // ...(isDev
            ([
              { type: 'separator' },
              { role: 'toggleDevTools', label: 'Консоль разработчика' },
              ...(isDev
                ? [{ role: 'reload', label: 'Перезагрузить окно' }]
                : []),
              {
                label: 'Создать heap snapshot',
                click: () =>
                  getHeapSnapshot({
                    logger: commonLogger,
                    directoryPath: app.getPath('logs'),
                    getWindow,
                  }),
              },
              { type: 'separator' },
            ] as MenuItemConstructorOptions[])
          : []),
        {
          label: langUse(translations, 'me_desktop_menu_debug_common'),
          checked: loggerSettings.getIsDebugLevelActive(),
          type: 'checkbox',
          click: ({ checked }: MenuItem) => {
            loggerSettings.setIsDebugLevelActive(checked)
          },
        },
        {
          label: langUse(translations, 'me_desktop_menu_debug_network'),
          checked: loggerSettings.getIsNetLogsActive(),
          type: 'checkbox',
          click: ({ checked }: MenuItem) => {
            loggerSettings.setIsNetLogsActive(checked)
          },
        },
        {
          label: langUse(translations, 'me_desktop_menu_flags'),
          submenu: [
            {
              label: 'Disable HTTP2',
              checked: userSettingsStore.get('disableHTTP2'),
              type: 'checkbox',
              click: ({ checked }: MenuItem) => {
                userSettingsStore.set('disableHTTP2', checked)
                const mainWindow = getWindow()
                if (mainWindow) {
                  dialog.showMessageBox(mainWindow, {
                    message: langUse(
                      translations,
                      'me_desktop_menu_reboot_to_apply',
                    ),
                  })
                }
              },
            },
            {
              label: 'Disable Hardware Acceleration',
              checked: userSettingsStore.get('disableHardwareAcceleration'),
              type: 'checkbox',
              click: ({ checked }: MenuItem) => {
                userSettingsStore.set('disableHardwareAcceleration', checked)
                const mainWindow = getWindow()
                if (mainWindow) {
                  dialog.showMessageBox(mainWindow, {
                    message: langUse(
                      translations,
                      'me_desktop_menu_reboot_to_apply',
                    ),
                  })
                }
              },
            },
            {
              label: 'Disable in process GPU',
              checked: userSettingsStore.get('disableInProcessGPU'),
              type: 'checkbox',
              click: ({ checked }: MenuItem) => {
                userSettingsStore.set('disableInProcessGPU', checked)
                const mainWindow = getWindow()
                if (mainWindow) {
                  dialog.showMessageBox(mainWindow, {
                    message: langUse(
                      translations,
                      'me_desktop_menu_reboot_to_apply',
                    ),
                  })
                }
              },
            },
            ...(isDev
              ? [
                  {
                    label: 'XDebug',
                    checked: memoryStore.getXDebug(),
                    type: 'checkbox',
                    click: ({ checked }: MenuItem) => {
                      memoryStore.setXDebug(checked)
                      const url = new URL(BASE_API_URL)

                      if (checked) {
                        session.defaultSession.cookies.set({
                          url: url.origin,
                          name: 'XDEBUG_SESSION',
                          value: 'PHPSTORM',
                          domain: url.hostname,
                          path: '/',
                        })
                      } else {
                        session.defaultSession.cookies.remove(
                          url.origin,
                          'XDEBUG_SESSION',
                        )
                      }
                    },
                  } as MenuItemConstructorOptions,
                ]
              : []),
          ],
        },
        { type: 'separator' },
        {
          label: langUse(translations, 'me_desktop_menu_open_logs'),
          click: () =>
            shell.showItemInFolder(join(app.getPath('logs'), 'common.log')),
        },
      ],
    },
  ]

  const windowMenuSection: MenuItemConstructorOptions[] = [
    {
      label: langUse(translations, 'me_desktop_menu_window'),
      submenu: [
        {
          role: 'minimize',
          label: langUse(translations, 'me_desktop_menu_window_minimize'),
        },
        ...(isMac
          ? ([
              {
                role: 'zoom',
                label: langUse(translations, 'me_desktop_menu_window_zoom'),
              },
              {
                label: langUse(translations, 'me_desktop_menu_window_hide'),
                accelerator: 'Cmd+W',
                click: hideMainWindow,
              },
              { type: 'separator' },
              {
                role: 'front',
                label: langUse(translations, 'me_desktop_menu_window_front'),
              },
            ] as const)
          : ([
              {
                role: 'close',
                label: langUse(translations, 'me_desktop_menu_window_close'),
              },
            ] as const)),
      ] as MenuItemConstructorOptions[],
    },
  ]

  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: langUse(translations, 'me_desktop_menu_app'),
      submenu: [
        {
          label: langUse(translations, 'me_desktop_menu_app_about'),
          click: async () => {
            const mainWindow = getWindow()
            mainWindow?.webContents?.send(
              ElectronFeatures.LINK_INNER,
              `/settings/about`,
            )
          },
        },
        ...(updateAllowedByPlatform
          ? [
              {
                label: langUse(translations, 'me_desktop_menu_app_updates'),
                click: async () => {
                  checkForUpdates(true)
                },
              },
            ]
          : []),
        {
          type: 'separator',
        },
        ...(isMac
          ? ([
              {
                label: langUse(translations, 'me_desktop_menu_app_show_tray'),
                checked: VKMeTray.isActive,
                type: 'checkbox',
                click: (menuItem: MenuItem) => {
                  menuItem.checked
                    ? VKMeTray.activateTray()
                    : VKMeTray.deactivateTray()
                },
              },
              {
                role: 'services',
                label: langUse(translations, 'me_desktop_menu_app_services'),
              },
              {
                role: 'hide',
                label: langUse(translations, 'me_desktop_menu_app_hide'),
              },
              {
                role: 'hideOthers',
                label: langUse(translations, 'me_desktop_menu_app_hide_others'),
              },
              {
                role: 'unhide',
                label: langUse(translations, 'me_desktop_menu_app_unhide'),
              },
            ] as const)
          : ([] as const)),
        {
          type: 'separator',
        },
        {
          id: 'logout',
          label: langUse(translations, 'me_desktop_menu_app_logout'),
          click: logout,
          enabled: false,
        },
        {
          label: langUse(translations, 'me_desktop_menu_app_quit'),
          role: 'quit',
        },
      ],
    },
    ...editMenuSection,
    ...viewMenuSection,
    ...windowMenuSection,
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}
