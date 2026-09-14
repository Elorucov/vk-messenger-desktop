import '../../ui/ConvoPinnedMessage/ConvoPinnedMessage.css';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { Link } from '../../ui/Link/Link';
import React, { useState, useEffect, useCallback, } from 'react';
import { MessageText } from '../../ui/MessageText/MessageText';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import { Icon16Pin } from '@vkontakte/icons';
import { exhaustivenessCheck, isSameYear } from '../../../core/utils/misc';
import { BannerClose, BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import { Time } from '../../ui/Time/Time';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useNow } from '../../hooks/useNow';
const ACTIONS_DISPLAY_TIMEOUT = 3000;
// Используем memo для оптимизации, так как закрепление/открепление сообщения происходит достаточно редко
export const ConvoPinnedMessage = React.memo(({ pinnedMessage, isHiddenLocally, isCompact, onUnpinForAll, onHideLocally, onClick, }) => {
    const { lang } = useBrowserEnv();
    /**
     * message - контент закрепленного сообщения
     * actions - кнопка открепелния сообщения для всех
     */
    const [displayState, setDisplayState] = useState('message');
    /**
     * Если запин обновился, то всегда показываем его
     */
    useEffect(() => {
        setDisplayState('message');
    }, [pinnedMessage]);
    const toggleShowState = (event) => {
        event.stopPropagation();
        switch (displayState) {
            case 'message':
                onHideLocally(pinnedMessage.peerId);
                setDisplayState('actions');
                return;
            case 'actions':
                setDisplayState('message');
                return;
            default:
                return exhaustivenessCheck(displayState);
        }
    };
    const goToPinnedMessage = useCallback(() => {
        onClick(pinnedMessage);
    }, [onClick, pinnedMessage]);
    return (
    /**
     * Скрываем закреп только если его нет или он скрыт локально
     */
    React.createElement(BannerPanel, { isVisible: !((displayState === 'message' && isHiddenLocally) || !pinnedMessage), isCompact: isCompact, mode: "custom", isLarge: true },
        React.createElement("div", { className: "ConvoPinnedMessage", onClick: goToPinnedMessage }, pinnedMessage && (React.createElement(React.Fragment, null,
            React.createElement(ConvoPinnedMessageContent, { pinnedMessage: pinnedMessage, isHiddenLocally: isHiddenLocally, displayState: displayState, setDisplayState: setDisplayState, hideLocally: onHideLocally, unpinForAll: onUnpinForAll, goToPinnedMessage: goToPinnedMessage }),
            React.createElement(BannerClose, { onCloseClick: toggleShowState, tooltipText: lang.use('me_convo_hide_pinned_message') }))))));
});
const ConvoPinnedMessageContent = React.memo(({ pinnedMessage, displayState, isHiddenLocally, setDisplayState, unpinForAll, goToPinnedMessage, }) => {
    const { isMobileLayout } = useLayoutData();
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const now = useNow();
    const peer = Peer.safeGet(peers, pinnedMessage.authorId);
    /**
     * Автоматически закрываем окошко действий через 3 секунды после локального скрытия
     */
    useEffect(() => {
        if (displayState === 'actions') {
            const hideActionsTimeout = setTimeout(() => {
                setDisplayState('message');
            }, ACTIONS_DISPLAY_TIMEOUT);
            return () => {
                clearTimeout(hideActionsTimeout);
            };
        }
        return;
    }, [displayState, setDisplayState]);
    if (displayState === 'message' && !isHiddenLocally) {
        const formattedDate = lang.use(isSameYear(now, pinnedMessage.sentAt)
            ? 'global_short_date'
            : 'global_date', {
            now,
            date: pinnedMessage.sentAt,
        });
        return (React.createElement(React.Fragment, null,
            React.createElement("button", { "aria-label": lang.use('me_go_to_pinned_message_aria_label'), onClick: (e) => {
                    e.stopPropagation();
                    goToPinnedMessage();
                }, className: "ConvoPinnedMessage__pinButton" },
                React.createElement(Icon16Pin, { className: "ConvoPinnedMessage__icon" })),
            React.createElement("div", { className: "ConvoPinnedMessage__content" },
                React.createElement("h3", { className: "ConvoPinnedMessage__info" },
                    React.createElement(Link, { to: {
                            kind: 'PeerPanel',
                            peerId: peer.id,
                            screenName: Peer.screenName(peer),
                        }, className: "ConvoPinnedMessage__authorLink" }, Peer.name(peer)),
                    React.createElement(Time, { ariaVersionFormattedDate: formattedDate, formattedDate: formattedDate, className: "ConvoPinnedMessage__date" })),
                React.createElement("span", { className: "ConvoPinnedMessage__text" }, pinnedMessage.chunks.length ? (React.createElement(MessageText, { isPlainText: isMobileLayout, multiline: false, chunks: pinnedMessage.chunks, peerId: pinnedMessage.peerId, formatData: pinnedMessage.formatData })) : (React.createElement(MessagePreview, { message: pinnedMessage, withFormatting: true }))))));
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ConvoPinnedMessage__content" },
            React.createElement("span", { className: "ConvoPinnedMessage__text ConvoPinnedMessage__text--hidden" }, lang.use('me_convo_hidden_pinned_message'))),
        unpinForAll && (React.createElement("button", { className: "ConvoPinnedMessage__unpinButton", onClickCapture: () => unpinForAll(pinnedMessage.peerId) }, lang.use('me_convo_unpin_pinned_message_for_all')))));
});
//# sourceMappingURL=ConvoPinnedMessage.js.map