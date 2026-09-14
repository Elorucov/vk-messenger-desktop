import * as Convo from '../../core/model/Convo';
import * as Peer from '../../core/model/Peer';
import * as Organisers from '../../core/model/Organisers';
import * as ChatMembers from '../../core/model/ChatMembers';
import * as Message from '../../core/model/Message';
import * as BotKeyboard from '../../core/model/BotKeyboard';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { current } from 'immer';
import { getOwnerGroupId } from '../store/State';
import { setDisabledPeerIdsByUser } from '@vkontakte-internal/stickers-kit';
import * as History from '../../core/model/History';
const userActionLockKeysMap = {
    mute: 'mute',
    unmute: 'mute',
    mute_until: 'mute_until',
    pin: 'pin',
    unpin: 'pin',
    mark_read: 'mark_read',
    mark_unread: 'mark_read',
    archive: 'archive',
    unarchive: 'archive',
    clear: 'clear',
    leave: 'leave',
    leave_and_clear: 'leave_and_clear',
    show_pinned_message: 'show_pinned_message',
    hide_pinned_message: 'show_pinned_message',
    show_bot_keyboard: 'show_bot_keyboard',
    hide_bot_keyboard: 'hide_bot_keyboard',
    pin_message_for_all: 'pin_message_for_all',
    unpin_message_for_all: 'pin_message_for_all',
    ban: 'ban',
    unban: 'unban',
    return_to_chat: 'return_to_chat',
    business_notify_enable: 'business_notify_enable',
    business_notify_disable: 'business_notify_enable',
    forbid_writing_all: 'forbid_writing_all',
    allow_writing_all: 'allow_writing_all',
    forbid_writing_all_until: 'forbid_writing_all_until',
    finish_call: 'finish_call',
    restrict_to_write: 'restrict_to_write',
    allow_to_write: 'allow_to_write',
    off_stickers_popup_animation: 'off_stickers_popup_animation',
    on_stickers_popup_animation: 'on_stickers_popup_animation',
    enable_mentions: 'enable_mentions',
    disable_all_and_online_mentions: 'enable_mentions',
    disable_mentions: 'enable_mentions',
    mark_answered: 'mark_answered',
    mark_important: 'mark_important',
    mark_unimportant: 'mark_unimportant',
};
const userUndoActions = {
    pin: 'unpin',
    unpin: 'pin',
    mark_read: 'mark_unread',
    mark_unread: 'mark_read',
    archive: 'unarchive',
    unarchive: 'archive',
    show_pinned_message: 'hide_pinned_message',
    hide_pinned_message: 'show_pinned_message',
    show_bot_keyboard: 'hide_bot_keyboard',
    hide_bot_keyboard: 'show_bot_keyboard',
};
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedConvo': {
            const { peerId, userAction, uiCallback } = action;
            const { organisers } = draft;
            const viewerId = draft.viewer.id;
            const lockKey = getUserActionLockKey(action.userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            draft.locks.convoActions.add(lockKey);
            const convo = draft.convos.get(peerId);
            const peer = draft.peers.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo || !peer) {
                return [];
            }
            let fetchUserAction;
            switch (userAction) {
                case 'pin': {
                    fetchUserAction = (api) => api.fetch('messages.pinConversation', {
                        peer_id: peerId,
                    });
                    break;
                }
                case 'unpin': {
                    fetchUserAction = (api) => api.fetch('messages.unpinConversation', {
                        peer_id: peerId,
                    });
                    break;
                }
                case 'mark_read': {
                    Convo.setPeerFlag(convo, Convo.PEER_FLAGS.isMarkedUnread, false);
                    fetchUserAction = (api) => api.fetch('messages.markAsRead', {
                        peer_id: peerId,
                        mark_conversation_as_read: 1,
                        group_id: getOwnerGroupId(ownerId),
                    });
                    break;
                }
                case 'mark_unread': {
                    Convo.setPeerFlag(convo, Convo.PEER_FLAGS.isMarkedUnread, true);
                    fetchUserAction = (api) => api.fetch('messages.markAsUnreadConversation', {
                        peer_id: peerId,
                        group_id: getOwnerGroupId(ownerId),
                    });
                    break;
                }
                case 'mark_important':
                case 'mark_unimportant': {
                    const isImportant = userAction === 'mark_important';
                    Convo.setPeerFlag(convo, Convo.PEER_FLAGS.isImportant, isImportant);
                    fetchUserAction = (api) => api.fetch('messages.markAsImportantConversation', {
                        peer_id: peerId,
                        group_id: getOwnerGroupId(ownerId),
                        important: isImportant ? 1 : 0,
                    });
                    break;
                }
                case 'mark_answered': {
                    Convo.setPeerFlag(convo, Convo.PEER_FLAGS.isUnanswered, false);
                    const cmid = History.lastCmid(convo.history);
                    fetchUserAction = (api) => api.fetch('messages.markAsAnsweredConversation', {
                        peer_id: peerId,
                        group_id: getOwnerGroupId(ownerId),
                        answered: 1,
                        read_up_to_cmid: cmid,
                    });
                    break;
                }
                case 'archive':
                case 'unarchive': {
                    const isArchived = userAction === 'archive';
                    Convo.setPeerFlag(convo, Convo.PEER_FLAGS.isArchived, isArchived);
                    Organisers.refresh(organisers, convo);
                    if (isArchived) {
                        draft.onboardingTriggers.userArchivedChat = true;
                    }
                    fetchUserAction = (api) => api.fetch(isArchived
                        ? 'messages.archiveConversation'
                        : 'messages.unarchiveConversation', {
                        peer_id: peerId,
                    });
                    break;
                }
                case 'hide_pinned_message': {
                    // Скрытие происходит локально на клиенте, ничего запрашивать не надо
                    if (convo.kind === 'ChatConvo' && convo.pinnedMessage) {
                        draft.hiddenPinnedMessages.set(action.peerId, convo.pinnedMessage.cmid);
                    }
                    break;
                }
                case 'show_pinned_message': {
                    // Отменяем локальное скрытие, ничего запрашивать не надо
                    draft.hiddenPinnedMessages.delete(action.peerId);
                    break;
                }
                case 'hide_bot_keyboard': {
                    draft.hiddenBotKeyboards.set(action.peerId, convo.currentKeyboard
                        ? BotKeyboard.resolveKeyboardId(convo.currentKeyboard)
                        : BotKeyboard.BOT_KEYBOARD_DEFAULT_ID);
                    break;
                }
                case 'show_bot_keyboard': {
                    draft.hiddenBotKeyboards.delete(action.peerId);
                    break;
                }
                case 'clear': {
                    fetchUserAction = (api) => api
                        .fetch('messages.deleteConversation', {
                        peer_id: peerId,
                        group_id: getOwnerGroupId(ownerId),
                    })
                        .then(({ last_deleted_id }) => Boolean(last_deleted_id));
                    break;
                }
                case 'leave':
                case 'leave_and_clear': {
                    if (convo.kind !== 'ChatConvo') {
                        break;
                    }
                    fetchUserAction = (api) => api.fetch('messages.removeChatUser', {
                        chat_id: Peer.toRealId(peerId),
                        user_id: Peer.toRealId(viewerId),
                        group_id: getOwnerGroupId(ownerId),
                    });
                    const peer = draft.peers.get(peerId);
                    if (!peer || peer.kind !== 'Chat') {
                        break;
                    }
                    Convo.clearChatDataOnLeave(convo);
                    Peer.clearChatDataOnLeave(peer);
                    break;
                }
                case 'ban': {
                    if (!((peer.kind === 'User' && convo.kind === 'UserConvo') ||
                        (peer.kind === 'Group' && convo.kind === 'GroupConvo'))) {
                        break;
                    }
                    Peer.updateIsPeerBlacklistedByMe(peer, true);
                    if (convo.kind === 'UserConvo') {
                        /**
                         * Если пользователь в черном списке, то ему нельзя написать сообщение
                         * Если в черном списке группа, то ей можно писать сообщения
                         */
                        Convo.restrictViewerToWrite(convo, 'peer_blacklisted_by_me');
                    }
                    if (convo.isDrafted) {
                        Convo.updateIsDrafted(convo, false);
                        Organisers.refresh(draft.organisers, convo);
                    }
                    if (Peer.isGroupPeerId(ownerId)) {
                        fetchUserAction = (api) => api.fetch('groups.ban', {
                            owner_id: peerId,
                            group_id: getOwnerGroupId(ownerId),
                            user_id: viewerId,
                        });
                    }
                    else if (Peer.isGroupPeerId(peerId)) {
                        fetchUserAction = (api) => api.fetch('messages.denyMessagesFromGroup', {
                            group_id: Peer.toRealId(peerId),
                            type: 'direct',
                        });
                    }
                    else {
                        fetchUserAction = (api) => api.fetch('account.ban', {
                            owner_id: peerId,
                        });
                    }
                    break;
                }
                case 'unban': {
                    if (!((peer.kind === 'User' && convo.kind === 'UserConvo') ||
                        (peer.kind === 'Group' && convo.kind === 'GroupConvo'))) {
                        break;
                    }
                    if (Peer.isGroupPeerId(ownerId) && Peer.isUserPeerId(peer.id)) {
                        delete draft.groupBannedUsers[peer.id];
                    }
                    Peer.updateIsPeerBlacklistedByMe(peer, false);
                    if (convo.kind === 'UserConvo') {
                        Convo.allowViewerToWrite(convo);
                    }
                    if (!convo.isDrafted) {
                        const peerDrafts = draft.composerDrafts[peerId];
                        if (peerDrafts && peerDrafts[peerDrafts.length - 1]) {
                            Convo.updateIsDrafted(convo, true);
                            Organisers.refresh(draft.organisers, convo);
                        }
                    }
                    if (Peer.isGroupPeerId(ownerId)) {
                        fetchUserAction = (api) => api.fetch('groups.unban', {
                            owner_id: peerId,
                            group_id: getOwnerGroupId(ownerId),
                        });
                    }
                    else if (Peer.isGroupPeerId(peerId)) {
                        fetchUserAction = (api) => api.fetch('messages.allowMessagesFromGroup', {
                            group_id: Peer.toRealId(peerId),
                            type: 'direct',
                        });
                    }
                    else {
                        fetchUserAction = (api) => api.fetch('account.unban', {
                            owner_id: peerId,
                        });
                    }
                    break;
                }
                case 'return_to_chat': {
                    fetchUserAction = (api) => api
                        .fetch('messages.addChatUser', {
                        chat_id: Peer.toRealId(peerId),
                        user_id: Peer.toRealId(viewerId),
                    })
                        .then(({ result }) => Boolean(result));
                    break;
                }
                case 'finish_call': {
                    if (Convo.canFinishCall(convo)) {
                        const callId = convo.activeCall.id;
                        fetchUserAction = (api) => api.fetch('messages.forceCallFinish', {
                            call_id: callId,
                        });
                    }
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        let hasFailed = false;
                        if (fetchUserAction) {
                            hasFailed = !(await fetchUserAction(api));
                        }
                        return {
                            type: 'UserChangedConvo_RequestCompleted',
                            hasFailed,
                            userAction,
                            peerId,
                            uiCallback,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedConvo_RequestCompleted',
                            hasFailed: true,
                            userAction,
                            peerId,
                            uiCallback,
                        };
                    }
                },
            ];
        }
        case 'UserChangedConvo_RequestCompleted': {
            const { peerId, userAction, hasFailed, uiCallback } = action;
            if (uiCallback) {
                uiCallback(!hasFailed);
            }
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            const undoAction = userUndoActions[userAction];
            if (hasFailed && undoAction) {
                handler(draft, {
                    type: 'UserChangedConvo',
                    userAction: undoAction,
                    peerId,
                }, featureFlags, envFeatureFlags);
                return [];
            }
            if (hasFailed) {
                return [];
            }
            switch (userAction) {
                // Сейчас никаких действий после успешного запроса для этих экшионов не требуется
                case 'clear':
                case 'pin':
                case 'unpin':
                case 'mark_read':
                case 'mark_unread':
                case 'mark_unimportant':
                case 'mark_important':
                case 'mark_answered':
                case 'unarchive':
                case 'show_pinned_message':
                case 'hide_pinned_message':
                case 'show_bot_keyboard':
                case 'hide_bot_keyboard':
                case 'ban':
                case 'unban':
                case 'finish_call': {
                    return [];
                }
                /**
                 * При архивировании чата добавляем в мапу меншенов запись по нему
                 */
                case 'archive': {
                    const convo = draft.convos.get(peerId);
                    if (!convo ||
                        convo.kind !== 'ChatConvo' ||
                        !convo.unreadMentions.size) {
                        return [];
                    }
                    const convoLastMentionId = Message.resolveCmid(Math.max(...convo.unreadMentions));
                    return [
                        async function setArchivedChatMentions({ storage }) {
                            const mentions = storage.get('archive-mentions-map');
                            if (!mentions || !convoLastMentionId) {
                                return {
                                    type: 'Noop',
                                };
                            }
                            mentions[peerId] = convoLastMentionId;
                            storage.set('archive-mentions-map', mentions);
                            return {
                                type: 'Noop',
                            };
                        },
                    ];
                }
                case 'leave': {
                    const convo = draft.convos.get(peerId);
                    if (convo?.kind === 'ChatConvo') {
                        Convo.setConvoState(convo, 'left');
                    }
                    return [];
                }
                case 'leave_and_clear': {
                    const convo = draft.convos.get(peerId);
                    if (convo?.kind !== 'ChatConvo') {
                        return [];
                    }
                    Convo.setConvoState(convo, 'left');
                    return handler(draft, {
                        type: 'UserChangedConvo',
                        userAction: 'clear',
                        peerId,
                    }, featureFlags, envFeatureFlags);
                }
                case 'return_to_chat': {
                    const convo = draft.convos.get(peerId);
                    if (convo?.kind === 'ChatConvo') {
                        Convo.setConvoState(convo, 'in');
                    }
                    return [];
                }
                default:
                    return exhaustivenessCheck(action);
            }
        }
        case 'GroupBanUser': {
            const { peerId, userAction } = action;
            const viewerId = draft.viewer.id;
            const lockKey = getUserActionLockKey(userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            draft.locks.convoActions.add(lockKey);
            const convo = draft.convos.get(peerId);
            const peer = draft.peers.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo ||
                !peer ||
                !(peer.kind === 'User' && convo.kind === 'UserConvo') ||
                !Peer.isGroupPeerId(ownerId)) {
                return [];
            }
            const banInfo = {
                ...action.banInfo,
                adminId: viewerId,
                date: new Date().getTime(),
            };
            draft.groupBannedUsers[peer.id] = banInfo;
            Peer.updateIsPeerBlacklistedByMe(peer, true);
            Convo.restrictViewerToWrite(convo, 'peer_blacklisted_by_me');
            if (convo.isDrafted) {
                Convo.updateIsDrafted(convo, false);
                Organisers.refresh(draft.organisers, convo);
            }
            return [
                async function ({ api }) {
                    try {
                        const { reason, comment, endDate, isCommentVisible } = action.banInfo;
                        await api.fetch('groups.ban', {
                            owner_id: peerId,
                            group_id: getOwnerGroupId(ownerId),
                            user_id: viewerId,
                            reason,
                            comment,
                            end_date: endDate,
                            comment_visible: isCommentVisible ? 1 : 0,
                        });
                        return {
                            type: 'GroupBanUser_RequestCompleted',
                            hasFailed: false,
                            userAction,
                            peerId,
                            banInfo,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'GroupBanUser_RequestCompleted',
                            hasFailed: true,
                            userAction,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'GroupBanUser_RequestCompleted': {
            const { peerId, userAction } = action;
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            return [];
        }
        case 'UserChangedMute': {
            const { peerId, timer, userAction } = action;
            const lockKey = getUserActionLockKey(action.userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const ownerId = draft.ownerId;
            let time;
            switch (userAction) {
                case 'mute': {
                    convo.push = {
                        mode: 'every-mention' /* нужно выставлять корректную, это дефолт */,
                        disabledUntil: Infinity,
                    };
                    time = -1;
                    break;
                }
                case 'unmute': {
                    convo.push = {
                        mode: 'everything',
                        disabledUntil: 0,
                    };
                    time = 0;
                    break;
                }
                case 'mute_until': {
                    convo.push = {
                        mode: 'every-mention' /* нужно выставлять корректную, это дефолт */,
                        disabledUntil: Date.now() + timer * 1000,
                    };
                    time = timer;
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        const response = await api.fetch('account.setSilenceMode', {
                            group_id: getOwnerGroupId(ownerId) || undefined,
                            time,
                            peer_id: peerId,
                            sound: userAction === 'unmute' ? 1 : 0,
                        });
                        return {
                            type: 'UserChangedMute_RequestCompleted',
                            hasFailed: response !== 1,
                            userAction: userAction,
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedMute_RequestCompleted',
                            hasFailed: true,
                            userAction: userAction,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserChangedMute_RequestCompleted': {
            const { peerId, userAction, hasFailed } = action;
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            const undoAction = {
                mute: 'unmute',
                unmute: 'mute',
                mute_until: 'unmute',
            }[userAction];
            if (hasFailed && undoAction) {
                handler(draft, {
                    type: 'UserChangedMute',
                    userAction: undoAction,
                    peerId,
                    timer: 0,
                }, featureFlags, envFeatureFlags);
                return [];
            }
            return [];
        }
        case 'UserChangedMuteChatMentions': {
            const { peerId, userAction } = action;
            const lockKey = getUserActionLockKey(action.userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            draft.locks.convoActions.add(lockKey);
            return [
                async function applyAction({ api }) {
                    const muteMentionsStatus = userAction === 'enable_mentions'
                        ? 'none'
                        : userAction === 'disable_all_and_online_mentions'
                            ? 'allOnline'
                            : 'all';
                    try {
                        await api.fetch('messages.muteChatMentions', {
                            peer_id: peerId,
                            mention_status: muteMentionsStatus,
                        });
                    }
                    catch {
                        return {
                            type: 'UserChangedMuteChatMentions_RequestCompleted',
                            peerId,
                            userAction,
                            muteMentionsStatus,
                            hasFailed: true,
                        };
                    }
                    return {
                        type: 'UserChangedMuteChatMentions_RequestCompleted',
                        peerId,
                        userAction,
                        muteMentionsStatus,
                        hasFailed: false,
                    };
                },
            ];
        }
        case 'UserChangedMuteChatMentions_RequestCompleted': {
            const { peerId, muteMentionsStatus, hasFailed, userAction } = action;
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            if (hasFailed) {
                return [];
            }
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            if (muteMentionsStatus === 'all') {
                convo.push.mode = 'nothing';
            }
            else if (muteMentionsStatus === 'allOnline') {
                convo.push.mode = 'direct-mention';
            }
            else if (muteMentionsStatus === 'none') {
                convo.push.mode = 'everything';
            }
            return [];
        }
        case 'UserPinMessage': {
            const { peerId, cmid, userAction } = action;
            const lockKey = getUserActionLockKey(action.userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            draft.locks.convoActions.add(lockKey);
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            const prevPinnedMessage = convo.pinnedMessage && current(convo.pinnedMessage);
            const messageToPin = Convo.findMessageByCmid(convo, cmid);
            if (messageToPin?.kind === 'Normal') {
                Convo.pinMessage(convo, Message.toPinned(messageToPin));
            }
            return [
                async function applyAction({ api }) {
                    try {
                        /**
                         * Никак не используем полученный запин,
                         * так как пока шел запрос через лонгпол могло прийти более актуальное состояние запина
                         */
                        await api.fetch('messages.pin', {
                            peer_id: peerId,
                            cmid,
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'UserPinMessage_RequestCompleted',
                            hasFailed: false,
                            userAction,
                            peerId,
                            cmid,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserPinMessage_RequestCompleted',
                            hasFailed: true,
                            userAction,
                            pinnedMessage: prevPinnedMessage,
                            peerId,
                            cmid,
                        };
                    }
                },
            ];
        }
        case 'UserPinMessage_RequestCompleted': {
            const { peerId, hasFailed, pinnedMessage, userAction } = action;
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            // Если запрос зафейлился, востановим предыдущее запиненное сообщение
            if (hasFailed) {
                Convo.unpinMessage(convo);
                if (pinnedMessage) {
                    Convo.pinMessage(convo, pinnedMessage);
                }
            }
            return [];
        }
        case 'UserUnpinMessage': {
            const { peerId, userAction } = action;
            const lockKey = getUserActionLockKey(action.userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            const convo = draft.convos.get(peerId);
            const ownerId = draft.ownerId;
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            const prevPinnedMessage = current(Convo.unpinMessage(convo));
            return [
                async function applyAction({ api }) {
                    try {
                        /**
                         * Никак не используем полученный запин,
                         * так как пока шел запрос через лонгпол могло прийти более актуальное состояние запина
                         */
                        await api.fetch('messages.unpin', {
                            peer_id: peerId,
                            group_id: getOwnerGroupId(ownerId),
                        });
                        return {
                            type: 'UserUnpinMessage_RequestCompleted',
                            hasFailed: false,
                            userAction,
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserUnpinMessage_RequestCompleted',
                            hasFailed: true,
                            userAction,
                            prevPinnedMessage,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserUnpinMessage_RequestCompleted': {
            const { peerId, hasFailed, prevPinnedMessage, userAction } = action;
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            // Если запрос зафейлился, востановим предыдущее запиненное сообщение
            if (hasFailed && prevPinnedMessage) {
                Convo.pinMessage(convo, prevPinnedMessage);
            }
            return [];
        }
        case 'UserChangedBusinessNotify': {
            const { userAction, peerId } = action;
            const lockKey = getUserActionLockKey(action.userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            const peer = draft.peers.get(peerId);
            if (peer?.kind !== 'Group' ||
                (peer.isBusinessBlacklistedByMe &&
                    userAction === 'business_notify_disable') ||
                (!peer.isBusinessBlacklistedByMe &&
                    userAction === 'business_notify_enable')) {
                return [];
            }
            Peer.updateIsPeerBusinessBlacklistedByMe(peer, userAction === 'business_notify_disable');
            return [
                async function applyAction({ api }) {
                    try {
                        const response = await api.fetch(userAction === 'business_notify_disable'
                            ? 'messages.denyMessagesFromGroup'
                            : 'messages.allowMessagesFromGroup', {
                            group_id: Peer.toRealId(peerId),
                            type: 'business_notify',
                        });
                        return {
                            type: 'UserChangedBusinessNotify_RequestCompleted',
                            hasFailed: response !== 1,
                            userAction,
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedBusinessNotify_RequestCompleted',
                            hasFailed: true,
                            userAction,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserChangedBusinessNotify_RequestCompleted': {
            const { userAction, peerId, hasFailed } = action;
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            const peer = draft.peers.get(peerId);
            if (peer?.kind !== 'Group') {
                return [];
            }
            if (hasFailed) {
                Peer.updateIsPeerBusinessBlacklistedByMe(peer, !peer.isBusinessBlacklistedByMe);
            }
            return [];
        }
        case 'UserRestrictChatMemberToWrite': {
            const { userAction, chatId, memberId, duration } = action;
            const convo = draft.convos.get(chatId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            const lockKey = getUserActionLockKey(action.userAction, chatId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            draft.locks.convoActions.add(lockKey);
            switch (userAction) {
                case 'restrict_to_write': {
                    ChatMembers.restrictMemberToWrite(convo.members, memberId);
                    break;
                }
                case 'allow_to_write': {
                    ChatMembers.allowMemberToWrite(convo.members, memberId);
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            const peerId = convo.peerId;
            return [
                async ({ api }) => {
                    try {
                        const response = await api.fetch('messages.changeConversationMemberRestrictions', {
                            peer_id: peerId,
                            member_ids_long: memberId.toString(),
                            ...(userAction === 'restrict_to_write'
                                ? {
                                    for: duration,
                                    action: 'ro',
                                }
                                : {
                                    action: 'rw',
                                }),
                        });
                        const hasFailed = response.failed_member_ids?.length !== 0;
                        return {
                            type: 'UserRestrictChatMemberToWrite_RequestCompleted',
                            hasFailed,
                            chatId,
                            failedIds: response.failed_member_ids,
                            userAction,
                        };
                    }
                    catch {
                        return {
                            type: 'UserRestrictChatMemberToWrite_RequestCompleted',
                            chatId,
                            hasFailed: true,
                            failedIds: [],
                            userAction,
                        };
                    }
                },
            ];
        }
        case 'UserRestrictChatMemberToWrite_RequestCompleted': {
            const { hasFailed, userAction, failedIds, chatId } = action;
            const lockKey = getUserActionLockKey(userAction, chatId);
            draft.locks.convoActions.delete(lockKey);
            const convo = draft.convos.get(chatId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            if (hasFailed && failedIds.length) {
                switch (userAction) {
                    case 'restrict_to_write': {
                        failedIds.forEach((id) => {
                            ChatMembers.allowMemberToWrite(convo.members, Peer.resolveId(id));
                        });
                        break;
                    }
                    case 'allow_to_write': {
                        failedIds.forEach((id) => {
                            ChatMembers.restrictMemberToWrite(convo.members, Peer.resolveId(id));
                        });
                        break;
                    }
                    default:
                        exhaustivenessCheck(userAction);
                }
            }
            return [];
        }
        case 'UserChangeForbidWritingAll': {
            const { peerId, duration, userAction } = action;
            const lockKey = getUserActionLockKey(action.userAction, peerId);
            if (draft.locks.convoActions.has(lockKey)) {
                return [];
            }
            const convo = draft.convos.get(peerId);
            if (!convo || convo.kind !== 'ChatConvo') {
                return [];
            }
            switch (userAction) {
                case 'forbid_writing_all': {
                    Convo.forbidWritingForAll(convo, true);
                    break;
                }
                case 'allow_writing_all': {
                    convo.forbidedWritingForAll = undefined;
                    break;
                }
                case 'forbid_writing_all_until': {
                    Convo.forbidWritingForAll(convo, true, Date.now() + duration * 1000);
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            const chatId = Peer.toRealId(peerId);
            const ownerId = draft.ownerId;
            return [
                async function applyAction({ api }) {
                    try {
                        const response = await (userAction === 'allow_writing_all'
                            ? api.fetch('messages.enableChatWriting', {
                                chat_id: chatId,
                                group_id: getOwnerGroupId(ownerId),
                            })
                            : api.fetch('messages.disableChatWriting', {
                                chat_id: chatId,
                                group_id: getOwnerGroupId(ownerId),
                                duration_sec: duration === Infinity ? 0 : Math.round(duration / 1000),
                            }));
                        return {
                            type: 'UserChangeForbidWritingAll_RequestCompleted',
                            hasFailed: response !== 1,
                            userAction: userAction,
                            peerId,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangeForbidWritingAll_RequestCompleted',
                            hasFailed: true,
                            userAction: userAction,
                            peerId,
                        };
                    }
                },
            ];
        }
        case 'UserChangeForbidWritingAll_RequestCompleted': {
            const { peerId, userAction, hasFailed } = action;
            const lockKey = getUserActionLockKey(userAction, peerId);
            draft.locks.convoActions.delete(lockKey);
            const undoAction = {
                forbid_writing_all: 'allow_writing_all',
                allow_writing_all: 'forbid_writing_all',
                forbid_writing_all_until: 'allow_writing_all',
            }[userAction];
            if (hasFailed && undoAction) {
                handler(draft, {
                    type: 'UserChangeForbidWritingAll',
                    userAction: undoAction,
                    peerId,
                    duration: Infinity,
                }, featureFlags, envFeatureFlags);
                return [];
            }
            return [];
        }
        case 'UserChangedStickersPopupAutoplay': {
            const { peerId, userAction } = action;
            const value = userAction === 'on_stickers_popup_animation' ? 1 : 0;
            return [
                async function setStickersPopupSettings({ api }) {
                    try {
                        const response = await api.fetch('stickers.setPopupSettings', {
                            name: 'autoplay_disabled_peer_ids',
                            value: value,
                            // на бэке ошиблись с названием chat_id -> надо было peer_id
                            chat_id: peerId,
                        });
                        return {
                            type: 'UserChangedStickersPopupAutoplay_RequestCompleted',
                            peerId,
                            response,
                            userAction,
                        };
                    }
                    catch {
                        return {
                            type: 'Noop',
                        };
                    }
                },
            ];
        }
        case 'UserChangedStickersPopupAutoplay_RequestCompleted': {
            const { response, peerId, userAction } = action;
            const convo = draft.convos.get(peerId);
            if (!convo) {
                return [];
            }
            const isDisabledForPeer = userAction === 'off_stickers_popup_animation';
            Convo.updateIsStickersPopupAutoplayDisabledByUser(convo, isDisabledForPeer);
            if (response.popup) {
                setDisabledPeerIdsByUser(response.popup.autoplay.disabled_peer_ids);
            }
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const getUserActionLockKey = (userAction, peerId) => `${userActionLockKeysMap[userAction]}-${peerId}`;
//# sourceMappingURL=UserChangedConvo.js.map