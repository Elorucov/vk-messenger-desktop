import * as os from 'os'
import { getDomain } from 'tldts'
import { execFile } from 'child_process'
import { v4 } from 'uuid'
import { app } from 'electron'
import { PlatformName } from 'vkme-common'
import { commonLogger } from '../libs/logger'

const scope = 'helpers'
const version = os.release()
const [majorVersion] = version.split('.')

const Platform = {
  [PlatformName.WINDOWS]: 'win32',
  [PlatformName.MAC]: 'darwin',
  [PlatformName.LINUX]: 'linux',
}

const isMac = process.platform === Platform.MAC

const isWindows = process.platform === Platform.WINDOWS

const isLinux = !isMac && !isWindows
const isAppImage = isLinux && process.env.APPIMAGE != null

const isWindows10OrHigher =
  isWindows && majorVersion !== undefined && majorVersion >= '10'

const isCatalinaOrHigher =
  isMac && majorVersion !== undefined && majorVersion >= '19'

const isSnap =
  isLinux &&
  (require.main?.filename.includes('snap') ||
    process.argv.filter((arg) => arg.includes('snap')).length > 0)

const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const isDevToolsAllowed = import.meta.env.VITE_DEV_TOOLS_ALLOWED === 'true'

const isMas = process.mas || false
const updateAllowedByPlatform = !isMas && (!isLinux || isAppImage)

const shouldDownloadFile = (url: string | null): boolean => {
  try {
    const { hostname, pathname, searchParams } = new URL(url || '')
    if (
      pathname.startsWith('/doc') &&
      searchParams.has('hash') &&
      searchParams.has('dl')
    ) {
      return true
    }
    if (pathname.startsWith('/away.php') && searchParams.has('to')) {
      return shouldDownloadFile(searchParams.get('to'))
    }
    if (getDomain(hostname) === 'userapi.com') {
      return true
    }
  } catch (error) {
    commonLogger.error('main', scope, error)
  }
  return false
}

const makeQuarantineAttr = (agentName: string) => {
  const timeStamp = Math.floor(Date.now() / 1000).toString(16)
  const eventId = v4().toUpperCase()
  return [
    isMac && version >= '16' ? '0081' : '0001',
    timeStamp,
    agentName,
    eventId,
  ].join(';')
}

const quarantine = (filePath: string): void => {
  execFile(
    'xattr',
    ['-w', 'com.apple.quarantine', makeQuarantineAttr(app.name), filePath],
    (error: unknown) => error && commonLogger.error('main', scope, error),
  )
}

const getDeviceName = (): string => {
  if (isWindows) {
    return `Windows: ${os.version}. VK Messenger: ${app.getVersion()}`
  } else if (isMac) {
    return `Mac OS: ${os.version}. VK Messenger: ${app.getVersion()}`
  } else {
    return `Linux: ${os.version}. VK Messenger: ${app.getVersion()}`
  }
}

export {
  isMac,
  isMas,
  isWindows,
  isDev,
  isWindows10OrHigher,
  isProd,
  isLinux,
  isAppImage,
  isSnap,
  isDevToolsAllowed,
  isCatalinaOrHigher,
  shouldDownloadFile,
  quarantine,
  updateAllowedByPlatform,
  Platform,
  getDeviceName,
}
