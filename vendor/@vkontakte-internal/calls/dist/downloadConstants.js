import { ARCH, OS } from '@vkontakte-internal/calls-core';
/* -------------- VK APP --------------  */
export const DESKTOP_CALLS_DOWNLOAD = {
    [OS.WINDOWS]: 'https://vkcalls-native-ac.vk-apps.com/latest/vk-calls.exe',
    [OS.MAC]: 'https://vkcalls-native-ac.vk-apps.com/latest/vk-calls.dmg',
    [OS.LINUX]: {
        deb: {
            [ARCH.X64]: 'https://vkcalls-native-ac.vk-apps.com/latest/vk-calls-amd64.deb',
            [ARCH.X86]: 'https://vkcalls-native-ac.vk-apps.com/latest/vk-calls-i386.deb',
        },
        rpm: {
            [ARCH.X64]: 'https://vkcalls-native-ac.vk-apps.com/latest/vk-calls-x86_64.rpm',
            [ARCH.X86]: 'https://vkcalls-native-ac.vk-apps.com/latest/vk-calls-i686.rpm',
        },
    },
};
export const DESKTOP_CALLS_FILENAME = {
    [OS.WINDOWS]: 'vk-calls.exe',
    [OS.MAC]: 'vk-calls.dmg',
    [OS.LINUX]: {
        deb: {
            [ARCH.X64]: 'vk-calls-amd64.deb',
        },
    },
};
/* -------------- SFERUM APP --------------  */
const SFERUM_OLD_APP_WINDOWS_URL = 'https://st.mycdn.me/static/sferum/latest/sferum.exe';
export const SFERUM_OLD_APP_URL = {
    [OS.WINDOWS]: SFERUM_OLD_APP_WINDOWS_URL,
    [OS.MAC]: 'https://st.mycdn.me/static/sferum/latest/sferum.pkg',
    [OS.LINUX]: {
        deb: {
            [ARCH.X64]: 'https://st.mycdn.me/static/sferum/latest/sferum-amd64.deb',
            [ARCH.X86]: 'https://st.mycdn.me/static/sferum/latest/sferum-i386.deb',
        },
        rpm: {
            [ARCH.X64]: 'https://st.mycdn.me/static/sferum/latest/sferum-x86_64.rpm',
            [ARCH.X86]: 'https://st.mycdn.me/static/sferum/latest/sferum-i686.rpm',
        },
    },
    [OS.UNKNOWN]: SFERUM_OLD_APP_WINDOWS_URL,
};
export const SFERUM_OLD_DESKTOP_CALLS_FILENAME = {
    [OS.WINDOWS]: 'sferum.exe',
    [OS.MAC]: 'sferum.pkg',
    [OS.LINUX]: {
        deb: {
            [ARCH.X64]: 'sferum-amd64.deb',
            [ARCH.X86]: 'sferum-i386.deb',
        },
        rpm: {
            [ARCH.X64]: 'sferum-x86_64.rpm',
            [ARCH.X86]: 'sferum-i686.rpm',
        },
    },
};
const SFERUM_NEW_APP_WINDOWS_URL = 'https://upload.object2.vk-apps.com/vk-me-desktop-dev-5837a06d-5f28-484a-ac22-045903cb1b1a/latest/vk-messenger-x64.exe';
export const SFERUM_NEW_APP_URL = {
    [OS.WINDOWS]: SFERUM_NEW_APP_WINDOWS_URL,
    [OS.MAC]: 'https://upload.object2.vk-apps.com/vk-me-desktop-dev-5837a06d-5f28-484a-ac22-045903cb1b1a/latest/vk-messenger-universal.dmg',
    [OS.LINUX]: {
        deb: {
            [ARCH.X64]: 'https://upload.object2.vk-apps.com/vk-me-desktop-dev-5837a06d-5f28-484a-ac22-045903cb1b1a/latest/vk-messenger-6.0.13-build.24-amd64.deb',
        },
    },
    [OS.UNKNOWN]: SFERUM_NEW_APP_WINDOWS_URL,
};
export const SFERUM_NEW_APP_DESKTOP_CALLS_FILENAME = {
    [OS.WINDOWS]: 'vk-messenger-x64.exe',
    [OS.MAC]: 'vk-messenger-universal.dmg',
    [OS.LINUX]: {
        deb: {
            [ARCH.X64]: 'vk-messenger-6.0.13-build.24-amd64.deb',
        },
    },
};
export const SFERUM_APP_URL = {
    current: SFERUM_OLD_APP_URL,
    latest: SFERUM_NEW_APP_URL,
};
export const SFERUM_DESKTOP_CALLS_FILENAME = {
    current: SFERUM_OLD_DESKTOP_CALLS_FILENAME,
    latest: SFERUM_NEW_APP_DESKTOP_CALLS_FILENAME,
};
//# sourceMappingURL=downloadConstants.js.map