import '../../ui/MessageActionsContent/MessageActionsContent.css';
import React from 'react';
import { NormalMessageActionsMenu, } from '../../ui/MessageActionsMenu/NormalMessageActionsMenu';
import { FailedMessageActionsMenu } from '../../ui/MessageActionsMenu/FailedMessageActionsMenu';
import { PostponedMessageActionsMenu } from '../../ui/MessageActionsMenu/PostponedMessageActionsMenu';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import cx from 'classnames';
import { MessageReactionPickerExtended } from '../../ui/MessageReactionPickerExtended/MessageReactionPickerExtended';
import { FailedEditedMessageActionsMenu } from '../../ui/MessageActionsMenu/FailedEditedMessageActionsMenu';
import { MessageReactionPickerExpandableContainer } from '../../ui/MessageReactionPickerExpandableContainer/MessageReactionPickerExpandableContainer';
export const MessageActionsContent = ({ peerId, message, onSelect, reactions, onMessageForward, normalMessageActions, isOpened, viewersCount, viewers, openReactedPeersModal, openDeleteMessageModal, openMessageViewersModal, openConfirmPinMessageModal, openPostponedCalendarModal, onReactionPickerExtend, onReactionClick, onOpenReport, onMessageReply, onReactionPickerHeightChange, classNames, isReactionsPickerExtended, isReactionsAvailable, isCompact, }) => {
    const { isMobileLayout } = useLayoutData();
    const isMessageNormal = message.kind === 'Normal' && !message.isPostponed;
    const isMessageQueued = message.kind === 'Queued';
    const isMessagePostponed = message.kind === 'Normal' && message.isPostponed;
    const className = cx('MessageActionsContent__menu', isMobileLayout
        ? 'MessageActionsContent__menu--bottom'
        : 'MessageActionsContent__menu--side');
    let actionsMenuType;
    if (isMessageQueued && message.hasFailed) {
        actionsMenuType = 'failedActions';
    }
    else if ((isMessageNormal || isMessagePostponed) &&
        message.editing?.status === 'failed') {
        actionsMenuType = 'failedEditedActions';
    }
    else if (isMessageNormal) {
        actionsMenuType = 'normalActions';
    }
    else if (isMessagePostponed) {
        actionsMenuType = 'postponedActions';
    }
    return (React.createElement(React.Fragment, null,
        actionsMenuType === 'normalActions' && isMessageNormal && (React.createElement("div", { className: cx('MessageActionsContent__wrapper', {
                'MessageActionsContent--mobile': isMobileLayout,
                'MessageActionsContent__wrapper--with-reactions': isReactionsAvailable,
            }, classNames) },
            isReactionsAvailable && (React.createElement(MessageReactionPickerExpandableContainer, { isVisible: isOpened, isCentered: isMobileLayout, onReactionPickerHeightChange: onReactionPickerHeightChange, content: ({ width, onHeightChange }) => (React.createElement(MessageReactionPickerExtended, { isVisible: isOpened, isExtended: isReactionsPickerExtended, reactions: reactions, onClick: (reactionId) => onReactionClick(reactionId, 'nearby_click'), active: message.reactionId, width: width, onHeightChange: onHeightChange, onExtendClick: onReactionPickerExtend })) })),
            React.createElement("div", { className: "MessageActionsContent__content" },
                React.createElement(NormalMessageActionsMenu, { peerId: peerId, normalMessageActions: normalMessageActions, message: message, viewersCount: viewersCount, viewers: viewers, openDeleteMessageModal: openDeleteMessageModal, openMessageViewersModal: openMessageViewersModal, openConfirmPinMessageModal: openConfirmPinMessageModal, openReactedPeersModal: openReactedPeersModal, onSelect: onSelect, onMessageForward: onMessageForward, className: className, isCompact: isCompact, onMessageReply: onMessageReply, onOpenReport: onOpenReport })))),
        actionsMenuType === 'postponedActions' && isMessagePostponed && (React.createElement("div", { className: cx('MessageActionsContent__wrapper', classNames) },
            React.createElement("div", { className: "MessageActionsContent__content" },
                React.createElement(PostponedMessageActionsMenu, { peerId: peerId, message: message, onSelect: onSelect, openCalendarModal: openPostponedCalendarModal, openDeleteMessageModal: openDeleteMessageModal })))),
        actionsMenuType === 'failedActions' && isMessageQueued && (React.createElement(FailedMessageActionsMenu, { message: message, peerId: peerId, className: className, openFailedPostponedMessageCalendarModal: openPostponedCalendarModal })),
        actionsMenuType === 'failedEditedActions' &&
            (isMessageNormal || isMessagePostponed) && (React.createElement(FailedEditedMessageActionsMenu, { message: message, className: className }))));
};
//# sourceMappingURL=MessageActionsContent.js.map