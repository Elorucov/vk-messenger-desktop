import React, { useCallback, useMemo } from 'react';
import { Icon16RepostOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ForwardedMessageNew } from '../../ui/ForwardedMessageNew/ForwardedMessageNew';
import { Button } from '@vkontakte/vkui';
import { classNames as cx } from '@vkontakte/vkjs';
import './ForwardedMessagesList.css';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
export const MAX_FORWARDED_IN_LIST = 5;
export const ForwardedMessagesList = ({ message, rootMessage, isCompact = false, onScrollToMessage, onOpenMessageInModal, onCloseMessageInModal, openClipCoOwnersModal, highlightFuzzySearch, highlightColor, highlightColorOpacity, handleChangeAttachWidth, getMediaAttachLinkPayload, isThemed, isContrastTheme, isUsedInModal, }) => {
    const { lang } = useBrowserEnv();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const forwardedCount = message.forwardedMessages?.length || 0;
    const croppedForwarded = useMemo(() => (message.forwardedMessages ?? []).slice(0, MAX_FORWARDED_IN_LIST), [message.forwardedMessages]);
    const showMoreButton = forwardedCount > MAX_FORWARDED_IN_LIST;
    const handleMoreClick = useCallback((event) => {
        event.stopPropagation();
        onOpenMessageInModal?.({ message, rootMessage });
    }, [message, onOpenMessageInModal, rootMessage]);
    return (React.createElement("div", { className: cx('ForwardedMessagesList', {
            'ForwardedMessagesList--themed': isThemed && rootMessage.isOut,
            'ForwardedMessagesList--withoutBubbles': isWithoutBubblesTheme,
        }) },
        React.createElement("div", { className: "ForwardedMessagesList__info" },
            React.createElement(Icon16RepostOutline, null),
            lang.use('me_forwarded_messages_total', {
                num: forwardedCount,
                values: { count: forwardedCount.toString() },
            })),
        React.createElement("div", { className: "ForwardedMessagesList__content" }, croppedForwarded.map((message, i) => (React.createElement(ForwardedMessageNew, { key: i, message: message, rootMessage: rootMessage, isCompact: isCompact, onScrollToMessage: onScrollToMessage, highlightFuzzySearch: highlightFuzzySearch, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, getMediaAttachLinkPayload: getMediaAttachLinkPayload, handleChangeAttachWidth: handleChangeAttachWidth, onCloseMessageInModal: onCloseMessageInModal, onOpenMessageInModal: onOpenMessageInModal, openClipCoOwnersModal: openClipCoOwnersModal, isThemed: isThemed, isContrastTheme: isContrastTheme, isUsedInModal: isUsedInModal })))),
        showMoreButton && (React.createElement("div", { className: "ForwardedMessagesList__action" },
            React.createElement(Button, { size: "m", mode: "outline", appearance: "accent-invariable", stretched: true, onClick: handleMoreClick }, lang.use('me_forwarded_messages_btn_all', {
                num: forwardedCount,
                values: { count: forwardedCount.toString() },
            }))))));
};
//# sourceMappingURL=ForwardedMessagesList.js.map