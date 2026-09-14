import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flex, RichAvatar, Spacing, getColorClass, EllipsisText, Overlay, Tappable, } from '@vkontakte-internal/vkcom-kit';
import { Icon28PhoneOutline } from '@vkontakte/icons';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { classNames } from '@vkontakte/vkjs';
import styles from './FriendsList.module.css';
export const FriendsList = ({ friends, onFriendItemClick }) => {
    const langs = useLangs();
    return (_jsxs(Flex, { gap: 0, children: [_jsx(Spacing, { size: 6, mode: "vertical" }), _jsx(Flex, { noWrap: true, gap: 12, children: friends.map((friend) => (_jsx(Flex.Item, { "data-testid": "calls_main_page_call_friends_item", children: _jsx(Tappable, { Component: "button", "aria-label": langs.getLang('calls_call_user').replace('{user}', friend.name), onClick: (event) => onFriendItemClick(event, peerIdToVkId(friend.peerId)), className: styles.button, hasHover: false, hasActive: false, children: _jsxs(Flex, { className: styles.content, direction: "column", align: "center", children: [_jsx(Flex.Item, { children: _jsxs(Flex, { align: "center", className: styles.photoWrapper, children: [_jsx(RichAvatar, { className: styles.photo, src: friend.photo, alt: friend.name, size: 48 }), _jsx(Overlay, { className: classNames(styles.hoverIcon, getColorClass('color_text_contrast')), centered: true, children: _jsx(Icon28PhoneOutline, {}) })] }) }), _jsx(Spacing, { mode: "horizontal" }), _jsx(Flex.Item, { className: classNames(styles.name, getColorClass('color_text_primary')), children: _jsx(EllipsisText, { children: friend.firstName }) })] }) }) }, friend.id))) })] }));
};
//# sourceMappingURL=FriendsList.js.map