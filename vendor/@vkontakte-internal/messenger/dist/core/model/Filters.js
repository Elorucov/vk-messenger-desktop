import * as Convo from './Convo';
import * as History from './History';
import * as Channel from './Channel';
import { exhaustivenessCheck } from '../utils/misc';
const LocalMajorSort = {
    isDraftedConvo: 1,
    default: 0,
};
const ItemTypeSort = {
    convos: 0,
    channels: -1,
};
const sortableFieldsOrder = [
    'majorSortId',
    'localMajorSort',
    'timestamp',
    'type',
    'minorSortId',
    'itemId',
];
// #region GETTERS
/**
 * Создает пустой объект папок
 */
export function empty() {
    const base = {
        ids: {
            convos: new Set(),
            channels: new Set(),
        },
        hasMore: true,
        unreadCount: 0,
        unreadUnmutedCount: 0,
        totalCount: 0,
        boundaries: {
            convos: null,
            channels: null,
        },
    };
    return {
        adTag: { kind: 'adTag', ...base },
        all: { kind: 'all', ...base },
        unread: { kind: 'unread', headerNotMutedUnread: 0, ...base },
        chats: { kind: 'chats', ...base },
        archive: {
            kind: 'archive',
            hasMentions: false,
            ...base,
        },
        important: { kind: 'important', ...base },
        messageRequest: { kind: 'messageRequest', ...base },
        businessNotify: { kind: 'businessNotify', isHidden: false, ...base },
        unanswered: { kind: 'unanswered', ...base },
    };
}
const IDS_TO_SNAKECASE = {
    adTag: 'ad_tag',
    all: 'all',
    unread: 'unread',
    chats: 'chats',
    important: 'important',
    messageRequest: 'message_request',
    businessNotify: 'business_notify',
    archive: 'archive',
    unanswered: 'unanswered',
};
/**
 * Переводит идентификатор папки в snake_case
 */
export function snakeCaseId(id) {
    return IDS_TO_SNAKECASE[id];
}
export function getLockId(filterKind) {
    return `filter_${filterKind}`;
}
/**
 * Нужно ли отображать папку
 */
export function isVisible(filter) {
    switch (filter.kind) {
        case 'adTag':
        case 'all':
        case 'important':
        case 'unread':
        case 'chats':
        case 'archive':
        case 'unanswered':
            return true;
        case 'messageRequest':
            return (Object.values(filter.ids).some((ids) => ids.size > 0) || filter.hasMore);
        case 'businessNotify':
            /**
             * Странные дела: при загрузке в методе 'messages.getCounters' нам приходят поля business_notify и business_notify_all
             * соответственно они хранятся в businessNotify (он же filter.unreadCount) и businessNotifyTotal(он же filter.totalCount). Но в 80 событии нам приходит только businessNotify.
             * Получается если вы получаете ваше самое первое бизнес-уведомление, то filter.totalCount равен 0 (якобы у нас нет никаких бизнес чатов), а вот непрочитанные всё равно есть. Чатов нет, а непрочитанные есть!
             * поэтому проверяем и filter.totalCount и filter.unreadCount
             */
            return (!filter.isHidden && (filter.totalCount > 0 || filter.unreadCount > 0));
        default:
            exhaustivenessCheck(filter);
    }
}
export function getItems(filter, getters) {
    const convos = getters.convos
        ? Array.from(filter.ids.convos).map(getters.convos)
        : [];
    const channels = getters.channels
        ? Array.from(filter.ids.channels)
            .map(getters.channels)
            .filter((channel) => channel.kind !== 'ChannelRestricted')
        : [];
    return [...convos, ...channels].sort((a, b) => sorter(a, b));
}
// #endregion
// #region SETTERS
/**
 * Добавляет список item'ов в конец папки
 */
export function push(filters, id, items, hasMore, featureFlags) {
    for (const item of items) {
        refresh(filters, item, (filterKind) => {
            if (featureFlags.vkm_update_filter_boundaries) {
                if (filterKind === id) {
                    return true;
                }
                /**
                 * Если пушим в фильтр "все", то обновляем не только его границу, но и границу
                 * фильтров "непрочитанные" и "чаты", так как у них строго одинаковый порядок
                 * сортировки и эти фильтра это подмножества фильтра "все". Границу других
                 * фильтров не обновляем, поскольку их сортировки могут быть разными
                 * из-за разных закрепов (планируется в будущем), и они не подмножества
                 * фильтра "все".
                 */
                if (id === 'all') {
                    return filterKind === 'unread' || filterKind === 'chats';
                }
            }
            return ['all', filterKind].includes(id);
        });
    }
    filters[id].hasMore = hasMore;
}
/**
 * Обновляет положение item и\или вставляет\удаляет его
 */
