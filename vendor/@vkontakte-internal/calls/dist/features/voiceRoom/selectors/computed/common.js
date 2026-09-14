import { VoiceRoomMode } from '@vkontakte-internal/calls-core';
import { getVoiceRoomGroupByOwnerId } from '../../helpers';
import { getVoiceRoomGroups, getVoiceRoomMode, getVoiceRoomOwnerId } from '../simple';
import { getIsVoiceRoom } from '../../../../selectors';
export const getIsVoiceRoomTribuneMode = (state) => getIsVoiceRoom(state) && getVoiceRoomMode(state) === VoiceRoomMode.TRIBUNE;
export const getIsVoiceRoomVoiceMode = (state) => getIsVoiceRoom(state) && getVoiceRoomMode(state) === VoiceRoomMode.VOICE_ROOM;
export const getVoiceRoomGroup = (state) => {
    const ownerId = getVoiceRoomOwnerId(state);
    const groups = getVoiceRoomGroups(state);
    return ownerId ? getVoiceRoomGroupByOwnerId(groups || [], ownerId) : undefined;
};
//# sourceMappingURL=common.js.map