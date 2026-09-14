import { MediaType } from '@vkontakte/calls-sdk';
export const isSharedMiniAppDeeplink = (url) => {
    try {
        const { pathname, hash } = new URL(url);
        return /^\/app\d+/.test(pathname) && !!hash;
    }
    catch (err) {
        return false;
    }
};
export const getSharedMiniAppIdFromUrl = (url) => {
    try {
        const { pathname } = new URL(url);
        const appId = /\d+/.exec(pathname)?.[0];
        return appId ? Number(appId) : undefined;
    }
    catch (err) {
        return undefined;
    }
};
export const getSharedMiniHashFromUrl = (url) => {
    try {
        const { hash } = new URL(url);
        return hash;
    }
    catch (err) {
        return undefined;
    }
};
export const isSharedMiniAppShownFromDevice = (device) => {
    return device.streamMode === MediaType.SHARED_URL;
};
export const getMiniAppIdSharedFromDevice = (device) => {
    if (device.streamMode !== MediaType.SHARED_URL) {
        return undefined;
    }
    const { sharedMiniAppId, sharedUrl } = device;
    // if deeplink to mini-app is received from another user it will be in sharedUrl
    return sharedMiniAppId ?? (sharedUrl ? getSharedMiniAppIdFromUrl(sharedUrl) : undefined);
};
export function getSharingMiniAppParticipantId(state) {
    if (isSharedMiniAppShownFromDevice(state.localDevice)) {
        return state.externalId;
    }
    const device = Object.values(state.devices).find((device) => isSharedMiniAppShownFromDevice(device));
    return device?.externalId;
}
//# sourceMappingURL=miniApps.js.map