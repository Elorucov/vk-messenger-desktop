import '../../ui/ConvoMessageInfoWithoutBubblesTheme/ConvoMessageInfoWithoutBubblesTheme.css';
import React from 'react';
import { useBrowserEnv, useCommunityMessagingWithToggle, useMessageAuthor, } from '../../hooks/misc';
import { Icon12Favorite, Icon12Bomb, Icon12View } from '@vkontakte/icons';
import { formatDuration } from '../../../core/utils/misc';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { getMessageOutStatusIconType, MessageOutStatusIcon, } from '../../ui/MessageOutStatusIcon/MessageOutStatusIcon';
import cx from 'classnames';
import { useNow } from '../../hooks/useNow';
import { MessageOutStatusIconHint } from '../../ui/MessageOutStatusIcon/MessageOutStatusIconHint';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
import { ConvoMessageInfoTooltip } from '../../ui/ConvoMessageInfoTooltip/ConvoMessageInfoTooltip';
export const ConvoMessageInfoWithoutBubblesTheme = ({ message, isUnread, expiresAt, expiresButtonShowDuration, onClick, className, showDate = true, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const { adminAuthor } = useMessageAuthor(message);
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const date = lang.formatDate(message.sentAt, { now, variant: 'time' });
    const views = message.attaches.wall?.views || message.attaches.channelMessage?.views;
    const isNormal = message.kind === 'Normal';
    const isImportant = isNormal && message.isImportant;
    const msgStatusIconType = message.kind !== 'Foreign' && getMessageOutStatusIconType(message, isUnread);
    const isPostponed = message.kind === 'Normal' && message.isPostponed;
    const isMessageStatusIconTooltipDisabled = isPostponed && msgStatusIconType !== 'failed';
    return (React.createElement("div", { className: cx('ConvoMessageInfoWithoutBubbles', className) },
        isImportant && (React.createElement("i", { className: "ConvoMessageInfoWithoutBubbles__importantIcon", role: "img", "aria-label": lang.use('me_important_message_icon_alt') },
            React.createElement(Icon12Favorite, null))),
        React.createElement(Bomb, { expiresAt: expiresAt, expiresButtonShowDuration: expiresButtonShowDuration }),
        Boolean(views) && !(isImportant && msgStatusIconType) && (React.createElement("span", { className: "ConvoMessageInfoWithoutBubbles__views" },
            React.createElement(Icon12View, { className: "ConvoMessageInfoWithoutBubbles__views--icon" }),
            formatNumber(views || 0))),
        msgStatusIconType && (React.createElement(Tooltip, { delay: 500, tooltipOffset: { x: 11 }, position: "top", content: React.createElement(MessageOutStatusIconHint, { message: message }), disabled: isMessageStatusIconTooltipDisabled, vkuiStyle: true, watchContentChange: true },
            React.createElement("span", { className: "ConvoMessageInfoWithoutBubbles__statusIcon" },
                React.createElement(MessageOutStatusIcon, { type: msgStatusIconType, sendingIconColor: "var(--vkui--color_icon_accent)", readIconColor: "var(--vkui--color_icon_accent)" })))),
        showDate && (React.createElement("span", { onClick: (event) => {
                event.stopPropagation();
                onClick?.();
            }, "aria-disabled": true, className: "ConvoMessageInfoWithoutBubbles__date" },
            date,
            isCommunityMessaging && adminAuthor && (React.createElement(ConvoMessageInfoTooltip, { adminAuthor: adminAuthor })))),
        isNormal && message.isOut && (React.createElement(VisuallyHidden, null,
            React.createElement("span", { "aria-label": isUnread
                    ? lang.use('me_a18y_out_message_unread')
                    : lang.use('me_a18y_out_message_read') })))));
};
/**
 * Вынесено в отдельный компонент ради оптимизации подписки на текущее время.
 */
const Bomb = ({ expiresAt, expiresButtonShowDuration }) => {
    const nowInSeconds = useNow(1000);
    let expiredTime;
    if (expiresAt) {
        const delta = Math.max(expiresAt - nowInSeconds, 0);
        if (expiresButtonShowDuration === undefined ||
            delta < expiresButtonShowDuration) {
            expiredTime = formatDuration(Math.floor(delta / 1000));
        }
    }
    return (expiredTime && (React.createElement(Tooltip, { content: expiredTime, watchContentChange: true },
        React.createElement("i", { className: "ConvoMessageInfoWithoutBubbles__bombIcon", role: "img" },
            React.createElement(Icon12Bomb, null)))));
};
/**
 * отдельно, а не из lang, потому что у нас не помещаются с запятой значения.
 */
function formatNumber(n) {
    let short;
    let suffix;
    switch (true) {
        case n > 1e9:
            short = n / 1e9;
            suffix = 'B';
            break;
        case n > 1e6:
            short = n / 1e6;
            suffix = 'M';
            break;
        case n > 1e3:
            short = n / 1e3;
            suffix = 'K';
            break;
        default:
            short = n;
            suffix = '';
    }
    return short.toFixed(0) + suffix;
}
//# sourceMappingURL=ConvoMessageInfoWithoutBubblesTheme.js.map