import '../../ui/AttachFinishedCall/AttachFinishedCall.css';
import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useOwner, usePeers } from '../../hooks/misc';
import { formatDuration } from '../../../core/utils/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Icon16LinkOutline, Icon24PhoneOutline } from '@vkontakte/icons';
import cx from 'classnames';
import { CallParticipantsStack } from '../../ui/CallParticipantsStack/CallParticipantsStack';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
export const AttachFinishedCall = ({ call, peerId, isInBubble, isOut, }) => {
    const { lang, calls } = useBrowserEnv();
    const owner = useOwner();
    const peers = usePeers();
    const convo = peers.get(peerId);
    const isGroup = Peer.isChatPeerId(peerId);
    const canCall = convo?.kind === 'User' && convo.canCall && !!calls;
    const isIncoming = call.initiatorId !== owner.id;
    const title = useMemo(() => {
        return (React.createElement("div", { className: "AttachFinishedCall__headlineContainer" },
            !isGroup && (React.createElement(Icon16LinkOutline, { className: cx('AttachFinishedCall__headlineIcon', {
                    'AttachFinishedCall__headlineIcon--upturned': isIncoming,
                    'AttachFinishedCall__headlineIcon--reached': call.state === 'reached',
                    'AttachFinishedCall__headlineIcon--canceled': (call.state === 'canceledByInitiator' && isIncoming) ||
                        (call.state === 'canceledByReceiver' && !isIncoming),
                }) })),
            isGroup
                ? lang.use('me_group_call')
                : isIncoming
                    ? lang.use('me_call_direction_in')
                    : lang.use('me_call_direction_out')));
    }, [isGroup, isIncoming, call.state, lang]);
    const getSubtitle = () => {
        let subtitle;
        switch (call.state) {
            case 'reached':
                subtitle = lang.use('me_call_state_reached');
                break;
            case 'canceledByInitiator':
                subtitle = isIncoming
                    ? lang.use('me_call_state_missed')
                    : lang.use('me_call_state_canceled');
                break;
            case 'canceledByReceiver':
                subtitle = isIncoming
                    ? lang.use('me_call_state_canceled')
                    : lang.use('me_call_state_rejected');
                break;
            default:
                return exhaustivenessCheck(call.state);
        }
        subtitle = call.duration
            ? `${subtitle} · ${formatDuration(call.duration)}`
            : subtitle;
        if (isGroup) {
            return (React.createElement("div", { className: "AttachActiveCall__subtitle" },
                getParticipants(),
                subtitle));
        }
        return subtitle;
    };
    const getParticipants = () => {
        const participantPhotos = call.participants.coverList
            .map((peerId) => peers.get(peerId)?.photo)
            .filter((photo) => photo !== undefined);
        if (!isGroup || participantPhotos.length === 0) {
            return undefined;
        }
        return (React.createElement(CallParticipantsStack, { participantsCount: call.participants.count, photos: participantPhotos, size: 16, visibleCount: 2 }));
    };
    const handleCallClick = () => {
        if (!canCall) {
            return;
        }
        calls.callPeer(peerId, 'message', false);
    };
    return (React.createElement("button", { className: "AttachFinishedCall", onClick: handleCallClick },
        React.createElement(AttachmentCell, { image: React.createElement(Icon24PhoneOutline, null), title: title, subtitle: getSubtitle(), isClickable: canCall, imageShape: 'round', isInBubble: isInBubble, isOut: isOut })));
};
//# sourceMappingURL=AttachFinishedCall.js.map