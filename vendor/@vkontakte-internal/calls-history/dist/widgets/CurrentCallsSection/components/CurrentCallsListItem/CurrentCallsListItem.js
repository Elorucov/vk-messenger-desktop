import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { CallStatSource, EMPTY_USER_ID, isParticipantGroup, useNavigationContext, useVkmeContext, } from '@vkontakte-internal/calls-core';
import { useLangs } from '@vkontakte-internal/plugins';
import { Button, Flex } from '@vkontakte-internal/vkcom-kit';
import { useMemo } from 'react';
import * as CallHistoryItem from '../../../../components/CallHistoryItem';
import { CallUsersStack, getMemberForUserStack, } from '../../../../components/CallUsersStack';
import { useHistoryConfig } from '../../../../services/HistoryConfig';
export function CurrentCallsListItem({ call, onJoin, profiles }) {
    const { sferum } = useHistoryConfig();
    const langs = useLangs();
    const { navigateToConvo } = useNavigationContext();
    const { member, chat } = getCurrentCallOwner(call, profiles);
    const { isVkme } = useVkmeContext();
    const { id, title, photo, href, description, avatarItems, join_link, vk_join_link } = useMemo(() => {
        let { id = EMPTY_USER_ID, title = '', photo = undefined, href = '', } = chat ? getChatItemData(chat) : member ? getMemberItemData(member) : {};
        const { users_count, participant_ids, join_link = '', caller_id, name, vk_join_link = '' } = call;
        if (caller_id && isParticipantGroup(caller_id)) {
            title = name || title;
        }
        const description = langs
            .numeric(users_count, langs.getLang('calls_history_members_count', true))
            .replace('%n', String(users_count));
        const peerIds = participant_ids.slice(0, 3);
        const avatarItems = [];
        for (let peerId of peerIds) {
            if (peerId in profiles) {
                avatarItems.push(getMemberForUserStack(profiles[peerId]));
            }
        }
        return {
            id,
            title,
            photo,
            href,
            description,
            join_link,
            avatarItems,
            vk_join_link,
        };
    }, [chat, call, member, profiles]);
    const currentJoinLink = useMemo(() => {
        if (!join_link)
            return join_link;
        if (sferum) {
            return vk_join_link || `https://sferum.ru/?call_link=${join_link}`;
        }
        return vk_join_link || `${window.location.origin}/call/join/${join_link}`;
    }, [vk_join_link, join_link]);
    if (!member && !chat) {
        return _jsx(_Fragment, {});
    }
    const isNFT = !!member?.is_nft;
    return (_jsx(CallHistoryItem.Item, { avatar: _jsx(CallHistoryItem.Avatar, { nft: isNFT, src: photo, alt: title }), hint: description, title: title, onClick: (e) => {
            if (isVkme && href) {
                e.preventDefault();
                e.stopPropagation();
                navigateToConvo(id);
            }
        }, actions: [
            _jsx(Flex.Item, { children: _jsx(CallUsersStack, { size: "m", items: avatarItems }, "avatar") }, "avatar"),
            _jsx(Flex.Item, { children: _jsx(Button, { "data-testid": "calls_current_calls_join", size: "m", onClick: () => onJoin(currentJoinLink, id, CallStatSource.HISTORY), children: langs.getLang('calls_history_join_call_button') }, "join") }, "join"),
        ], dataTestId: "calls_current_calls_item" }));
}
function getChatItemData({ title = '', photo_100: photo, id = EMPTY_USER_ID }) {
    const href = id !== EMPTY_USER_ID ? '/im?sel=c' + id : '';
    return { title, photo, href, id };
}
function getMemberItemData({ name: title = '', photo, link = '', id = EMPTY_USER_ID }) {
    const href = link ? link : id !== EMPTY_USER_ID ? `/im?sel=c${id}` : '';
    return { title, photo, href, id };
}
export function getCurrentCallOwner(call, profiles) {
    let { chat, participant_ids } = call;
    let member = undefined;
    if (!chat) {
        if (participant_ids.length) {
            let peerId = participant_ids[0];
            if (peerId in profiles) {
                member = profiles[peerId];
            }
        }
    }
    return { member, chat };
}
//# sourceMappingURL=CurrentCallsListItem.js.map