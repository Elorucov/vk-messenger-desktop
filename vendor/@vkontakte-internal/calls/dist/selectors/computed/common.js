import { getEntryPoint, getUiMode } from '../common';
import { isMiniAppSource } from '../../helpers/apps';
import { UIMode } from '@vkontakte-internal/calls-core';
export const getIsFullScreen = (state) => getUiMode(state) === UIMode.FULLSCREEN;
export const getIsMiniApp = (state) => {
    const entryPoint = getEntryPoint(state);
    return isMiniAppSource(entryPoint?.source);
};
//# sourceMappingURL=common.js.map