export function refresh(filters, item, withUpdateBoundaries) {
    ;
    Object.keys(filters).forEach((filterKind) => {
        const filter = filters[filterKind];
        const { ids, id, canInclude } = getCanInclude(filter, item);
        const isIncluded = ids.has(id);
        let shouldInclude = false;
        if (canInclude) {
            if (withUpdateBoundaries?.(filterKind)) {
                updateBoundaries(filters, filterKind, item);
            }
            shouldInclude = isWithinBoundary(filter, item);
        }
        if (isIncluded && !shouldInclude) {
            ids.delete(id);
        }
        if (!isIncluded && shouldInclude) {
            ids.add(id);
        }
    });
}
/**
 * Получаем флаг canInclude и типизированные айдишники, чтобы
 * могли выполнить ids.add(id) без ошибок в типах.
 */
function getCanInclude(filter, item) {
    switch (item.kind) {
        case 'Channel': {
            return {
                ids: filter.ids.channels,
                id: item.id,
                canInclude: canIncludeChannelInFilters(item)[filter.kind],
            };
        }
        case 'ChatConvo':
        case 'GroupConvo':
        case 'UserConvo':
        case 'ContactConvo':
        case 'MessageRequestUserConvo':
        case 'MessageRequestChatConvo':
        case 'BusinessNotify':
            return {
                ids: filter.ids.convos,
                id: item.peerId,
                canInclude: canIncludeConvoInFilters(item)[filter.kind],
            };
        default:
            exhaustivenessCheck(item);
    }
}
function canIncludeConvoInFilters(convo) {
    /*
     * Сначала удаляем диалог из всех фильтров,
     * чтобы потом вставить его в нужные
     */
    const result = {
        adTag: false,
        all: false,
        archive: false,
        businessNotify: false,
        chats: false,
        important: false,
        messageRequest: false,
        unanswered: false,
        unread: false,
    };
    const shouldNotInclude = 
    // Чаты из спейсов, удаленные и скрытые не добавляем в фильтры
    convo.spaceId || Convo.isDeleted(convo) || Convo.isHidden(convo);
    if (shouldNotInclude) {
        return result;
    }
    if (Convo.isBusinessNotify(convo)) {
        result.businessNotify = true;
        return result;
    }
    if (Convo.isMR(convo)) {
        // В фильтр месседж реквестов пытаемся вставить только активные МРы.
        if (Convo.isPendingMR(convo)) {
            result.messageRequest = true;
        }
        // Отклоненные или отмененные МРы удаляем отовсюду и никуда не вставляем.
        return result;
    }
    if (Convo.hasPeerFlag(convo, Convo.PEER_FLAGS.isArchived)) {
        result.archive = true;
        /*
         * Если диалог архивный, то он не может попасть в другие папки,
         * делаем ранний выход
         */
        return result;
    }
    result.all = true;
    if (Convo.isUnread(convo)) {
        result.unread = true;
    }
    if (convo.kind === 'ChatConvo') {
        result.chats = true;
    }
    if (Convo.isAdTag(convo)) {
        result.adTag = true;
    }
    if (Convo.isImportant(convo)) {
        result.important = true;
    }
    if (Convo.isUnanswered(convo)) {
        result.unanswered = true;
    }
    return result;
}
function canIncludeChannelInFilters(channel) {
    /*
     * Сначала удаляем канал из всех фильтров,
     * чтобы потом вставить его в нужные
     */
    const result = {
        adTag: false,
        all: false,
        archive: false,
        businessNotify: false,
        chats: false,
        important: false,
        messageRequest: false,
        unanswered: false,
        unread: false,
    };
    const shouldNotInclude = !channel.isMember || channel.isArchived || Channel.isHidden(channel);
    if (shouldNotInclude) {
        return result;
    }
    result.all = true;
    if (Channel.isUnread(channel)) {
        result.unread = true;
    }
    return result;
}
/**
 * Устанавливает счетчики непрочитанных у фильтров
 */
export function updateCounters(filters, { unread, unreadUnmuted, headerNotMutedUnread, archive, archiveTotal, archiveMentions, messageRequests, businessNotify, businessNotifyTotal, adTag, important, unanswered, }) {
    if (unread !== undefined) {
        filters.all.unreadCount = unread;
        filters.unread.unreadCount = unread;
    }
    if (unreadUnmuted !== undefined) {
        filters.all.unreadUnmutedCount = unreadUnmuted;
        filters.unread.unreadUnmutedCount = unreadUnmuted;
    }
    if (headerNotMutedUnread !== undefined) {
        filters.unread.headerNotMutedUnread = headerNotMutedUnread;
    }
    if (archive !== undefined) {
        filters.archive.unreadCount = archive;
    }
    if (archiveMentions !== undefined) {
        filters.archive.hasMentions = !!archiveMentions;
    }
    if (archiveTotal !== undefined) {
        filters.archive.totalCount = archiveTotal;
    }
    if (messageRequests !== undefined) {
        filters.messageRequest.totalCount = messageRequests;
    }
    if (businessNotify !== undefined) {
        filters.businessNotify.unreadCount = businessNotify;
    }
    if (businessNotifyTotal !== undefined) {
        filters.businessNotify.totalCount = businessNotifyTotal;
    }
    if (adTag !== undefined) {
        filters.adTag.totalCount = adTag;
    }
    if (important !== undefined) {
        filters.important.totalCount = important;
    }
    if (unanswered !== undefined) {
        filters.unanswered.totalCount = unanswered;
    }
}
/**
 * Устанавливает счетчики у фильтров по флагам
 */
