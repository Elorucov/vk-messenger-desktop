import * as Peer from './Peer';
import * as Message from './Message';
import { exhaustivenessCheck, getFlagValueByBitOffset, isDev, isSameDate, } from '../utils/misc';
import { MESSAGES_PER_PAGE } from '../config/config';
import * as History from '../model/History';
import * as ChatMembers from '../model/ChatMembers';
// Проставленное на бэкенде дефолтное значение.
// Может быть другим для пользователей под ручками, но это не критично
// так как оно обновится в событии добавления сообщения из long poll'а.
export const CASPER_MESSAGE_DELETE_TTL = 14400 * 1000;
/**
 * Максимальное количество закрепленных бесед
 */
export const MAX_PINNED = 5;
// Возможные флаги у convo
export const PEER_FLAGS = {
    isAdTag: 15,
    isMarkedUnread: 20,
    isArchived: 23,
    isBusinessNotify: 13,
    isImportant: 0,
    isUnanswered: 1,
    DONT_USE_isMuted: 4,
};
export const DEFAULT_CHAT_PERMISSIONS = {
    invite: 'all',
    change_info: 'all',
    change_pin: 'all',
    use_mass_mentions: 'all',
    see_invite_link: 'all',
    call: 'all',
    change_style: 'all',
    change_admins: 'owner',
    stickers_popup_autoplay: 'on',
};
// #region GETTERS
/**
 * Неудаленные узлы истории с сервера.
 */
export function allConfirmedHistoryNodes(convo) {
    return convo.history.confirmed.reduce((result, node) => {
        if (node.kind === 'Node') {
            result.push(node);
        }
        return result;
    }, []);
}
export function lastEditableMessage(convo) {
    const confirmedNodes = allConfirmedHistoryNodes(convo);
    for (let index = confirmedNodes.length - 1; index >= 0; index--) {
        const message = confirmedNodes[index]?.item;
        if (message?.kind === 'Normal' && Message.isEditable(message, Date.now())) {
            return message;
        }
    }
    return undefined;
}
/**
 * В отложенных нет смысла проверять на срок давности сообщения (Message.isEditable),
 * ведь оно отложенное, а значит дата отправления - будущее
 */
export function lastEditablePostponedMessage(convo) {
    const confirmedNodes = convo.postponed.history.confirmed.filter((node) => node.kind === 'Node');
    for (let index = confirmedNodes.length - 1; index >= 0; index--) {
        const message = confirmedNodes[index]?.item;
        if (message?.kind === 'Normal') {
            return message;
        }
    }
    return undefined;
}
/**
 * Неудаленные узлы истории с сервера и на отправку.
 */
export function allHistoryNodes(convo) {
    return [...allConfirmedHistoryNodes(convo), ...convo.history.pending];
}
/**
 * Разбиваем сообщения в истории на стеки.
 */
export function flowHistory(nodes, inReadBy, withUnreadSplitBeforeFirstMessage, stackQueuedToNormal = false) {
    let firstUnreadFound = false;
    // @TODO Касперчаты
    // @TODO Разные админы в сообщениях сообществ
    return nodes.map((newerNode, index) => {
        const olderNode = nodes[index - 1];
        const newer = newerNode.kind === 'DeletedNode' ? newerNode.restorable : newerNode.item;
        if (!olderNode) {
            /**
             * Если первое непрочитанное сообщение это первое сообщение в истории.
             */
            const isFirstMessageUnread = newerNode.kind !== 'DeletedNode' &&
                newer.kind === 'Normal' &&
                inReadBy < newer.cmid;
            if (isFirstMessageUnread && !firstUnreadFound) {
                firstUnreadFound = true;
            }
            return {
                kind: 'split',
                atUnread: isFirstMessageUnread && withUnreadSplitBeforeFirstMessage,
                atDate: true,
            };
        }
        const older = olderNode.kind === 'DeletedNode' ? olderNode.restorable : olderNode.item;
        const splittableAttaches = [
            'gift',
            'graffiti',
            'finishedCall',
        ];
        // Если следующее сообщение имеет другую дату
        const shouldSplitDate = !isSameDate(older.sentAt, newer.sentAt);
        // Если следующее сообщение в непрочитанных
        const shouldSplitUnread = older.kind !== 'Queued' &&
            newer.kind !== 'Queued' &&
            !newer.isOut &&
            newer.cmid > inReadBy &&
            !firstUnreadFound;
        if (shouldSplitUnread && !firstUnreadFound) {
            firstUnreadFound = true;
        }
        const stackableNormals = 
        // Оба сообщения обычные или удаленные обычные с возможностью восстановления.
        // Так же это может быть Queued сообщение, потому что оптимистично мы считаем его потенциально Normal
        (older.kind === 'Normal' ||
            (stackQueuedToNormal && older.kind === 'Queued')) &&
            (newer.kind === 'Normal' ||
                (stackQueuedToNormal && newer.kind === 'Queued')) &&
            // У сообщений один автор
            older.authorId === newer.authorId &&
            older.adminAuthorId === newer.adminAuthorId &&
            // Оба сообщения не исчезающие
            !older.expireTTL &&
            !newer.expireTTL &&
            // Следующее сообщение не содержит реплая
            !newer.replyMessage &&
            // Оба сообщения не содержат разделяющие аттачи
            !splittableAttaches.some((key) => typeof older.attaches[key] !== 'undefined') &&
            !splittableAttaches.some((key) => typeof newer.attaches[key] !== 'undefined') &&
            !older.attaches.sticker;
        const stackableExpired = older.kind === 'Expired' && newer.kind === 'Expired';
        const shouldStack = !shouldSplitDate &&
            !shouldSplitUnread &&
            // Время, прошедшее между отправкой, небольшое
            newer.sentAt - older.sentAt <= 5 * 60 * 1000 &&
            (stackableNormals || stackableExpired);
        if (!shouldStack) {
            return {
                kind: 'split',
                atUnread: shouldSplitUnread,
                atDate: shouldSplitDate,
            };
        }
        return { kind: 'continue' };
    });
}
/**
 * Ищет узел в истории.
 */
export function findHistoryNodeByCmid(convo, cmid, isPostponedHistory) {
    const history = getHistory(convo, Boolean(isPostponedHistory));
    return History.findNodeByCmid(history, cmid);
}
export function getHistory(convo, postponed) {
    return postponed ? convo.postponed.history : convo.history;
}
export function findMessageByCmid(convo, cmid, isPostponedHistory) {
    const { node } = findHistoryNodeByCmid(convo, cmid, isPostponedHistory);
    return node?.kind === 'Node' ? node.item : undefined;
}
export function findMessageByRandomId(convo, randomId, isPostponedHistory) {
    const history = isPostponedHistory ? convo.postponed.history : convo.history;
    const pendingNode = History.findPendingNode(history, randomId);
    return pendingNode ? pendingNode.item : undefined;
}
/**
 * Проверяет замьючена ли беседа.
 */
