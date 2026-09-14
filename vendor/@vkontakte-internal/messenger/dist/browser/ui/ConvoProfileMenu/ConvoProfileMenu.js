import React, { useCallback, useMemo, useState } from 'react';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as ChatMembers from '../../../core/model/ChatMembers';
import * as Viewer from '../../../core/model/Viewer';
import { useBrowserEnv, useCommunityMessagingWithToggle, useConvos, useDispatch, useFeatureFlags, useGroupBannedUser, useOwner, usePeers, useUserDetails, useViewer, } from '../../hooks/misc';
import { useModal } from '../../hooks/useModal';
import { Icon20ArchiveOutline, Icon20BlockOutline, Icon16CheckOutline, Icon20DeleteOutline, Icon20DoorArrowRightOutline, Icon20MessageAddOutline, Icon20MessageCheckOutline, Icon20MessageOutline, Icon20MessageUnreadTopOutline, Icon20More, Icon20NotificationOutline, Icon20NotificationSlashOutline, Icon20PhoneOutline, Icon20PinOutline, Icon20PinSlashOutline, Icon20RemoveCircleOutline, Icon20UnarchiveOutline, Icon20MessageCrossOutline, Icon20ClearDataOutline, Icon20MentionOutline, Icon16CheckDoubleOutline, Icon20FavoriteOutline, Icon24CheckCircleOutline, Icon20UnfavoriteOutline, Icon20ArrowUturnLeftOutline, } from '@vkontakte/icons';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Button } from '@vkontakte/vkui';
import '../../ui/ConvoProfileMenu/ConvoProfileMenu.css';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { useRouter } from '../../ui/Router/Router';
import { ActionsMenu, ActionsMenuAction, ActionsMenuDropdownAction, } from '../../ui/ActionsMenu/ActionsMenu';
import { Dropdown } from '../../ui/Dropdown/Dropdown';
import { ActionCell } from '../../ui/ActionCell/ActionCell';
import { UserChatInvite } from '../../ui/UserChatInvite/UserChatInvite';
import { Time } from '../../../core/utils/time';
import { useConvoClear } from '../../hooks/useConvoClear';
import { useConvoDelete } from '../../hooks/useConvoDelete';
import { Placeholder, RichAvatar } from '@vkontakte-internal/vkcom-kit';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { GroupUnbanUserModal } from '../../ui/GroupBanUserModal/GroupUnbanUserModal';
import { GroupBanUserModal } from '../../ui/GroupBanUserModal/GroupBanUserModal';
import { useConvoLeave } from '../../hooks/useConvoLeave';
/**
 * Компонент меню беседы в профиле беседы
 */
