import { isChatPeer } from '@vkontakte-internal/vkjs/lib/im/Helpers';
import { EMPTY_USER_ID } from '../../constants';
export const isGroupCallByVkId = (vkId) => {
    return vkId === EMPTY_USER_ID || vkId === null || isChatPeer(vkId);
};
//# sourceMappingURL=call.js.map