export function isMuted(convo) {
    return convo.push.mode !== 'everything';
}
/**
 * Проверяет может ли пользователь отключить уведомления в чате.
 * Существует т.к. сферум наложил такие продуктовые требования на передший в макс чат
 */
export function canChangeMute(convo) {
    return !hasMigratedSferumRestrictions(convo);
}
/**
 * Является ли беседа фантом чатом.
 */
export function isCasper(convo) {
    return ((convo.kind === 'ChatConvo' || convo.kind === 'MessageRequestChatConvo') &&
        convo.isCasper);
}
/**
 * Доступна ли опция "Новый чат на основе этого" для беседы
 */
export function canCreateChatBasedOnCurrent(convo, viewerId) {
    if (convo.kind !== 'ChatConvo') {
        return false;
    }
    const isAdmin = ChatMembers.isAdmin(convo.members, viewerId);
    const isViewerIsOwner = convo.ownerId === viewerId;
    const isChatHasMembers = convo.members.count > 0;
    return (!Peer.isFavorites(convo.peerId, viewerId) &&
        isChatHasMembers &&
        (isAdmin || isViewerIsOwner));
}
/**
 * Является ли беседа мессендж реквестом.
 */
export function isMR(convo) {
    return (convo.kind === 'MessageRequestChatConvo' ||
        convo.kind === 'MessageRequestUserConvo');
}
/**
 * Удалена ли беседа
 */
export function isDeleted(convo) {
    switch (convo.kind) {
        case 'ChatConvo':
            return convo.isDeleted;
        case 'UserConvo':
        case 'GroupConvo':
        case 'ContactConvo':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
        case 'BusinessNotify':
            return false;
        default:
            exhaustivenessCheck(convo);
    }
}
/**
 * Является ли беседа активным мессендж реквестом (непринятым и неотклоненным).
 */
export function isPendingMR(convo) {
    return ((convo.kind === 'MessageRequestChatConvo' ||
        convo.kind === 'MessageRequestUserConvo') &&
        convo.MRStatus === 'pending');
}
/**
 * Является ли беседа отклоненным мессендж реквестом.
 */
export function isRejectedMR(convo) {
    return ((convo.kind === 'MessageRequestChatConvo' ||
        convo.kind === 'MessageRequestUserConvo') &&
        convo.MRStatus === 'rejected');
}
/**
 * Является ли беседа бизнес-уведомлением.
 */
export function isBusinessNotify(convo) {
    return convo.kind === 'BusinessNotify';
}
/**
 * Отправитель месседж реквеста.
 */
export function getMRSenderPeerId(convo) {
    return convo.kind === 'MessageRequestUserConvo'
        ? convo.peerId
        : convo.inviterPeerId;
}
/**
 * Можно ли пересылать сообщения из беседы
 */
export function canForwardFrom(convo) {
    return !isCasper(convo) && !isMessagesForwardingDisabled(convo);
}
/**
 * Можно ли пересылать сообщения в беседу
 */
export function canForwardTo(convo) {
    return (convo.kind !== 'MessageRequestChatConvo' &&
        !isBusinessNotify(convo) &&
        convo.canWrite.allowed);
}
/**
 * Можно ли добавлять участников в чат
 */
export function canInviteTo(convo, owner) {
    return (convo.kind === 'ChatConvo' &&
        convo.acl.canInvite &&
        owner.kind !== 'Group' &&
        (convo.canWrite.allowed ||
            convo.canWrite.reason === 'forbid_writing_for_all'));
}
export function canUseMassMentions(convo) {
    return convo.kind === 'ChatConvo' && convo.acl.canUseMassMentions;
}
export function canFinishCall(convo) {
    return Boolean(convo.kind === 'ChatConvo' &&
        convo.activeCall?.canFinishCall &&
        convo.activeCall.id);
}
export function canAddToFolder(convo) {
    return (!isMR(convo) &&
        !isBusinessNotify(convo) &&
        !(canDelete(convo) && convo.isDeleted) &&
        !((convo.kind === 'ContactConvo' || convo.kind === 'UserConvo') &&
            convo.history.confirmed.length === 0));
}
export function canCopyMessagesText(convo) {
    const isForwardingDisabled = isMessagesForwardingDisabled(convo);
    return !isForwardingDisabled;
}
export function isRestrictedToWrite(convo, peerId) {
    if (!convo.canWrite.allowed) {
        return true;
    }
    if (convo.kind !== 'ChatConvo') {
        return false;
    }
    const member = convo.members.members.get(peerId);
    if (!member) {
        return false;
    }
    return member.isRestrictedToWrite;
}
/**
 * Проверка беседы на запиненность.
 */
export function isPinned(convo) {
    const flags = [4, 5, 6];
    return flags.some((flag) => (convo.majorSortId & (1 << flag)) > 0);
}
/**
 * Проверка беседы на возможность запина.
 */
export function canPin(convo, owner) {
    return (owner.kind !== 'Group' &&
        !hasPeerFlag(convo, PEER_FLAGS.isArchived) &&
        !isEmpty(convo) &&
        !isMR(convo) &&
        !isCasper(convo));
}
export function canDelete(convo) {
    switch (convo.kind) {
        case 'ChatConvo':
            return true;
        case 'UserConvo':
        case 'GroupConvo':
        case 'ContactConvo':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
        case 'BusinessNotify':
            return false;
        default:
            exhaustivenessCheck(convo);
    }
}
/**
 * Проверка может ли пользователь удалить сообщение для всех
 */
export function canDeleteMessageForAll(convo, message, ownerId) {
    const isMessageByUserOrGroup = Peer.isUserPeerId(message.authorId) || Peer.isGroupPeerId(message.authorId);
    const isAdmin = convo.kind === 'ChatConvo'
        ? ChatMembers.isAdmin(convo.members, ownerId)
        : false;
    const isMessageOwner = message.authorId === ownerId;
    const isAuthorAdmin = isMessageByUserOrGroup && convo.kind === 'ChatConvo'
        ? ChatMembers.isAdmin(convo.members, message.authorId)
        : false;
    const isChatMember = convo.kind === 'ChatConvo' ? convo.state === 'in' : true;
    if (isAdmin && isMessageOwner) {
        return true;
    }
    if (isAdmin && !isAuthorAdmin) {
        return true;
    }
    /**
     * ВАЖНО!!!
     * Сохраняйте текущий порядок в свитче
     * Если нужно что-то поменять, то осторожно
     */
    switch (true) {
        // Запрещено писать в чат по любой причине
        case !convo.canWrite.allowed:
            return false;
        case !isChatMember:
            return false;
        case Message.isCall(message):
            return false;
        // Диалог с самим собой
        case Peer.isFavorites(convo.peerId, ownerId):
            return false;
        // Свое сообщение
        case isMessageOwner:
            return true;
        // Сообщение отправлено больше 24 часов назад
        case Date.now() - message.sentAt > 24 * 3600 * 1000:
            return false;
        case isAdmin && !isAuthorAdmin:
            return true;
        default:
            return false;
    }
}
/**
 * Проверка на отметку "из рекламы"
 */
