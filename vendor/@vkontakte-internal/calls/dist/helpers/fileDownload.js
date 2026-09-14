import { LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED, LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED } from '../constants';
import { DESKTOP_CALLS_DOWNLOAD, DESKTOP_CALLS_FILENAME, SFERUM_APP_URL, SFERUM_DESKTOP_CALLS_FILENAME, } from '../downloadConstants';
import { localStorage } from '@vkontakte/vkjs';
import { ARCH, OS, Platform } from '@vkontakte-internal/calls-core';
export function getPlatformUrl(isSferum, isLatestSferumApp) {
    if (isSferum) {
        return getSferumPLatformUrl(isLatestSferumApp);
    }
    let result = null;
    if (Platform.OS === OS.MAC) {
        result = {
            url: DESKTOP_CALLS_DOWNLOAD[OS.MAC],
            filename: DESKTOP_CALLS_FILENAME[OS.MAC],
        };
    }
    else if (Platform.OS === OS.WINDOWS) {
        result = {
            url: DESKTOP_CALLS_DOWNLOAD[OS.WINDOWS],
            filename: DESKTOP_CALLS_FILENAME[OS.WINDOWS],
        };
    }
    else if (Platform.OS === OS.LINUX) {
        result = {
            url: DESKTOP_CALLS_DOWNLOAD[OS.LINUX]['deb'][ARCH.X64],
            filename: DESKTOP_CALLS_FILENAME[OS.LINUX]['deb'][ARCH.X64],
        };
    }
    return result;
}
export function setDownloadedFlag(isSferum) {
    localStorage.setItem(isSferum ? LOCALSTORAGE_IS_MESSENGER_APP_DOWNLOADED : LOCALSTORAGE_IS_CALLS_APP_DOWNLOADED, 'true');
}
function getSferumPLatformUrl(isLatestSferumApp = true) {
    const appUrl = isLatestSferumApp ? SFERUM_APP_URL.latest : SFERUM_APP_URL.current;
    const filename = isLatestSferumApp ? SFERUM_DESKTOP_CALLS_FILENAME.latest : SFERUM_APP_URL.current;
    switch (Platform.OS) {
        case OS.MAC:
        case OS.WINDOWS:
            return {
                url: appUrl[Platform.OS],
                filename: filename[Platform.OS],
            };
        case OS.LINUX:
            return {
                url: appUrl[Platform.OS]['deb'][ARCH.X64],
                filename: filename[Platform.OS]['deb'][ARCH.X64],
            };
        default:
            return null;
    }
}
//# sourceMappingURL=fileDownload.js.map