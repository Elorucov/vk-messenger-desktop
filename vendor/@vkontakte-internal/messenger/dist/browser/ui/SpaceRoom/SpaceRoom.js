import '../../ui/SpaceRoom/SpaceRoom.css';
import React from 'react';
import * as Peer from '../../../core/model/Peer';
import * as Convo from '../../../core/model/Convo';
import * as History from '../../../core/model/History';
import { useBrowserEnv, useConvos, usePeers, useSpaceCalls, useViewer, useTribunes, useTypings, } from '../../hooks/misc';
import { Icon12Bomb, Icon12Mention, Icon12Stars, Icon16LogoVkVideo, Icon16Users, Icon16Videocam, Icon20AdvertisingOutline, Icon20MessagesOutline, Icon20VoiceOutline, Icon20VolumeOutline, } from '@vkontakte/icons';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Link } from '../../ui/Link/Link';
import cx from 'classnames';
import { TypingIndicator } from '../../ui/TypingIndicator/TypingIndicator';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { PeerAvatar } from '../../ui/PeerAvatar/PeerAvatar';
import { useFormattedDate } from '../../hooks/useFormattedDate';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
// SPC-TODO заменить на реальные данные про шаринг
const withSharing = false;
export const SpaceRoom = ({ room, spaceId, isSelected, }) => {
    const to = {
        kind: 'SpaceRoomRoute',
        spaceId,
        roomId: room.id,
    };
    switch (room.relatedEntity.kind) {
        case 'RoomChannel':
        case 'RoomChat': {
            return (React.createElement(TextRoom, { to: to, room: room.relatedEntity, isSelected: isSelected }));
        }
        case 'RoomCall': {
            return (React.createElement(CallRoom, { to: to, room: room.relatedEntity, isSelected: isSelected }));
        }
        case 'RoomTribune': {
            return (React.createElement(TribuneRoom, { to: to, room: room.relatedEntity, isSelected: isSelected }));
        }
        default:
            return exhaustivenessCheck(room.relatedEntity);
    }
};
const TextRoom = ({ room, isSelected, to }) => {
    const peers = usePeers();
    const convos = useConvos();
    const { lang } = useBrowserEnv();
    const peer = Peer.safeGet(peers, room.peerId);
    const convo = Convo.safeGet(convos, room.peerId);
    const isUnread = Convo.isUnread(convo);
    const lastMessage = History.lastNode({
        history: convo.history,
        withDeleted: false,
        withPending: true,
        withFailed: true,
    })?.item;
    const lastMessageAuthor = lastMessage?.authorId || convo.ownerId;
    const lastMessageAuthorPeer = lastMessageAuthor
        ? peers.get(lastMessageAuthor)
        : undefined;
    const typing = useTypings(convo.peerId, 'compact', 2);
    return (React.createElement(Link, { className: cx('SpaceRoom', 'SpaceRoom--chat', {
            'SpaceRoom--selected': isSelected,
        }), to: to, role: "tab", tabIndex: 0, "aria-selected": isSelected },
        React.createElement("div", { className: "SpaceRoom__icon" }, room.kind === 'RoomChat' ? (React.createElement(Icon20MessagesOutline, null)) : (React.createElement(Icon20AdvertisingOutline, null))),
        React.createElement("div", { className: "SpaceRoom__title" }, peer.title),
        React.createElement("div", { className: "SpaceRoom__message" }, typing ? (React.createElement("span", { className: "SpaceRoom__typing" },
            React.createElement(TypingIndicator, { className: "SpaceRoom__typingIndicator", type: typing.type, animationDuration: 1100 }),
            React.createElement("span", { className: "SpaceRoom__typingText" }, typing.text))) : (React.createElement(React.Fragment, null,
            lastMessageAuthorPeer && (React.createElement(PeerAvatar, { peer: lastMessageAuthorPeer, size: 20 })),
            React.createElement("div", { className: "SpaceRoom__messageText" }, lastMessage ? (React.createElement(React.Fragment, null,
                React.createElement(MessagePreview, { message: lastMessage }),
                React.createElement(RoomLastUpdate, { sentAt: lastMessage.sentAt }))) : (lang.use('me_spaces_room_was_created', {
                sex: (lastMessageAuthorPeer?.kind === 'User' &&
                    lastMessageAuthorPeer.sex) ||
                    'unknown',
            })))))),
        React.createElement("div", { className: cx('SpaceRoom__aside', {
                'SpaceRoom__aside--muted': Convo.isMuted(convo),
            }) },
            Convo.hasUnreadExpireables(convo) && (React.createElement("div", { className: "SpaceRoom__asideIcon", role: "img", "aria-label": lang.use('me_convo_has_expired') },
                React.createElement(Icon12Bomb, null))),
            Convo.hasUnreadReactions(convo) && (React.createElement("div", { className: "SpaceRoom__asideIcon", role: "img" },
                React.createElement(Icon12Stars, null))),
            Convo.hasUnreadMentions(convo) && (React.createElement("div", { className: "SpaceRoom__asideIcon", role: "img", "aria-label": lang.use('me_convo_has_mentions') },
                React.createElement(Icon12Mention, null))),
            isUnread && (React.createElement(UnreadCounter, { count: convo.unreadCount, isMuted: Convo.isMuted(convo), size: 18 })))));
};
const CallRoom = ({ isSelected, room, to }) => {
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const peer = Peer.safeGet(peers, room.peerId);
    const spaceCalls = useSpaceCalls();
    const call = spaceCalls.get(room.callId);
    if (!call) {
        return null;
    }
    const participantPeers = call.participantsList.map((peerId) => Peer.safeGet(peers, peerId));
    const photos = participantPeers
        .map((item) => item.photo)
        .filter((photo) => photo !== undefined)
        .slice(0, 6);
    return (React.createElement(Link, { className: cx('SpaceRoom', 'SpaceRoom--call', {
            'SpaceRoom--emptyCall': call.participantsCount === 0,
            'SpaceRoom--selected': isSelected,
            'SpaceRoom--withSharing': withSharing,
        }), role: "tab", to: to, tabIndex: 0, "aria-selected": isSelected },
        React.createElement("div", { className: "SpaceRoom__icon" },
            React.createElement(Icon20VolumeOutline, null)),
        React.createElement("div", { className: "SpaceRoom__title" }, peer.title),
        participantPeers.length > 0 && (React.createElement("div", { className: "SpaceRoom__members" },
            React.createElement(UsersStack, { count: participantPeers.length, size: 18, photos: photos }))),
        withSharing && (React.createElement("div", { className: "SpaceRoom__info" },
            React.createElement(Icon16Videocam, { className: "SpaceRoom__infoIcon" }),
            React.createElement("span", { className: "SpaceRoom__infoText" }, lang.use('me_spaces_room_with_screencast')))),
        React.createElement("div", { className: "SpaceRoom__aside" },
            React.createElement("div", { className: "SpaceRoom__callParticipant" },
                React.createElement(Icon16Users, { className: "SpaceRoom__callParticipantIcon" }),
                React.createElement("span", { className: "SpaceRoom__callParticipantCounter" },
                    call.participantsCount,
                    React.createElement("span", { className: "SpaceRoom__callParticipantSeparator" }, "/"),
                    100)))));
};
const TribuneRoom = ({ isSelected, room, to }) => {
    const viewer = useViewer();
    const peers = usePeers();
    const tribunes = useTribunes();
    const { lang } = useBrowserEnv();
    const peer = Peer.safeGet(peers, room.peerId);
    const tribune = tribunes.get(room.tribuneId);
    if (!tribune) {
        return null;
    }
    const speakersPeerIds = tribune.speakersInRoom;
    const speakersPeers = speakersPeerIds.map((peerId) => Peer.safeGet(peers, peerId));
    const speakersCounter = speakersPeers.length > 2 ? speakersPeers.length - 2 : 0;
    const amISpeaker = tribune.guestSpeakers.includes(viewer.id) || tribune.ownerId === viewer.id;
    return (React.createElement(Link, { className: cx('SpaceRoom SpaceRoom--tribune', {
            'SpaceRoom--selected': isSelected,
            'SpaceRoom--withSharing': withSharing,
        }), role: "tab", to: to, tabIndex: 0, "aria-selected": isSelected },
        React.createElement("div", { className: "SpaceRoom__icon" },
            React.createElement(Icon20VoiceOutline, null)),
        React.createElement("div", { className: "SpaceRoom__title" }, peer.title),
        React.createElement("div", { className: "SpaceRoom__members" },
            amISpeaker && (React.createElement("div", { className: "SpaceRoom__youSpeaker" }, lang.use('me_spaces_room_voice_you_speaker'))),
            tribune.participantsCount > 0 ? (React.createElement(React.Fragment, null,
                React.createElement(Icon16Users, null),
                " ",
                tribune.participantsCount)) : (lang.use('me_spaces_room_voice_empty'))),
        withSharing && (React.createElement("div", { className: "SpaceRoom__info" },
            React.createElement(Icon16LogoVkVideo, { className: "SpaceRoom__infoIcon" }),
            React.createElement("span", { className: "SpaceRoom__infoText" }))),
        React.createElement("div", { className: "SpaceRoom__aside" }, speakersPeers.length > 0 && (React.createElement("div", { className: "SpaceRoom__speakerStack" },
            speakersPeers.slice(0, 2).map((peer) => (React.createElement(PeerAvatar, { className: "SpaceRoom__speakerAvatar", key: peer.id, peer: peer, size: 44 }))),
            speakersCounter > 0 && (React.createElement("div", { className: "SpaceRoom__speakerCounter" },
                "+",
                speakersCounter)))))));
};
const RoomLastUpdate = ({ sentAt }) => {
    const [formattedDate, ariaVersionFormattedDate] = useFormattedDate(sentAt);
    return formattedDate ? (React.createElement(React.Fragment, null,
        React.createElement("span", { className: "SpaceRoom__date", "aria-hidden": true }, '· ' + formattedDate),
        React.createElement(VisuallyHidden, { Component: "span" }, ariaVersionFormattedDate))) : null;
};
//# sourceMappingURL=SpaceRoom.js.map