export function isAdTag(convo) {
    return hasPeerFlag(convo, PEER_FLAGS.isAdTag);
}
/**
 * Проверка на то, является ли беседа непрочитанной.
 */
export function isUnread(convo) {
    return convo.unreadCount > 0 || hasPeerFlag(convo, PEER_FLAGS.isMarkedUnread);
}
/**
 * Проверка на отметку "важное"
 */
export function isImportant(convo) {
    return hasPeerFlag(convo, PEER_FLAGS.isImportant);
}
/**
 * Проверка на отметку "неотвеченное"
 */
export function isUnanswered(convo) {
    return hasPeerFlag(convo, PEER_FLAGS.isUnanswered);
}
/**
 * Проверка на то является ли последнее сообщение в беседе исходящим непрочитанным.
 */
export function isUnreadOut(convo) {
    if (convo.kind === 'MessageRequestChatConvo') {
        return false;
    }
    const last = History.lastNode({
        history: convo.history,
        withDeleted: true,
        withPending: true,
        withFailed: true,
    });
    const lastMessage = last?.kind === 'DeletedNode' ? last.restorable : last?.item;
    if (lastMessage === undefined) {
        return false;
    }
    return lastMessage.isOut && isMessageUnread(convo, lastMessage);
}
/**
 * Проверка на то, есть ли непрочитанные исчезающие сообщения в беседе.
 */
export function hasUnreadExpireables(convo) {
    return convo.unreadExpireables.size > 0;
}
/**
 * Проверка на то, есть ли непрочитанные реакции в беседе.
 */
export function hasUnreadReactions(convo) {
    return convo.unreadReactions.size > 0;
}
/**
 * Проверка на то, есть ли непрочитанные меншены в беседе.
 */
export function hasUnreadMentions(convo) {
    switch (convo.kind) {
        case 'UserConvo':
        case 'GroupConvo':
        case 'ContactConvo':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
        case 'BusinessNotify':
            // В таких беседах меншенов не может быть
            return false;
        case 'ChatConvo':
            return convo.unreadMentions.size > 0;
        default:
            return exhaustivenessCheck(convo);
    }
}
/**
 * Проверяет есть ли сообщения в беседе не только среди загруженных,
 * но и в принципе.
 */
export function isEmpty(convo) {
    return History.isEmpty(convo.history);
}
/**
 * Проверяет является ли беседа абсолютно новой
 */
export function isNew(convo) {
    return convo.isNew;
}
/**
 * Проверяет наличие карточки в беседе
 */
export function hasCard(convo) {
    switch (convo.kind) {
        case 'UserConvo':
            return !!convo.convoCard;
        case 'MessageRequestUserConvo':
        case 'MessageRequestChatConvo':
        case 'GroupConvo':
        case 'ContactConvo':
        case 'BusinessNotify':
        case 'ChatConvo':
            return false;
        default:
            exhaustivenessCheck(convo);
    }
}
/**
 * Возвращает кол-во failed сообщений в беседе
 */
export function getConvoFailedMessagesCount(convo) {
    return getFailedMessages(convo).length;
}
/**
 * Получить id пригласившего участника
 */
export function getConvoMemberInviterId(convo, memberId) {
    if (convo.kind !== 'ChatConvo') {
        return;
    }
    return ChatMembers.getMemberInviterId(convo.members, memberId);
}
/**
 * Возвращает массив Queued сообщений
 */
export function getQueuedMessages(convo) {
    return convo.history.pending.map((node) => node.item);
}
/**
 * Возвращает массив зафейленных Queued сообщений
 */
export function getFailedMessages(convo) {
    return getQueuedMessages(convo).filter((msg) => msg.hasFailed);
}
/**
 * Возвращает массив Queued отложенных
 */
function getPostponedQueuedMessages(convo) {
    return convo.postponed.history.pending.map((node) => node.item);
}
/**
 * Возвращает зафейленные отложенные
 */
export function getPostponedFailedMessages(convo) {
    return getPostponedQueuedMessages(convo).filter((msg) => msg.hasFailed);
}
/**
 * Возвращает кол-во failed отложенных сообщений в беседе
 */
export function getPostponedConvoFailedMessagesCount(convo) {
    return getPostponedFailedMessages(convo).length;
}
/**
 * Возвращает все Queued сообщения
 */
export function getAllQueuedMessages(convo) {
    return [...getQueuedMessages(convo), ...getPostponedQueuedMessages(convo)];
}
/**
 * Возвращает все зафейленные сообщения
 */
export function getAllFailedMessages(convo) {
    return [...getFailedMessages(convo), ...getPostponedFailedMessages(convo)];
}
/**
 * Возвращает закрепленное сообщение
 */
export function getPinnedMessage(convo) {
    return convo.kind === 'ChatConvo' ? convo.pinnedMessage : undefined;
}
/**
 * Возвращает cmid первого непрочитанного меншена, если такой есть
 */
export function getFirstUnreadMentionCmid(convo) {
    const minUnreadMentionCmid = Math.min(...[...convo.unreadMentions.values()]);
    return minUnreadMentionCmid === Infinity
        ? undefined
        : Message.resolveCmid(minUnreadMentionCmid);
}
/**
 * Возвращает cmid первого непрочитанного меншена, если такой есть
 */
export function firstUnreadReactionCmid(convo) {
    const minUnreadReactionCmid = Math.min(...[...convo.unreadReactions.keys()]);
    return minUnreadReactionCmid === Infinity
        ? undefined
        : Message.resolveCmid(minUnreadReactionCmid);
}
/**
 * Проверяет прочитано ли сообщение в беседе.
 */
export function isMessageUnread(convo, message) {
    if (message.peerId !== convo.peerId) {
        throw new Error('Передано сообщение не принадлежащее беседе');
    }
    if (message.kind === 'Queued') {
        return true;
    }
    return message.isOut
        ? message.cmid > convo.outReadBy
        : message.cmid > convo.inReadBy;
}
/**
 * Определяет, может ли текущий пользователь прочитать список участников чата
 */
export function canReadMembers(convo) {
    return (convo.canWrite.allowed ||
        (!convo.canWrite.allowed && convo.canWrite.reason !== 'no_access'));
}
export function resolvePrecreatedConvoId(peerId) {
    return peerId;
}
/**
 * Проверяет является ли беседа скрытой.
 * Беседа может стать скрытой, например, при очистке истории.
 */