export const ConvoProfileMenu = ({ convo, modalGroupId, onOpenConvo, onCall, onClose, className, }) => {
    const featureFlags = useFeatureFlags();
    const owner = useOwner();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const peers = usePeers();
    const convos = useConvos();
    const peer = Peer.safeGet(peers, convo.peerId);
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const { lang, calls, envFeatureFlags } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const { screenRoute: route } = useRouter();
    const [showConvoInviteModal, setShowConvoInviteModal] = useState(false);
    const pinErrorModal = useModal(modalGroupId);
    const userBanConfirmationModal = useModal(modalGroupId);
    const groupBanUserConfirmationModal = useModal(modalGroupId);
    const groupUnbanUserConfirmationModal = useModal(modalGroupId);
    const blockGroupConfirmationModal = useModal(modalGroupId);
    const userUnbanConfirmationModal = useModal(modalGroupId);
    const { ConvoLeaveConfirmModal, handleConvoLeaveAction } = useConvoLeave({
        modalGroupId,
        cb: onClose,
    });
    const { ConvoClearConfirmModal, handleConvoClearAction } = useConvoClear();
    const { ConvoDeleteConfirmModal, handleConvoDeleteAction } = useConvoDelete();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const canBan = useUserDetails(peer.id)?.can_ban;
    const bannedInfo = useGroupBannedUser(peer);
    const isFavorites = Peer.isFavorites(peer.id, owner.id);
    const isOwnerAdmin = convo.kind === 'ChatConvo' && ChatMembers.isAdmin(convo.members, owner.id);
    const openUserBanConfirmation = useCallback(() => {
        owner.kind === 'Group'
            ? groupBanUserConfirmationModal.open()
            : userBanConfirmationModal.open();
    }, [userBanConfirmationModal, owner.kind, groupBanUserConfirmationModal]);
    const openUserUnbanConfirmation = useCallback(() => {
        owner.kind === 'Group'
            ? groupUnbanUserConfirmationModal.open()
            : userUnbanConfirmationModal.open();
    }, [userUnbanConfirmationModal, owner.kind, groupUnbanUserConfirmationModal]);
    const openBlockGroupConfirmation = useCallback(() => {
        blockGroupConfirmationModal.open();
    }, [blockGroupConfirmationModal]);
    const handleConvoAction = useCallback((action) => {
        if (action === 'archive' || action === 'unarchive') {
            dispatch({
                type: 'UserChangedConvo',
                peerId: peer.id,
                userAction: action,
                uiCallback: (isSuccess) => {
                    if (isSuccess) {
                        snackbar({
                            message: action === 'archive'
                                ? lang.use('me_chat_moved_in_archive')
                                : lang.use('me_chat_returned_from_archive'),
                            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
                            action: lang.use('me_cancel'),
                            onActionClick: () => {
                                dispatch({
                                    type: 'UserChangedConvo',
                                    peerId: peer.id,
                                    userAction: action === 'archive' ? 'unarchive' : 'archive',
                                });
                            },
                        });
                    }
                },
            });
        }
        else if (action === 'return_to_chat') {
            dispatch({
                type: 'UserChangedConvo',
                peerId: peer.id,
                userAction: action,
            });
        }
        else {
            dispatch({
                type: 'UserChangedConvo',
                peerId: peer.id,
                userAction: action,
            });
        }
    }, [dispatch, peer, snackbar, lang]);
    const onPinConvo = useCallback(() => {
        const canPinMore = [...convos.values()].filter(Convo.isPinned).length < Convo.MAX_PINNED;
        if (canPinMore) {
            handleConvoAction('pin');
        }
        else {
            pinErrorModal.open();
        }
    }, [handleConvoAction, convos, pinErrorModal]);
    const handleUnblockGroup = useCallback(() => {
        handleConvoAction('unban');
        snackbar({
            before: React.createElement(RichAvatar, { src: peer.photo?.photo50, size: 48 }),
            message: lang.use('me_group_unblocked_snackbar', {
                values: { group: Peer.name(peer) },
            }),
        });
    }, [handleConvoAction, snackbar, lang, peer]);
    const banUser = () => {
        dispatch({
            type: 'UserChangedConvo',
            peerId: peer.id,
            userAction: 'ban',
        });
    };
    const groupBanUser = (banInfo) => {
        dispatch({
            type: 'GroupBanUser',
            peerId: peer.id,
            userAction: 'ban',
            banInfo,
        });
    };
    const unbanUser = () => {
        dispatch({
            type: 'UserChangedConvo',
            peerId: peer.id,
            userAction: 'unban',
        });
    };
    const onUserBanConfirmation = () => {
        banUser();
        if (userBanConfirmationModal.isActive) {
            userBanConfirmationModal.close();
        }
    };
    const onGroupBanUserConfirmation = (banInfo) => {
        groupBanUser(banInfo);
        if (groupBanUserConfirmationModal.isActive) {
            groupBanUserConfirmationModal.close();
        }
    };
    const onBlockGroupConfirmation = () => {
        handleConvoAction('ban');
        if (blockGroupConfirmationModal.isActive) {
            blockGroupConfirmationModal.close();
        }
    };
    const onUserUnbanConfirmation = () => {
        unbanUser();
        if (userUnbanConfirmationModal.isActive) {
            userUnbanConfirmationModal.close();
        }
        if (groupUnbanUserConfirmationModal.isActive) {
            groupUnbanUserConfirmationModal.close();
        }
    };
    const onConvoInvite = useCallback(() => {
        setShowConvoInviteModal(true);
    }, [setShowConvoInviteModal]);
    const handleMuteChange = useCallback((setting) => {
        dispatch({
            type: 'UserChangedMute',
            peerId: convo.peerId,
            userAction: typeof setting === 'number' ? 'mute_until' : setting,
            timer: typeof setting === 'number' ? setting / 1000 : 0,
        });
    }, [convo.peerId, dispatch]);
    const handleMuteChatMentionsChange = useCallback((userAction) => {
        dispatch({
            type: 'UserChangedMuteChatMentions',
            peerId: convo.peerId,
            userAction,
        });
    }, [convo.peerId, dispatch]);
    const isEnabledNotifications = convo.push.disabledUntil === 0;
    const handleForbidWritingAllChange = useCallback((userAction, duration) => {
        dispatch({
            type: 'UserChangeForbidWritingAll',
            peerId: convo.peerId,
            userAction,
            duration: duration || Infinity,
        });
    }, [convo.peerId, dispatch]);
    const isForbidedWritingForAll = Convo.isForbidedWritingForAll(convo);
    const startCallButton = useMemo(() => {
        return (React.createElement(ActionCell, { key: "start_call", "aria-label": lang.use('me_aria_convo_profile_start_call_new'), icon: React.createElement(Icon20PhoneOutline, null), className: "ConvoProfileActions__action", onClick: () => onCall?.(convo.peerId, 'profile') }, lang.use('me_convo_profile_start_call_new')));
    }, [convo.peerId, lang, onCall]);
    const startCallAction = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { key: "start_call", "aria-label": lang.use('me_aria_convo_profile_start_call_new'), leftIcon: React.createElement(Icon20PhoneOutline, null), title: lang.use('me_convo_profile_start_call_new'), onClick: () => onCall?.(convo.peerId, 'profile') }));
    }, [convo.peerId, lang, onCall]);
    const archiveButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ArchiveOutline, null), "aria-label": lang.use('me_aria_convo_action_archive'), title: lang.use('me_convo_action_archive'), onClick: () => handleConvoAction('archive'), key: "archive" }));
    }, [handleConvoAction, lang]);
    const unarchiveButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20UnarchiveOutline, null), "aria-label": lang.use('me_aria_convo_action_unarchive'), title: lang.use('me_convo_action_unarchive'), onClick: () => handleConvoAction('unarchive'), key: "unarchive" }));
    }, [handleConvoAction, lang]);
    const convoPushMode = convo.push.mode;
    const muteMentions = useMemo(() => {
        const isAllMentionsAllowed = convoPushMode === 'every-mention' || convoPushMode === 'everything';
        const isMassMentionsForbidden = convoPushMode === 'direct-mention';
        const allMentionsForbidden = convoPushMode === 'nothing';
        return (React.createElement(ActionsMenuDropdownAction, { title: lang.use('me_mute_mentions_actions_menu'), enableFocusTrap: true, "aria-haspopup": "menu", "aria-label": lang.use('me_aria_mute_mentions_actions_menu'), icon: React.createElement(Icon20MentionOutline, null), key: "mute_mentions" },
            React.createElement(ActionsMenuAction, { rightIcon: isAllMentionsAllowed && (React.createElement(Icon16CheckOutline, { color: "var(--vkui--color_icon_accent)" })), title: lang.use('me_mute_mentions_allow_all_action'), "aria-label": lang.use('me_aria_mute_mentions_allow_all_action'), onClick: () => handleMuteChatMentionsChange('enable_mentions') }),
            React.createElement(ActionsMenuAction, { rightIcon: isMassMentionsForbidden && (React.createElement(Icon16CheckOutline, { color: "var(--vkui--color_icon_accent)" })), title: lang.use('me_mute_mentions_disable_all_and_online_mentions_action'), "aria-label": lang.use('me_aria_mute_mentions_disable_all_and_online_mentions_action'), onClick: () => handleMuteChatMentionsChange('disable_all_and_online_mentions') }),
            React.createElement(ActionsMenuAction, { rightIcon: allMentionsForbidden && React.createElement(Icon16CheckOutline, null), title: lang.use('me_mute_mentions_disable_any_mentions_action'), "aria-label": lang.use('me_aria_mute_mentions_disable_any_mentions_action'), onClick: () => handleMuteChatMentionsChange('disable_mentions'), type: "danger" })));
    }, [convoPushMode, handleMuteChatMentionsChange, lang]);
    const markAsReadButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20MessageCheckOutline, null), "aria-label": lang.use('me_aria_convo_action_mark_read'), title: lang.use('me_convo_action_mark_read'), onClick: () => handleConvoAction('mark_read'), key: "mark_read" }));
    }, [handleConvoAction, lang]);
    const markAsUnread = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20MessageUnreadTopOutline, null), "aria-label": lang.use('me_aria_convo_action_mark_unread'), title: lang.use('me_convo_action_mark_unread'), onClick: () => handleConvoAction('mark_unread'), key: "mark_unread" }));
    }, [handleConvoAction, lang]);
    const markAnswered = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon16CheckDoubleOutline, { width: 20, height: 20 }), "aria-label": lang.use('me_convo_action_mark_answered'), title: lang.use('me_convo_action_mark_answered'), onClick: () => handleConvoAction('mark_answered'), key: "mark_answered" }));
    }, [handleConvoAction, lang]);
    const markUnimportant = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_profile_menu_action_mark_unimportant'), "aria-label": lang.use('me_convo_action_mark_unimportant'), leftIcon: React.createElement(Icon20UnfavoriteOutline, null), onClick: () => handleConvoAction('mark_unimportant'), key: "mark_unimportant" }));
    }, [handleConvoAction, lang]);
    const markImportant = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_profile_menu_action_mark_important'), "aria-label": lang.use('me_convo_action_mark_important'), leftIcon: React.createElement(Icon20FavoriteOutline, null), onClick: () => handleConvoAction('mark_important'), key: "mark_important" }));
    }, [handleConvoAction, lang]);
    const openConvoButton = useMemo(() => {
        return (React.createElement(ActionCell, { key: "open_convo", icon: React.createElement(Icon20MessageOutline, null), className: "ConvoProfileActions__action", "aria-label": lang.use('me_aria_convo_profile_open_convo_new'), onClick: () => onOpenConvo({ peerId: convo.peerId, entrypoint: 'profile_page' }) }, lang.use('me_convo_profile_open_convo_new')));
    }, [convo.peerId, lang, onOpenConvo]);
    const notificationsButton = useMemo(() => {
        return isEnabledNotifications ? (React.createElement(Dropdown, { enableFocusTrap: true, key: "notification_setting", openType: "click", adaptive: true, hideOnClick: true, content: React.createElement(ActionsMenu, { id: "notification_settings" },
                React.createElement(ActionsMenuAction, { title: lang.use('me_notifications_mute_hours', {
                        num: 1,
                    }), onClick: () => handleMuteChange(Time.Hour), key: "notification_setting_hour" }),
                React.createElement(ActionsMenuAction, { title: lang.use('me_notifications_mute_hours', {
                        num: 8,
                    }), onClick: () => handleMuteChange(Time.Hour * 8), key: "notification_setting_8_hours" }),
                React.createElement(ActionsMenuAction, { title: lang.use('me_notifications_mute_days', { num: 1 }), onClick: () => handleMuteChange(Time.Day), key: "notification_setting_day" }),
                React.createElement(ActionsMenuAction, { title: lang.use('me_notifications_mute_weeks', {
                        num: 1,
                    }), onClick: () => handleMuteChange(Time.Week), key: "notification_setting_week" }),
                React.createElement(ActionsMenuAction, { title: lang.use('me_notifications_mute_forever'), onClick: () => handleMuteChange('mute'), key: "notification_setting_mute", type: "danger" })), align: "right", position: "top", classNames: {
                wrapper: 'ConvoProfileActions__menu',
                trigger: 'ConvoProfileActions__trigger',
                contentWrapper: 'ConvoProfileActions__menuContent',
            } }, (isOpened) => (React.createElement(ActionCell, { "aria-label": lang.use('me_aria_notifications_enabled'), "aria-controls": "notification_settings", "aria-haspopup": "menu", "aria-expanded": isOpened, icon: React.createElement(Icon20NotificationOutline, null), className: "ConvoProfileActions__action" }, lang.use('me_notifications_enabled'))))) : (React.createElement(ActionCell, { key: "notification_setting", "aria-label": lang.use('me_aria_notifications_disabled'), icon: React.createElement(Icon20NotificationSlashOutline, null), className: "ConvoProfileActions__action", onClick: () => handleMuteChange('unmute') }, lang.use('me_notifications_disabled')));
    }, [handleMuteChange, isEnabledNotifications, lang]);
    const unpinButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20PinSlashOutline, null), "aria-label": lang.use('me_aria_convo_action_unpin'), title: lang.use('me_convo_action_unpin'), onClick: () => handleConvoAction('unpin'), key: "unpin" }));
    }, [handleConvoAction, lang]);
    const pinButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20PinOutline, null), "aria-label": lang.use('me_aria_convo_action_pin'), title: lang.use('me_convo_action_pin'), onClick: onPinConvo, key: "pin" }));
    }, [lang, onPinConvo]);
    const forbidWritingButton = useMemo(() => {
        return isForbidedWritingForAll ? (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20MessageCheckOutline, null), title: lang.use('me_convo_profile_allow_writing_all'), "aria-label": lang.use('me_aria_convo_profile_allow_writing_all'), onClick: () => handleForbidWritingAllChange('allow_writing_all'), key: "forbid_writing_all" })) : (React.createElement(ActionsMenuDropdownAction, { enableFocusTrap: true, title: lang.use('me_convo_profile_forbid_writing_all'), "aria-haspopup": "menu", "aria-label": lang.use('me_aria_convo_profile_forbid_writing_all'), "aria-controls": "forbid_writing_all", icon: React.createElement(Icon20MessageCrossOutline, null), key: "forbid_writing_all" },
            React.createElement(ActionsMenuAction, { title: lang.use('me_convo_profile_forbid_writing_hours', {
                    num: 1,
                }), onClick: () => handleForbidWritingAllChange('forbid_writing_all_until', Time.Hour), key: "forbid_writing_hour" }),
            React.createElement(ActionsMenuAction, { title: lang.use('me_convo_profile_forbid_writing_hours', {
                    num: 8,
                }), onClick: () => handleForbidWritingAllChange('forbid_writing_all_until', Time.Hour * 8), key: "forbid_writing_8_hours" }),
            React.createElement(ActionsMenuAction, { title: lang.use('me_convo_profile_forbid_writing_hours', {
                    num: 24,
                }), onClick: () => handleForbidWritingAllChange('forbid_writing_all_until', Time.Day), key: "forbid_writing_day" }),
            React.createElement(ActionsMenuAction, { title: lang.use('me_convo_profile_forbid_writing_forever'), onClick: () => handleForbidWritingAllChange('forbid_writing_all'), key: "forbid_writing_forever" })));
    }, [handleForbidWritingAllChange, isForbidedWritingForAll, lang]);
    const deleteChatButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DeleteOutline, null), title: lang.use('me_convo_action_delete_chat'), "aria-label": lang.use('me_aria_convo_action_delete_chat'), onClick: () => handleConvoDeleteAction(convo.peerId), key: "delete_chat", type: "danger" }));
    }, [convo.peerId, handleConvoDeleteAction, lang]);
    const clearButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ClearDataOutline, null), title: lang.use('me_convo_profile_clear'), onClick: () => handleConvoClearAction(convo), "aria-label": lang.use('me_aria_convo_profile_clear'), key: "clear", type: "danger" }));
    }, [convo, handleConvoClearAction, lang]);
    const leaveChatButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DoorArrowRightOutline, null), title: lang.use('me_convo_profile_leave_chat'), "aria-label": lang.use('me_aria_convo_profile_leave_chat'), onClick: () => handleConvoLeaveAction(convo.peerId), key: "leave_chat", type: "danger" }));
    }, [handleConvoLeaveAction, lang, convo.peerId]);
    const returnToChatButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { onClick: () => handleConvoAction('return_to_chat'), title: lang.use('me_return_to_group_chat'), leftIcon: React.createElement(Icon20ArrowUturnLeftOutline, null), type: "secondary", key: "return_to_chat", "aria-label": lang.use('me_return_to_group_chat') }));
    }, [handleConvoAction, lang]);
    const addOrInviteToChatButton = useMemo(() => {
        const isFriend = peer.kind === 'User' && peer.friendship === 'friends';
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20MessageAddOutline, null), title: lang.use(isFriend ? 'me_add_to_chat' : 'me_invite_to_chat'), "aria-label": lang.use(isFriend ? 'me_aria_add_to_chat' : 'me_aria_invite_to_chat'), onClick: onConvoInvite, key: "invite_to_chat" }));
    }, [lang, onConvoInvite, peer]);
    const unbanUserButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20RemoveCircleOutline, null), title: lang.use('me_convo_action_unban_user'), onClick: openUserUnbanConfirmation, "aria-label": lang.use('me_convo_action_unban_user'), key: "unban_user", type: "secondary" }));
    }, [lang, openUserUnbanConfirmation]);
    const banUserButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20BlockOutline, null), title: lang.use('me_convo_action_ban'), onClick: openUserBanConfirmation, key: "ban_user", "aria-label": lang.use('me_aria_convo_action_ban'), type: "danger" }));
    }, [lang, openUserBanConfirmation]);
    const tuneBanUserButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20BlockOutline, null), title: lang.use('me_convo_action_tune_ban'), onClick: openUserBanConfirmation, key: "tune_ban", "aria-label": lang.use('me_convo_action_tune_ban'), type: "danger" }));
    }, [lang, openUserBanConfirmation]);
    const unblockGroupMessagesButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20RemoveCircleOutline, null), title: lang.use('me_convo_profile_unblock_messages'), onClick: handleUnblockGroup, key: "unblock_messages", "aria-label": lang.use('me_aria_convo_profile_unblock_messages') }));
    }, [handleUnblockGroup, lang]);
    const blockGroupMessagesButton = useMemo(() => {
        return (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20BlockOutline, null), title: lang.use('me_convo_profile_block_messages'), onClick: openBlockGroupConfirmation, key: "block_messages", type: "danger", "aria-label": lang.use('me_aria_convo_profile_block_messages') }));
    }, [openBlockGroupConfirmation, lang]);
    /**
     * Набор элементов меню в зависимости от типа пира
     */
    const items = useMemo(() => {
        const isOwnerUserOrCommunityMessaging = owner.kind !== 'Group' ||
            (!isEdu && envFeatureFlags.isCommunityMessagingEnabled);
        switch (peer.kind) {
            case 'Chat': {
                const moreActions = [];
                const actions = [];
                if (!isCommunityMessaging &&
                    onCall &&
                    !Peer.isFavorites(convo.peerId, owner.id) &&
                    calls &&
                    peer.canCall &&
                    (convo.canWrite.allowed ||
                        convo.canWrite.reason === 'forbid_writing_for_all')) {
                    if (isMobileLayout) {
                        moreActions.push(startCallAction);
                    }
                    else {
                        actions.push(startCallButton);
                    }
                }
                if (!Convo.isEmpty(convo) &&
                    !Convo.isMR(convo) &&
                    !Peer.isFavorites(convo.peerId, owner.id) &&
                    !Peer.isVkAdministration(convo.peerId) &&
                    !Convo.isBusinessNotify(convo) &&
                    owner.kind !== 'Group') {
                    moreActions.push(Convo.hasPeerFlag(convo, Convo.PEER_FLAGS.isArchived)
                        ? unarchiveButton
                        : archiveButton);
                }
                if (!Convo.isEmpty(convo)) {
                    moreActions.push(Convo.isUnread(convo) ? markAsReadButton : markAsUnread);
                }
                if (isCommunityMessaging) {
                    moreActions.push(Convo.isImportant(convo) ? markUnimportant : markImportant);
                    if (Convo.isUnanswered(convo)) {
                        moreActions.push(markAnswered);
                    }
                }
                if (route.kind !== 'ConvoRoute' || route.peerId !== convo.peerId) {
                    actions.push(openConvoButton);
                }
                const isInactiveChat = convo.kind === 'ChatConvo' && convo.state !== 'in';
                if (!isFavorites &&
                    !isInactiveChat &&
                    isOwnerUserOrCommunityMessaging &&
                    Convo.canChangeMute(convo)) {
                    actions.push(notificationsButton);
                }
                if (Convo.canPin(convo, owner)) {
                    moreActions.push(Convo.isPinned(convo) ? unpinButton : pinButton);
                }
                /**
                 * Не даем управлять возможностью запрещать сообщения в чате если чат был отключен сообществом
                 * @see ME-60589
                 */
                const canForbidWriting = isOwnerAdmin &&
                    !(convo.isCommunityChat &&
                        !convo.canWrite.allowed &&
                        convo.canWrite.reason === 'chat_disabled');
                if (featureFlags.vkm_convo_forbid_writing_all && canForbidWriting) {
                    moreActions.push(forbidWritingButton);
                }
                if (!isCommunityMessaging &&
                    !Convo.isBusinessNotify(convo) &&
                    Convo.canChangeMute(convo)) {
                    moreActions.push(muteMentions);
                }
                const moreActionsDanger = [];
                if (featureFlags.vkm_delete_chat &&
                    Convo.canDelete(convo) &&
                    ChatMembers.isAdmin(convo.members, owner.id) &&
                    owner.id === convo.ownerId) {
                    moreActionsDanger.push(deleteChatButton);
                }
                if (!Convo.isEmpty(convo)) {
                    moreActionsDanger.push(clearButton);
                }
                if (convo.kind === 'ChatConvo' &&
                    convo.state === 'in' &&
                    owner.kind !== 'Group') {
                    moreActionsDanger.push(leaveChatButton);
                }
                if (convo.kind === 'ChatConvo' &&
                    convo.state === 'left' &&
                    (convo.canWrite.allowed ||
                        convo.canWrite.reason === 'forbid_writing_for_all' ||
                        convo.canWrite.reason === 'restricted_to_write_in_chat')) {
                    moreActionsDanger.push(returnToChatButton);
                }
                moreActions.push(...moreActionsDanger);
                if (moreActions.length) {
                    actions.push(React.createElement(MoreAction, { actions: moreActions, key: "more-actions" }));
                }
                return actions;
            }
            case 'User': {
                const actions = [];
                const moreActions = [];
                if (peer.canMessage &&
                    (route.kind !== 'ConvoRoute' || route.peerId !== convo.peerId)) {
                    actions.push(openConvoButton);
                }
                if (!isCommunityMessaging &&
                    onCall &&
                    !Peer.isFavorites(convo.peerId, owner.id) &&
                    calls &&
                    (peer.canCall || featureFlags.vkm_ignore_user_can_call)) {
                    if (isMobileLayout) {
                        moreActions.push(startCallAction);
                    }
                    else {
                        actions.push(startCallButton);
                    }
                }
                if (isOwnerUserOrCommunityMessaging && Convo.canChangeMute(convo)) {
                    actions.push(notificationsButton);
                }
                if (!Convo.isEmpty(convo) &&
                    !Convo.isMR(convo) &&
                    !Peer.isFavorites(convo.peerId, owner.id) &&
                    !Peer.isVkAdministration(convo.peerId) &&
                    !Convo.isBusinessNotify(convo) &&
                    owner.kind !== 'Group') {
                    moreActions.push(Convo.hasPeerFlag(convo, Convo.PEER_FLAGS.isArchived)
                        ? unarchiveButton
                        : archiveButton);
                }
                if (!Convo.isEmpty(convo)) {
                    moreActions.push(Convo.isUnread(convo) ? markAsReadButton : markAsUnread);
                }
                if (isCommunityMessaging) {
                    moreActions.push(Convo.isImportant(convo) ? markUnimportant : markImportant);
                    if (Convo.isUnanswered(convo)) {
                        moreActions.push(markAnswered);
                    }
                }
                if (Convo.canPin(convo, owner)) {
                    moreActions.push(Convo.isPinned(convo) ? unpinButton : pinButton);
                }
                if (!peer.isDeactivated &&
                    !peer.isBlacklistedByMe &&
                    (convo.canWrite.allowed ||
                        !['no_conversation', 'peer_blacklisted'].includes(convo.canWrite.reason)) &&
                    owner.kind !== 'Group') {
                    moreActions.push(addOrInviteToChatButton);
                }
                const moreActionsDanger = [];
                if (!Convo.isEmpty(convo)) {
                    moreActionsDanger.push(clearButton);
                }
                if (owner.kind !== 'Group') {
                    if (peer.isBlacklistedByMe) {
                        moreActionsDanger.push(unbanUserButton);
                    }
                    else {
                        moreActionsDanger.push(banUserButton);
                    }
                }
                if (isCommunityMessaging) {
                    const isBanned = peer.isBlacklistedByMe || !convo.canWrite.allowed;
                    if (isBanned && canBan && bannedInfo) {
                        moreActionsDanger.push(tuneBanUserButton);
                    }
                    if (isBanned) {
                        moreActionsDanger.push(unbanUserButton);
                    }
                    if (!isBanned && canBan) {
                        moreActionsDanger.push(banUserButton);
                    }
                }
                moreActions.push(...moreActionsDanger);
                if (moreActions.length) {
                    actions.push(React.createElement(MoreAction, { actions: moreActions, key: "more-actions" }));
                }
                return actions;
            }
            case 'Contact': {
                const actions = [];
                if (Convo.canChangeMute(convo)) {
                    actions.push(notificationsButton);
                }
                return actions;
            }
            case 'Group': {
                const actions = [];
                const moreActions = [];
                if (owner.kind === 'Group'
                    ? owner.id !== peer.id && peer.canMessage
                    : peer.canMessage) {
                    actions.push(openConvoButton);
                }
                if (!Convo.isEmpty(convo) &&
                    !Convo.isMR(convo) &&
                    !Peer.isFavorites(convo.peerId, owner.id) &&
                    !Peer.isVkAdministration(convo.peerId) &&
                    !Convo.isBusinessNotify(convo) &&
                    owner.kind !== 'Group') {
                    moreActions.push(Convo.hasPeerFlag(convo, Convo.PEER_FLAGS.isArchived)
                        ? unarchiveButton
                        : archiveButton);
                }
                if (!Convo.isEmpty(convo)) {
                    moreActions.push(Convo.isUnread(convo) ? markAsReadButton : markAsUnread);
                }
                if (isOwnerUserOrCommunityMessaging && Convo.canChangeMute(convo)) {
                    actions.push(notificationsButton);
                }
                if (Convo.canPin(convo, owner)) {
                    moreActions.push(Convo.isPinned(convo) ? unpinButton : pinButton);
                }
                if (peer.isBlacklistedByMe) {
                    moreActions.push(unblockGroupMessagesButton);
                }
                const moreActionsDanger = [];
                if (!Convo.isEmpty(convo)) {
                    moreActionsDanger.push(clearButton);
                }
                if (!peer.isBlacklistedByMe) {
                    moreActionsDanger.push(blockGroupMessagesButton);
                }
                moreActions.push(...moreActionsDanger);
                if (moreActions.length) {
                    actions.push(React.createElement(MoreAction, { actions: moreActions, key: "more-actions" }));
                }
                return actions;
            }
            default:
                return [];
        }
    }, [
        addOrInviteToChatButton,
        archiveButton,
        banUserButton,
        blockGroupMessagesButton,
        calls,
        clearButton,
        convo,
        deleteChatButton,
        featureFlags.vkm_convo_forbid_writing_all,
        featureFlags.vkm_delete_chat,
        envFeatureFlags.isCommunityMessagingEnabled,
        featureFlags.vkm_ignore_user_can_call,
        isCommunityMessaging,
        isEdu,
        markAnswered,
        markImportant,
        markUnimportant,
        forbidWritingButton,
        isFavorites,
        isOwnerAdmin,
        isMobileLayout,
        leaveChatButton,
        markAsReadButton,
        markAsUnread,
        notificationsButton,
        onCall,
        openConvoButton,
        owner,
        peer,
        pinButton,
        muteMentions,
        route,
        startCallButton,
        startCallAction,
        unarchiveButton,
        unbanUserButton,
        tuneBanUserButton,
        canBan,
        unblockGroupMessagesButton,
        unpinButton,
        returnToChatButton,
        bannedInfo,
    ]);
    return (React.createElement("div", { className: className },
        React.createElement("div", { className: "ConvoProfileActions__actions" }, items),
        ConvoLeaveConfirmModal,
        userBanConfirmationModal.isActive && (React.createElement(ModalInterface, { onClose: userBanConfirmationModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_confirmation_title'), buttons: React.createElement(React.Fragment, null,
                React.createElement(Button, { mode: "secondary", onClick: userBanConfirmationModal.close }, lang.use('global_cancel')),
                React.createElement(Button, { onClick: onUserBanConfirmation }, lang.use('me_convo_ban_confirmation_modal_confirm'))) }, lang.use('me_convo_ban_confirmation_modal_text', {
            values: { fullname: Peer.name(peer) },
        }))),
        groupBanUserConfirmationModal.isActive &&
            peer.kind === 'User' &&
            owner.kind === 'Group' && (React.createElement(GroupBanUserModal, { onClose: groupBanUserConfirmationModal.close, onSubmit: onGroupBanUserConfirmation, peer: peer, owner: owner, canWriteToConvo: convo.canWrite.allowed })),
        groupUnbanUserConfirmationModal.isActive && (React.createElement(GroupUnbanUserModal, { onClose: groupUnbanUserConfirmationModal.close, onSubmit: onUserUnbanConfirmation, peer: peer })),
        blockGroupConfirmationModal.isActive && (React.createElement(ModalInterface, { onClose: blockGroupConfirmationModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig ConvoProfileMenu__blockGroupModalContext", title: lang.use('me_block_group_confirmation_modal_title'), buttons: React.createElement(React.Fragment, null,
                React.createElement(Button, { mode: "secondary", onClick: blockGroupConfirmationModal.close }, lang.use('global_cancel')),
                React.createElement(Button, { onClick: onBlockGroupConfirmation }, lang.use('me_block_group_confirmation_modal_confirm'))) },
            React.createElement(Placeholder, { noPadding: true }, lang.use('me_convo_block_group_confirmation_modal_text', {
                values: { group: Peer.name(peer) },
            })))),
        React.createElement(ModalInterface, { onClose: userUnbanConfirmationModal.close, closeLabel: lang.use('me_close'), contextClass: "MEConfig", title: lang.use('me_confirmation_title'), isHidden: !userUnbanConfirmationModal.isActive, buttons: React.createElement(React.Fragment, null,
                React.createElement(Button, { mode: "secondary", onClick: userUnbanConfirmationModal.close }, lang.use('global_cancel')),
                React.createElement(Button, { onClick: onUserUnbanConfirmation }, lang.use('me_convo_unban_confirmation_modal_confirm'))) }, lang.use('me_convo_unban_confirmation_modal_text', {
            values: { fullname: Peer.name(peer) },
        })),
        showConvoInviteModal &&
            (Peer.isUserPeerId(peer.id) || Peer.isContactPeerId(peer.id)) && (React.createElement(UserChatInvite, { onClose: () => setShowConvoInviteModal(false), peerId: peer.id, source: "screen" })),
        pinErrorModal.isActive && (React.createElement(ModalDialog, { title: lang.use('me_error_title'), content: lang.use('me_too_many_conversation_pinned_error'), closeLabel: lang.use('me_close'), onClose: pinErrorModal.close, buttons: React.createElement(Button, { onClick: pinErrorModal.close }, lang.use('me_close')) })),
        ConvoClearConfirmModal,
        ConvoDeleteConfirmModal));
};
function MoreAction(props) {
    const { lang } = useBrowserEnv();
    const actionsCount = props.actions.length;
    if (!actionsCount) {
        return null;
    }
    if (actionsCount === 1 && props.actions[0]) {
        const element = props.actions[0];
        const { type } = element;
        if (type === ActionsMenuDropdownAction) {
            const { key, props: { title, icon, children, ...restProps }, } = element;
            return (React.createElement(Dropdown, { openType: "click", enableFocusTrap: true, key: key, hideOnClick: true, content: React.createElement(ActionsMenu, { id: restProps['aria-controls'] }, children), align: "right", position: "top", classNames: {
                    wrapper: 'ConvoProfileActions__menu',
                    trigger: 'ConvoProfileActions__trigger',
                    contentWrapper: 'ConvoProfileActions__menuContent',
                } }, (isOpened) => (React.createElement(ActionCell, { "aria-expanded": isOpened, "aria-haspopup": "menu", "aria-controls": restProps['aria-controls'], icon: icon, className: "ConvoProfileActions__action" }, title))));
        }
        if (type === ActionsMenuAction) {
            const { key, props: { onClick, title, leftIcon, ...restProps }, } = element;
            return (React.createElement(ActionCell, { key: key, icon: leftIcon, "aria-label": restProps['aria-label'], className: "ConvoProfileActions__action", onClick: onClick }, title));
        }
        return null;
    }
    return (React.createElement(Dropdown, { enableFocusTrap: true, openType: "click", adaptive: true, hideOnClick: true, content: React.createElement(ActionsMenu, { id: "more-actions-menu" }, ...props.actions), align: "right", position: "bottom", classNames: {
            wrapper: 'ConvoProfileActions__menu',
            trigger: 'ConvoProfileActions__trigger',
            contentWrapper: 'ConvoProfileActions__menuContent',
        } }, (isOpened) => (React.createElement(ActionCell, { "aria-label": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043E\u043F\u0446\u0438\u0439", "aria-haspopup": "menu", "aria-expanded": isOpened, "aria-controls": "more-actions-menu", icon: React.createElement(Icon20More, null), className: "ConvoProfileActions__action" }, lang.use('me_convo_profile_actions_more')))));
}
//# sourceMappingURL=ConvoProfileMenu.js.map