import '../../ui/ForeignMessageModal/ForeignMessageModal.css';
import React, { useCallback } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { ForwardedMessage } from '../../ui/ForwardedMessage/ForwardedMessage';
import { ConvoMessageLightBubble } from '../../ui/ConvoMessageLightBubble/ConvoMessageLightBubble';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { getMediaAttachLinkPayload } from '../../ui/ConvoHistoryMessageBlock/ConvoHistoryMessageBlock';
import '../../ui/ForeignMessageModal/ForeignMessageModal.css';
export const ForeignMessageModal = ({ message, rootMessage, onClose, isHidden = false, }) => {
    const { lang, videoMessagePlayer } = useBrowserEnv();
    const getMediaAttachLinkPayloadWrapper = useCallback((params) => 'rootCmid' in message
        ? getMediaAttachLinkPayload(message.rootCmid, message.rootPeerId, params)
        : undefined, [message]);
    const onModalClose = useCallback(() => {
        onClose();
        videoMessagePlayer.stop();
    }, [onClose, videoMessagePlayer]);
    return (React.createElement(ModalInterface, { onClose: onModalClose, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_view_message'), panelClass: "ForeignMessageModal", withCustomLayout: true, isHidden: isHidden, isDarkBody: true, stickersPopupRootContainerId: "popup-sticker-foreign-message-container" },
        React.createElement("div", { className: "ForeignMessageModal__body" },
            React.createElement(ConvoMessageLightBubble, { isOut: false, isWithoutBubblesTheme: false, className: "ForeignMessageModal__bubble" },
                React.createElement(ForwardedMessage, { message: message, rootMessage: rootMessage, usedInModal: "as-message", getMediaAttachLinkPayload: getMediaAttachLinkPayloadWrapper, onCloseMessageInModal: onClose })))));
};
//# sourceMappingURL=ForeignMessageModal.js.map