export function isHidden(convo) {
    return (convo.majorSortId <= 0 &&
        convo.minorSortId <= 0 &&
        /**
         * Здесь мы не случайно проверяем только по pending.length,
         * не учитывая confirmed.length. Есть чаты, отображение которых
         * в списке, не требуется, даже если у них история не пуста.
         *
         * Например наличие приветственного сообщения у чата сообщений сообществ:
         * https://jira.mvk.com/browse/ME-57182
         */
        convo.history.pending.length === 0 &&
        /**
         * Чаты с черновиками отражаются вверху списка чатов, они не должны быть
         * скрытыми независимо от sort_id
         */
        !convo.isDrafted);
}
export function canSendReactions(convo) {
    // В случае если нам отправил МР пользователь с низким ботскором,
    // то беседа для нас считается обычной, но в ней присуствует баннер
    if (isCasper(convo) || convo.convoBanner?.name === 'message_request_banner') {
        return false;
    }
    switch (convo.kind) {
        case 'UserConvo':
        case 'GroupConvo':
            return convo.canWrite.allowed;
        case 'ChatConvo':
            return (convo.state === 'in' &&
                convo.acl.canSendReactions &&
                (convo.canWrite.allowed ||
                    convo.canWrite.reason === 'forbid_writing_for_all') &&
                !convo.isGroupChannel);
        case 'BusinessNotify':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
        case 'ContactConvo':
            return false;
        default:
            exhaustivenessCheck(convo);
    }
}
export function shouldShortPollReactions(convo) {
    if (convo.kind === 'ChatConvo' && convo.shouldShortPollReactions) {
        return true;
    }
    return false;
}
function isMessageInMediaViewerCache(convo, message) {
    return !!convo.mediaViewerCache.items.find(({ cmid }) => cmid === message.cmid);
}
export function isPromo(convo) {
    return convo.kind === 'GroupConvo' && convo.isPromo;
}
export function calcUnreadCountWithInReadBy(convo, inReadBy) {
    const lastCmid = History.lastCmid(convo.history);
    if (lastCmid && inReadBy >= lastCmid) {
        return 0;
    }
    const inReadBySlice = History.around(convo.history, convo.inReadBy);
    /**
     * Загружена ли история целиком без пробелов между текущим и новым inReadBy.
     */
    const isHistoryLoaded = inReadBySlice &&
        (!inReadBySlice.bottomGap || inReadBySlice.bottomGap.fromCmid > inReadBy);
    if (!isHistoryLoaded) {
        /**
         * При незагруженной истории мы вынуждены вычитать границы непрочитанности
         * друг из друга, это даст некорректный результат, если в истории между
         * границами были удаленные сообщения.
         */
        const readAmount = inReadBy - convo.inReadBy;
        return Math.max(0, convo.unreadCount - readAmount);
    }
    const readAmount = inReadBySlice.nodes.filter((node) => {
        if (node.kind !== 'Node') {
            return false;
        }
        const message = node.item;
        return (!message.isOut &&
            isMessageUnread(convo, message) &&
            message.cmid <= inReadBy);
    }).length;
    return Math.max(0, convo.unreadCount - readAmount);
}
// #endregion
// #region SETTERS
/**
 * Если мы мержим беседы, то будем перезаписывать только строго определенные
 * поля.
 * Данные в беседе могут различным образом меняться из лонгполла,
 * в том числе оптимистично и мы хотим их перезатирать
 * исключительно осознанно пока не сможем гарантировать,
 * что перезаписываем более актуальной информацией
 *
 * В случае, если беседа была получена с помощью getConversationsById
 * (при поиске или из списка сохраненных), последнее сообщение будет пустым.
 * В таком случае нужно добавить его при слиянии.
 */
export function merge(newerConvo, convo, { invalidateHistory, } = {}) {
    if (convo === undefined) {
        return;
    }
    if (convo?.peerId !== newerConvo.peerId) {
        throw new Error('Convo.merge вызван на 2 разных чатах');
    }
    /**
     * Если инвалидируем историю беседы, то ничего
     * не инсертим, оставляем так, как пришло из апи,
     * то есть только с последним сообщением
     */
    if (!invalidateHistory) {
        const newHistory = newerConvo.history;
        newerConvo.history = convo.history;
        removePendingOnInsert(newerConvo, newHistory.confirmed);
        History.insert(newerConvo.history, newHistory.confirmed);
    }
    /**
     * При мерже бесед мы инвалидируем кэш истории отложенных сообщений
     * (мы перезапрашивали данные беседы не просто так, значит был разрыв лп или произошло что-то,
     * что требовало получать беседу заново и мержить с имеющейся).
     * Это значит, что, когда нам понадобится история отложек мы заново пойдём за ней по апи (получать самое актуальное).
     * Единственное, что нам апи не отдаст - это сообщения, которые зафейлились на клиенте при отправке.
     */
    newerConvo.postponed.history.pending = convo.postponed.history.pending.filter((pendinNode) => pendinNode.item.hasFailed);
    /**
     * Не обнуляем majorSortId, так как для закрепленных чатов в папке: "Все"
     * при загрузке какой-либо другой папки, кроме: "Bce" получим его равным 0.
     *
     * В случае, если majorSortId поменяется на 0 в результате открепления чата,
     * обновим его при обработке LP события.
     *
     * TODO выпилить, когда бэк починит sort_id.
     */
    if (newerConvo.majorSortId === 0) {
        newerConvo.majorSortId = convo.majorSortId;
    }
    if (!newerConvo.isDrafted) {
        newerConvo.isDrafted = convo.isDrafted;
    }
    if (newerConvo.kind === 'ChatConvo' && convo.kind === 'ChatConvo') {
        /**
         * Поля memberIds, members, invitedIds, incognitoMembers мы не получаем с API в данных беседы.
         * Поле membersCount для консистентности берем также из имеющихся данных,
         * все эти поля обновим при обработке евента LP.
         * Также не обнуляем stickersParams и inviteLinks, приходящие отдельными запросами.
         */
        newerConvo.members = convo.members;
        newerConvo.stickersParams = convo.stickersParams;
        newerConvo.inviteLinks = convo.inviteLinks;
    }
}
export function updatePush(convo, push) {
    convo.push = push;
}
/**
 * Удаление queued сообщения
 */
export function removePending(convo, randomId) {
    History.removePending(convo.history, randomId);
}
/**
 * Удаление отложенного queued сообщения
 */
export function removePostponedPending(convo, randomId) {
    History.removePending(convo.postponed.history, randomId);
}
/**
 * Добавление нового сообщения в беседу.
 */
