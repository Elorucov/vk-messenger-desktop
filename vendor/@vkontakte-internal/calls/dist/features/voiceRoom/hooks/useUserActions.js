import { useCallsSDK } from '../../../providers/CallsSdkProvider';
import { useCallback } from 'react';
import { KickParticipantType, ModalType, UIMode, VoiceRoomModalTypes, VoiceRoomNotification, } from '@vkontakte-internal/calls-core';
import { pause } from '@vkontakte-internal/vkjs/lib/PromiseUtils';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { getVoiceRoomPromotionRequestsIsHandUp, PROMOTION_LIMIT_ERROR, setPromotionRequestsHandUp, setVoiceRoomModal, setVoiceRoomNotification, } from '../../../features/voiceRoom';
import { changeUiMode, toggleModal } from '../../../actions';
export function useManagePromotions() {
    const SDK = useCallsSDK();
    const dispatch = useTypedDispatch();
    const handlePromote = useCallback((externalId) => {
        SDK.promoteParticipant(externalId).catch((error) => {
            if (error.message === PROMOTION_LIMIT_ERROR) {
                dispatch(setVoiceRoomNotification(VoiceRoomNotification.PROMOTED_LIMIT_ERROR));
            }
        });
    }, []);
    const handleDemote = useCallback((externalId) => SDK.promoteParticipant(externalId, true), []);
    return { handlePromote, handleDemote };
}
export function useRequestPromotion() {
    const dispatch = useTypedDispatch();
    const isHandUp = useTypedSelector(getVoiceRoomPromotionRequestsIsHandUp);
    const SDK = useCallsSDK();
    const toggle = () => SDK.requestPromotion(isHandUp).then(() => {
        dispatch(setPromotionRequestsHandUp(!isHandUp));
    });
    return {
        isHandUp,
        toggle,
    };
}
export function useCollapseCall() {
    const dispatch = useTypedDispatch();
    const uiMode = useTypedSelector((state) => state.uiMode);
    return useCallback(() => {
        if (uiMode === UIMode.FULLSCREEN) {
            pause(0.3, null).then(() => {
                dispatch(changeUiMode(UIMode.COLLAPSED));
            });
            dispatch(changeUiMode(UIMode.DEFAULT));
        }
        else {
            dispatch(changeUiMode(UIMode.COLLAPSED));
        }
    }, [uiMode]);
}
export function useKickParticipant() {
    const dispatch = useTypedDispatch();
    return useCallback((participant) => dispatch(toggleModal(ModalType.KICK_PARTICIPANT, {
        kickType: KickParticipantType.CALL,
        peerId: participant.peerId,
    })), []);
}
export function useKickListener() {
    const dispatch = useTypedDispatch();
    return (participant) => dispatch(setVoiceRoomModal({
        type: VoiceRoomModalTypes.KICK_PARTICIPANT,
        data: {
            participant,
        },
    }));
}
//# sourceMappingURL=useUserActions.js.map