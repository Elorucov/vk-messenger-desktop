import { DESKTOP_CALLS_HOST, DESKTOP_CALLS_SCHEME } from '../constants';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
const joinPrefix = `${DESKTOP_CALLS_SCHEME}${DESKTOP_CALLS_HOST}/join`;
const sferumJoinPrefix = 'vk://sferum.ru/';
export const generateStartCallsDeepLink = ({ peerId, userId, entryPoint, mode = 'manual', }) => {
    const deeplink = new URL(joinPrefix);
    deeplink.searchParams.append('peerId', `${peerId}`);
    deeplink.searchParams.append('userId', `${userId}`);
    if (entryPoint) {
        deeplink.searchParams.append('entrypoint', entryPoint);
        deeplink.searchParams.append('mode', mode);
    }
    console.log('deeplink: ', deeplink.toString());
    return deeplink.toString();
};
export const generateJoinCallsDeepLink = ({ joinLink, vkJoinLink, userId, sferum, entryPoint, mode = 'manual', }) => {
    let prefix = sferum ? sferumJoinPrefix : joinPrefix;
    let url = new URL(prefix);
    let params = url.searchParams;
    const joinLinkStr = `${joinLink}`;
    if (sferum) {
        params.append('call_link', joinLinkStr);
        // возможно, для anonymous юзера потребуется vkJoinLink
    }
    else if ((userId === 0 || !userId) && typeof vkJoinLink === 'string') {
        // anonymous user
        params.append('callId', vkJoinLink);
        params.append('joinLink', joinLinkStr);
    }
    else if (userId) {
        params.append('joinLink', joinLinkStr);
        params.append('userId', userId.toString());
    }
    if (entryPoint) {
        params.append('entrypoint', entryPoint);
        params.append('mode', mode);
    }
    debugMessage(DebugMessageType.LOG, `deeplink: ${url.toString()}`);
    return url.toString();
};
//# sourceMappingURL=deepLink.js.map