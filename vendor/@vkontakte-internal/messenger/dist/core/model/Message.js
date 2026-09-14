import { current } from 'immer';
import * as Attach from './Attach';
import * as TextChunk from './TextChunk';
import { exhaustivenessCheck, isNonEmptyArray, MIN_INT_32, isShallowEqual, getFlagValueByBitOffset, isDeepEqual, } from '../utils/misc';
import { Time } from '../utils/time';
export var FormatKind;
(function (FormatKind) {
    FormatKind["BOLD"] = "bold";
    FormatKind["ITALIC"] = "italic";
    FormatKind["UNDERLINE"] = "underline";
    FormatKind["URL"] = "url";
})(FormatKind || (FormatKind = {}));
/**
 * Соответствия HTML-тегов форматам сообщения
 */
export const FORMATTING_NODE_NAMES = {
    [FormatKind.BOLD]: 'B',
    [FormatKind.ITALIC]: 'I',
    [FormatKind.UNDERLINE]: 'U',
    [FormatKind.URL]: 'A',
};
// #region GETTERS
export function resolveFormatKind(kind) {
    switch (kind) {
        case FormatKind.BOLD:
            return FormatKind.BOLD;
        case FormatKind.ITALIC:
            return FormatKind.ITALIC;
        case FormatKind.UNDERLINE:
            return FormatKind.UNDERLINE;
        case FormatKind.URL:
            return FormatKind.URL;
        default:
            return null;
    }
}
/**
 * Функция парсит число в локальный по отношению к беседе идентификатор сообщения.
 */
export function resolveCmid(id) {
    if (Number.isNaN(id)) {
        id = 0;
    }
    if (!id || id < 0) {
        /**
         * В данном случае нам можно воспользоваться кастом,
         * потому что:
         * 1. Это происходит внутри того же самого модуля, где объявлен айди - инкапсуляция
         * 2. На самом деле вся эта функция создана, чтобы сделать типизацию строже.
         * 3. Это исключительный случай, когда по-другому не получится никак.
         */
        return 0;
    }
    return id;
}
export function resolveRandomId(id) {
    /**
     * Наш рандом айди должен быть всегда меньше 0.
     *
     * Это сделано для того, чтобы айдишники и рандом айдишники не пересекались.
     * А айдишники всегда больше нуля.
     */
    if (!id || id > 0) {
        return 0;
    }
    /**
     * В данном случае нам можно воспользоваться кастом,
     * потому что:
     * 1. Это происходит внутри того же самого модуля, где объявлен айди - инкапсуляция
     * 2. На самом деле вся эта функция создана, чтобы сделать типизацию строже.
     * 3. Это исключительный случай, когда по-другому не получится никак.
     */
    return id;
}
export function isRandomId(id) {
    return id < 0;
}
export function getCmid(message) {
    if (message.kind === 'Normal') {
        return message.cmid;
    }
    if (message.kind === 'Foreign' && 'rootCmid' in message) {
        return message.rootCmid;
    }
    return undefined;
}
export function toPlainText(message, opts) {
    return TextChunk.toPlainText(message.chunks, opts);
}
export function toRawText(message) {
    return TextChunk.toRawText(message.chunks);
}
/**
 * Можно ли отредактировать сообщение.
 */
export function isEditable(message, now) {
    const canEditByTimeLimit = message.isPostponed
        ? true
        : now - message.sentAt < Time.Day;
    const isFavorites = message.isOut && message.authorId === message.peerId;
    return ((canEditByTimeLimit || message.isPinned || isFavorites) &&
        message.isOut &&
        !isCall(message) &&
        !message.attaches.voice &&
        !message.attaches.sticker &&
        !message.attaches.ugcSticker &&
        !message.attaches.gift &&
        !message.attaches.graffiti &&
        !message.attaches.moneyTransfer &&
        !message.attaches.moneyRequest &&
        !message.attaches.videoMessage &&
        !message.attaches.miniAppWidgets &&
        !isFailed(message) &&
        !isClipOnly(message));
}
/**
 * Сообщение является зафэйленным.
 * Зафэйленными бывают Normal | Queued.
 * Normal являются зафейленными если они были отложенными (message.isPostponed)
 * и в нужное время бэк не смог его по какой-либо причине отправить в целевой чат.
 * Normal являются зафейленными если они были отредактированы (message.editing)
 * и при редактировании произошла ошибка.
 * Queued являются зафейленными если при их отправке произошла ошибка.
 * Остальные сообщения считаем успешными.
 */
