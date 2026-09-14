import { MediaType } from '@vkontakte/calls-sdk';
import { E_ACTION } from '../../constants';
import { getPreviousAvailableStreamMode } from '../../helpers/participant';
export const showSharedUrl = (sharedUrl) => ({
    type: E_ACTION.SET_LOCAL_DEVICE,
    data: {
        sharedMiniAppId: undefined,
        sharedUrl,
        streamMode: MediaType.SHARED_URL,
    },
});
export const showSharedMiniApp = (sharedMiniAppId) => ({
    type: E_ACTION.SET_LOCAL_DEVICE,
    data: {
        sharedMiniAppId,
        sharedUrl: undefined,
        streamMode: MediaType.SHARED_URL,
    },
});
export const updateSharedMiniAppUrl = (url) => ({
    type: E_ACTION.SET_LOCAL_DEVICE,
    data: {
        sharedUrl: url,
    },
});
export const hideSharedMiniApp = (localDevice) => ({
    type: E_ACTION.SET_LOCAL_DEVICE,
    data: {
        sharedUrl: undefined,
        sharedMiniAppId: undefined,
        streamMode: getPreviousAvailableStreamMode(localDevice, MediaType.SHARED_URL),
    },
});
//# sourceMappingURL=actions.js.map