import React from 'react';
import { Icon20Add, Icon20ArchiveOutline, Icon20ArrowUturnLeftOutline, Icon20BlockOutline, Icon20Check, Icon20DeleteOutline, Icon20DoorArrowRightOutline, Icon20MessageCheckOutline, Icon20MessageUnreadTopOutline, Icon20NotificationOutline, Icon20NotificationSlashOutline, Icon20PinOutline, Icon20PinSlashOutline, Icon20UnarchiveOutline, Icon20ClearDataOutline, Icon20FolderSimpleOutline, Icon20FolderSimplePlusOutline, Icon20MarkerOutline, Icon20UsersOutline, Icon20WorkOutline, Icon20FavoriteOutline, Icon16CheckDoubleOutline, Icon24CheckCircleOutline, } from '@vkontakte/icons';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { ActionsMenu, ActionsMenuAction, ActionsMenuDropdownAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { useRouter } from '../../ui/Router/Router';
import { useBrowserEnv, useDispatch, useOwner, useFeatureFlags, usePeer, useOrganisers, useCommunityMessagingWithToggle, useViewer, } from '../../hooks/misc';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Folder from '../../../core/model/Folder';
import * as ChatMembers from '../../../core/model/ChatMembers';
import * as Viewer from '../../../core/model/Viewer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import './ConvoListItemActionsMenu.css';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { useSnackbar } from '../../hooks/useSnackbar';
/*
  Этот компонент имеет разные причины для изменения с <ConvoMainActionsMenu> и уже имеет отличие
  в форме отсутствия пункта меню "Показать вложения", и поэтому эти два меню изменяются раздельно.
 */
export const ConvoListItemActionsMenu = ({ convo, selectedOrganiser, isSelected, onAction, className, dropdownActionOpenType = 'hover', }) => {
    const { navigate, screenRoute } = useRouter();
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const owner = useOwner();
    const isFolder = selectedOrganiser?.kind === 'folders';
    // Находимся или во вкладке Все, или в режиме поиска
    const isPinAvailable = !isFolder;
    const { vkm_community_messaging_ref: vkmCommunityMessagingRef, vkm_delete_chat, } = useFeatureFlags();
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const { isMobileLayout } = useLayoutData();
    const organisers = useOrganisers();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const folders = organisers.folders.filter(({ type }) => type !== 'channels' && type !== 'managed_groups');
    const folder = isFolder && folders.find((folder) => folder.id === selectedOrganiser?.id);
    const isChatAdmin = convo.kind === 'ChatConvo' &&
        ChatMembers.isAdmin(convo.members, owner.id) &&
        owner.id === convo.ownerId;
    const handleCreateNewFolder = (peerId) => {
        navigate({
            kind: 'NewFolderModal',
            peerId,
        });
    };
    const snackbar = useSnackbar();
    const onDefaultActionClick = (userAction) => () => {
        switch (userAction) {
            // Ничего не делаем, так как открываем модалку в ConvoList
            case 'leave':
            case 'clear':
            case 'configure_tags':
            case 'pin': // делаем пин в ConvoList, чтобы иметь возможность открыть модалку с ошибкой
            case 'delete':
                break;
            case 'archive':
            case 'unarchive':
                dispatch({
                    type: 'UserChangedConvo',
                    peerId: convo.peerId,
                    userAction,
                    uiCallback: (isSuccess) => {
                        if (isSuccess) {
                            snackbar({
                                message: userAction === 'archive'
                                    ? lang.use('me_chat_moved_in_archive')
                                    : lang.use('me_chat_returned_from_archive'),
                                before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                                action: lang.use('me_cancel'),
                                onActionClick: () => {
                                    dispatch({
                                        type: 'UserChangedConvo',
                                        peerId: convo.peerId,
                                        userAction: userAction === 'archive' ? 'unarchive' : 'archive',
                                    });
                                },
                            });
                        }
                    },
                });
                break;
            default:
                dispatch({
                    type: 'UserChangedConvo',
                    peerId: convo.peerId,
                    userAction,
                });
        }
        if (isSelected) {
            switch (userAction) {
                case 'mark_unread':
                    navigate({ kind: 'MainRoute', organiser: screenRoute.organiser });
                    break;
                case 'archive':
                case 'unarchive':
                    navigate({ kind: 'MainRoute' });
                    break;
                case 'mark_read':
                case 'pin':
                case 'unpin':
                case 'return_to_chat':
                case 'clear':
                case 'configure_tags':
                case 'leave':
                case 'delete':
                case 'mark_answered':
                case 'mark_important':
                case 'mark_unimportant':
                    break;
                default:
                    exhaustivenessCheck(userAction);
            }
        }
        onAction?.(userAction, convo);
    };
    const onMuteMessageActionClick = (userAction, timer = 0) => () => {
        dispatch({
            type: 'UserChangedMute',
            userAction,
            peerId: convo.peerId,
            timer,
        });
    };
    const onFolderActionClick = (userAction, folder) => () => {
        switch (userAction) {
            case 'add_to_folder': {
                const isAddable = !folder.peerIds.has(convo.peerId);
                if (isAddable) {
                    dispatch({
                        type: 'UserUpdatedFolder',
                        folderId: folder.id,
                        addPeerIds: new Set([convo.peerId]),
                        removePeerIds: new Set(),
                    });
                }
                break;
            }
            case 'remove_from_folder': {
                const isRemovable = folder.peerIds.has(convo.peerId);
                if (isRemovable) {
                    dispatch({
                        type: 'UserUpdatedFolder',
                        folderId: folder.id,
                        addPeerIds: new Set(),
                        removePeerIds: new Set([convo.peerId]),
                    });
                }
                break;
            }
            default:
                exhaustivenessCheck(userAction);
        }
    };
    const ownerIsGroup = owner.kind === 'Group';
    const isOwnerUserOrCommunityMessaging = !ownerIsGroup || (!isEdu && vkmCommunityMessagingRef);
    const muteUnmuteAction = !Convo.isMR(convo) &&
        isOwnerUserOrCommunityMessaging &&
        Convo.canChangeMute(convo) &&
        (Convo.isMuted(convo) ? (React.createElement(ActionsMenuAction, { onClick: onMuteMessageActionClick('unmute'), title: lang.use('me_convo_action_unmute'), "aria-label": lang.use('me_convo_action_unmute'), leftIcon: React.createElement(Icon20NotificationOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuDropdownAction, { title: lang.use('me_convo_action_mute'), "aria-label": lang.use('me_convo_action_mute'), icon: React.createElement(Icon20NotificationSlashOutline, null), type: "secondary", enableFocusTrap: true, onClick: !isMobileLayout ? onMuteMessageActionClick('mute') : undefined, openType: dropdownActionOpenType },
            React.createElement(ActionsMenuAction, { onClick: onMuteMessageActionClick('mute_until', 3600), title: lang.use('me_notifications_mute_hours_short', { num: 1 }), "aria-label": lang.use('me_notifications_mute_hours_short', { num: 1 }) }),
            React.createElement(ActionsMenuAction, { onClick: onMuteMessageActionClick('mute_until', 24 * 3600), title: lang.use('me_notifications_mute_days_short', { num: 1 }), "aria-label": lang.use('me_notifications_mute_days_short', { num: 1 }) }),
            React.createElement(ActionsMenuAction, { onClick: onMuteMessageActionClick('mute'), title: lang.use('me_notifications_mute_forever_short'), "aria-label": lang.use('me_notifications_mute_forever_short'), type: "danger" }))));
    const clearHistoryAction = !Convo.isEmpty(convo) && (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('clear'), title: lang.use('me_convo_action_clear'), "aria-label": lang.use('me_convo_action_clear'), leftIcon: React.createElement(Icon20ClearDataOutline, null), type: "danger" }));
    if (convo.kind === 'BusinessNotify') {
        return (React.createElement(BusinessNotifyConvoActions, { convo: convo, onAction: onAction, muteUnmuteAction: muteUnmuteAction, clearHistoryAction: clearHistoryAction }));
    }
    return (React.createElement(ActionsMenu, { className: className },
        isCommunityMessaging &&
            !organisers.tags.isUnavailable &&
            Peer.isUserPeerId(convo.peerId) && (React.createElement(ActionsMenuAction, { "aria-label": lang.use('me_convo_action_configure_tags'), onClick: onDefaultActionClick('configure_tags'), title: lang.use('me_convo_action_configure_tags'), leftIcon: React.createElement(Icon20MarkerOutline, null), type: "secondary" })),
        Convo.isUnread(convo) ? (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('mark_read'), title: lang.use('me_convo_action_mark_read'), "aria-label": lang.use('me_convo_action_mark_read'), leftIcon: React.createElement(Icon20MessageCheckOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('mark_unread'), title: lang.use('me_convo_action_mark_unread'), "aria-label": lang.use('me_convo_action_mark_unread'), leftIcon: React.createElement(Icon20MessageUnreadTopOutline, null), type: "secondary" })),
        Convo.canPin(convo, owner) && isPinAvailable && (React.createElement(React.Fragment, null, Convo.isPinned(convo) ? (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('unpin'), title: lang.use('me_convo_action_unpin'), "aria-label": lang.use('me_convo_action_unpin'), leftIcon: React.createElement(Icon20PinSlashOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('pin'), title: lang.use('me_convo_action_pin'), "aria-label": lang.use('me_convo_action_pin'), leftIcon: React.createElement(Icon20PinOutline, null), type: "secondary" })))),
        !Convo.isMR(convo) &&
            !ownerIsGroup &&
            !isFolder &&
            !Peer.isFavorites(convo.peerId, owner.id) &&
            !Peer.isVkAdministration(convo.peerId) &&
            !Convo.isPromo(convo) &&
            (Convo.hasPeerFlag(convo, Convo.PEER_FLAGS.isArchived) ? (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('unarchive'), title: lang.use('me_convo_action_unarchive'), "aria-label": lang.use('me_convo_action_unarchive'), leftIcon: React.createElement(Icon20UnarchiveOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('archive'), title: lang.use('me_convo_action_archive'), "aria-label": lang.use('me_convo_action_archive'), leftIcon: React.createElement(Icon20ArchiveOutline, null), type: "secondary" }))),
        muteUnmuteAction,
        isCommunityMessaging &&
            (Convo.isImportant(convo) ? (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('mark_unimportant'), title: lang.use('me_convo_action_mark_unimportant'), "aria-label": lang.use('me_convo_action_mark_unimportant'), leftIcon: React.createElement(Icon20FavoriteOutline, null), type: "secondary" })) : (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('mark_important'), title: lang.use('me_convo_action_mark_important'), "aria-label": lang.use('me_convo_action_mark_important'), leftIcon: React.createElement(Icon20FavoriteOutline, null), type: "secondary" }))),
        isCommunityMessaging && Convo.isUnanswered(convo) && (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('mark_answered'), title: lang.use('me_convo_action_mark_answered'), "aria-label": lang.use('me_convo_action_mark_answered'), leftIcon: React.createElement(Icon16CheckDoubleOutline, { width: 20, height: 20 }), type: "secondary" })),
        folder &&
            folder.peerIds.has(convo.peerId) &&
            !Folder.isConvoInSublist(folder, organisers.sublists, convo) && (React.createElement(ActionsMenuAction, { onClick: onFolderActionClick('remove_from_folder', folder), title: lang.use('me_convo_action_folder_remove'), "aria-label": lang.use('me_convo_action_folder_remove'), leftIcon: React.createElement(Icon20ArrowUturnLeftOutline, null), type: "secondary" })),
        !ownerIsGroup && !isFolder && folders.length > 0 && (React.createElement(ActionsMenuDropdownAction, { title: lang.use('me_convo_action_folder_add'), "aria-label": lang.use('me_convo_action_folder_add'), icon: React.createElement(Icon20Add, null), type: "secondary", hideOnClick: false, enableFocusTrap: true, openType: dropdownActionOpenType, actionsMenuClassName: "ConvoListItemActionsMenu__folder" },
            React.createElement(ScrollbarProvider, { forceVisible: "y", style: {
                    maxHeight: isMobileLayout ? '300px' : 'calc(100vh - 175px)',
                    minWidth: 'min-content',
                }, overflowX: "hidden" }, folders.map((folder) => {
                let leftIcon;
                switch (folder.type) {
                    case 'personal':
                        leftIcon = (React.createElement(Icon20UsersOutline, { fill: "var(--vkui--color_icon_secondary)" }));
                        break;
                    case 'business':
                        leftIcon = (React.createElement(Icon20WorkOutline, { fill: "var(--vkui--color_icon_secondary)" }));
                        break;
                    case 'unread':
                        leftIcon = (React.createElement(Icon20MessageUnreadTopOutline, { fill: "var(--vkui--color_icon_secondary)" }));
                        break;
                    default:
                        leftIcon = (React.createElement(Icon20FolderSimpleOutline, { fill: "var(--vkui--color_icon_secondary)" }));
                }
                return (React.createElement(ActionsMenuAction, { className: "ConvoListItemActionsMenu__folderAction", titleClassName: "ConvoListItemActionsMenu__folderActionTitle", key: folder.id, disabled: Folder.isConvoInSublist(folder, organisers.sublists, convo), onClick: onFolderActionClick(folder.peerIds.has(convo.peerId)
                        ? 'remove_from_folder'
                        : 'add_to_folder', folder), title: folder.name, "aria-label": folder.name, type: "primary", leftIcon: leftIcon, rightIcon: React.createElement(Icon20Check, { visibility: folder.peerIds.has(convo.peerId) ||
                            Folder.isConvoInSublist(folder, organisers.sublists, convo)
                            ? 'visible'
                            : 'hidden' }) }));
            })),
            React.createElement(ActionsMenuAction, { onClick: () => handleCreateNewFolder(convo.peerId), title: lang.use('me_convo_action_folder_create'), leftIcon: React.createElement(Icon20FolderSimplePlusOutline, null), "aria-label": lang.use('me_convo_action_folder_create'), type: "secondary" }))),
        vkm_delete_chat && isChatAdmin && (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('delete'), title: lang.use('me_convo_action_delete_chat'), "aria-label": lang.use('me_convo_action_delete_chat'), leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger" })),
        clearHistoryAction,
        !ownerIsGroup && convo.kind === 'ChatConvo' && convo.state === 'in' && (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('leave'), title: lang.use('me_convo_action_leave'), "aria-label": lang.use('me_convo_action_leave'), leftIcon: React.createElement(Icon20DoorArrowRightOutline, null), type: "danger" })),
        convo.kind === 'ChatConvo' &&
            convo.state === 'left' &&
            (convo.canWrite.allowed ||
                convo.canWrite.reason === 'forbid_writing_for_all' ||
                convo.canWrite.reason === 'restricted_to_write_in_chat') && (React.createElement(ActionsMenuAction, { onClick: onDefaultActionClick('return_to_chat'), title: lang.use('me_return_to_group_chat'), "aria-label": lang.use('me_return_to_group_chat'), leftIcon: React.createElement(Icon20ArrowUturnLeftOutline, null), type: "secondary" }))));
};
/**
 * Отдельный компонент, чтобы не добавлять подписку на кэш пиров
 * для всех остальных типов чатов, кроме БУ.
 */