export function isFailed(message) {
    if (message.kind === 'Queued') {
        return message.hasFailed;
    }
    if (message.kind === 'Normal') {
        if (message.editing?.status === 'failed') {
            return true;
        }
        if (message.isPostponed && message.isPostponedFailed) {
            return true;
        }
    }
    return false;
}
export function isCall(message) {
    return !!message.attaches.activeCall || !!message.attaches.finishedCall;
}
export function isReactionsAvailable(message) {
    if (message.expireTTL || message.deleteTTL) {
        return false;
    }
    if (message.attaches.gift ||
        message.attaches.activeCall ||
        message.attaches.finishedCall) {
        return false;
    }
    return true;
}
export function isClipOnly(message) {
    if (message.kind === 'Service' || message.kind === 'Expired') {
        return false;
    }
    return (Object.keys(message.attaches).length === 1 &&
        message.attaches.videos?.length === 1 &&
        message.attaches.videos[0].type === 'short_video' &&
        message.chunks.length === 0);
}
export function isPostOnly(message) {
    if (message.kind === 'Service' || message.kind === 'Expired') {
        return false;
    }
    return (Object.keys(message.attaches).length === 1 &&
        (!!message.attaches.wall || !!message.attaches.channelMessage) &&
        message.chunks.filter((c) => c.kind !== 'Text').length === 0);
}
export function isVideoOrAudioOnly(message) {
    if (message.kind === 'Service' || message.kind === 'Expired') {
        return false;
    }
    return ((Object.keys(message.attaches).length === 1 &&
        message.attaches.videos?.length === 1 &&
        message.attaches.videos[0].type === 'video' &&
        message.chunks.length === 0) ||
        (Object.keys(message.attaches).length === 1 &&
            message.attaches.audios?.length === 1 &&
            message.chunks.length === 0));
}
/**
 * Конвертация Normal в Pinned
 */
export function toPinned(message) {
    const { cmid, peerId, authorId, chunks, sentAt, forwardedMessages, replyMessage, attaches, formatData, } = message;
    return {
        kind: 'Pinned',
        cmid,
        peerId,
        authorId,
        chunks,
        sentAt,
        forwardedMessages,
        replyMessage,
        attaches,
        formatData,
        isUnavailable: false,
    };
}
/**
 * Конвертация Normal в Foreign
 */
export function toForeign(params) {
    const { message, ...otherParams } = params;
    const { kind, randomId, isOut, isImportant, replyMessage, ...other } = message;
    return {
        kind: 'Foreign',
        ...other,
        ...otherParams,
    };
}
export function expireForeign(foreign) {
    const { kind, replyMessage, forwardedMessages, chunks, attaches, updatedAt, expireTTL, deleteTTL, ...other } = foreign;
    return {
        kind: 'ForeignExpired',
        ...other,
    };
}
// #endregion
// #region SETTERS
export function updateFailedStatus(message, hasFailed, errorCode) {
    message.hasFailed = hasFailed;
    message.errorCode = errorCode;
}
export function updatePostponedFailedStatus(message, hasFailed) {
    message.isPostponedFailed = hasFailed;
}
export function updateQueuedPostponedTime(message, postponedTime) {
    message.sentAt = postponedTime;
    message.extra.delayedUntil = postponedTime;
}
export function updateCmid(message, cmid) {
    message.cmid = cmid;
}
export function updateEntrypoint(message, entrypoint) {
    message.entrypoint = entrypoint;
}
export function pinMessage(message) {
    message.isPinned = true;
}
export function unpinMessage(message) {
    message.isPinned = false;
}
export function edit(message, { text, attaches, formatData, keepForwarded, editedPostponedTime, }) {
    const undraftedMessage = current(message);
    message.chunks = TextChunk.fromClientText(text);
    message.attaches = attaches;
    message.formatData = formatData;
    // смотрим на undraftedMessage.originalEditedMessage на случай если
    // пользователь попытается отредактировать уже однажды сфейлевшееся
    // при редактировании сообщение или жмёт "Повторить отправку"
    const originalEditedMessage = undraftedMessage.editing?.originalEditedMessage || undraftedMessage;
    message.editing = { status: 'pending', originalEditedMessage };
    if (!keepForwarded) {
        message.replyMessage = undefined;
        message.forwardedMessages = undefined;
    }
    if (message.isPostponed && editedPostponedTime) {
        message.sentAt = editedPostponedTime;
    }
}
/**
 * Лонгполла пока нет + с апи при создании нам не возвращается полное сообщение,
 * только присвоенный ему cmid. Поэтому берём сообщение из Queued и трансформируем в Postponed
 */
