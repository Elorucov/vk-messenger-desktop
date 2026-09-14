import React, { useMemo } from 'react';
import { ActionsMenu, ActionsMenuAction, ActionsMenuDropdownAction, ActionsMenuText, } from '../../ui/ActionsMenu/ActionsMenu';
import * as Message from '../../../core/model/Message';
import * as Convo from '../../../core/model/Convo';
import * as ChatMembers from '../../../core/model/ChatMembers';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useConvo, useDispatch, useFeatureFlags, useOwner, usePeers, } from '../../hooks/misc';
import { exhaustivenessCheck, isDev } from '../../../core/utils/misc';
import { isMessageCanBeSelected, } from '../../hooks/useSelectedMessages';
import { useComposerDraft } from '../../hooks/useComposerDraft';
import { Icon20CheckCircleOutline, Icon20DeleteOutline, Icon20FavoriteOutline, Icon20PinOutline, Icon20PinSlashOutline, Icon20ReplyOutline, Icon20ReportOutline, Icon20ShareOutline, Icon20Stars, Icon20UnfavoriteOutline, Icon20ViewOutline, Icon20WriteOutline, Icon20MessageCrossOutline, Icon20MessageCheckOutline, Icon20HelpOutline, } from '@vkontakte/icons';
import { CommonCopySelectionAction } from '../../ui/MessageActionsMenu/CommonCopySelectionAction';
import { CommonCopyMessageTextAction } from '../../ui/MessageActionsMenu/CommonCopyMessageTextAction';
import { useRestrictChatMemberToWrite } from '../../hooks/useRestrictChatMemberToWrite';
import { ForwardMenuList } from '../../ui/ForwardMenuList/ForwardMenuList';
import { useMessagesForward } from '../../hooks/useMessagesForward';
import { useRouter } from '../../ui/Router/Router';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import cx from 'classnames';
import { useNow } from '../../hooks/useNow';
export const NormalMessageActionsMenu = ({ peerId, message, viewersCount, viewers, normalMessageActions, openDeleteMessageModal, openMessageViewersModal, openConfirmPinMessageModal, openReactedPeersModal, onSelect, onMessageForward, onMessageReply, onOpenReport, className, isCompact, }) => {
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const draft = useComposerDraft(peerId);
    const { screenRoute, navigate } = useRouter();
    const peers = usePeers();
    const convo = useConvo(peerId);
    const now = useNow();
    const isEditing = draft.editing !== undefined;
    const isEditingCurrent = draft.editing?.peerId === message.peerId &&
        draft.editing?.cmid === message.cmid;
    const { lang } = useBrowserEnv();
    const forward = useMessagesForward({
        draft,
        peerId: message.peerId,
    });
    const { isMobileLayout } = useLayoutData();
    const openConvo = ({ peerId, entrypoint }) => {
        navigate({
            kind: 'ConvoRoute',
            peerId,
            entrypoint,
            organiser: screenRoute.organiser,
        });
    };
    const { id: ownerId, kind: ownerKind } = useOwner();
    const isMessageAuthorAdmin = convo.kind === 'ChatConvo' &&
        !Peer.isContactPeerId(message.authorId) &&
        !Peer.isChatPeerId(message.authorId) &&
        ChatMembers.isAdmin(convo.members, message.authorId);
    const isMessageAuthorRestrictedToWrite = !Peer.isChatPeerId(message.authorId) &&
        (convo.kind !== 'ChatConvo' ||
            ChatMembers.isMemberRestrictedToWrite(convo.members, message.authorId));
    const isRestrictToWriteButtonShowing = !isMessageAuthorAdmin &&
        convo.kind === 'ChatConvo' &&
        ChatMembers.isAdmin(convo.members, ownerId) &&
        ownerKind !== 'Group';
    const handleAction = (userAction) => {
        switch (userAction) {
            case 'pin_message_for_all': {
                openConfirmPinMessageModal();
                break;
            }
            case 'forward': {
                onMessageForward?.(message);
                break;
            }
            case 'reply': {
                onMessageReply();
                break;
            }
            case 'unpin_message_for_all': {
                dispatch({
                    type: 'UserUnpinMessage',
                    peerId: convo.peerId,
                    userAction: 'unpin_message_for_all',
                });
                break;
            }
            case 'delete': {
                // Если можем удалить для всех, откроем модалку с выбором
                if (Convo.canDeleteMessageForAll(convo, message, ownerId)) {
                    openDeleteMessageModal();
                    break;
                }
                dispatch({
                    type: 'UserDeleteMessage',
                    userAction: 'delete',
                    messages: [message],
                    peerId: convo.peerId,
                    deleteType: 'local',
                });
                break;
            }
            case 'showViewers': {
                openMessageViewersModal();
                break;
            }
            case 'spam': {
                onOpenReport([message]);
                break;
            }
            case 'select': {
                if (onSelect) {
                    onSelect(message, 'via-actions-menu');
                }
                break;
            }
            case 'mark_important':
            case 'unmark_important': {
                dispatch({
                    type: 'UserChangedMessage',
                    cmids: [message.cmid],
                    peerId: convo.peerId,
                    userAction,
                });
                break;
            }
            case 'edit': {
                dispatch({
                    type: 'UserChangedComposerDraft',
                    kind: 'editing',
                    editing: message,
                    peerId: convo.peerId,
                    isPostponed: false,
                });
                break;
            }
            case 'show_reacted_peers': {
                openReactedPeersModal();
                break;
            }
            default:
                exhaustivenessCheck(userAction);
        }
    };
    const viewersCountTitle = useMemo(() => {
        switch (viewersCount) {
            case undefined:
                return '';
            case null:
                return lang.use('me_message_viewers_count_title_failed');
            default:
                return lang.use('me_message_viewers_count', {
                    num: viewersCount,
                    formatted: 'short',
                });
        }
    }, [viewersCount, lang]);
    const viewersAvatars = useMemo(() => {
        return viewers
            .map((viewer) => Peer.safeGet(peers, viewer).photo)
            .filter((photo) => photo !== undefined);
    }, [peers, viewers]);
    const showViewersAction = message.isOut &&
        !Convo.isMessageUnread(convo, message) &&
        convo.kind === 'ChatConvo' &&
        convo.state === 'in' &&
        ownerKind !== 'Group';
    const { restrictToWrite, allowToWrite } = useRestrictChatMemberToWrite({
        chatId: convo.peerId,
    });
    const handleForwardTo = (peerId) => {
        forward.onTargetSelected(peerId, [message]);
        openConvo({ peerId, entrypoint: 'forward_messages_target' });
    };
    const isMessagesForwardingDisabled = Convo.isMessagesForwardingDisabled(convo);
    const canCopyMessagesText = Convo.canCopyMessagesText(convo);
    const isReactionsAvailable = featureFlags.vkm_reactions &&
        Convo.canSendReactions(convo) &&
        convo.kind === 'ChatConvo' &&
        message.reactions &&
        message.reactions.size > 0;
    const totalReactions = useMemo(() => Array.from(message.reactions.values()).reduce((acc, cur) => acc + cur.count, 0), [message.reactions]);
    /* @TODO: При добавлении новых опций не забывать про каспер чаты, в них нельзя:
     * - отмечать важными.
     * - пересылать в другой чат.
     * - закреплять
     * - ставить реакции
     */
    const actionsList = (React.createElement(React.Fragment, null,
        isMessagesForwardingDisabled && (React.createElement(ActionsMenuText, { text: lang.use('me_messages_forwarding_disabled_hint') })),
        showViewersAction && (React.createElement(ActionsMenuAction, { isLoading: viewersCount === undefined, leftIcon: React.createElement(Icon20ViewOutline, null), title: viewersCountTitle, rightIcon: React.createElement(UsersStack, { size: 18, count: viewers.length, photos: viewersAvatars }), onClick: () => handleAction('showViewers') })),
        isReactionsAvailable && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20Stars, null), title: lang.use('me_message_action_reacted_peers', {
                num: totalReactions,
            }), onClick: () => handleAction('show_reacted_peers'), type: "secondary" })),
        convo.canWrite.allowed &&
            !isEditing &&
            !Message.isCall(message) &&
            !message.attaches.widget &&
            normalMessageActions.has('reply') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ReplyOutline, null), title: lang.use('me_message_action_reply'), onClick: () => handleAction('reply'), type: "secondary" })),
        Convo.canForwardFrom(convo) &&
            !message.expireTTL &&
            !isEditing &&
            !Message.isCall(message) &&
            normalMessageActions.has('forward') &&
            !message.attaches.widget &&
            (isMobileLayout || isCompact ? (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ShareOutline, null), title: lang.use('me_message_action_forward'), onClick: () => handleAction('forward'), type: "secondary" })) : (React.createElement(ActionsMenuDropdownAction, { enableFocusTrap: true, title: lang.use('me_message_action_forward'), "aria-label": lang.use('me_message_action_forward'), icon: React.createElement(Icon20ShareOutline, null), type: "secondary", openType: "hover", align: "center", onClick: () => handleAction('forward') },
                React.createElement(ForwardMenuList, { onConvoClick: handleForwardTo, onFullOpenClick: () => handleAction('forward') })))),
        convo.kind === 'ChatConvo' &&
            (convo.canWrite.allowed ||
                convo.canWrite.reason === 'forbid_writing_for_all') &&
            convo.acl.canChangePin &&
            !Convo.isCasper(convo) &&
            !message.expireTTL &&
            !Message.isCall(message) &&
            (convo.pinnedMessage?.cmid === message.cmid
                ? normalMessageActions.has('unpin_message_for_all') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20PinSlashOutline, null), title: lang.use('me_convo_action_unpin_for_all'), onClick: () => handleAction('unpin_message_for_all'), type: "secondary" }))
                : normalMessageActions.has('pin_message_for_all') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20PinOutline, null), title: lang.use('me_convo_action_pin_for_all_short'), onClick: () => handleAction('pin_message_for_all'), type: "secondary" }))),
        !Convo.isCasper(convo) &&
            ownerKind !== 'Group' &&
            !message.expireTTL &&
            !Message.isCall(message) &&
            !message.attaches.widget &&
            (message.isImportant
                ? normalMessageActions.has('unmark_important') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20UnfavoriteOutline, null), title: lang.use('me_message_action_mark_unimportant'), onClick: () => handleAction('unmark_important'), type: "secondary" }))
                : normalMessageActions.has('mark_important') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20FavoriteOutline, null), title: lang.use('me_message_action_mark_important'), onClick: () => handleAction('mark_important'), type: "secondary" }))),
        canCopyMessagesText && (React.createElement(React.Fragment, null,
            React.createElement(CommonCopySelectionAction, null),
            React.createElement(CommonCopyMessageTextAction, { chunks: message.chunks }))),
        Message.isEditable(message, now) &&
            convo.canWrite.allowed &&
            normalMessageActions.has('edit') &&
            !isEditingCurrent && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20WriteOutline, null), title: lang.use('me_message_action_edit'), onClick: () => handleAction('edit'), type: "secondary" })),
        isRestrictToWriteButtonShowing &&
            (isMessageAuthorRestrictedToWrite ? (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20MessageCheckOutline, null), title: lang.use('me_convo_member_action_unban_title'), onClick: () => allowToWrite(message.authorId), type: "secondary" })) : (React.createElement(ActionsMenuDropdownAction, { enableFocusTrap: true, icon: React.createElement(Icon20MessageCrossOutline, null), key: "ban", title: lang.use('me_convo_member_action_ban_title') },
                React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(message.authorId, 3600), title: lang.use('me_convo_member_action_ban_hours', { num: 1 }) }),
                React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(message.authorId, 8 * 3600), title: lang.use('me_convo_member_action_ban_hours', { num: 8 }) }),
                React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(message.authorId, 24 * 3600), title: lang.use('me_convo_member_action_ban_hours', {
                        num: 24,
                    }) }),
                React.createElement(ActionsMenuAction, { onClick: () => restrictToWrite(message.authorId), title: lang.use('me_convo_member_action_ban_forever'), type: "danger" })))),
        normalMessageActions.has('spam') && message.authorId !== ownerId && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20ReportOutline, null), title: lang.use('me_message_action_spam'), onClick: () => handleAction('spam'), type: "danger" })),
        normalMessageActions.has('delete') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DeleteOutline, null), title: lang.use('me_message_action_delete'), onClick: () => handleAction('delete'), type: "danger" })),
        isMessageCanBeSelected(message, featureFlags) &&
            normalMessageActions.has('select') && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CheckCircleOutline, null), title: lang.use('me_select_message'), onClick: () => handleAction('select'), type: "secondary" })),
        isDev && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20HelpOutline, null), title: "\u0412\u044B\u0432\u0435\u0441\u0442\u0438 \u0432 \u043A\u043E\u043D\u0441\u043E\u043B\u044C", onClick: () => console.info(message) }))));
    return (React.createElement(ActionsMenu, { className: cx(className, {
            'MessageActionsMenu--withViewers': showViewersAction,
        }) }, actionsList));
};
//# sourceMappingURL=NormalMessageActionsMenu.js.map