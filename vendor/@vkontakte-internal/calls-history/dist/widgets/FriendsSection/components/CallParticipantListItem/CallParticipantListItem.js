import { jsx as _jsx } from "react/jsx-runtime";
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { Flex } from '@vkontakte-internal/vkcom-kit';
import { Icon24PhoneOutline, Icon24VideocamOutline } from '@vkontakte/icons';
import * as CallHistoryItem from '../../../../components/CallHistoryItem';
export const CallParticipantListItem = ({ friend, description, badgePreset, onFriendItemClick, onNavigateToConvo, isVkme, }) => {
    const langs = useLangs();
    const friendVkId = peerIdToVkId(friend.peerId);
    const handleClick = (e) => {
        if (isVkme && onNavigateToConvo) {
            e.preventDefault();
            e.stopPropagation();
            onNavigateToConvo(friendVkId);
        }
    };
    return (_jsx(CallHistoryItem.Item, { dataTestId: "calls_call_friends_page_item", avatar: _jsx(CallHistoryItem.Avatar, { "data-testid": "calls_call_friends_page_item_avatar", src: friend.photo, alt: friend.name, badgePreset: badgePreset }), hint: description, title: friend.name, href: friend.link, onClick: handleClick, actions: [
            _jsx(Flex.Item, { children: _jsx(CallHistoryItem.ActionButton, { "data-testid": "calls_call_friends_page_item_audiocall", label: `${langs.getLang('calls_history_dropdown_item_audio')} ${friend.name}`, onClick: () => onFriendItemClick(friendVkId, false), children: _jsx(Icon24PhoneOutline, {}) }, "audiocall") }, "audiocall"),
            _jsx(Flex.Item, { children: _jsx(CallHistoryItem.ActionButton, { "data-testid": "calls_call_friends_page_item_videocall", label: `${langs.getLang('calls_history_dropdown_item_video')} ${friend.name}`, onClick: () => onFriendItemClick(friendVkId, true), children: _jsx(Icon24VideocamOutline, {}) }, "videocall") }, "videocall"),
        ] }));
};
//# sourceMappingURL=CallParticipantListItem.js.map