import React, { useMemo, useEffect, useState, useRef, useLayoutEffect, } from 'react';
import * as Peer from '../../../core/model/Peer';
import '../../ui/ChannelMembers/ChannelMembers.css';
import { Avatar } from '../../ui/Avatar/Avatar';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { useBrowserEnv, useDebounced, useInsertIntoCache, useViewer, } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { Search } from '@vkontakte/vkui';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Icon20FavoriteOutline, Icon20More, Icon20UnfavoriteOutline, } from '@vkontakte/icons';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { fromApiChannelMember } from '../../../data/converter/ChannelMembersConverter';
import { produce } from 'immer';
import { useApiFetch } from '../../hooks/useApiFetch';
const PAGE_SIZE = 50;
/**
 * Список подписчиков на канал
 */
export const ChannelMembers = ({ channel }) => {
    const { lang } = useBrowserEnv();
    /**
     * Текущий поисковой запрос
     */
    const [query, setQuery] = useState('');
    const onQueryChange = (event) => {
        setQuery(event.target.value);
    };
    return (React.createElement("div", { className: "ChannelMembers" },
        React.createElement("div", { className: "ChannelMembers__search" },
            React.createElement(Search, { placeholder: lang.use('me_search'), onChange: onQueryChange, value: query })),
        React.createElement("div", { className: "ChannelMembers__list" }, query ? (React.createElement(SearchResults, { query: query, channel: channel })) : (React.createElement(SubscribersList, { channel: channel })))));
};
const SearchResults = ({ query, channel }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const [members, setMembers] = useState(null);
    /**
     * Указатель на сервере, с какой точки мы хотим дозагрузить данные
     * Аналог offset'а на сервере
     */
    const [nextFrom, setNextFrom] = useState('');
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const insertIntoCache = useInsertIntoCache();
    const queryRef = useRef(query);
    const searchQuery = useDebounced(query, 250).debounced;
    queryRef.current = query;
    useLayoutEffect(() => {
        setMembers(null);
        setTotal(0);
        setNextFrom('');
        loadMore();
        // Зависимость от loadMore будет вызывать повторные загрузки при смене isLoading
        // С зависимостью будет сложнее, обертки, неочевидные вызовы, а сейчас просто зависимость по скоупу и всё
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);
    const loadMore = async ({ members, nextFrom } = {
        members: null,
        nextFrom: '',
    }) => {
        try {
            setLoading(true);
            const response = await apiFetch('channels.searchMembers', {
                q: searchQuery,
                channel_id: channel.id,
                next_from: nextFrom ? nextFrom : undefined,
                count: PAGE_SIZE,
            });
            if (queryRef.current !== searchQuery) {
                // Поисковой запрос изменился в процессе ожидания ответа, поэтому не актуальный ответ не обрабатываем
                return;
            }
            const extendedMembers = new Map(nextFrom ? members || [] : []);
            response.items.forEach((item) => {
                const peerId = Peer.resolveId(item.id);
                if (!Peer.isUserPeerId(peerId)) {
                    return;
                }
                if (extendedMembers.has(peerId)) {
                    return;
                }
                const member = fromApiChannelMember(item);
                extendedMembers.set(member.id, member);
            });
            insertIntoCache({
                profiles: response.items,
            });
            setMembers(extendedMembers);
            setNextFrom(response.next_from || '');
            setTotal(response.count);
            setLoading(false);
        }
        catch {
            // Ничего не делаем в случае ошибки
            setLoading(false);
        }
    };
    function onLoadMore() {
        loadMore({ members, nextFrom });
    }
    return (React.createElement(MembersList, { members: members, total: total, isLoading: isLoading || queryRef.current !== searchQuery, setMembers: setMembers, channel: channel, loadMore: onLoadMore, empty: React.createElement("div", { className: "ChannelMembers__empty" }, lang.use('me_channel_members_search_empty')) }));
};
const SubscribersList = ({ channel }) => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const [members, setMembers] = useState(null);
    const [skipped, setSkipped] = useState(0);
    const [nextFrom, setNextFrom] = useState('');
    const [isLoading, setLoading] = useState(false);
    const insertIntoCache = useInsertIntoCache();
    const loadMore = async () => {
        if (isLoading) {
            return;
        }
        try {
            setLoading(true);
            const response = await apiFetch('channels.getMembers', {
                channel_id: channel.id,
                sort: 'managers',
                count: PAGE_SIZE,
                next_from: nextFrom,
            });
            const extendedMembers = new Map(members || []);
            let skippedFoundMembers = 0;
            response.items.forEach((item) => {
                const peerId = Peer.resolveId(item.id);
                if (!Peer.isUserPeerId(peerId)) {
                    return;
                }
                if (extendedMembers.has(peerId)) {
                    skippedFoundMembers += 1;
                    return;
                }
                const member = fromApiChannelMember(item);
                extendedMembers.set(member.id, member);
            });
            insertIntoCache({
                profiles: response.items,
            });
            setMembers(extendedMembers);
            setNextFrom(response.next_from || '');
            setSkipped(skipped + skippedFoundMembers);
        }
        catch {
            // Ничего не делаем в случае ошибки
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadMore();
        // Загрузка требуется только при первом рендере компонента
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement(MembersList, { members: members, total: channel.membersCount - skipped, isLoading: isLoading, setMembers: setMembers, channel: channel, loadMore: loadMore, empty: React.createElement("div", { className: "ChannelMembers__empty" }, lang.use('me_channel_members_no_subscribers')) }));
};
const MembersList = ({ channel, members, total, isLoading, loadMore, setMembers, empty, }) => {
    const apiFetch = useApiFetch();
    const list = useMemo(() => {
        if (!members) {
            return [];
        }
        return [...members.values()];
    }, [members]);
    const setRole = async (memberId, role) => {
        if (!members) {
            return;
        }
        const member = members.get(memberId);
        const previousIsAdmin = !!member?.isAdmin;
        // Оптимистичный апдейт
        let newMembers = produce(members, (draftMembers) => {
            const member = draftMembers.get(memberId);
            if (!member) {
                return draftMembers;
            }
            member.isAdmin = role === 'administrator';
            return draftMembers;
        });
        setMembers(newMembers);
        try {
            await apiFetch('groups.editManager', {
                group_id: Peer.toRealId(Peer.resolveId(channel.id)),
                user_id: Peer.toRealId(memberId),
                role,
            });
        }
        catch {
            // Откат изменений в локальном состоянии если произошла ошибка запроса
            newMembers = produce(newMembers, (draftMembers) => {
                const member = draftMembers.get(memberId);
                if (!member) {
                    return draftMembers;
                }
                member.isAdmin = previousIsAdmin;
                return draftMembers;
            });
            setMembers(newMembers);
        }
    };
    const promote = async (memberId) => {
        setRole(memberId, 'administrator');
    };
    const demote = async (memberId) => {
        setRole(memberId);
    };
    const count = members?.size ?? 0;
    const hasMore = count < total;
    if (list.length === 0 && isLoading) {
        return React.createElement(OptimizedSpinner, { className: "ChannelMembers__spinner" });
    }
    if (count === 0) {
        if (!hasMore) {
            return empty;
        }
        return null;
    }
    return (React.createElement(React.Fragment, null,
        list.map((member) => (React.createElement(ChannelMember, { key: member.id, member: member, onPromote: promote, onDemote: demote }))),
        hasMore && (React.createElement(OptimizedSpinner, { key: `${count}_${isLoading}`, onIntersection: loadMore, className: "ChannelMembers__spinner" }))));
};
const ChannelMember = ({ member, onPromote, onDemote }) => {
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    const { viewer } = useViewer();
    const isViewer = member.id === viewer.id;
    const openProfile = () => {
        navigate({ kind: 'PeerPanel', peerId: member.id });
    };
    const promote = async () => {
        onPromote(member.id);
    };
    const demote = async () => {
        onDemote(member.id);
    };
    return (React.createElement("div", { className: "ChannelMember", onClick: openProfile },
        React.createElement("div", { className: "ChannelMember__avatar" },
            React.createElement(Avatar, { peer: member, size: 40 })),
        React.createElement("div", { className: "ChannelMember__content" },
            React.createElement("div", { className: "ChannelMember__name" },
                React.createElement(PeerTitle, { peer: member, isAdmin: member.isAdmin, isOwner: member.isOwner })),
            React.createElement("div", { className: "ChannelMember__subnote" },
                React.createElement(OnlineStatus, { user: member }))),
        React.createElement("div", { className: "ChannelMember__actions" }, !member.isOwner && !isViewer && (React.createElement(Dropdown, { hideOnClick: true, content: React.createElement(ActionsMenu, null, member.isAdmin ? (React.createElement(ActionsMenuAction, { onClick: demote, title: lang.use('me_channel_members_revoke_admin'), leftIcon: React.createElement(Icon20UnfavoriteOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: promote, title: lang.use('me_channel_members_set_admin'), leftIcon: React.createElement(Icon20FavoriteOutline, null), type: "secondary" }))), align: "center", position: "bottom", openType: "hover" },
            React.createElement("button", { className: "ChannelMember__menuButton", "aria-label": lang.use('me_actions_more'), onClick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                } },
                React.createElement(Icon20More, null)))))));
};
//# sourceMappingURL=ChannelMembers.js.map