export function appendMessage(convo, message, minorSortId, hasMention, keyboardEvent) {
    if (message.peerId !== convo.peerId) {
        throw new Error('Передано сообщение не принадлежащее беседе');
    }
    if (message.kind === 'Normal' && message.isPostponed) {
        return History.appendPostponed(convo.postponed.history, message, message.randomId);
    }
    /**
     * Обновление minorSortId до проверки на дубликат сообщения в истории нужен
     * для кейса принятия МРа в чат: к нам прилетает 21 событие с minorSortId равным 0,
     * и после него прилетает 10004 c обновленным minorSortId, но при этом это сообщение
     * у нас уже есть в истории и мы не пройдем проверку ниже.
     * Если тут мы не обновим в этом сценарии minorSortId, то беседа у нас будет считаться скрытой
     * во всех фильтрах.
     * Условие проверяет актуальность полученного minorSortId.
     */
    if (convo.minorSortId < minorSortId) {
        convo.minorSortId = minorSortId;
    }
    const lastHistoryCmid = History.lastCmid(convo.history);
    const isMessageNotInConvo = lastHistoryCmid === undefined || lastHistoryCmid < message.cmid;
    if (!message.isOut &&
        isMessageNotInConvo &&
        isMessageUnread(convo, message)) {
        convo.unreadCount++;
        if (convo.kind === 'ChatConvo' && hasMention) {
            convo.unreadMentions.add(message.cmid);
        }
        if (message.kind === 'Normal' && message.expireTTL) {
            convo.unreadExpireables.add(message.cmid);
        }
    }
    updateOneTimeKeyboard(message.isOut, convo);
    updateConvoKeyboard(convo, keyboardEvent);
    // При добавлении нового сообщения считаем что в медиа-кеше могло что-то появиться
    convo.mediaViewerCache.hasNext = true;
    History.append(convo.history, message, 'randomId' in message ? message.randomId : undefined);
}
/**
 * Добавляет новое "локальное" сообщение.
 */
export function appendQueuedMessage(convo, message) {
    const currentHistory = message.isPostponed
        ? convo.postponed.history
        : convo.history;
    History.appendPending(currentHistory, message);
    updateOneTimeKeyboard(message.isOut, convo);
}
/**
 * Обновляет сообщение в беседе, если оно присутствует в истории.
 */
export function replaceMessage(convo, message, hasMention, keyboardEvent) {
    if (message.kind === 'Normal' && message.isPostponed) {
        History.replace(convo.postponed.history, message);
        History.sortConfirmedPostponed(convo.postponed.history);
        return;
    }
    if (convo.kind === 'ChatConvo') {
        convo.unreadMentions.delete(message.cmid);
        if (hasMention && isMessageUnread(convo, message)) {
            convo.unreadMentions.add(message.cmid);
        }
    }
    convo.unreadExpireables.delete(message.cmid);
    if (((message.kind === 'Normal' && message.expireTTL) ||
        message.kind === 'Expired') &&
        isMessageUnread(convo, message)) {
        convo.unreadExpireables.add(message.cmid);
    }
    updateConvoKeyboard(convo, keyboardEvent);
    // Очитска кеша медиапросмотрщика если сообщение было в кеше
    isMessageInMediaViewerCache(convo, message) && clearMediaViewerCache(convo);
    History.replace(convo.history, message);
}
/**
 * Заменяем реплаи на исчезнувшее сообщение.
 * Исчезающие сообщения можно только реплаить, и нельзя форвардить,
 * поэтому заменяем только реплаи.
 */
export function replaceExpiredReplies(convo, expiredCmid) {
    convo.history.confirmed.forEach((node) => {
        if (node.kind !== 'Node' || node.item.kind !== 'Normal') {
            return;
        }
        const { replyMessage } = node.item;
        if (replyMessage !== undefined &&
            replyMessage.kind !== 'ForeignExpired' &&
            replyMessage.cmid === expiredCmid) {
            node.item.replyMessage = Message.expireForeign(replyMessage);
        }
    });
}
/**
 * Удаляет сообщение из беседы
 */
export function deleteMessage(convo, message, options) {
    if (message.kind === 'Normal' && message.isPostponed) {
        History.remove(convo.postponed.history, message.cmid, options);
        return;
    }
    // TODO удалить код ниже, когда LP будет слать событие обновления
    // счетчика непрочитанных вместе с 10002 событием.
    /**
     * Обновляем счетчик непрочитанных, завязываясь на то, что при удалении
     * сообщения (10002 событие лонгполла), мы не запрашиваем беседу с API.
     * Это означает, что в большинстве кейсов вызова этой фукнции беседа будет взята
     * из кэша и иметь необновленный счетчик непрочитанных.
     */
    if (!message.isOut && isMessageUnread(convo, message)) {
        convo.unreadCount = Math.max(0, convo.unreadCount - 1);
    }
    if (convo.kind === 'ChatConvo') {
        convo.unreadMentions.delete(message.cmid);
    }
    convo.unreadExpireables.delete(message.cmid);
    convo.unreadReactions.delete(message.cmid);
    if (convo.inReadBy === message.cmid) {
        const nodeData = History.findNodeByCmid(convo.history, message.cmid);
        if (nodeData.status === 'Node') {
            const prevNode = convo.history.confirmed[nodeData.index - 1];
            if (prevNode !== undefined && prevNode.kind !== 'GapNode') {
                convo.inReadBy = History.nodeCmid(prevNode);
            }
        }
    }
    /**
     * Очитска кеша MediaViewer'a если сообщение было в кеше
     */
    isMessageInMediaViewerCache(convo, message) && clearMediaViewerCache(convo);
    updateForeignMessageAvailable(convo, message.cmid, true);
    History.remove(convo.history, message.cmid, options);
}
/**
 * Восстанавливает сообщение в беседе
 */
export function restoreMessage(convo, message, hasMentions) {
    // TODO удалить коммент ниже, когда LP будет слать событие обновления
    // счетчика непрочитанных вместе с 10003 событием.
    /**
     * Не обновляем счетчик непрочитанных, завязываясь на то, что при восстановлении
     * сообщении (10003 событие лонгполла), мы запрашиваем беседу с API.
     * Это означает, что при вызове этой фукнции, у беседы будет актуальный счетчик
     * непрочитанных.
     */
    History.restore(convo.history, message.cmid, message);
    if (message.kind === 'Normal') {
        updateForeignMessageAvailable(convo, message.cmid, false);
    }
    if (convo.kind === 'ChatConvo' &&
        hasMentions &&
        isMessageUnread(convo, message)) {
        convo.unreadMentions.add(message.cmid);
    }
    // Очищаем кеш медиапросмотрщика, так как сообщение могло быть восстановлено в любом месте истории
    clearMediaViewerCache(convo);
}
/**
 * Добавляет сообщения в историю.
 * Сообщения переданные в массиве должны идти по порядку без дырок.
 *
 * Полезно для догрузки сообщений в беседу.
 */
