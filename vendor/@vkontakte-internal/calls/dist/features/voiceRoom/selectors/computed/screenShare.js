import { isSameExternalId } from '@vkontakte-internal/calls-core';
import { getMyExternalId } from '../../../../selectors';
import { getVoiceRoomScreenShareOwner } from '../simple';
export const getIsMyScreenShare = (state) => isSameExternalId(getMyExternalId(state), getVoiceRoomScreenShareOwner(state));
//# sourceMappingURL=screenShare.js.map