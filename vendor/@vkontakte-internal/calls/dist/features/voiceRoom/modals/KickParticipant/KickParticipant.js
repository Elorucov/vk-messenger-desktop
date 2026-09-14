import { jsx as _jsx } from "react/jsx-runtime";
import { KickParticipantModal } from '../../../../components/KickParticipantModal/KickParticipantModal';
import { useTypedDispatch } from '../../../../hooks/useTypedDispatch';
import { setVoiceRoomModal } from '../../model';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { useState } from 'react';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { kickParticipant, KickType } from '../../../../helpers/participant';
import { useLang } from '../../../../hooks/useLang';
import { ClickHouseEventType, useSendStatsService } from '../../../../stats/clickHouse';
export const KickParticipant = ({ participant }) => {
    const [allowReconnect, setAllowReconnect] = useState(true);
    const dispatch = useTypedDispatch();
    const closeModal = () => dispatch(setVoiceRoomModal(null));
    const { getLang, langSex } = useLang();
    const sendStats = useSendStatsService();
    const onKickParticipant = () => {
        kickParticipant(participant, !allowReconnect);
        sendStats(ClickHouseEventType.USER_REMOVED, {
            reason: allowReconnect ? KickType.KICK : KickType.BAN,
            ...(participant && {
                event_param: peerIdToVkId(participant.peerId),
            }),
        });
        closeModal();
    };
    const description = langSex(participant?.sex, 'calls_kick_participant_text', getLang('calls_kick_participant_text', 'raw')).replace('{user}', participant?.name ?? '');
    return (_jsx(KickParticipantModal, { onClose: closeModal, onAllowReconnectChange: setAllowReconnect, description: description, allowBan: true, banText: getLang('calls_kick_participant_with_ban_setting'), actionButtons: [
            _jsx(Button, { "data-focus-first": true, size: "m", onClick: closeModal, mode: "secondary", children: getLang('calls_cancel') }, "cancel"),
            _jsx(Button, { size: "m", mode: "primary", onClick: onKickParticipant, children: getLang('calls_kick_participant_kick_button_text') }, "stop"),
        ] }));
};
//# sourceMappingURL=KickParticipant.js.map