import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { KickParticipantType, participantIsAdmin, peerIdToVkId, } from '@vkontakte-internal/calls-core';
import { KickParticipantModal } from '../components/KickParticipantModal/KickParticipantModal';
import { kickParticipant, KickType, participantIsChatAdmin } from '../helpers/participant';
import { removeUserFromWaitingHall } from '../actions/waitingHall';
import { useLang } from '../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useCloseModal } from '../hooks/useCloseModal';
import { getConversation, getWaitingHall } from '../selectors';
import { ClickHouseEventType, useSendStatsService } from '../stats/clickHouse';
const createParticipantSelector = (peerId, kickType) => (state) => {
    const isKickFromCall = kickType === KickParticipantType.CALL;
    return {
        isKickFromCall,
        participant: isKickFromCall ? state.participants[peerId] : getWaitingHall(state)?.members.get(peerId),
    };
};
export const KickParticipantContainer = ({ peerId, kickType, onClose }) => {
    const dispatch = useTypedDispatch();
    const { getLang, langSex } = useLang();
    const waitingHall = useTypedSelector(getWaitingHall);
    const { participant, isKickFromCall } = useTypedSelector(createParticipantSelector(peerId, kickType));
    const conversation = useTypedSelector(getConversation);
    const [allowReconnect, setAllowReconnect] = useState(true);
    const allowBan = participant
        ? !participantIsAdmin(participant) && !participantIsChatAdmin(participant, conversation)
        : false;
    const closeModal = useCloseModal(onClose);
    const sendStats = useSendStatsService();
    const onKickParticipant = useCallback(() => {
        kickParticipant(participant, !allowReconnect).then(() => {
            if (!isKickFromCall && waitingHall && participant?.peerId) {
                dispatch(removeUserFromWaitingHall(participant.peerId, waitingHall));
            }
        });
        if (!waitingHall?.members.has(peerId)) {
            sendStats(ClickHouseEventType.USER_REMOVED, {
                reason: allowReconnect ? KickType.KICK : KickType.BAN,
                ...(participant && {
                    event_param: peerIdToVkId(participant.peerId),
                }),
            });
        }
        closeModal();
    }, [participant?.peerId, allowReconnect, waitingHall]);
    const onBanChange = useCallback((allow) => {
        setAllowReconnect(allow);
    }, []);
    useEffect(() => {
        if (!participant?.id) {
            closeModal();
        }
    }, [participant?.id]);
    const descriptionKey = isKickFromCall
        ? 'calls_kick_participant_text'
        : 'calls_kick_participant_from_waiting_hall_text';
    const descriptionLang = isKickFromCall
        ? getLang('calls_kick_participant_text', 'raw')
        : getLang('calls_kick_participant_from_waiting_hall_text', 'raw');
    const description = langSex(participant?.sex, descriptionKey, descriptionLang).replace('{user}', participant?.name ?? '');
    const buttonKickText = isKickFromCall
        ? getLang('calls_kick_participant_kick_button_text')
        : getLang('calls_kick_participant_from_waiting_hall_button_text');
    const settingText = isKickFromCall
        ? getLang('calls_kick_participant_with_ban_setting')
        : getLang('calls_kick_participant_from_waiting_hall_with_ban_setting');
    return (_jsx(KickParticipantModal, { onClose: closeModal, onAllowReconnectChange: onBanChange, description: description, allowBan: allowBan, banText: settingText, isKickFromCall: isKickFromCall, actionButtons: [
            _jsx(Button, { "data-focus-first": true, size: "m", onClick: closeModal, mode: "secondary", "data-testid": `calls${isKickFromCall ? '_call' : '_waiting_hall'}_kick_cancel`, children: getLang('calls_cancel') }, "cancel"),
            _jsx(Button, { size: "m", mode: "primary", onClick: onKickParticipant, "data-testid": `calls${isKickFromCall ? '_call' : '_waiting_hall'}_kick_submit`, children: buttonKickText }, "stop"),
        ] }));
};
//# sourceMappingURL=KickParticipantContainer.js.map