export function updateCountersByFlags(filters, variant, flags) {
    Object.entries(Convo.convertFlags(flags)).forEach(([key, hasFlag]) => {
        let filter;
        if (!hasFlag) {
            return;
        }
        switch (key) {
            case 'isAdTag':
                filter = filters.adTag;
                break;
            case 'isImportant':
                filter = filters.important;
                break;
            case 'isUnanswered':
                filter = filters.unanswered;
                break;
            default:
                break;
        }
        if (filter) {
            switch (variant) {
                case 'set':
                    filter.totalCount++;
                    break;
                case 'unset':
                    filter.totalCount--;
                    break;
                default:
                    break;
            }
        }
    });
}
/**
 * Сортирует сущности для корректной отрисовки
 * @param aItem
 * @param bItem
 * @returns
 */
export function sorter(aItem, bItem) {
    const aSort = convertToSortable(aItem);
    const bSort = convertToSortable(bItem);
    return sortableSorter(aSort, bSort);
}
function sortableSorter(a, b) {
    for (let i = 0; i < sortableFieldsOrder.length; i++) {
        const field = sortableFieldsOrder[i];
        if (!field) {
            return 0;
        }
        if (a[field] !== b[field]) {
            return b[field] - a[field];
        }
    }
    return 0;
}
/**
 * Конвертор сущностей в интерфейс для сортировки
 */
function convertToSortable(item) {
    switch (item.kind) {
        case 'Channel': {
            const timestamp = History.lastNode({
                history: item.history,
                withDeleted: false,
                withPending: true,
                withFailed: false,
            })?.item.sentAt ?? item.minorSortId;
            return {
                majorSortId: 0,
                localMajorSort: LocalMajorSort.default,
                timestamp,
                type: ItemTypeSort.channels,
                minorSortId: item.minorSortId,
                itemId: item.id,
            };
        }
        case 'ChatConvo':
        case 'GroupConvo':
        case 'UserConvo':
        case 'ContactConvo':
        case 'MessageRequestUserConvo':
        case 'MessageRequestChatConvo':
        case 'BusinessNotify': {
            const timestamp = History.lastNode({
                history: item.history,
                withDeleted: false,
                withPending: true,
                withFailed: false,
            })?.item.sentAt ?? item.minorSortId;
            return {
                majorSortId: item.majorSortId,
                localMajorSort: item.isDrafted
                    ? LocalMajorSort.isDraftedConvo
                    : LocalMajorSort.default,
                timestamp,
                type: ItemTypeSort.convos,
                minorSortId: item.minorSortId,
                itemId: item.peerId,
            };
        }
        default:
            exhaustivenessCheck(item);
    }
}
export function toggleBusinessNotifyVisibility(draft, visible) {
    draft.businessNotify.isHidden = !visible;
}
// #endregion
/**
 * Высчитывает новые границы "видимости" для папки
 */
function updateBoundaries(filters, id, item) {
    const sort = convertToSortable(item);
    const itemType = convertToItemType(item);
    const boundary = filters[id].boundaries[itemType];
    const shouldUpdate = !isSortableWithinBoundary(sort, boundary);
    if (shouldUpdate) {
        filters[id].boundaries[itemType] = sort;
    }
}
/**
 * Возвращает true, если диалог находится "в пределах видимости" папки
 * диалоги выходящие за пределы не отображаются
 */
function isWithinBoundary(filter, item) {
    /**
     * Делаем такое условие для сценариев по типу: загрузили все сущности из
     * фильтра "все" и потом зархивировали старый чат, который ниже последней
     * сущности фильтра "все". Без этого условия разархированный старый чат не
     * добавится в конец фильтра.
     */
    if (!filter.hasMore) {
        return true;
    }
    const sortable = convertToSortable(item);
    const boundary = filter.boundaries[convertToItemType(item)];
    return isSortableWithinBoundary(sortable, boundary);
}
function isSortableWithinBoundary(sortable, boundary) {
    return !!boundary && sortableSorter(sortable, boundary) <= 0;
}
export function convertToItemType(item) {
    switch (item.kind) {
        case 'Channel':
            return 'channels';
        case 'ChatConvo':
        case 'GroupConvo':
        case 'UserConvo':
        case 'ContactConvo':
        case 'MessageRequestUserConvo':
        case 'MessageRequestChatConvo':
        case 'BusinessNotify':
            return 'convos';
        default:
            exhaustivenessCheck(item);
    }
}
//# sourceMappingURL=Filters.js.map