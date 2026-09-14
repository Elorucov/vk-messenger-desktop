import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import cx from 'classnames';
import { useBrowserEnv, useFeatureFlags, usePeers } from '../../hooks/misc';
import { Avatar } from '../../ui/Avatar/Avatar';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import './NestedForwardedMessageButton.css';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
export const NestedForwardedMessageButton = ({ message, onMoreClick, }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const { vkm_new_bubbles_width_calc } = useFeatureFlags();
    const restPhotos = useMemo(() => {
        return Array.from(new Set(message.forwardedMessages
            ?.slice(1)
            .reduce((acc, message) => {
            const messageAuthor = Peer.safeGet(peers, message.authorId);
            if (messageAuthor.photo) {
                acc.push(messageAuthor.photo);
            }
            return acc;
        }, [])));
    }, [message.forwardedMessages, peers]);
    if (!message.forwardedMessages) {
        return null;
    }
    const restMessagesCount = message.forwardedMessages.length - 1;
    const firstMessage = message.forwardedMessages[0];
    const author = Peer.safeGet(peers, firstMessage.authorId);
    // Для Enter обрабатываем нажатие кнопки
    const handleKeyDown = (event) => {
        event.preventDefault();
        if ((event.code || event.keyCode) === 13) {
            onMoreClick?.(message);
        }
    };
    // Для Пробела обрабатываем отпускание кнопки
    const handleKeyUp = (event) => {
        event.preventDefault();
        if ((event.code || event.keyCode) === 32) {
            onMoreClick?.(message);
        }
    };
    const handleClick = (event) => {
        event.stopPropagation();
        onMoreClick?.(message);
    };
    return (React.createElement("div", { className: "NestedForwardedMessageButton", tabIndex: 0, role: "button", "aria-label": lang.use('me_forwarded_messages_btn_more', {
            num: restMessagesCount,
            values: { count: restMessagesCount.toString() },
        }), onClick: handleClick, onKeyDown: handleKeyDown, onKeyUp: handleKeyUp },
        React.createElement("div", { className: "NestedForwardedMessageButton__wrapper" },
            React.createElement("div", { className: "NestedForwardedMessageButton__innerWrapper" },
                React.createElement("div", { className: "NestedForwardedMessageButton__avatar", "aria-hidden": true },
                    React.createElement(Avatar, { size: 16, peer: author })),
                React.createElement("div", { className: cx(vkm_new_bubbles_width_calc
                        ? 'NestedForwardedMessageButton__main--refactored'
                        : 'NestedForwardedMessageButton__main') },
                    React.createElement("header", { className: "NestedForwardedMessageButton__header" }, Peer.name(author)),
                    React.createElement("div", { className: "NestedForwardedMessageButton__content" },
                        React.createElement(MessagePreview, { message: firstMessage, withFormatting: true })))),
            restMessagesCount > 0 && (React.createElement("span", { className: "NestedForwardedMessageButton__more" },
                React.createElement(UsersStack, { size: 16, photos: restPhotos, count: restPhotos.length }),
                lang.use('me_forwarded_messages_btn_more', {
                    num: restMessagesCount,
                    values: { count: restMessagesCount.toString() },
                }))))));
};
//# sourceMappingURL=NestedForwardedMessageButton.js.map