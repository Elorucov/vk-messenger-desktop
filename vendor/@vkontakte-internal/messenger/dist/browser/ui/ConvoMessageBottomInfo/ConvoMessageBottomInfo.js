import '../../ui/ConvoMessageBottomInfo/ConvoMessageBottomInfo.css';
import React from 'react';
import * as Message from '../../../core/model/Message';
import { useBrowserEnv, useCommunityMessagingWithToggle, useMessageAuthor, } from '../../hooks/misc';
import { Icon12Favorite, Icon12View } from '@vkontakte/icons';
import cx from 'classnames';
import { getMessageOutStatusIconType, MessageOutStatusIcon, } from '../../ui/MessageOutStatusIcon/MessageOutStatusIcon';
import { FormattedDate } from '../../ui/Time/Time';
import { ConvoMessageEditedTimeTooltip } from '../../ui/ConvoMessageEditedTimeTooltip/ConvoMessageEditedTimeTooltip';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { MessageOutStatusIconHint } from '../../ui/MessageOutStatusIcon/MessageOutStatusIconHint';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
import { ConvoMessageInfoTooltip } from '../../ui/ConvoMessageInfoTooltip/ConvoMessageInfoTooltip';
export const ConvoMessageBottomInfo = ({ message, isUnread, className, dateClassName, showDate, onClick, }) => {
    const { lang } = useBrowserEnv();
    const isEdited = message.kind !== 'Foreign' && Message.isMessageEdited(message);
    const { adminAuthor } = useMessageAuthor(message);
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const editedLabel = isEdited && (React.createElement(React.Fragment, null,
        React.createElement(ConvoMessageEditedTimeTooltip, { message: message },
            React.createElement("span", null, lang.use('me_message_edited_label_short'))),
        showDate ? ' · ' : ''));
    const isImportant = message.kind === 'Normal' && message.isImportant;
    const views = message.attaches.wall?.views || message.attaches.channelMessage?.views;
    const outStatusIconType = message.kind !== 'Foreign' &&
        isUnread !== undefined &&
        getMessageOutStatusIconType(message, isUnread);
    if (!showDate && !isEdited && !outStatusIconType && !isImportant) {
        return null;
    }
    const isPostponed = message.kind === 'Normal' && message.isPostponed;
    const isMessageOutStatusIconTooltipDisabled = isPostponed && outStatusIconType !== 'failed';
    const isNormalMessage = message.kind === 'Normal';
    return (React.createElement("span", { onClick: onClick, "aria-disabled": true, className: cx('ConvoMessageBottomInfo', className, {
            'ConvoMessageBottomInfo--clickable': onClick,
            'ConvoMessageBottomInfo--withViews': message.attaches.wall || views,
        }) },
        Boolean(views) && (React.createElement("span", { className: cx('ConvoMessageBottomInfo__views', {
                'ConvoMessageBottomInfo__views--out': 
                /**
                 * Акцентный цвет только если рядом с галочками
                 */
                !!outStatusIconType,
            }) },
            React.createElement(Icon12View, { className: "ConvoMessageBottomInfo__viewsIcon" }),
            lang.formatNumber(views || 0, 'short'))),
        React.createElement("span", { className: cx('ConvoMessageBottomInfo__date', {
                'ConvoMessageBottomInfo__date--out': 
                /**
                 * Акцентный цвет только если рядом с галочками
                 */
                !!outStatusIconType,
            }, dateClassName) },
            editedLabel,
            showDate && (React.createElement(FormattedDate, { timestamp: message.sentAt, variant: "time" })),
            isCommunityMessaging && showDate && adminAuthor && (React.createElement(ConvoMessageInfoTooltip, { adminAuthor: adminAuthor }))),
        isImportant && (React.createElement("i", { className: "ConvoMessageBottomInfo__importantIcon", role: "img", "aria-label": lang.use('me_important_message_icon_alt') },
            React.createElement(Icon12Favorite, null))),
        isNormalMessage && message.isOut && (React.createElement(VisuallyHidden, null,
            React.createElement("span", { "aria-label": isUnread
                    ? lang.use('me_a18y_out_message_unread')
                    : lang.use('me_a18y_out_message_read') }))),
        outStatusIconType && (React.createElement(Tooltip, { delay: 500, tooltipOffset: { x: 12, y: 2 }, position: "top", content: React.createElement(MessageOutStatusIconHint, { message: message }), disabled: isMessageOutStatusIconTooltipDisabled, vkuiStyle: true, watchContentChange: true },
            React.createElement("span", null,
                React.createElement(MessageOutStatusIcon, { type: outStatusIconType, className: "ConvoMessageBottomInfo__outStatusIcon", sendingIconColor: "inherit", readIconColor: "inherit" }))))));
};
//# sourceMappingURL=ConvoMessageBottomInfo.js.map