export function insertMessages(convo, messages, hasMore) {
    const historyNodes = [];
    messages.reverse().forEach((message, index, self) => {
        if (index === 0 && message.cmid > 1 && hasMore.backward) {
            historyNodes.push({
                kind: 'GapNode',
                fromCmid: Message.resolveCmid(1),
                toCmid: Message.resolveCmid(message.cmid - 1),
            });
        }
        historyNodes.push({
            kind: 'Node',
            item: message,
        });
        if (index === self.length - 1 && hasMore.forward) {
            const lastHistoryCmid = History.lastCmid(convo.history);
            if (lastHistoryCmid !== undefined && message.cmid < lastHistoryCmid) {
                historyNodes.push({
                    kind: 'GapNode',
                    fromCmid: Message.resolveCmid(message.cmid + 1),
                    toCmid: Message.resolveCmid(lastHistoryCmid),
                });
            }
        }
    });
    removePendingOnInsert(convo, historyNodes);
    if (historyNodes.length === 0) {
        if (
        /**
         * При первом заходе в чат с сообществом с приветственным сообщением из api
         * получаем пустую историю, а приветственное сообщение получаем по LP.
         * В случае, если получим сообщение раньше, чем пустую истории, нам важно его
         * оставить в истории.
         * Поэтому перезаписываем историю пустой историей только в случае,
         * если история полностью не загружена, то есть в ней присутствует только
         * один узел и он гэп.
         * https://jira.mvk.com/browse/ME-51970
         */
        convo.history.confirmed.length === 1 &&
            convo.history.confirmed[0]?.kind === 'GapNode') {
            convo.history.confirmed = [];
        }
    }
    else {
        History.insert(convo.history, historyNodes);
    }
}
export function insertPostponedMessages(convo, messages) {
    /**
     * В отложенных нет гэпов, если пришёл ответ с отложенными значит это всё что есть (пагинации/оффсета для них нет).
     * Убираем гэп-заглушку.
     */
    convo.postponed.history.confirmed = convo.postponed.history.confirmed.filter((node) => node.kind !== 'GapNode');
    /**
     * с отложенными всё несколько сложнее, чем с обычной беседой
     * так как сортируются они по времени и cmid (cmid в них вторично)
     * Поэтому мержить историю лучше по одной сообщеньке через History.appendPostponed,
     * чтобы после каждой вставки происходила сортировка и все сообщения по итогу мержа
     * заняли верный порядок в списке
     */
    messages.reverse().forEach((message) => {
        if (!convo.postponed.history.confirmed.some((node) => node.kind === 'Node' && node.item.cmid === message.cmid)) {
            History.appendPostponed(convo.postponed.history, message, message.randomId);
        }
    });
}
/**
 * Для сообществ из-за приветственного сообщения в историю может искусственно
 * добавляться гэп https://jira.mvk.com/browse/ME-51970
 * Убираем его, если запрос на историю сообщений упал с ошибкой
 */
export function removeInitialGroupConvoGap(convo) {
    if (convo.kind === 'GroupConvo' &&
        convo.history.confirmed.length === 1 &&
        convo.history.confirmed[0]?.kind === 'GapNode') {
        convo.history.confirmed = [];
    }
}
function removePendingOnInsert(convo, newConfirmedHistory) {
    /**
     * @TODO https://jira.mvk.com/browse/ME-38932
     * Добавить в History.insert удаление pending узлов при вставке.
     */
    newConfirmedHistory.forEach((node) => {
        const randomId = node.kind === 'Node' && 'randomId' in node.item
            ? node.item.randomId
            : undefined;
        if (randomId) {
            removePending(convo, randomId);
        }
    });
}
/**
 * Отрезает конец истории, когда она становится слишком длинной.
 *
 * Используется для того, чтобы избегать переполнения памяти в беседах.
 */
export function cleanup(convo) {
    const aroundCmid = convo.unreadCount > 0 ? convo.inReadBy : undefined;
    History.cleanup(convo.history, MESSAGES_PER_PAGE * 1.5, aroundCmid);
}
/**
 * Снимает отметку непрочитанности у беседы.
 */
export function markRead(convo) {
    setPeerFlag(convo, PEER_FLAGS.isMarkedUnread, false);
}
/**
 * Прочтение входящих сообщений в беседе вплоть до переданного.
 */
export function readInUntil(convo, inReadBy, newUnreadCount) {
    if (convo.inReadBy > inReadBy) {
        return;
    }
    convo.inReadBy = inReadBy;
    convo.unreadCount = newUnreadCount;
    if (newUnreadCount === 0) {
        setPeerFlag(convo, PEER_FLAGS.isMarkedUnread, false);
    }
    switch (convo.kind) {
        case 'UserConvo':
        case 'GroupConvo':
        case 'ContactConvo':
        case 'MessageRequestUserConvo':
        case 'MessageRequestChatConvo':
        case 'BusinessNotify':
            break;
        case 'ChatConvo':
            for (const cmid of convo.unreadMentions) {
                if (cmid <= inReadBy) {
                    convo.unreadMentions.delete(cmid);
                }
            }
            break;
        default:
            exhaustivenessCheck(convo);
    }
    for (const cmid of convo.unreadExpireables) {
        if (cmid <= inReadBy) {
            convo.unreadExpireables.delete(cmid);
        }
    }
}
/**
 * Прочтение исходящих сообщений в беседе вплоть до переданного.
 */
export function readOutUntil(convo, outReadBy) {
    if (convo.outReadBy >= outReadBy) {
        return;
    }
    convo.outReadBy = outReadBy;
}
/**
 * Заменяет список сообщений с непрочитанными реакциями.
 */
export function replaceUnreadReactions(convo, unreadReactions) {
    convo.unreadReactions = unreadReactions.reduce((acc, cmid) => {
        acc.set(cmid, convo.unreadReactions.get(cmid));
        return acc;
    }, new Map());
}
/**
 * Обновляет непрочитанную реакцию, которую надо анимировать
 */
export function setUnreadReaction(convo, cmid, reactonId) {
    if (convo.unreadReactions.has(cmid)) {
        convo.unreadReactions.set(cmid, reactonId);
    }
}
/**
 * Прочтение реакции в сообщении
 */
export function readReactions(convo, cmid) {
    convo.unreadReactions.delete(cmid);
}
function updateOneTimeKeyboard(isOutMessage, convo) {
    if (isOutMessage && convo.currentKeyboard?.oneTime) {
        delete convo.currentKeyboard;
    }
}
function updateConvoKeyboard(convo, keyboardEvent) {
    if (keyboardEvent) {
        switch (keyboardEvent.kind) {
            case 'InputKeyboardUpsertEvent':
                convo.currentKeyboard = keyboardEvent.keyboard;
                break;
            case 'InputKeyboardDeleteEvent':
                delete convo.currentKeyboard;
                break;
            default:
                exhaustivenessCheck(keyboardEvent);
        }
    }
}
export function updateOwner(convo, ownerId) {
    if (convo.kind !== 'ChatConvo') {
        return;
    }
    if (convo.ownerId) {
        ChatMembers.unsetAdmin(convo.members, convo.ownerId);
    }
    convo.ownerId = ownerId;
    ChatMembers.setAdmin(convo.members, ownerId);
}
/**
 * Обновляет состояние зафейленности сообщения при отправке.
 */