export function createPostponedFromQueued(message, cmid, sentAt) {
    return {
        kind: 'Normal',
        cmid,
        peerId: message.peerId,
        authorId: message.authorId,
        chunks: message.chunks,
        isSilent: false,
        sentAt: sentAt || message.sentAt,
        updatedAt: message.updatedAt,
        attaches: message.attaches,
        forwardedMessages: message.forwardedMessages,
        formatData: message.formatData,
        randomId: message.randomId,
        replyMessage: message.replyMessage,
        nestedMsgsCount: message.nestedMsgsCount,
        nestedMsgsHasMore: message.nestedMsgsHasMore,
        isOut: true,
        isUnavailable: false,
        isImportant: false,
        isPinned: false,
        reactions: new Map(),
        isPostponed: true,
    };
}
/**
 * Из-за ограничений движков бек под капотом метода редактирования удаляет
 * исходное сообщение и создаёт новое. Поэтому при успешном (200) запросе
 * messages.editPostponed мы обновляем cmid и убираем поле-черновик editing
 */
export function updateEditedPostponed(message, cmid) {
    message.cmid = cmid;
    updatePostponedFailedStatus(message, false);
    delete message.editing;
}
export function editFailed(message) {
    message.editing && (message.editing.status = 'failed');
}
export function updateFlags(historyNode, variant, flags) {
    const message = historyNode.kind === 'DeletedNode'
        ? historyNode.restorable
        : historyNode.item;
    const same = {
        isOut: message.isOut,
        /**
         * На эти флаги мы реагируем удалением сообщения из истории,
         * поэтому у нас не может быть сообщений с такими флагами в true.
         */
        isSpam: false,
        isDeleted: false,
        isDeletedForAll: false,
        /**
         * Этот флаг нужен только в момент прихода сообщения из
         * лонгполла, дальше нам до него дела нет.
         */
        noPush: false,
        DONT_USE_ME_isUnread: false,
        DONT_USE_ME_isStealth: false,
        DONT_USE_ME_skipUnread: false,
    };
    let old;
    switch (message.kind) {
        case 'Normal':
            old = convertFlags({
                ...same,
                isImportant: message.isImportant,
                isPlayed: !!message.isPlayed,
                hasReactions: historyNode.kind === 'Node' && message.reactions.size > 0,
            });
            break;
        case 'Service':
            old = convertFlags({
                ...same,
                isImportant: false,
                isPlayed: false,
                hasReactions: false,
            });
            break;
        case 'Expired':
            old = convertFlags({
                ...same,
                isImportant: false,
                isPlayed: false,
                hasReactions: false,
            });
            break;
        default:
            exhaustivenessCheck(message);
    }
    let updated;
    switch (variant) {
        case 'unset': {
            updated = convertFlags(old & ~flags);
            break;
        }
        case 'replace': {
            updated = convertFlags(flags);
            break;
        }
        case 'set': {
            updated = convertFlags(old | flags);
            break;
        }
        default:
            exhaustivenessCheck(variant);
    }
    /**
     * Ниже обновляются не все флаги, потому что не для всех это осмысленно.
     *
     * Например, исходящее сообщение не может внезапно стать входящим и наоборот.
     */
    const { isImportant, isSpam, isDeleted, isDeletedForAll, isPlayed, isOut, hasReactions, noPush: _noPush, DONT_USE_ME_isStealth: _DONT_USE_ME_isStealth, DONT_USE_ME_isUnread: _DONT_USE_ME_isUnread, DONT_USE_ME_skipUnread: _DONT_USE_ME_skipUnread, ...rest } = updated;
    switch (message.kind) {
        case 'Normal':
            message.isImportant = isImportant;
            message.isOut = isOut;
            message.isPlayed = isPlayed;
            break;
        case 'Service':
            break;
        case 'Expired':
            break;
        default:
            exhaustivenessCheck(message);
    }
    /*
     * Если видите ошибку TS на следующей строке, это значит,
     * что не все флаги мапятся в свойства сообщения.
     * То есть вы добавили новый флаг, но не добавили его обработку.
     * Нужно либо добавить маппинг, либо объявить неиспользуемую переменную
     * как в коде выше.
     */
    const _typeguard = rest;
    return {
        isDeleted,
        isDeletedForAll,
        isSpam,
    };
}
function updateForwardsUnavailable(forwardedMessages, cmid, isUnavailable) {
    for (let i = 0; i < forwardedMessages.length; i++) {
        const forward = forwardedMessages[i];
        if (forward) {
            if (forward.cmid === cmid) {
                forward.isUnavailable = isUnavailable;
            }
            if (forward?.forwardedMessages?.length) {
                updateForwardsUnavailable(forward.forwardedMessages, cmid, isUnavailable);
            }
        }
    }
}
/**
 * Обновляем флаг isUnavailable в replyMessage/forwardedMessages
 * для того, чтобы недоступное сообщение могли открыть в модалке
 */
