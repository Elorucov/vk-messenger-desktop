import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"article":["global",{"className":1}],"div":["global",{"className":2}],"footer":["global",{"className":1}],"span":["global",{"className":2}]} */
import { memo, useCallback, useRef } from 'react';
import { BlurredBackground } from '../BlurredBackground/BlurredBackground';
import { classNames as cx } from '@vkontakte/vkjs';
import { isParticipantAnonymOrContact } from '../../helpers/participant';
import { CallPhoto } from '../../components/CallPhoto/CallPhoto';
import ParticipantHeader from '../../components/ParticipantHeader/ParticipantHeader';
import { Icon24Privacy } from '@vkontakte/icons';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { externalIdToString } from '@vkontakte-internal/calls-core';
import { useLang } from '../../hooks/useLang';
import { useIsHandRaised } from '../../hooks/useIsHandRaised';
import { useWasConnected } from '../../hooks/useWasConnected';
import { useDeviceMediaSettings } from '../../hooks/useDeviceMediaSettings';
import { useConfig } from '../../services/config';
export const ParticipantLite = memo(({ externalId, isInfoShown, isPinned, isPinnedByAdmin, photo, isMe = false, name = '', gender, letter, onClickParticipant, onDblClickParticipant, }) => {
    const { getLang, langSex } = useLang();
    const { anonymPhoto } = useConfig();
    const ref = useRef(null);
    const isAnonymOrContact = isParticipantAnonymOrContact(externalId);
    const classes = cx('Participant', 'Participant--withAnimation', { 'Participant--isPinned': isPinned });
    const id = externalIdToString(externalId);
    const mediaSettings = useDeviceMediaSettings(externalId);
    const hasAudio = !!mediaSettings?.isAudioEnabled;
    const handleParticipantClick = useCallback((e) => {
        if (onClickParticipant) {
            onClickParticipant(e, externalId);
        }
    }, [onClickParticipant, externalId]);
    const handleParticipantDblClick = useCallback((e) => {
        if (onDblClickParticipant) {
            onDblClickParticipant(e, externalId);
        }
    }, [onDblClickParticipant, externalId]);
    const string = langSex(gender, 'calls_notification_raised_hand', getLang('calls_notification_raised_hand', 'raw'));
    const wasConnected = useWasConnected(externalId);
    const isHandRaised = useIsHandRaised(externalId);
    const raisedHandLabel = string.replace('{user}', name);
    const participantLabel = isHandRaised ? raisedHandLabel : name;
    return (_jsxs("article", { ref: ref, className: classes, onClick: handleParticipantClick, "aria-label": participantLabel, onDoubleClick: handleParticipantDblClick, "participant-id": id, children: [_jsx(BlurredBackground, { id: externalId.id, className: "Participant__main", children: _jsx(CallPhoto, { peerId: externalId.id, photo: !anonymPhoto && isAnonymOrContact ? '' : photo, alt: participantLabel, letter: letter, className: isInfoShown ? 'Participant__offsetCard' : '' }) }), _jsx(ParticipantHeader, { externalId: externalId, isPinnedByAdmin: isPinnedByAdmin, isPinned: isPinned }), wasConnected && isHandRaised && (_jsx("div", { className: cx('Participant__indicators', 'Participant__indicators--lite'), children: _jsx("div", { className: cx('Participant__indicator', 'Participant__indicator--hand'), children: _jsx(Icon24Privacy, {}) }) })), isInfoShown && (_jsxs("footer", { className: "Participant__footer", children: [_jsx("span", { className: "Participant__name", children: decodeHTMLEntities(name) }), (wasConnected || isMe) && !hasAudio && (_jsx("span", { className: "Participant__statusIcon Participant__statusIcon--mic" }))] }))] }));
});
ParticipantLite.displayName = 'ParticipantLite';
//# sourceMappingURL=ParticipantLite.js.map