export function updateSendingFail(convo, randomId, hasFailed, isPostponed) {
    const history = isPostponed ? convo.postponed.history : convo.history;
    const node = History.findPendingNode(history, randomId);
    if (node !== undefined) {
        Message.updateFailedStatus(node.item, hasFailed);
    }
}
/**
 * Обновление идентификаторов сортировки беседы.
 */
export function updateSortId(convo, change) {
    if ('majorSortId' in change) {
        convo.majorSortId = change.majorSortId;
    }
    else {
        convo.minorSortId = change.minorSortId;
    }
}
/**
 * Обновление назначенных меток беседы
 */
export function updateTags(convo, change) {
    convo.tags = new Set(change);
}
export function updateIsDrafted(convo, isDrafted) {
    convo.isDrafted = isDrafted;
}
/**
 * Обновляем флаг того новая беседа или нет.
 * Подробнее в описании поля.
 */
export function updateIsNew(convo, isNew) {
    convo.isNew = isNew;
}
export function updateFlags(convo, variant, flags) {
    let updated;
    switch (variant) {
        case 'unset': {
            updated = convo.peerFlags & ~flags;
            break;
        }
        case 'replace': {
            updated = flags;
            break;
        }
        case 'set': {
            updated = convo.peerFlags | flags;
            break;
        }
        default:
            exhaustivenessCheck(variant);
    }
    convo.peerFlags = updated;
}
export function updateMessageFlags(convo, cmid, variant, flags) {
    const node = History.findNodeByCmid(convo.history, cmid).node;
    if (node === undefined || node.kind === 'GapNode') {
        return;
    }
    const { isDeleted, isDeletedForAll, isSpam } = Message.updateFlags(node, variant, flags);
    /**
     * Всегда удаляем сообщение из кэша, если было положено в спам или удалено для всех.
     * Если было удалено не для всех, удаляем из кэша только, если было удалено не локально.
     */
    if (((isDeleted || isSpam) && node?.kind !== 'DeletedNode') ||
        isDeletedForAll) {
        const message = node.kind === 'DeletedNode' ? node.restorable : node.item;
        deleteMessage(convo, message, { isRestorable: false });
    }
}
export function clearChatDataOnLeave(convo) {
    convo.state = 'left';
    convo.acl = {
        canChangeInfo: false,
        canChangeInviteLink: false,
        canChangePin: false,
        canInvite: false,
        canPromoteUsers: false,
        canSeeInviteLink: false,
        canDisableServiceMessages: false,
        canModerate: false,
        canCopyChat: false,
        canCall: false,
        canUseMassMentions: false,
        canChangeOwner: false,
        canChangeServiceType: false,
        canChangeStickersPopupAutoplay: false,
        canChangeStyle: false,
        canSendReactions: false,
        canDisableMessagesForwarding: false,
        canForwardMessages: false,
    };
    ChatMembers.reset(convo.members);
    delete convo.inviteLinks;
}
export function updateAcl(convo, acl) {
    convo.acl = acl;
}
/**
 * Проверка, что я являюсь инкогнито участником чата
 */
export function isIncognitoChat(convo) {
    return Boolean(convo.isIncognito);
}
/**
 * Изменение настроек администрирования бесед
 */
export function setChatPermissions(convo, permissions, isService) {
    convo.permissions = permissions;
    convo.isService = isService;
}
/**
 * Включение / выключение отображения сервисных сообщений
 */
export function setIsServiceMessagesDisabled(convo, value) {
    convo.isServiceMessagesDisabled = value;
}
export function setIsMessagesForwardingDisabled(convo, value) {
    convo.acl.canForwardMessages = !value;
}
/**
 * Изменение описания чата
 */
export function setDescription(convo, description) {
    convo.description = description;
}
/**
 * Изменение параметров кастомных стикеров чата
 */
export function setStickersParams(convo, stickersParams) {
    convo.stickersParams = stickersParams;
}
/**
 * Замена ссылок-приглашений
 */
export function replaceInviteLinks(convo, inviteLinks) {
    convo.inviteLinks = inviteLinks;
}
/**
 * Закрепить сообщение в беседе
 */
export function pinMessage(convo, pinnedMessage) {
    if (convo.pinnedMessage) {
        const message = findMessageByCmid(convo, convo.pinnedMessage.cmid);
        if (message?.kind === 'Normal') {
            Message.unpinMessage(message);
        }
    }
    convo.pinnedMessage = pinnedMessage;
    const message = findMessageByCmid(convo, pinnedMessage.cmid);
    if (message?.kind === 'Normal') {
        Message.pinMessage(message);
    }
}
/**
 * Открепить сообщение в беседе
 */
export function unpinMessage(convo) {
    const pinnedMessage = convo.pinnedMessage;
    if (!pinnedMessage) {
        return;
    }
    delete convo.pinnedMessage;
    const message = findMessageByCmid(convo, pinnedMessage.cmid);
    if (message?.kind === 'Normal') {
        Message.unpinMessage(message);
    }
    return pinnedMessage;
}
/**
 * Обновить информацию об активном звонке в чате
 */
export function updateActiveCall(convo, activeCall) {
    convo.activeCall = activeCall;
}
/**
 * Обновляет состояние пользователя в беседе
 */
export function setConvoState(convo, state) {
    convo.state = state;
}
export function rejectMR(convo) {
    if (convo.kind === 'UserConvo') {
        return {
            ...convo,
            kind: 'MessageRequestUserConvo',
            MRStatus: 'rejected',
            canWrite: {
                allowed: false,
                reason: 'mr_rejected',
            },
        };
    }
    return {
        ...convo,
        MRStatus: 'rejected',
        canWrite: {
            allowed: false,
            reason: 'mr_rejected',
        },
    };
}
/**
 * Запрещает писать текущему юзеру в беседу по причине `reason`.
 */
export function restrictViewerToWrite(convo, reason, until) {
    convo.canWrite = {
        allowed: false,
        reason,
        until,
    };
}
/**
 * Разрешает писать текущему юзеру в беседу.
 */
