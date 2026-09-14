import '../../ui/RepliedMessage/RepliedMessage.css';
import cx from 'classnames';
import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import { useFeatureFlags, usePeers } from '../../hooks/misc';
import { onElementKeyDownFactory } from '../../utils/elementKeyDown';
export const RepliedMessage = ({ className, message, rootMessage, onScrollToMessage, onOpenMessageInModal, highlightFuzzySearch, highlightColor, highlightColorOpacity, forceUseModal, isWithoutBubble, }) => {
    const peers = usePeers();
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const author = Peer.safeGet(peers, message.authorId);
    const isClickable = message.kind !== 'ForeignExpired' && (message.peerId || message.rootPeerId);
    const handleGoToMessage = () => {
        if (!isClickable) {
            return;
        }
        if (message.isUnavailable || forceUseModal) {
            onOpenMessageInModal?.({ message, rootMessage });
            return;
        }
        onScrollToMessage?.({
            cmid: message.cmid,
            peerId: message.rootPeerId,
            rootCmid: 'rootCmid' in message ? message.rootCmid : undefined,
        });
    };
    return (React.createElement("div", { className: cx('Reply', className, {
            'Reply--clickable': isClickable,
            'Reply--withoutBubble': isWithoutBubble,
            'Reply--isOut': rootMessage.isOut,
        }), role: "button", tabIndex: isClickable ? 0 : -1, onClick: (e) => {
            handleGoToMessage();
            e.stopPropagation();
        }, onKeyDown: onElementKeyDownFactory((keyCombo) => {
            if (keyCombo === 'Enter') {
                handleGoToMessage();
                return;
            }
        }) },
        React.createElement("div", { className: cx('Reply__main', vkm_new_bubbles_width_calc && 'Reply__mainRefactored') },
            React.createElement("div", { className: "Reply__author" }, Peer.name(author)),
            React.createElement("div", { className: "Reply__content" },
                React.createElement(MessagePreview, { message: message, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, withFormatting: true })))));
};
//# sourceMappingURL=RepliedMessage.js.map