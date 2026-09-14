import * as os from 'os'
import { app } from 'electron'

export const OSParams = [os.platform(), os.release(), os.arch()].join('; ')

/**
 * Вид юзер-агента зафиксирован и ожидается на бэке
 * VKDesktopMessenger/1.0.0 (darwin; 16.0.0; x64)
 */
export const USER_AGENT = `VKDesktopMessenger/${app.getVersion()} (${OSParams})`