export function allowViewerToWrite(convo) {
    convo.canWrite = {
        allowed: true,
    };
}
export function changeUserState(convo, state) {
    convo.state = state;
}
export function clearMediaViewerCache(convo) {
    convo.mediaViewerCache = {
        items: [],
        hasPrev: true,
        hasNext: true,
    };
}
/** Безвозвратно убираем баннер из модели беседы */
export function hideBanner(convo) {
    convo.convoBanner = undefined;
}
export function safeGet(convos, peerId) {
    const peer = convos.get(peerId);
    if (peer) {
        return peer;
    }
    if (isDev) {
        throw new Error(`Беседа ${peerId} не найдена в кэше! Обрати внимание на то как загружаются недостающие данные в сторе.`);
    }
    return convos.get(Peer.resolveId());
}
export function convertFlags(flags) {
    /**
     * Тайпскрипт не может определить перегрузку, помогаем ему
     */
    return typeof flags === 'number'
        ? getFlagValueByBitOffset(flags, PEER_FLAGS)
        : getFlagValueByBitOffset(flags, PEER_FLAGS);
}
export function setPeerFlag(convo, peerFlag, flag) {
    if (flag) {
        convo.peerFlags = convo.peerFlags | (1 << peerFlag);
    }
    else {
        convo.peerFlags = convo.peerFlags & ~(1 << peerFlag);
    }
}
export function hasPeerFlag(convo, peerFlag) {
    return (convo.peerFlags & (1 << peerFlag)) > 0;
}
export function description(convo) {
    switch (convo.kind) {
        case 'ChatConvo':
        case 'GroupConvo':
            return convo.description;
        default:
            // Только для валидации типов на уровне TS
            return;
    }
}
export function mayHaveDisabledServiceMessages(convo) {
    return convo.kind === 'ChatConvo';
}
export function isServiceMessagesDisabled(convo) {
    if (!mayHaveDisabledServiceMessages(convo)) {
        return false;
    }
    return convo.isServiceMessagesDisabled;
}
export function isMessagesForwardingDisabled(convo) {
    if (convo.kind !== 'ChatConvo') {
        return false;
    }
    return !convo.acl.canForwardMessages;
}
export function findMediaViewerCacheItem(convo, id, cmid, position) {
    return convo.mediaViewerCache.items.find((item) => `${cmid}-${id}-${position}` ===
        `${item.cmid}-${item.id}-${item.position}`);
}
export function isAdmin(convo, peerId) {
    return (convo.kind === 'ChatConvo' &&
        !Peer.isContactPeerId(peerId) &&
        !Peer.isChatPeerId(peerId) &&
        ChatMembers.isAdmin(convo.members, peerId));
}
export function isForbidedWritingForAll(convo) {
    return (convo.kind === 'ChatConvo' &&
        !!convo.forbidedWritingForAll &&
        convo.forbidedWritingForAll.value);
}
export function forbidWritingForAll(convo, value, until) {
    if (convo.kind === 'ChatConvo') {
        convo.forbidedWritingForAll = {
            value,
            until,
        };
    }
}
export function isDisabled(convo) {
    switch (convo.kind) {
        case 'ChatConvo':
            return (convo.isCommunityChat &&
                !convo.canWrite.allowed &&
                convo.canWrite.reason === 'chat_disabled');
        case 'BusinessNotify':
        case 'ContactConvo':
        case 'GroupConvo':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
        case 'UserConvo':
            return false;
        default:
            exhaustivenessCheck(convo);
    }
}
/**
 * Проверяет наличие баннера дня рождения
 */
export function hasBirthdayBanner(convo) {
    return convo.convoBanner?.name === 'birthday';
}
/**
 * Если было удалено/восстановлено сообщение, то просматриваем историю на наличие
 * ссылок на это удалённое сообщение в объектах replyMessage/forwardedMessages,
 * чтобы обновить у них флаг isUnavailable
 */
function updateForeignMessageAvailable(convo, cmid, isUnavailable) {
    convo.history.confirmed.forEach((node) => {
        if (node.kind === 'Node' && node.item.kind === 'Normal') {
            node.item = Message.updateForeignAvailableStatus(node.item, cmid, isUnavailable);
        }
    });
}
/**
 * Установить вкл/выкл тогл анимации всплывающих стикеров для конво со стороны юзера
 */
export function updateIsStickersPopupAutoplayDisabledByUser(convo, value) {
    convo.isStickersPopupAutoplayDisabledByUser = value;
}
/**
 * Доступен ли чат в звонке
 */
export function isCallInChatEnabled(convo) {
    switch (convo.kind) {
        case 'ChatConvo':
        case 'UserConvo':
            return true;
        case 'BusinessNotify':
        case 'ContactConvo':
        case 'GroupConvo':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
            return false;
        default:
            exhaustivenessCheck(convo);
    }
}
/**
 * Есть ли ошибки в отложенных сообщениях.
 * Со стороны бэкенда (не удалось вовремя отправить запланированное сообщение)
 * или состороны клиента (осталось неотправленное сообщение локально на клиенте - например, "моргнула" сеть)
 */
export function hasPostponedMessagesError(convo) {
    const backendSendingError = convo.postponed.hasError;
    const clientSendingError = convo.postponed.history.pending.some((msg) => msg.item.hasFailed);
    return backendSendingError || clientSendingError;
}
/**
 * Разрешено ли пользователю отправлять отложенные сообщения в чат, просматривать отложенные сообщения.
 */
export function postponedMessagingPermissions(convo) {
    switch (convo.kind) {
        case 'ChatConvo': {
            /**
             * Для старых каналов нет отложек.
             */
            if (convo.isGroupChannel) {
                return { isHistoryAvailable: false, isSendingPostponedAvailable: false };
            }
            /**
             * Если пользователь покинул чат сам, то скрываем в ui возможность отправить отложку.
             * Пусть сначала вернётся в чат.
             */
            if (convo.state === 'left') {
                return { isHistoryAvailable: true, isSendingPostponedAvailable: false };
            }
            return {
                isHistoryAvailable: true,
                isSendingPostponedAvailable: convo.canWrite.allowed,
            };
        }
        case 'ContactConvo':
        case 'UserConvo':
        case 'GroupConvo':
            return {
                isHistoryAvailable: true,
                isSendingPostponedAvailable: convo.canWrite.allowed,
            };
        case 'BusinessNotify':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
            return { isHistoryAvailable: false, isSendingPostponedAvailable: false };
        default:
            exhaustivenessCheck(convo);
    }
}
/**
 * Может ли беседа участвовать в локальном поиске на клиенте.
 */
export function isSearchableConvo(convo) {
    switch (convo.kind) {
        case 'ChatConvo':
        case 'UserConvo':
        case 'ContactConvo':
        case 'GroupConvo':
            return true;
        case 'BusinessNotify':
        case 'MessageRequestChatConvo':
        case 'MessageRequestUserConvo':
            return false;
        default:
            exhaustivenessCheck(convo);
    }
}
/**
 * Наложены ли на конво ограничения, связанные с переходом в макс
 */
export function hasMigratedSferumRestrictions(convo) {
    return Boolean(convo.kind === 'ChatConvo' &&
        !convo.canWrite.allowed &&
        convo.canWrite.reason === 'chat_moved_to_max');
}
//# sourceMappingURL=Convo.js.map