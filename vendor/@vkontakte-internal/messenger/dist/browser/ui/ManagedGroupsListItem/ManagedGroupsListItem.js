import React, { useRef } from 'react';
import cx from 'classnames';
import { BasicAvatar } from '../../ui/BasicAvatar/BasicAvatar';
import { Icon20NotificationSlashOutline, Icon20NotificationOutline, Icon24ChevronCompactRight, Icon16MoreHorizontal, Icon16MoreVertical, Icon16Muted, } from '@vkontakte/icons';
import { ExternalLink } from '../../ui/Link/Link';
import { useFastActionsState } from '../../hooks/useFastActionsState';
import { UnreadCounter } from '../../ui/UnreadCounter/UnreadCounter';
import { useBrowserEnv, useDispatch, useFeatureFlags } from '../../hooks/misc';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { ContextMenu } from '../../ui/ContextMenu/ContextMenu';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import './ManagedGroupsListItem.css';
import { useFastActionsTrigger } from '../../hooks/useFastActionsTrigger';
export const ManagedGroupsListItem = React.memo(function ManagedGroupsListItem({ url, isAllMuted, onClick, isCollapsed, managedGroup, }) {
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const $contextMenu = useRef(null);
    const { isDropdownFastActionsOpened, isContextMenuFastActionsOpened, openDropdownFastActions, openContextMenuFastActions, closeDropdownFastActions, closeContextMenuFastActions, } = useFastActionsState();
    const fastActionsTrigger = useFastActionsTrigger();
    const ariaLabel = () => {
        const unreadCount = managedGroup.unreadCount
            ? lang.use('me_managed_group_unread_count', {
                values: {
                    count: managedGroup.unreadCount.toString(),
                },
            })
            : '';
        const description = lang.use(managedGroup.type === 'event'
            ? 'me_managed_group_event_aria_label'
            : 'me_managed_group_aria_label', {
            values: {
                name: managedGroup.name,
                activity: managedGroup.activity,
            },
        });
        return `${description}, ${unreadCount}`;
    };
    const dropdownContent = (React.createElement(ManagedGroupsListItemActionsMenu, { managedGroup: managedGroup, isAllMuted: isAllMuted }));
    const actionHoverButton = featureFlags.vkm_managed_groups_mute_unmute &&
        fastActionsTrigger.button === 'hover' && (React.createElement(Dropdown, { content: dropdownContent, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, adaptation: "vertical", align: "center", position: "right", hideOnClick: true, classNames: {
            wrapper: isCollapsed ? 'ManagedGroupsListItem__dropdownWrapper' : '',
        } },
        React.createElement("button", { className: "ManagedGroupsListItem__action", type: "button", "aria-label": lang.use('me_actions_more'), onClickCapture: (e) => {
                e.stopPropagation();
                e.preventDefault();
            } },
            React.createElement(Icon16MoreHorizontal, null))));
    const actionTapButton = featureFlags.vkm_managed_groups_mute_unmute &&
        fastActionsTrigger.button === 'tap' && (React.createElement(Dropdown, { content: dropdownContent, open: isDropdownFastActionsOpened, onOpen: openDropdownFastActions, onClose: closeDropdownFastActions, adaptation: "horizontal", align: "right", position: "bottom", openType: "click", hideOnClick: true },
        React.createElement("button", { className: cx('ManagedGroupsListItem__action', 'ManagedGroupsListItem__actionTap'), type: "button", "aria-label": lang.use('me_actions_more'), onClick: (e) => {
                e.stopPropagation();
            } },
            React.createElement(Icon16MoreVertical, null),
            React.createElement("div", { className: "ManagedGroupsListItem__actionTapArea" }))));
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { ref: $contextMenu, className: cx('ManagedGroupsListItem', {
                'ManagedGroupsListItem--tap': fastActionsTrigger.button === 'tap',
                'ManagedGroupsListItem--collapsed': isCollapsed,
            }) },
            React.createElement(Tooltip, { align: "right", delay: 500, content: managedGroup.name, position: "right", disabled: !isCollapsed },
                React.createElement(ExternalLink, { href: url, className: "ManagedGroupsListItem__link", onClick: (e) => onClick(e, managedGroup), "aria-label": ariaLabel() },
                    React.createElement("span", { className: "ManagedGroupsListItem__linkText" }, managedGroup.name))),
            React.createElement("div", { className: "ManagedGroupsListItem__avatar" },
                React.createElement(BasicAvatar, { picture: managedGroup.photo, size: isCollapsed ? 40 : 48, alt: managedGroup.name, content: managedGroup.name })),
            React.createElement("header", { className: "ManagedGroupsListItem__header" },
                React.createElement("div", { className: "ManagedGroupsListItem__info" },
                    React.createElement("h3", { className: "ManagedGroupsListItem__title" }, managedGroup.name),
                    (isAllMuted || managedGroup.isMuted) && (React.createElement("span", { className: "ManagedGroupsListItem__mutedIcon" },
                        React.createElement(Icon16Muted, { "aria-hidden": false, "aria-label": lang.use('me_convo_title_muted') })))),
                actionHoverButton),
            React.createElement("span", { className: "ManagedGroupsListItem__text" }, managedGroup.activity),
            React.createElement("div", { className: "ManagedGroupsListItem__icons" },
                !!managedGroup.unreadCount && (React.createElement("div", { className: cx('ManagedGroupsListItem__counter ManagedGroupsListItem__counter--unreadCounter') },
                    React.createElement(UnreadCounter, { size: 20, count: managedGroup.unreadCount, isMuted: isAllMuted || managedGroup.isMuted }))),
                React.createElement(Icon24ChevronCompactRight, { className: cx('ManagedGroupsListItem__chevron', {
                        'ManagedGroupsListItem__chevron--hidden': isCollapsed,
                    }) }),
                actionTapButton)),
        featureFlags.vkm_managed_groups_mute_unmute &&
            fastActionsTrigger.rightClick && (React.createElement(ContextMenu, { ref: $contextMenu, open: isContextMenuFastActionsOpened, onOpen: openContextMenuFastActions, onClose: closeContextMenuFastActions, content: dropdownContent, allowNativeContextMenu: true }))));
});
const EVENT_MAP = {
    mute: 'push_disabled',
    unmute: 'push_enabled',
};
export const ManagedGroupsListItemActionsMenu = ({ managedGroup, isAllMuted }) => {
    const { lang, stats } = useBrowserEnv();
    const dispatch = useDispatch();
    const onDefaultActionClick = (userAction) => {
        switch (userAction) {
            case 'mute':
            case 'unmute': {
                dispatch({
                    type: 'UserChangedManagedGroup',
                    groupId: managedGroup.id,
                    userAction,
                });
                stats.logEvent({
                    type: 'type_click',
                    type_click: {
                        item: {
                            type: 'click_item',
                        },
                        type: 'type_im_push_notifications_settings_click',
                        type_im_push_notifications_settings_click: {
                            event: EVENT_MAP[userAction],
                            label: 'selected_community_pushes',
                            community_id: managedGroup.id,
                            nav_screen: 'im_community_list',
                        },
                    },
                });
                break;
            }
            default:
                break;
        }
    };
    return (React.createElement(ActionsMenu, null,
        React.createElement(React.Fragment, null, isAllMuted || managedGroup.isMuted ? (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('unmute'), title: lang.use('me_managed_group_action_unmute'), "aria-label": lang.use('me_managed_group_action_unmute'), leftIcon: React.createElement(Icon20NotificationOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: () => onDefaultActionClick('mute'), title: lang.use('me_managed_group_action_mute'), "aria-label": lang.use('me_managed_group_action_mute'), leftIcon: React.createElement(Icon20NotificationSlashOutline, null), type: "secondary" })))));
};
//# sourceMappingURL=ManagedGroupsListItem.js.map