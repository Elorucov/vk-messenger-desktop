import { jsx as _jsx } from "react/jsx-runtime";
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getVoiceRoomModal } from '../selectors/simple/modal';
import { VoiceRoomModalTypes } from '@vkontakte-internal/calls-core';
import { KickParticipant } from './KickParticipant/KickParticipant';
export const ModalManager = () => {
    const modal = useTypedSelector(getVoiceRoomModal);
    switch (modal?.type) {
        case VoiceRoomModalTypes.KICK_PARTICIPANT: {
            return _jsx(KickParticipant, { ...modal.data });
        }
        default: {
            return null;
        }
    }
};
//# sourceMappingURL=ModalManager.js.map