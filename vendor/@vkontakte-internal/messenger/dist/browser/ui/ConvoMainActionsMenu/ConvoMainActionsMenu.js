import '../../ui/ConvoMainActionsMenu/ConvoMainActionsMenu.css';
import React, { useMemo } from 'react';
import { useFeatureFlags, useViewer, useOwner, usePeers, useCommunityMessagingWithToggle, useGroupBannedUser, useOrganisers, useUserDetails, } from '../../hooks/misc';
import { useBrowserEnv } from '../../hooks/misc';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import * as Convo from '../../../core/model/Convo';
import * as Peer from '../../../core/model/Peer';
import * as Viewer from '../../../core/model/Viewer';
import * as ChatMembers from '../../../core/model/ChatMembers';
import { Icon20ArchiveOutline, Icon20ArrowUturnLeftOutline, Icon20Attach, Icon20BlockOutline, Icon20DoorArrowRightOutline, Icon20ClearDataOutline, Icon20HideOutline, Icon20MessageAddOutline, Icon20PhoneDownOutline, Icon20MessageCheckOutline, Icon20MessagesOutline, Icon20MessageUnreadTopOutline, Icon20NotificationOutline, Icon20NotificationSlashOutline, Icon20PinOutline, Icon20PinSlashOutline, Icon20RemoveCircleOutline, Icon20UnarchiveOutline, Icon20UserAddOutline, Icon20ViewOutline, Icon20DeleteOutline, Icon20PopUpStickerOutline, Icon20FavoriteOutline, Icon20MarkerOutline, Icon16CheckDoubleOutline, } from '@vkontakte/icons';
export const ConvoMainActionsMenu = ({ convo, isPinnedMessageHiddenLocally, onAction, }) => {
    const owner = useOwner();
    const { settings: { isStickersAnimationEnabled, isPopupStickersAutoplaySettingEnabled, }, } = useViewer();
    const ownerId = owner.id;
    const ownerIsGroup = owner.kind === 'Group';
    const peers = usePeers();
    const peer = Peer.safeGet(peers, convo.peerId);
    const businessNotifyOwner = convo.kind === 'BusinessNotify' && convo.ownerId !== undefined
        ? Peer.safeGet(peers, convo.ownerId)
        : null;
    const { lang, envFeatureFlags } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    const organisers = useOrganisers();
    const isCommunityMessaging = useCommunityMessagingWithToggle();
    const canBan = useUserDetails(peer.id)?.can_ban;
    const bannedInfo = useGroupBannedUser(peer);
    const { profileType } = useViewer();
    const isEdu = Viewer.isEdu(profileType);
    const isOwnerUserOrCommunityMessaging = !ownerIsGroup || (!isEdu && envFeatureFlags.isCommunityMessagingEnabled);
    let actionGroups = [];
    const clearHistoryAction = !Convo.isEmpty(convo) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('clear'), title: lang.use('me_convo_action_clear'), leftIcon: React.createElement(Icon20ClearDataOutline, null), type: "danger", key: "clear" }));
    const toggleStickersPopupAnimationAction = useMemo(() => {
        const key = 'stickersPopupAnimation';
        if (!isStickersAnimationEnabled) {
            return (React.createElement(ActionsMenuAction, { disabled: true, title: lang.use('me_convo_action_disabled_all_stickers_animation'), titleClassName: "StickersPopupAction", leftIcon: React.createElement(Icon20PopUpStickerOutline, null), type: "secondary", key: key }));
        }
        if (convo.isStickersPopupAutoplayDisabledByAdmin) {
            return (React.createElement(ActionsMenuAction, { disabled: true, title: lang.use('me_convo_action_disabled_autoplay_stickers_popup_by_admin'), titleClassName: "StickersPopupAction", leftIcon: React.createElement(Icon20PopUpStickerOutline, null), type: "secondary", key: key }));
        }
        if (convo.isStickersPopupAutoplayDisabledByUser) {
            return (React.createElement(ActionsMenuAction, { onClick: () => onAction('on_stickers_popup_animation'), title: lang.use('me_convo_action_turn_on_stickers_popup_autoplay'), titleClassName: "StickersPopupAction", leftIcon: React.createElement(Icon20PopUpStickerOutline, null), type: "secondary", key: key }));
        }
        return (React.createElement(ActionsMenuAction, { onClick: () => onAction('off_stickers_popup_animation'), title: lang.use('me_convo_action_turn_off_stickers_popup_autoplay'), titleClassName: "StickersPopupAction", leftIcon: React.createElement(Icon20PopUpStickerOutline, null), type: "secondary", key: key }));
    }, [
        lang,
        convo.isStickersPopupAutoplayDisabledByAdmin,
        convo.isStickersPopupAutoplayDisabledByUser,
        isStickersAnimationEnabled,
        onAction,
    ]);
    const muteUnmuteAction = convo.kind !== 'ContactConvo' &&
        (Convo.isMuted(convo) ? (React.createElement(ActionsMenuAction, { onClick: () => onAction('unmute'), title: lang.use('me_convo_action_unmute'), leftIcon: React.createElement(Icon20NotificationOutline, null), type: "secondary", key: "unmute" })) : (React.createElement(ActionsMenuAction, { onClick: () => onAction('mute'), title: lang.use('me_convo_action_mute'), leftIcon: React.createElement(Icon20NotificationSlashOutline, null), type: "secondary", key: "mute" })));
    switch (convo.kind) {
        case 'BusinessNotify':
            actionGroups = [
                [
                    businessNotifyOwner?.kind === 'Group' &&
                        !businessNotifyOwner.isBusinessBlacklistedByMe &&
                        muteUnmuteAction,
                ],
                [
                    businessNotifyOwner?.kind === 'Group' &&
                        businessNotifyOwner.isBusinessBlacklistedByMe && (React.createElement(ActionsMenuAction, { onClick: () => onAction('business_notify_enable'), title: lang.use('me_convo_action_business_notify_enable'), leftIcon: React.createElement(Icon20NotificationOutline, null), type: "secondary", key: "business_notify_enable" })),
                ],
                [
                    clearHistoryAction,
                    businessNotifyOwner?.kind === 'Group' &&
                        !businessNotifyOwner.isBusinessBlacklistedByMe && (React.createElement(ActionsMenuAction, { onClick: () => onAction('business_notify_disable'), title: lang.use('me_convo_action_business_notify_disable'), leftIcon: React.createElement(Icon20BlockOutline, null), type: "danger", key: "business_notify_disable" })),
                ],
            ];
            break;
        default: {
            actionGroups = [
                [
                    ...(!Convo.isEmpty(convo) &&
                        !ownerIsGroup &&
                        !Convo.isMR(convo) &&
                        !Peer.isFavorites(peer.id, ownerId) &&
                        !Peer.isVkAdministration(convo.peerId) &&
                        !Convo.isPromo(convo)
                        ? [
                            Convo.hasPeerFlag(convo, Convo.PEER_FLAGS.isArchived) ? (React.createElement(ActionsMenuAction, { onClick: () => onAction('unarchive'), title: lang.use('me_convo_action_unarchive'), leftIcon: React.createElement(Icon20UnarchiveOutline, null), type: "secondary", key: "unarchive" })) : (React.createElement(ActionsMenuAction, { onClick: () => onAction('archive'), title: lang.use('me_convo_action_archive'), leftIcon: React.createElement(Icon20ArchiveOutline, null), type: "secondary", key: "archive" })),
                        ]
                        : []),
                    ...(isCommunityMessaging &&
                        !organisers.tags.isUnavailable &&
                        Peer.isUserPeerId(convo.peerId)
                        ? [
                            React.createElement(ActionsMenuAction, { key: "configure_tags", "aria-label": lang.use('me_convo_action_configure_tags'), onClick: () => onAction('configure_tags'), title: lang.use('me_convo_action_configure_tags'), leftIcon: React.createElement(Icon20MarkerOutline, null), type: "secondary" }),
                        ]
                        : []),
                    !Convo.isEmpty(convo) &&
                        (Convo.isUnread(convo) ? (React.createElement(ActionsMenuAction, { onClick: () => onAction('mark_read'), title: lang.use('me_convo_action_mark_read'), leftIcon: React.createElement(Icon20MessageCheckOutline, null), type: "secondary", key: "mark_read" })) : (React.createElement(ActionsMenuAction, { onClick: () => onAction('mark_unread'), title: lang.use('me_convo_action_mark_unread'), leftIcon: React.createElement(Icon20MessageUnreadTopOutline, null), type: "secondary", key: "mark_unread" }))),
                    isCommunityMessaging &&
                        (Convo.isImportant(convo) ? (React.createElement(ActionsMenuAction, { onClick: () => onAction('mark_unimportant'), title: lang.use('me_convo_action_mark_unimportant'), "aria-label": lang.use('me_convo_action_mark_unimportant'), leftIcon: React.createElement(Icon20FavoriteOutline, null), type: "secondary", key: "mark_unimportant" })) : (React.createElement(ActionsMenuAction, { onClick: () => onAction('mark_important'), title: lang.use('me_convo_action_mark_important'), "aria-label": lang.use('me_convo_action_mark_important'), leftIcon: React.createElement(Icon20FavoriteOutline, null), type: "secondary", key: "mark_important" }))),
                    isCommunityMessaging && Convo.isUnanswered(convo) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('mark_answered'), title: lang.use('me_convo_action_mark_answered'), "aria-label": lang.use('me_convo_action_mark_answered'), leftIcon: React.createElement(Icon16CheckDoubleOutline, { width: 20, height: 20 }), type: "secondary", key: "mark_answered" })),
                    ...(Convo.canPin(convo, owner)
                        ? [
                            Convo.isPinned(convo) ? (React.createElement(ActionsMenuAction, { onClick: () => onAction('unpin'), title: lang.use('me_convo_action_unpin'), leftIcon: React.createElement(Icon20PinSlashOutline, null), type: "secondary", key: "unpin" })) : (React.createElement(ActionsMenuAction, { onClick: () => onAction('pin'), title: lang.use('me_convo_action_pin'), leftIcon: React.createElement(Icon20PinOutline, null), type: "secondary", key: "pin" })),
                        ]
                        : []),
                    peer.kind === 'User' &&
                        !peer.isBlacklistedByMe &&
                        !ownerIsGroup &&
                        peer.friendship === 'friends' && (React.createElement(ActionsMenuAction, { onClick: () => onAction('add_to_convo'), title: lang.use('me_add_to_chat'), leftIcon: React.createElement(Icon20MessageAddOutline, null), type: "secondary", key: "add_to_convo" })),
                    ((peer.kind === 'User' &&
                        !peer.isBlacklistedByMe &&
                        !ownerIsGroup &&
                        !Peer.isFavorites(peer.id, ownerId) &&
                        peer.canInviteToChats &&
                        peer.friendship !== 'friends') ||
                        peer.kind === 'Contact') && (React.createElement(ActionsMenuAction, { onClick: () => onAction('invite_to_convo'), title: lang.use('me_invite_to_chat'), leftIcon: React.createElement(Icon20MessageAddOutline, null), type: "secondary", key: "invite_to_convo" })),
                    Convo.canInviteTo(convo, owner) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('add_to_chat'), leftIcon: React.createElement(Icon20UserAddOutline, null), title: lang.use('me_convo_action_invite_users'), type: "secondary", key: "add_to_chat" })),
                    peer.kind === 'User' &&
                        !Peer.isFavorites(peer.id, ownerId) &&
                        !ownerIsGroup && (React.createElement(ActionsMenuAction, { onClick: () => onAction('open_shared_convos'), title: lang.use('me_convo_action_shared_convos'), leftIcon: React.createElement(Icon20MessagesOutline, null), type: "secondary", key: "open_shared_convos" })),
                    !Convo.isEmpty(convo) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('open_convo_attaches'), title: lang.use('me_convo_action_attach'), leftIcon: React.createElement(Icon20Attach, null), type: "secondary", key: "open_convo_attaches" })),
                    Convo.canCreateChatBasedOnCurrent(convo, ownerId) &&
                        !ownerIsGroup && (React.createElement(ActionsMenuAction, { onClick: () => onAction('create_chat_based_on_current'), title: lang.use('me_create_new_chat_based_on_current_chat'), leftIcon: React.createElement(Icon20MessageAddOutline, null), type: "secondary", key: "create_chat_based_on_current" })),
                    Convo.canFinishCall(convo) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('finish_call'), title: lang.use('me_convo_action_finish_call'), leftIcon: React.createElement(Icon20PhoneDownOutline, null), type: "secondary", key: "finish_call" })),
                ],
                [
                    convo.kind !== 'ContactConvo' &&
                        isOwnerUserOrCommunityMessaging &&
                        Convo.canChangeMute(convo) &&
                        muteUnmuteAction,
                ],
                [
                    featureFlags.vkm_stickers_popup &&
                        convo.kind !== 'ContactConvo' &&
                        (convo.kind === 'ChatConvo'
                            ? !convo.isGroupChannel && convo.state === 'in'
                            : true) &&
                        isPopupStickersAutoplaySettingEnabled &&
                        toggleStickersPopupAnimationAction,
                ],
                [
                    ...(convo.kind === 'ChatConvo' && convo.pinnedMessage
                        ? [
                            isPinnedMessageHiddenLocally ? (React.createElement(ActionsMenuAction, { onClick: () => onAction('show_pinned_message'), title: lang.use('me_convo_action_show_pinned_message'), leftIcon: React.createElement(Icon20ViewOutline, null), type: "secondary", key: "show_pinned_message" })) : (React.createElement(ActionsMenuAction, { onClick: () => onAction('hide_pinned_message'), title: lang.use('me_convo_action_hide_pinned_message'), leftIcon: React.createElement(Icon20HideOutline, null), type: "secondary", key: "hide_pinned_message" })),
                            convo.acl.canChangePin &&
                                (convo.canWrite.allowed ||
                                    convo.canWrite.reason === 'forbid_writing_for_all') && (React.createElement(ActionsMenuAction, { title: lang.use('me_convo_action_unpin_for_all'), onClick: () => onAction('unpin_message_for_all'), leftIcon: React.createElement(Icon20PinSlashOutline, null), type: "secondary", key: "me_convo_action_unpin_for_all" })),
                        ]
                        : []),
                ],
                [
                    featureFlags.vkm_delete_chat &&
                        Convo.canDelete(convo) &&
                        ChatMembers.isAdmin(convo.members, ownerId) &&
                        convo.ownerId === ownerId && (React.createElement(ActionsMenuAction, { onClick: () => onAction('delete_for_all'), title: lang.use('me_convo_action_delete_chat'), "aria-label": lang.use('me_convo_action_delete_chat'), leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger", key: "delete" })),
                    clearHistoryAction,
                    ...(convo.kind === 'UserConvo' &&
                        peer.kind === 'User' &&
                        (!ownerIsGroup || envFeatureFlags.isCommunityMessagingEnabled) &&
                        !Peer.isFavorites(peer.id, ownerId)
                        ? [
                            (peer.isBlacklistedByMe || !convo.canWrite.allowed) &&
                                ownerIsGroup &&
                                canBan &&
                                bannedInfo && (React.createElement(ActionsMenuAction, { onClick: () => onAction('ban'), title: lang.use('me_convo_action_tune_ban'), leftIcon: React.createElement(Icon20BlockOutline, null), type: "danger", key: "tune-ban" })),
                            (peer.isBlacklistedByMe ||
                                (ownerIsGroup && !convo.canWrite.allowed && bannedInfo)) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('unban'), title: lang.use('me_convo_action_unban_user'), leftIcon: React.createElement(Icon20RemoveCircleOutline, null), "aria-label": lang.use('me_convo_action_unban_user'), type: "secondary", key: "unban" })),
                            (ownerIsGroup
                                ? canBan &&
                                    !bannedInfo &&
                                    (!peer.isBlacklistedByMe || convo.canWrite.allowed)
                                : !peer.isBlacklistedByMe) && (React.createElement(ActionsMenuAction, { onClick: () => onAction('ban'), title: lang.use('me_convo_action_ban'), leftIcon: React.createElement(Icon20BlockOutline, null), type: "danger", key: "ban" })),
                        ]
                        : []),
                    ...(convo.kind === 'GroupConvo' &&
                        peer.kind === 'Group' &&
                        !Peer.isFavorites(peer.id, ownerId) &&
                        !Convo.isPromo(convo)
                        ? [
                            peer.isBlacklistedByMe ? (React.createElement(ActionsMenuAction, { onClick: () => onAction('unban'), title: lang.use('me_convo_action_unban_group'), leftIcon: React.createElement(Icon20RemoveCircleOutline, null), type: "secondary", key: "unban" })) : (React.createElement(ActionsMenuAction, { onClick: () => onAction('ban'), title: lang.use('me_convo_action_ban_group'), leftIcon: React.createElement(Icon20BlockOutline, null), type: "danger", key: "ban" })),
                        ]
                        : []),
                    convo.kind === 'ChatConvo' &&
                        convo.state === 'in' &&
                        !ownerIsGroup && (React.createElement(ActionsMenuAction, { onClick: () => onAction('leave'), title: lang.use('me_convo_action_leave'), leftIcon: React.createElement(Icon20DoorArrowRightOutline, null), type: "danger", key: "leave" })),
                    convo.kind === 'ChatConvo' &&
                        convo.state === 'left' &&
                        (convo.canWrite.allowed ||
                            convo.canWrite.reason === 'forbid_writing_for_all' ||
                            convo.canWrite.reason === 'restricted_to_write_in_chat') && (React.createElement(ActionsMenuAction, { onClick: () => onAction('return_to_chat'), title: lang.use('me_return_to_group_chat'), leftIcon: React.createElement(Icon20ArrowUturnLeftOutline, null), type: "secondary", key: "return_to_chat" })),
                ],
            ];
            break;
        }
    }
    const actionsMenuItems = actionGroups.filter((group) => group.filter(Boolean).length);
    return (React.createElement(ActionsMenu, { className: "ConvoMainActionsMenu", id: "convo-more-menu", "aria-labelledby": "convo-more-menu-trigger" }, actionsMenuItems));
};
//# sourceMappingURL=ConvoMainActionsMenu.js.map