export function updateForeignAvailableStatus(message, cmid, isUnavailable) {
    if (!message.replyMessage && !message.forwardedMessages) {
        return message;
    }
    if (message?.replyMessage?.kind === 'Foreign' &&
        message.replyMessage.cmid === cmid) {
        message.replyMessage.isUnavailable = isUnavailable;
    }
    if (!!message?.forwardedMessages) {
        updateForwardsUnavailable(message.forwardedMessages, cmid, isUnavailable);
    }
    return message;
}
// #endregion
// #region CONSTRUCTORS
/**
 * Создает новое локальное сообщение.
 */
export function newQueued(fields, reply, forwarded) {
    /**
     * Согласно докам, рандом айди должен помещаться в int32.
     *
     * Мы используем отрицательный рейндж для рандомных айдишников.
     * Подробнее можно почитать внутри resolveRandomId.
     */
    const randomId = resolveRandomId(-(fields.sentAt % Math.abs(MIN_INT_32)));
    const replyMessage = reply !== undefined
        ? toForeign({
            message: reply,
            rootPeerId: fields.peerId,
            rootRandomId: randomId,
        })
        : undefined;
    const forwardedMessages = forwarded?.map((message) => toForeign({
        message,
        rootPeerId: fields.peerId,
        rootRandomId: randomId,
    }));
    const isPostponed = !!fields.extra.delayedUntil;
    /**
     * Для отложек sentAt это время когда они будут отправлены в беседу, а не когда они созданы в отложках
     */
    const sentAt = isPostponed ? fields.extra.delayedUntil : fields.sentAt;
    return {
        ...fields,
        kind: 'Queued',
        text: fields.text,
        chunks: TextChunk.fromClientText(fields.text),
        hasFailed: false,
        errorCode: undefined,
        isPostponed,
        sentAt,
        randomId,
        replyMessage,
        forwardedMessages: forwardedMessages && isNonEmptyArray(forwardedMessages)
            ? forwardedMessages
            : undefined,
    };
}
// Если появился новый флаг, нужно добавить его сюда
export const MESSAGE_FLAGS = {
    DONT_USE_ME_isUnread: 0,
    isOut: 1,
    isImportant: 3,
    isSpam: 6,
    isDeleted: 7,
    isPlayed: 12,
    DONT_USE_ME_isStealth: 16,
    isDeletedForAll: 17,
    noPush: 20,
    DONT_USE_ME_skipUnread: 23,
    hasReactions: 24,
};
export function convertFlags(flags) {
    /**
     * Тайпскрипт не может определить перегрузку, помогаем ему
     */
    return typeof flags === 'number'
        ? getFlagValueByBitOffset(flags, MESSAGE_FLAGS)
        : getFlagValueByBitOffset(flags, MESSAGE_FLAGS);
}
/**
 * Нельзя отметить проигранным пересланные, а в сервисных и исчезнувших нет воисов и видеосообщений
 */
export function canChangeMessagePlayedStatus(message) {
    if (message.isOut) {
        return false;
    }
    const hasVoiceOrVideoMessage = !!message.attaches.voice || !!message.attaches.videoMessage;
    const hasClipMessage = message.attaches.videos?.length === 1 &&
        message.attaches.videos[0].type === 'short_video';
    if (!hasVoiceOrVideoMessage && !hasClipMessage) {
        return false;
    }
    if (message.isPlayed) {
        return false;
    }
    return true;
}
/**
 * Устанавливает реакцию, которую поставил текущий пользователь
 */
export function setCurrentUserReaction(message, reactionId) {
    message.reactionId = reactionId;
}
/**
 * Проверяет было ли сообщение редактировано.
 */
export function isMessageEdited(message) {
    /**
     * Отредактированные голосовые -- это голосовые с измененной транскрипцией,
     * для них есть отдельный индикатор
     */
    const isEdited = message.updatedAt && !message.attaches.voice;
    return !!isEdited;
}
/**
 * Устанавливает реакции сообщения
 */
