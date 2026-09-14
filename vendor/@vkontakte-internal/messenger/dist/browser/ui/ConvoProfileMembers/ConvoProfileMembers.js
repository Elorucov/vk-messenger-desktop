import '../../ui/ConvoProfileMembers/ConvoProfileMembers.css';
import React, { useCallback, useEffect, useMemo, useState, } from 'react';
import classNames from 'classnames';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Trie from '../../../core/model/Trie';
import * as ChatMembers from '../../../core/model/ChatMembers';
import * as Viewer from '../../../core/model/Viewer';
import { Icon20Add, Icon20BlockOutline, Icon20Cancel, Icon20Favorite, Icon20FavoriteOutline, Icon20MessageCheckOutline, Icon20MessageCrossOutline, Icon20More, Icon20UnfavoriteOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useDispatch, useFeatureFlags, useOwner, usePeers, useViewer, } from '../../hooks/misc';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { Button, Search } from '@vkontakte/vkui';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Link } from '../../ui/Link/Link';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { OnlineStatus } from '../../ui/OnlineStatus/OnlineStatus';
import { ActionsMenu, ActionsMenuAction, ActionsMenuDropdownAction, ActionsMenuSeparator, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import cx from 'classnames';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { getInitials } from '../../../core/utils/misc';
import { useInView } from 'react-intersection-observer';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { useRestrictChatMemberToWrite } from '../../hooks/useRestrictChatMemberToWrite';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { EmployeeVacationMark } from '../../ui/EmployeeVacationMark/EmployeeVacationMark';
import { useNow } from '../../hooks/useNow';
import { Timer } from '../../ui/Timer/Timer';
import { useSearchConversationMembers } from '../../hooks/useSearch';
import { FakeAvatar, Skeleton } from '@vkontakte-internal/vkcom-kit';
import { useConvoAttachesGetMissedPeers } from '../../hooks/useConvoAttaches';
import { FormattedDate } from '../../ui/Time/Time';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
import { useModal } from '../../hooks/useModal';
import { AlertInterface } from '../../ui/AlertInterface/AlertInterface';
const PAGE_SIZE = 50;
const AVATAR_SIZE = 40;
const MAX_CAN_SORTED_MEMBERS_COUNT = 100;
export const ConvoProfileMembers = ({ activeTab, convo, onAddUsers, onIncognitoClick, isLoading, }) => {
    const { lang } = useBrowserEnv();
    const [searchQuery, setSearchQuery] = useState('');
    if (!Convo.canReadMembers(convo) ||
        convo.kind !== 'ChatConvo' ||
        convo.state !== 'in') {
        return null;
    }
    if (convo.members.count === 0) {
        return React.createElement(OptimizedSpinner, { className: "ConvoProfileMembers__loader" });
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "ConvoProfileMembers__searchArea" },
            React.createElement(Search, { placeholder: lang.use('me_search'), "aria-label": lang.use('me_aria_convo_profile_members_search'), onChange: (event) => setSearchQuery(event.target.value), value: searchQuery })),
        React.createElement("div", { className: "ConvoProfileMembers__content" },
            React.createElement(ChatMembersContent, { searchQuery: searchQuery, onShowInviteUsersModal: onAddUsers, onIncognitoClick: onIncognitoClick, activeTab: activeTab, convo: convo, members: convo.members, isLoading: isLoading }))));
};
export const ChatMembersContent = ({ searchQuery, convo, onShowInviteUsersModal, onIncognitoClick, activeTab, members, isLoading: isMembersPageLoading, }) => {
    const dispatch = useDispatch();
    const { ref, inView } = useInView();
    const { lang } = useBrowserEnv();
    const [membersCount, setMembersCount] = useState(members.count);
    const [incognitoMembersCount, setIncognitoMembersCount] = useState(members.incognitoMembers.size);
    const [count, setCount] = useState(0);
    const featureFlags = useFeatureFlags();
    const isPaginationEnabled = !!featureFlags.vkm_members_search_pagination;
    const params = useMemo(() => ({
        query: isPaginationEnabled ? { query: searchQuery } : {},
        peerId: convo.peerId,
    }), [isPaginationEnabled, convo.peerId, searchQuery]);
    const { results: membersRawResults, isLoading: isSearchLoading } = useSearchConversationMembers(params);
    const membersServerResults = useMemo(() => membersRawResults.reduce((acc, { member_id: id }) => {
        const memberId = Peer.resolveId(id);
        /**
         * TODO: В будущем тут можно будет сделать еще парсинг результатов
         * по инкогнито. Но из-за https://jira.mvk.com/browse/ME-60394 пока
         * этого не делаем.
         */
        if (Peer.isUserPeerId(memberId) || Peer.isGroupPeerId(memberId)) {
            acc.add(memberId);
        }
        return acc;
    }, new Set()), [membersRawResults]);
    const totalCount = membersCount + incognitoMembersCount;
    const isEmptyList = totalCount === 0 && members.count !== 0 && !isSearchLoading;
    const isFullyLoaded = ChatMembers.isFullyLoaded(members);
    const shouldDisplayMore = count === 0 || count < totalCount;
    const showMoreUsers = useCallback(() => {
        setCount((count) => Math.min(count + PAGE_SIZE, totalCount));
    }, [totalCount]);
    const loadMoreUsers = useCallback(() => {
        if (isMembersPageLoading ||
            searchQuery ||
            shouldDisplayMore ||
            isFullyLoaded) {
            return;
        }
        dispatch({
            type: 'LoadChatMembers',
            peerId: convo.peerId,
        });
    }, [
        convo.peerId,
        dispatch,
        isFullyLoaded,
        isMembersPageLoading,
        searchQuery,
        shouldDisplayMore,
    ]);
    useEffect(() => {
        if (!inView) {
            return;
        }
        if (isPaginationEnabled) {
            loadMoreUsers();
        }
        showMoreUsers();
    }, [inView, isPaginationEnabled, showMoreUsers, loadMoreUsers]);
    return (React.createElement("div", { className: classNames('ConvoProfileMembers__list', `ConvoProfileMembers__list--${activeTab}`), role: "menu" },
        members.count > 0 &&
            activeTab === 'members' &&
            onShowInviteUsersModal && (React.createElement("div", { className: "ConvoProfileMembers__add", onClick: onShowInviteUsersModal, tabIndex: 0, role: "button", "aria-label": lang.use('me_chat_members_add') },
            React.createElement("div", { className: "ConvoProfileMembers__addButton" },
                React.createElement(Icon20Add, null)),
            React.createElement("div", { className: "ConvoProfileMembers__addText" }, lang.use('me_chat_members_add')))),
        isEmptyList && searchQuery && (React.createElement("div", { className: "ConvoProfileMembers__emptySearchResult" }, lang.use('me_chat_members_not_found'))),
        React.createElement(MembersList, { searchQuery: searchQuery, count: count, setMembersCount: setMembersCount, convo: convo, activeTab: activeTab, chatMembers: members, serverResults: membersServerResults }),
        members.incognitoMembers && count >= membersCount && (React.createElement(IncognitoMembersList, { searchQuery: searchQuery, count: count - membersCount, setIncognitoMembersCount: setIncognitoMembersCount, incognitoMembers: members.incognitoMembers, canPromoteUsers: convo.acl.canPromoteUsers, peerId: convo.peerId, onItemClick: onIncognitoClick })),
        isSearchLoading && React.createElement(MemberItemSkeleton, null),
        isPaginationEnabled && !isEmptyList && isMembersPageLoading && (React.createElement(React.Fragment, null,
            React.createElement(MemberItemSkeleton, null),
            React.createElement(MemberItemSkeleton, null))),
        isPaginationEnabled &&
            isEmptyList &&
            !searchQuery &&
            [...Array(5).keys()].map((key) => React.createElement(MemberItemSkeleton, { key: key })),
        shouldDisplayMore && (React.createElement("div", { className: "ConvoProfileMembers__observer", ref: ref }))));
};
/**
 * Сортирует участников чата в алфавитном порядке, группируя по признаку:
 * владелец -> админ -> участник
 */
