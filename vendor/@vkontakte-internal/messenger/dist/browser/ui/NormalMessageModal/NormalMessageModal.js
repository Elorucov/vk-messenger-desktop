import React, { useCallback } from 'react';
import { useBrowserEnv, usePeer } from '../../hooks/misc';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { getMediaAttachLinkPayload } from '../../ui/ConvoHistoryMessageBlock/ConvoHistoryMessageBlock';
import { ConvoMessage } from '../../ui/ConvoMessage/ConvoMessage';
import { ConvoStack } from '../../ui/ConvoStack/ConvoStack';
import './NormalMessageModal.css';
export const NormalMessageModal = ({ message, onClose, openClipCoOwnersModal, }) => {
    const { lang, videoMessagePlayer } = useBrowserEnv();
    const getMediaAttachLinkPayloadWrapper = useCallback((params) => message.kind === 'Normal'
        ? getMediaAttachLinkPayload(message.cmid, message.peerId, params)
        : undefined, [message]);
    const onModalClose = useCallback(() => {
        onClose();
        videoMessagePlayer.stop();
    }, [onClose, videoMessagePlayer]);
    const author = usePeer(message.authorId);
    return (React.createElement(ModalInterface, { onClose: onModalClose, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_view_message'), panelClass: "NormalMessageModal", withCustomLayout: true },
        React.createElement("div", { className: "NormalMessageModal__body" },
            React.createElement(ConvoStack, { key: `${message.peerId}_${message.cmid}`, peerId: author.id, isOut: false, isCentered: false, isOneToOneConvo: false, selected: [], className: "NormalMessageModal__flowStack" },
                React.createElement(ConvoMessage, { isHead: true, isSelected: false, peerId: message.peerId, author: author, message: message, isUnread: false, unreadReactionId: undefined, onScrollToMessage: () => { }, onKeyboardSend: () => { }, isInsideCasper: false, getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, isUsedInModal: true, openClipCoOwnersModal: openClipCoOwnersModal })))));
};
//# sourceMappingURL=NormalMessageModal.js.map