export function setReactions(message, reactions) {
    //Просто заменить нельзя, т.к. сломается порядок реакций
    const reactionIds = new Set(reactions.map((r) => r.reactionId));
    //Удаляем реакции, которых нет в новом списке
    Array.from(message.reactions.keys())
        .filter((id) => !reactionIds.has(id))
        .forEach((id) => message.reactions.delete(id));
    reactions.forEach((reaction) => {
        message.reactions.set(reaction.reactionId, reaction);
    });
}
/**
 * Возвращает общее число аттачей в сообщении
 */
export function getMessageAttachmentsCount(message) {
    let count = 0;
    count += Attach.count(message.attaches);
    if (message.replyMessage && message.replyMessage.kind !== 'ForeignExpired') {
        count += getMessageAttachmentsCount(message.replyMessage);
    }
    count +=
        message.forwardedMessages?.reduce((count, message) => (count += getMessageAttachmentsCount(message)), 0) ?? 0;
    return count;
}
export function hasText(message) {
    return message.chunks.length !== 0;
}
/**
 * Вырезаем из Queued сообщения пустые форварды, так как бэк делает то же самое и нам нужно,
 * чтобы локальное сообщение соответствовало тому, которое нам вернет бэк, чтобы не было скачков в UI
 */
export function removeEmptyForwardsFromQueued(queuedMessage) {
    if (!queuedMessage.forwardedMessages) {
        return queuedMessage;
    }
    return {
        ...queuedMessage,
        forwardedMessages: removeEmptyForwards(queuedMessage.forwardedMessages),
    };
}
export function removeEmptyForwards(forwardedMessages) {
    return forwardedMessages.reduce((forwardedMessages, message) => {
        const isEmptyMessage = !hasText(message) && !Attach.kindsCount(message.attaches);
        if (isEmptyMessage && message.forwardedMessages) {
            // Вырезаем сообщение, оставляя только его форварды
            forwardedMessages.push(...message.forwardedMessages);
        }
        else {
            forwardedMessages.push(message);
        }
        return forwardedMessages;
    }, 
    // TS теряет тип NonEmptyArray, но мы точно уверены, что это NonEmptyArray
    []);
}
export function checkMessageHasChanged({ draft, message, }) {
    return (toRawText(message) !== draft.text ||
        draft.keepForwarded !==
            Boolean(message.replyMessage || message.forwardedMessages?.length) ||
        !isShallowEqual(Attach.ids(draft.attaches), Attach.ids(message.attaches)) ||
        !isDeepEqual(draft.attaches.geo, message.attaches.geo) ||
        !isDeepEqual(message.formatData?.items, draft.formatData?.items) ||
        Boolean(message.isPostponed && message.sentAt !== draft.editedPostponedTime));
}
export function getForceAutoPlay(message) {
    if ('forceAutoPlayMedia' in message) {
        return message.forceAutoPlayMedia || false;
    }
    return false;
}
export const isMessageNormal = (message) => message.kind === 'Normal';
export const isMessageQueued = (message) => message.kind === 'Queued';
/**
 * Создает JSON строку со связанными идентификаторами сообщений
 * @param response - Ответ от API отправки сообщений
 * @returns JSON строка с массивом объектов, содержащих peer_id и cmid
 */
export const createLinkedCmids = (response, peerId) => {
    const linkedMessages = Array.isArray(response)
        ? response.map(({ peer_id, conversation_message_id }) => ({
            peer_id,
            cmid: conversation_message_id,
        }))
        : [{ peer_id: peerId, cmid: response.cmid }];
    return JSON.stringify(linkedMessages);
};
/**
 * Проверяет, должно ли вложение отправляться отдельно от текста
 */
export const shouldSendAttachesSeparatelyFromTheText = (message) => {
    const { attaches, forwardedMessages, replyMessage } = message;
    const hasExactlyOneAttachment = Object.keys(attaches).length === 1;
    const hasForwardsOrReplies = !!forwardedMessages || !!replyMessage;
    if (!hasExactlyOneAttachment || hasForwardsOrReplies) {
        return false;
    }
    const isVideoOrClip = attaches.videos?.length === 1 &&
        (attaches.videos[0].type === 'short_video' ||
            attaches.videos[0].type === 'video');
    const isAudio = attaches?.audios?.length === 1;
    const isWallPost = !!attaches.wall;
    const isChannelMessage = !!attaches.channelMessage;
    return isVideoOrClip || isWallPost || isAudio || isChannelMessage;
};
//# sourceMappingURL=Message.js.map