const BusinessNotifyConvoActions = ({ convo, onAction, muteUnmuteAction, clearHistoryAction }) => {
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const convoOwner = usePeer(convo.ownerId, false);
    const onBusinessNotifyActionClick = (userAction) => () => {
        if (convo.kind === 'BusinessNotify' && convo.ownerId !== undefined) {
            if (userAction === 'business_notify_enable') {
                dispatch({
                    type: 'UserChangedBusinessNotify',
                    userAction,
                    peerId: convo.ownerId,
                });
            }
            onAction?.(userAction, convo);
        }
    };
    return (React.createElement(ActionsMenu, null,
        convoOwner?.kind === 'Group' &&
            !convoOwner.isBusinessBlacklistedByMe &&
            muteUnmuteAction,
        convoOwner?.kind === 'Group' && convoOwner.isBusinessBlacklistedByMe && (React.createElement(ActionsMenuAction, { onClick: onBusinessNotifyActionClick('business_notify_enable'), title: lang.use('me_convo_action_business_notify_enable'), "aria-label": lang.use('me_convo_action_business_notify_enable'), leftIcon: React.createElement(Icon20NotificationOutline, null), type: "secondary" })),
        clearHistoryAction,
        convoOwner?.kind === 'Group' &&
            !convoOwner.isBusinessBlacklistedByMe && (React.createElement(ActionsMenuAction, { onClick: onBusinessNotifyActionClick('business_notify_disable'), title: lang.use('me_convo_action_business_notify_disable'), "aria-label": lang.use('me_convo_action_business_notify_disable'), leftIcon: React.createElement(Icon20BlockOutline, null), type: "danger", key: "business_notify_disable" }))));
};
//# sourceMappingURL=ConvoListItemActionsMenu.js.map