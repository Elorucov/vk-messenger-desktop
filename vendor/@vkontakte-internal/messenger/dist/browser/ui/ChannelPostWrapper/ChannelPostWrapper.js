import '../../ui/ChannelPostWrapper/ChannelPostWrapper.css';
import React, { forwardRef, useState } from 'react';
import cx from 'classnames';
import { ChannelPostActionsDropdown } from '../../ui/ChannelPostActionsDropdown/ChannelPostActionsDropdown';
import { useFeatureFlags } from '../../hooks/misc';
export const ChannelPostWrapper = forwardRef(({ className, wrapperClassName, children, post, channelId, isChannelArchived, isCommunityChannel, postReactions, onReactionClick, isRepostsDisabled, onForward, canDelete, canEdit, postHasDonutPlaceholder, canPostComments, canChangeCommentsPosting, width, onSend, onEditSendTime, }, ref) => {
    const [containerElement, setContainerElement] = useState(null);
    const updateRef = (node) => {
        setContainerElement(node);
        if (!ref) {
            return;
        }
        if (typeof ref === 'function') {
            ref(node);
        }
        else {
            ref.current = node;
        }
    };
    const featureFlags = useFeatureFlags();
    /**
     * После редизайна донатных постов у них тоже появились "действия"
     */
    const isActionsAvailable = featureFlags.vkm_channel_donut_redesign
        ? containerElement
        : containerElement && !postHasDonutPlaceholder;
    return (React.createElement("div", { ref: updateRef, className: cx(className, 'ChannelPostWrapper'), style: { width } },
        children,
        isActionsAvailable && (React.createElement(ChannelPostActionsDropdown, { isRepostsDisabled: isRepostsDisabled, isCommunityChannel: isCommunityChannel, onForward: onForward, postReactions: postReactions, isPostponed: post.kind === 'Postponed', onReactionClick: onReactionClick, containerElement: containerElement, classNames: {
                wrapper: cx('ChannelPostWrapper__actions', wrapperClassName),
            }, onSend: onSend, onEditSendTime: onEditSendTime, post: post, channelId: channelId, postCmid: post.cmid, canDelete: canDelete, canEdit: canEdit, isChannelArchived: isChannelArchived, canPostComments: canPostComments, canChangeCommentsPosting: canChangeCommentsPosting }))));
});
//# sourceMappingURL=ChannelPostWrapper.js.map