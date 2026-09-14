import '../../ui/AttachActiveCall/AttachActiveCall.css';
import React from 'react';
import { useBrowserEnv, usePeers, useViewer } from '../../hooks/misc';
import { CallParticipantsStack } from '../../ui/CallParticipantsStack/CallParticipantsStack';
import { AttachmentCell, AttachmentCellButton, } from '../../ui/AttachmentCell/AttachmentCell';
import { Icon24PhoneOutline } from '@vkontakte/icons';
import * as Viewer from '../../../core/model/Viewer';
import { isMouseEventWithModifier } from '../../utils/misc';
export const AttachActiveCall = ({ activeCall, isInBubble, isOut, }) => {
    const peers = usePeers();
    const { lang, calls, vkDomain } = useBrowserEnv();
    const viewer = useViewer();
    const canCall = calls && !!activeCall.joinLink;
    const getSubtitle = () => {
        if (activeCall.participants.count > 0) {
            return (React.createElement("div", { className: "AttachActiveCall__subtitle" },
                getParticipants(),
                lang.use('me_group_call_participant_count', {
                    num: activeCall.participants.count,
                })));
        }
        return lang.use('me_group_call_participant_count_none');
    };
    const getParticipants = () => {
        const participantPhotos = activeCall.participants.coverList
            .map((peerId) => peers.get(peerId)?.photo)
            .filter((photo) => photo !== undefined);
        if (participantPhotos.length === 0) {
            return undefined;
        }
        return (React.createElement(CallParticipantsStack, { participantsCount: activeCall.participants.count, photos: participantPhotos, visibleCount: 2, size: 16 }));
    };
    const handleCallClick = () => {
        if (!canCall) {
            return;
        }
        calls.showJoinPopup(`https://${vkDomain}/call/join/${activeCall.joinLink}`, 'join_popup');
    };
    const handleCallLinkClick = (event) => {
        if (isMouseEventWithModifier(event)) {
            // Позволяем открыть ссылку в новой вкладке / окне
            return;
        }
        event.preventDefault();
        handleCallClick();
    };
    const callCell = (React.createElement(AttachmentCell, { image: React.createElement(Icon24PhoneOutline, null), title: lang.use('me_group_call'), subtitle: getSubtitle(), isClickable: canCall, buttonRight: canCall ? (React.createElement(AttachmentCellButton, { mode: "outline", appearance: "accent-invariable" }, lang.use('me_group_call_join'))) : undefined, imageShape: "round", isInBubble: isInBubble, isOut: isOut }));
    if (activeCall.joinLink && !Viewer.isEdu(viewer.profileType)) {
        return (React.createElement("a", { href: `https://${vkDomain}/call/join/${activeCall.joinLink}`, onClick: handleCallLinkClick, className: "AttachActiveCall" }, callCell));
    }
    return (React.createElement("button", { onClick: handleCallClick, className: "AttachActiveCall" }, callCell));
};
//# sourceMappingURL=AttachActiveCall.js.map