const sortMembers = (peers, chatMembers, ownerId, locale) => (prevMemberId, currentMemberId) => {
    const [lastName1, firstName1, middleName1] = Peer.classicName(Peer.safeGet(peers, prevMemberId))
        .trim()
        .toLowerCase()
        .split(' ');
    const [lastName2, firstName2, middleName2] = Peer.classicName(Peer.safeGet(peers, currentMemberId))
        .trim()
        .toLowerCase()
        .split(' ');
    return (
    // 1. владелец
    Number(currentMemberId === ownerId) - Number(prevMemberId === ownerId) ||
        // 2. админы
        Number(ChatMembers.isAdmin(chatMembers, currentMemberId)) -
            Number(ChatMembers.isAdmin(chatMembers, prevMemberId)) ||
        // 3. по фамилии
        (lastName2 && lastName1?.localeCompare(lastName2, locale)) ||
        // 4. по имени
        (firstName2 && firstName1?.localeCompare(firstName2, locale)) ||
        // 5. по отчеству
        (middleName2 && middleName1?.localeCompare(middleName2, locale)) || // 6. иначе ничего не делать
        0);
};
const MembersList = ({ count, searchQuery, convo, activeTab, chatMembers, setMembersCount, serverResults, }) => {
    const viewer = useViewer();
    const ownerId = convo.ownerId;
    const { adminIds, invitedIds, memberIds } = chatMembers;
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const [results, setResults] = useState(new Set());
    const currentIds = activeTab === 'members' ? memberIds : invitedIds;
    const memberPeers = useMemo(() => {
        const isEdu = Viewer.isEdu(viewer.profileType);
        const memberIds = Array.from(
        /**
         * Ставим владельца в начало, затем админов, затем убираем дубликаты сетом
         */
        new Set([
            ...(ownerId && currentIds.has(ownerId) ? [ownerId] : []),
            ...[...adminIds].filter((id) => currentIds.has(id)),
            ...currentIds,
        ]));
        if (isEdu && memberIds.length < MAX_CAN_SORTED_MEMBERS_COUNT) {
            memberIds.sort(sortMembers(peers, chatMembers, ownerId, lang.locale));
        }
        return memberIds.reduce((acc, peerId) => {
            const peer = Peer.safeGet(peers, peerId);
            if (peer.kind !== 'User' &&
                peer.kind !== 'Group' &&
                peer.kind !== 'Contact') {
                return acc;
            }
            return acc.set(peerId, peer);
        }, new Map());
    }, [
        viewer.profileType,
        adminIds,
        currentIds,
        peers,
        ownerId,
        chatMembers,
        lang.locale,
    ]);
    const searchIndex = useMemo(() => Trie.add(Trie.create(), [...memberPeers.values()], (peer) => ({
        id: peer.id,
        strings: Trie.peerWords(peer),
    })), [memberPeers]);
    const membersList = useMemo(() => [...results.values()], [results]);
    useEffect(() => {
        if (searchQuery.length > 0) {
            const matchesPeerIds = Trie.search(searchIndex, searchQuery);
            const bothMatchesPeerIds = new Set([...matchesPeerIds, ...serverResults]);
            setResults(bothMatchesPeerIds);
            setMembersCount(bothMatchesPeerIds.size);
            return;
        }
        setResults(new Set(memberPeers.keys()));
        setMembersCount(memberPeers.size);
    }, [memberPeers, searchQuery, searchIndex, setMembersCount, serverResults]);
    const listItems = membersList.slice(0, count).map((peerId) => {
        const peer = memberPeers.get(peerId);
        const member = chatMembers.members.get(peerId);
        if (!peer || !member) {
            return null;
        }
        return (React.createElement(MemberItem, { key: peerId, ownerId: ownerId, peerId: peerId, member: member, isAdmin: ChatMembers.isAdmin(chatMembers, peerId), peer: peer, canPromoteUsers: convo.acl.canPromoteUsers, canChangeOwner: convo.acl.canChangeOwner, chatPeerId: convo.peerId, isIncognitoChat: Convo.isIncognitoChat(convo), isMeAdmin: ChatMembers.isAdmin(convo.members, viewer.id), withClassicTitle: Viewer.isEdu(viewer.profileType) }));
    });
    return React.createElement(React.Fragment, null, listItems);
};
const IncognitoMembersList = ({ searchQuery, peerId, count, setIncognitoMembersCount, incognitoMembers, canPromoteUsers, onItemClick, }) => {
    const [results, setResults] = useState(new Set());
    /**
     * Выводим только тех инкогнито юзеров, которые не имеют memberId. С memberId мы выводим в обычном списке пользователей
     */
    const filteredIncognitoMembers = useMemo(() => new Map([...incognitoMembers].filter(([, { memberId }]) => !memberId)), [incognitoMembers]);
    useEffect(() => {
        setIncognitoMembersCount(filteredIncognitoMembers.size);
    }, [filteredIncognitoMembers, setIncognitoMembersCount]);
    const searchIndex = useMemo(() => Trie.add(Trie.create(), [...filteredIncognitoMembers.values()], (member) => ({
        id: member.id,
        strings: Trie.byWords(member.name),
    })), [filteredIncognitoMembers]);
    useEffect(() => {
        if (searchQuery.length > 0) {
            const matchesIds = Trie.search(searchIndex, searchQuery);
            setResults(matchesIds);
            setIncognitoMembersCount(matchesIds.size);
            return;
        }
        setResults(new Set(filteredIncognitoMembers.keys()));
        setIncognitoMembersCount(filteredIncognitoMembers.size);
    }, [
        filteredIncognitoMembers,
        searchQuery,
        searchIndex,
        setIncognitoMembersCount,
    ]);
    const incognitoMembersList = useMemo(() => [...results.values()], [results]);
    const listItems = [...incognitoMembersList.values()]
        .slice(0, count)
        .map((incognitoMemberId) => {
        const incognitoMember = incognitoMembers.get(incognitoMemberId);
        if (!incognitoMember) {
            return null;
        }
        return (React.createElement(IncognitoItem, { incognitoMember: incognitoMember, peerId: peerId, key: incognitoMemberId, canPromoteUsers: canPromoteUsers, onClick: onItemClick }));
    });
    return React.createElement(React.Fragment, null, listItems);
};
const IncognitoItem = ({ incognitoMember, peerId, canPromoteUsers, onClick, }) => {
    const owner = useViewer();
    const handleOnClick = useCallback(() => {
        onClick?.(incognitoMember.id);
    }, [incognitoMember.id, onClick]);
    if (!incognitoMember) {
        return null;
    }
    return (React.createElement(SimpleItem, { avatar: React.createElement(BasicAvatar, { size: AVATAR_SIZE, content: getInitials(incognitoMember.name) }), name: incognitoMember.name, description: React.createElement(IncognitoDescription, { incognitoMember: incognitoMember }), onClick: handleOnClick, actions: React.createElement(IncognitoMembersActions, { canKick: incognitoMember.inviterId === owner.id || canPromoteUsers, incognitoMember: incognitoMember, chatPeerId: peerId }) }));
};
const MemberItem = React.memo(({ peerId, peer, isAdmin, ownerId, canPromoteUsers, canChangeOwner, chatPeerId, member, isIncognitoChat, isMeAdmin, withClassicTitle, }) => {
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const now = useNow();
    const featureFlags = useFeatureFlags();
    /**
     * Так как компонент не перерендеривается, прокидывание рефа здесь
     * не сработает, так как forwardRef отработает на второй рендер
     */
    const [itemElement, setItemElement] = useState(null);
    /**
     * Если текущий участника чата - мы
     */
    const isMe = peerId === owner.id;
    /**
     * Если текущий участник чата - владелец чата
     */
    const isOwner = peerId === ownerId;
    /**
     * Если мы - владелец чата
     */
    const isMeOwner = owner.id === ownerId;
    /** Может ли пользователь быть забанен на время в чате */
    const isCanBeRestrictedToWrite = !isAdmin && !isMe && isMeAdmin;
    /** Забанен ли пользователь в чате */
    const isRestrictedToWrite = member.isRestrictedToWrite;
    /** Может ли пользователь назначить себя/другого владельцем  */
    const canPromoteToOwner = featureFlags.vkm_convo_owner_right_transfer &&
        !(isMe && isMeOwner) &&
        canChangeOwner &&
        owner.kind !== 'Group';
    const shouldDisplayActions = () => {
        /** Если можем назначить владельцем текущего пира - всегда показываем */
        if (canPromoteToOwner) {
            return true;
        }
        /** Если текущий пользователь - мы или владелец, то не отображаем действия */
        if (isMe || isOwner) {
            return false;
        }
        const hasAnyPermission = canPromoteUsers || member.canKick || member.isMessageRequest;
        /** если нет прав на какие-либо действия - не показываем */
        return hasAnyPermission;
    };
    const description = () => {
        if (isMe && isIncognitoChat) {
            return lang.use('me_incognito_chat_member_description');
        }
        if (peer.kind === 'User' && !member.isMessageRequest) {
            return React.createElement(OnlineStatus, { user: peer });
        }
        if (peer.kind === 'Group') {
            return peerId === ownerId
                ? lang.use('me_community_label')
                : lang.use('me_bot_label');
        }
        const date = member.requestDate || member.joinDate;
        if (date) {
            return lang.use('me_invitation_sended_ago', {
                values: {
                    when: lang.formatDate(date, {
                        now,
                        variant: 'time-ago',
                    }),
                },
            });
        }
        return '';
    };
    return (React.createElement(SimpleItem, { setItemElement: setItemElement, to: {
            kind: 'PeerPanel',
            peerId: peer.id,
            screenName: Peer.screenName(peer),
        }, avatar: React.createElement(Avatar, { peer: peer, size: 40, withBirthday: true, withOnline: true }), name: React.createElement(PeerTitle, { peer: peer, isAdmin: isAdmin || peerId === ownerId, isOwner: isOwner, isRestrictedToWrite: isRestrictedToWrite, isClassic: withClassicTitle }), description: React.createElement(InviterTooltip, { ownerId: ownerId, peerId: member.peerId, inviterId: member.inviterId, joinDate: member.joinDate },
            description(),
            peer.kind === 'User' && (React.createElement(EmployeeVacationMark, { peer: peer, hasSeparator: true, isShort: true }))), actions: shouldDisplayActions() ? (React.createElement(MemberActions, { itemElement: itemElement, canPromoteUsers: canPromoteUsers, memberId: peerId, chatPeerId: chatPeerId, isAdmin: isAdmin, isMeOwner: isMeOwner, canBePromotedToOwner: canPromoteToOwner, isContactPeer: member.isMessageRequest || Peer.isContactPeerId(peerId), canKick: member.canKick, peer: peer, isCanBeRestrictedToWrite: isCanBeRestrictedToWrite, isRestrictedToWrite: isRestrictedToWrite })) : undefined }));
});
const MemberItemSkeleton = () => {
    return (React.createElement(SimpleItem, { avatar: React.createElement(FakeAvatar, null,
            React.createElement(Skeleton, { width: AVATAR_SIZE, height: AVATAR_SIZE, circle: true })), name: React.createElement(Skeleton, { width: 160, height: 16 }), description: React.createElement(Skeleton, { width: 80, height: 8 }) }));
};
const SimpleItem = ({ avatar, actions, name, description, to, canPromoteUsers, setItemElement, onClick, }) => {
    const content = (React.createElement("div", { className: cx('ConvoProfileMembers__member', {
            'ConvoProfileMembers__member--admin': canPromoteUsers,
            'ConvoProfileMembers__member--clickable': Boolean(to || onClick),
        }) },
        React.createElement("div", { className: "ConvoProfileMembers__memberAvatar" }, avatar),
        React.createElement("div", { className: "ConvoProfileMembers__memberName" }, name),
        React.createElement("div", { className: "ConvoProfileMembers__memberDescription" }, description),
        actions && (React.createElement("div", { className: "ConvoProfileMembers__memberActions" }, actions))));
    return to ? (React.createElement(Link, { to: to, className: "ConvoProfileMembers__memberLink", ref: (node) => {
            setItemElement?.(node);
        }, role: "menuitem" }, content)) : (React.createElement("div", { className: "ConvoProfileMembers__memberLink", onClick: onClick, tabIndex: onClick ? 0 : -1, role: "menuitem" }, content));
};
const MemberActions = ({ itemElement, peer, canPromoteUsers, canBePromotedToOwner, isAdmin, isMeOwner, isCanBeRestrictedToWrite, isRestrictedToWrite, canKick, isContactPeer, memberId, chatPeerId, }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const owner = useOwner();
    const promoteOwnerConfirmationModal = useModal();
    const makeAction = (userAction) => {
        dispatch({
            type: 'UserChangedChatMember',
            userAction,
            peerId: chatPeerId,
            memberId,
        });
    };
    const removeUser = () => {
        dispatch({
            type: 'UserChangedChatMember',
            userAction: 'remove',
            peerId: chatPeerId,
            memberId,
        });
    };
    const cancelInvitation = () => {
        dispatch({
            type: 'UserChangedChatMember',
            userAction: 'cancel_invitation',
            peerId: chatPeerId,
            memberId,
        });
    };
    const promoteOwner = () => {
        if (isMeOwner) {
            promoteOwnerConfirmationModal.open();
        }
        else {
            makeAction('set_owner');
        }
    };
    const { restrictToWrite, allowToWrite } = useRestrictChatMemberToWrite({
        chatId: chatPeerId,
    });
    // Если это приглашение в чат - показываем крестик
    if (isContactPeer) {
        return (React.createElement(DestructiveAction, { onProceed: cancelInvitation, buttonAriaLabel: lang.use('me_chat_members_cancel_invitation'), duration: 5000, snackbarMessage: lang.use('me_chat_members_cancel_invitation_description') }));
    }
    // если юзер может банить, то здесь надо не ретернить один лишь этот экшн
    // Если viewer не админ и не может стать овнером, то доступно только исключение приглашенных
    if (!canPromoteUsers &&
        !canBePromotedToOwner &&
        canKick &&
        !isCanBeRestrictedToWrite &&
        owner.kind !== 'Group') {
        return (React.createElement(DestructiveAction, { onProceed: removeUser, buttonAriaLabel: lang.use('me_chat_members_remove'), duration: 5000, snackbarMessage: lang.use('me_chat_members_remove_description', {
                values: { name: Peer.name(peer) },
                sex: Peer.sex(peer),
            }) }));
    }
    const actions = [];
    const isMarusiaMember = Peer.isMarusia(memberId);
    if (isCanBeRestrictedToWrite && owner.kind !== 'Group') {
        actions.push(isRestrictedToWrite ? (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_member_action_unban_title'), leftIcon: React.createElement(Icon20MessageCheckOutline, null), onClick: () => allowToWrite(memberId), type: "secondary" })) : (React.createElement(ActionsMenuDropdownAction, { key: "ban", enableFocusTrap: true, "aria-haspopup": "menu", "aria-controls": "me_convo_member_action_ban", icon: React.createElement(Icon20MessageCrossOutline, null), title: lang.use('me_convo_member_action_ban_title') },
            React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(memberId, 3600), title: lang.use('me_convo_member_action_ban_hours', { num: 1 }) }),
            React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(memberId, 8 * 3600), title: lang.use('me_convo_member_action_ban_hours', { num: 8 }) }),
            React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(memberId, 24 * 3600), title: lang.use('me_convo_member_action_ban_hours', { num: 24 }) }),
            React.createElement(ActionsMenuSeparator, null),
            React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(memberId), title: lang.use('me_convo_member_action_ban_forever'), type: "danger" }))));
    }
    if (canBePromotedToOwner) {
        actions.push(React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20Favorite, null), key: "promote_owner", onClick: promoteOwner, title: owner.id === memberId
                ? lang.use('me_become_owner')
                : lang.use('me_promote_owner') }));
    }
    if (canPromoteUsers && !isMarusiaMember) {
        if (isAdmin) {
            actions.push(React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20UnfavoriteOutline, null), key: "demote", onClick: () => makeAction('set_member'), title: lang.use('me_chat_members_demote') }));
        }
        else {
            actions.push(React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20FavoriteOutline, null), key: "promote", onClick: () => makeAction('set_admin'), title: lang.use('me_chat_members_promote') }));
        }
    }
    if (canKick) {
        if (actions.length > 0) {
            actions.push(
            // Последний экшен разделяется
            React.createElement(ActionsMenuSeparator, { key: "kick-separator" }));
        }
        actions.push(React.createElement(ActionsMenuAction, { key: "remove", onClick: removeUser, type: "danger", leftIcon: React.createElement(Icon20BlockOutline, null), title: lang.use('me_chat_members_remove') }));
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(ActionsDropdown, { itemElement: itemElement }, actions),
        canBePromotedToOwner && promoteOwnerConfirmationModal.isActive && (React.createElement(AlertInterface, { contextClass: "MEConfig", onClose: () => promoteOwnerConfirmationModal.close(), actions: [
                {
                    title: lang.use('me_cancel'),
                    mode: 'cancel',
                },
                {
                    title: lang.use('me_promote'),
                    mode: 'destructive',
                    action: () => makeAction('set_owner'),
                },
            ], title: lang.use('me_convo_owner_alert_title'), description: lang.use('me_convo_owner_alert_description'), stopPropagation: true }))));
};
const IncognitoMembersActions = ({ canKick, chatPeerId, incognitoMember }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    if (!canKick) {
        return null;
    }
    const removeIncognitoMember = () => {
        dispatch({
            type: 'UserRemoveIncognitoMember',
            userAction: 'remove_incognito',
            peerId: chatPeerId,
            incognitoId: incognitoMember.id,
        });
    };
    return (React.createElement(DestructiveAction, { onProceed: removeIncognitoMember, buttonAriaLabel: lang.use('me_chat_members_remove'), duration: 5000, snackbarMessage: lang.use('me_chat_members_remove_description', {
            values: { name: incognitoMember.name },
            sex: 'unknown',
        }) }));
};
const ActionsDropdown = ({ children, itemElement, }) => {
    const { lang } = useBrowserEnv();
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    return (React.createElement(React.Fragment, null,
        fastActionsTrigger.button && (React.createElement(Dropdown, { enableFocusTrap: true, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, classNames: {
                portal: 'MEConfig',
                wrapper: cx('ConvoProfileMembers__dropdown', {
                    'ConvoProfileMembers__dropdown--open': fastActionsTrigger.button === 'tap',
                }),
                wrapperOpened: 'ConvoProfileMembers__dropdown--open',
            }, hideOnClick: true, adaptive: true, align: "right", position: "bottom", content: React.createElement(ActionsMenu, { id: "member_actions" }, children), openType: fastActionsTrigger.button === 'tap' ? 'click' : 'hover' }, (isOpened) => (React.createElement("button", { "aria-controls": "member_actions", "aria-haspopup": "menu", "aria-expanded": isOpened, "aria-label": lang.use('me_actions_more'), className: "ConvoProfileMembers__action", onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                openDropdownFastActions();
            } },
            React.createElement(Icon20More, null),
            fastActionsTrigger.button === 'tap' && (React.createElement("div", { className: "ConvoProfileMembers__actionTapArea" })))))),
        fastActionsTrigger.rightClick && itemElement && (React.createElement(ContextMenu, { ref: { current: itemElement }, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, allowNativeContextMenu: true, content: React.createElement(ActionsMenu, null, children) }))));
};
const DestructiveAction = ({ duration, onProceed, snackbarMessage, buttonAriaLabel }) => {
    const { lang } = useBrowserEnv();
    const snackbar = useSnackbar();
    const [isPending, setIsPending] = useState(false);
    const handleActionClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPending(true);
        const confirmId = snackbar({
            before: React.createElement(Timer, { duration: duration, callback: onProceed }),
            message: snackbarMessage,
            after: (React.createElement(Button, { mode: "tertiary", size: "s", onClick: () => {
                    setIsPending(false);
                    snackbar.close(confirmId);
                } }, lang.use('me_chat_members_remove_cancel'))),
            duration,
        });
    }, [duration, lang, onProceed, snackbar, snackbarMessage]);
    return (React.createElement(Tooltip, { content: buttonAriaLabel },
        React.createElement("button", { type: "button", className: "ConvoProfileMembers__action", disabled: isPending, "aria-label": buttonAriaLabel, onClick: handleActionClick },
            React.createElement(Icon20Cancel, null))));
};
export const IncognitoDescription = ({ incognitoMember }) => {
    const peers = usePeers();
    const owner = useOwner();
    const now = useNow();
    const { lang } = useBrowserEnv();
    const inviterPeer = Peer.safeGet(peers, incognitoMember.inviterId);
    return (React.createElement(React.Fragment, null, incognitoMember.inviterId === owner.id
        ? lang.use('me_invitation_sended_ago', {
            values: {
                when: lang.formatDate(incognitoMember.inviteDate, {
                    now,
                    variant: 'time-ago',
                }),
            },
        })
        : lang.use('me_invited_to_chat_by', {
            values: {
                user: Peer.name(inviterPeer),
                when: lang.formatDate(incognitoMember.inviteDate, {
                    now,
                    variant: 'time-ago',
                }),
            },
            sex: Peer.sex(inviterPeer),
        })));
};
const InviterTooltip = ({ joinDate, peerId, ownerId, inviterId, children, }) => {
    const peers = usePeers();
    const viewer = useViewer();
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const { fetchProfilesAndGroups } = useConvoAttachesGetMissedPeers(inviterId ? [inviterId] : []);
    useEffect(() => {
        // Если inviterId определен и отсутствует в кэше - тогда дозапрашиваем пира
        if (inviterId && !peers.has(inviterId)) {
            fetchProfilesAndGroups();
        }
    }, [fetchProfilesAndGroups, inviterId, peers]);
    const getInviteText = () => {
        const timeAgoText = joinDate ? (React.createElement(FormattedDate, { timestamp: joinDate, variant: "time-ago" })) : undefined;
        const isOwner = peerId === ownerId;
        if (isOwner) {
            return featureFlags.vkm_convo_owner_right_transfer
                ? lang.use('me_chat_owner_new')
                : lang.use('me_chat_owner');
        }
        if (!inviterId) {
            return timeAgoText;
        }
        if (inviterId === viewer.id) {
            return (React.createElement(React.Fragment, null,
                lang.use('me_invited_to_chat_by_you'),
                React.createElement("br", null),
                timeAgoText));
        }
        const inviterPeer = peers.get(inviterId);
        if (!inviterPeer) {
            return (React.createElement("div", { className: "ConvoProfileMembers__tooltip-skeleton" },
                React.createElement(Skeleton, { width: 140 }),
                React.createElement("br", null),
                React.createElement(Skeleton, { width: 120 })));
        }
        return (React.createElement(React.Fragment, null,
            lang.use('me_invited_to_chat_by_user', {
                sex: inviterPeer.kind === 'User' ? inviterPeer.sex : 'unknown',
                values: {
                    user: Peer.name(inviterPeer),
                },
            }),
            React.createElement("br", null),
            timeAgoText));
    };
    return (React.createElement(Tooltip, { disabled: !joinDate, vkuiStyle: true, content: getInviteText(), position: "bottom", align: "left", delay: 500, watchContentChange: true },
        React.createElement("div", null, children)));
};
//# sourceMappingURL=ConvoProfileMembers.js.map