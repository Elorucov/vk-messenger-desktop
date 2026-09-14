import '../../ui/SearchResult/SearchResult.css';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import React, { useCallback, useRef } from 'react';
import { Avatar } from '../../ui/Avatar/Avatar';
import { ConvoTitle } from '../../ui/ConvoTitle/ConvoTitle';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { useBrowserEnv, useOwner } from '../../hooks/misc';
import { AvatarFavorites } from '../../ui/AvatarFavorites/AvatarFavorites';
import { Icon16Cancel, Icon16MoreHorizontal, Icon16MoreVertical, Icon20Cancel, } from '@vkontakte/icons';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import cx from 'classnames';
import { PeerSubhead } from '../../ui/PeerSubhead/PeerSubhead';
import { ConvoListItemActionsMenu, } from '../../ui/ConvoListItemActionsMenu/ConvoListItemActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const SearchResult = ({ convo, showScreenName, peer, isFocused, onClick, onRemove, withContext, selectedConvoId, handleContextMenuAction, handleRejectMRAction, }) => {
    const owner = useOwner();
    const { lang } = useBrowserEnv();
    const isFavorites = owner.kind !== 'Group' && Peer.isFavorites(peer.id, owner.id);
    const $ref = useRef(null);
    const fastActionsTrigger = useFastActionsTrigger();
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const withRemoveButton = onRemove !== undefined;
    const unreadCounter = convo !== undefined && Convo.isUnread(convo) ? (React.createElement("span", { className: "SearchResult__counter" },
        React.createElement(UnreadCounter, { count: convo.unreadCount, isMuted: Convo.isMuted(convo), size: 18 }))) : null;
    const removeBtn = (React.createElement("span", { className: "SearchResult__remove" },
        React.createElement(Tooltip, { content: lang.use('me_recent_search_remove'), position: "top", delay: 500 },
            React.createElement("button", { className: "SearchResult__removeButton", onClick: (event) => {
                    event.stopPropagation();
                    onRemove?.(peer.id);
                }, "aria-label": lang.use('me_recent_search_remove') },
                React.createElement(Icon20Cancel, null)))));
    const onContextAction = useCallback((action) => {
        convo &&
            handleContextMenuAction &&
            handleContextMenuAction(action, convo);
    }, [convo, handleContextMenuAction]);
    return (React.createElement(React.Fragment, null,
        React.createElement("button", { key: peer.id, className: cx('SearchResult', {
                'SearchResult--tappable': fastActionsTrigger.button === 'tap',
                'SearchResult--selected': isFocused,
                'SearchResult--favorites': isFavorites,
            }), role: "menuitem", ref: $ref, onClick: () => onClick(peer.id) },
            React.createElement("div", { className: "SearchResult__avatar" }, isFavorites ? (React.createElement(AvatarFavorites, { size: 40 })) : (React.createElement(Avatar, { peer: peer, size: 40, withOnline: true, withBirthday: true }))),
            React.createElement("header", { className: "SearchResult__header" },
                React.createElement(ConvoTitle, { className: "SearchResult__title", peer: peer, isMuted: convo ? Convo.isMuted(convo) : false, isCasper: convo ? Convo.isCasper(convo) : false, isForbidedWritingForAll: convo
                        ? Convo.isForbidedWritingForAll(convo) &&
                            !Convo.isDisabled(convo)
                        : false })),
            !isFavorites && (React.createElement(PeerSubhead, { peer: peer, convo: convo, showScreenName: showScreenName, className: "SearchResult__subhead", showVacation: true })),
            React.createElement("div", { className: cx('SearchResult__icons', {
                    'SearchResult__icons--withRemove': withRemoveButton,
                    'SearchResult__icons--withContext': withContext && fastActionsTrigger.button,
                }) },
                withContext && convo !== undefined && (React.createElement(React.Fragment, null,
                    fastActionsTrigger.button === 'hover' && (React.createElement(ActionHoverButton, { selectedConvoId: selectedConvoId, handleContextMenuAction: onContextAction, handleRejectMRAction: handleRejectMRAction, convo: convo, showDropdown: true, isDropdownFastActionsOpened: isDropdownFastActionsOpened, openDropdownFastActions: openDropdownFastActions, closeDropdownFastActions: closeDropdownFastActions })),
                    unreadCounter,
                    fastActionsTrigger.button === 'tap' && (React.createElement(ActionTapButton, { selectedConvoId: selectedConvoId, handleContextMenuAction: onContextAction, handleRejectMRAction: handleRejectMRAction, convo: convo, isDropdownFastActionsOpened: isDropdownFastActionsOpened, openDropdownFastActions: openDropdownFastActions, closeDropdownFastActions: closeDropdownFastActions })))),
                withRemoveButton && (React.createElement(React.Fragment, null,
                    !withContext && unreadCounter,
                    removeBtn)))),
        withContext && convo !== undefined && fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: $ref, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, allowNativeContextMenu: true, content: React.createElement(ConvoListItemActionsMenu, { onAction: onContextAction, convo: convo, isSelected: convo.peerId === selectedConvoId, dropdownActionOpenType: fastActionsTrigger.button === 'tap' ? 'click' : 'hover' }) }))));
};
const RejectMRButton = ({ convo, onActionRejectMR, }) => (React.createElement("button", { type: "button", className: "SearchResult__action", onClick: (e) => {
        e.stopPropagation();
        onActionRejectMR?.(convo);
    } },
    React.createElement(Icon16Cancel, null)));
