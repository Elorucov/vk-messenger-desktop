import { ARCH, OS } from '@vkontakte-internal/calls-core';
export const LINK_GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=com.vkontakte.android';
export const LINK_RUSTORE = 'https://apps.rustore.ru/app/com.vkontakte.android';
export const LINK_IOS = 'https://apps.apple.com/app/id564177498';
export const DOWNLOAD_APP_PROXY_PAGE = '/calls?act=download_app';
export const DESKTOP_CALLS_FILENAME = {
    [OS.WINDOWS]: 'vk-calls.exe',
    [OS.MAC]: 'vk-calls.dmg',
    [OS.LINUX]: {
        deb: {
            [ARCH.X64]: 'vk-calls-amd64.deb',
        },
    },
};
//# sourceMappingURL=constants.js.map