const DropdownActionMenu = ({ selectedConvoId, convo, handleContextMenuAction, openType, children, isDropdownFastActionsOpened, openDropdownFastActions, closeDropdownFastActions, }) => {
    const handleAction = useCallback((action) => handleContextMenuAction(action, convo), [convo, handleContextMenuAction]);
    return (React.createElement(Dropdown, { open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, content: React.createElement(ConvoListItemActionsMenu, { isSelected: convo.peerId === selectedConvoId, convo: convo, onAction: handleAction, className: cx({
                'SearchResult__actionsMenu--bottom': openType === 'click',
                'SearchResult__actionsMenu--right': openType === 'hover',
            }), dropdownActionOpenType: openType }), adaptation: openType === 'click' ? 'horizontal' : 'vertical', align: openType === 'click' ? 'right' : 'center', position: openType === 'click' ? 'bottom' : 'right', openType: openType, hideOnClick: true }, children));
};
const ActionTapButton = ({ selectedConvoId, convo, convoOwner, handleContextMenuAction, handleRejectMRAction, isDropdownFastActionsOpened, openDropdownFastActions, closeDropdownFastActions, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("span", { onClick: (e) => {
            e.stopPropagation();
        } }, convo.kind === 'MessageRequestChatConvo' ? (React.createElement(RejectMRButton, { convo: convo, onActionRejectMR: handleRejectMRAction })) : (React.createElement(DropdownActionMenu, { selectedConvoId: selectedConvoId, convo: convo, convoOwner: convoOwner, handleContextMenuAction: handleContextMenuAction, openType: "click", isDropdownFastActionsOpened: isDropdownFastActionsOpened, openDropdownFastActions: openDropdownFastActions, closeDropdownFastActions: closeDropdownFastActions },
        React.createElement("button", { type: "button", "aria-label": lang.use('me_actions_more'), className: cx('SearchResult__action', 'SearchResult__actionTap') },
            React.createElement(Icon16MoreVertical, null),
            React.createElement("div", { className: "SearchResult__actionTapArea" }))))));
};
const ActionHoverButton = ({ selectedConvoId, convo, convoOwner, handleContextMenuAction, handleRejectMRAction, showDropdown, isDropdownFastActionsOpened, openDropdownFastActions, closeDropdownFastActions, }) => {
    const { lang } = useBrowserEnv();
    return convo.kind === 'MessageRequestChatConvo' ? (React.createElement(Tooltip, { content: lang.use('me_message_request_delete'), position: "top" },
        React.createElement(RejectMRButton, { convo: convo, onActionRejectMR: handleRejectMRAction }))) : showDropdown ? (React.createElement(DropdownActionMenu, { selectedConvoId: selectedConvoId, convo: convo, convoOwner: convoOwner, handleContextMenuAction: handleContextMenuAction, openType: "hover", isDropdownFastActionsOpened: isDropdownFastActionsOpened, openDropdownFastActions: openDropdownFastActions, closeDropdownFastActions: closeDropdownFastActions },
        React.createElement("button", { type: "button", "aria-label": lang.use('me_actions_more'), className: "SearchResult__action", onClickCapture: (e) => {
                e.stopPropagation();
                e.preventDefault();
            } },
            React.createElement(Icon16MoreHorizontal, null)))) : null;
};
//# sourceMappingURL=SearchResult.js.map