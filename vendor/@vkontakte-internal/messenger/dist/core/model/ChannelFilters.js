import * as Channel from './Channel';
// #region GETTERS
/**
 * Создает пустой объект папок
 */
export function empty() {
    const base = {
        channelIds: new Set(),
        hasMore: true,
        unreadCount: 0,
        unreadUnmutedCount: 0,
        totalCount: 0,
        boundary: {
            channelId: Channel.resolveId(0),
            majorSortId: Infinity,
            minorSortId: Infinity,
        },
    };
    return {
        all: { kind: 'all', ...base },
        unread: { kind: 'unread', ...base },
        archive: {
            kind: 'archive',
            isHidden: false,
            ...base,
        },
        inboundRequest: {
            kind: 'inboundRequest',
            ...base,
        },
        recommended: {
            kind: 'recommended',
            ...base,
            totalCount: Infinity,
        },
    };
}
const IDS_TO_SNAKECASE = {
    all: 'all',
    unread: 'unread',
    archive: 'archived',
    inboundRequest: 'inbound_request',
    recommended: 'recommended',
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
export function isLoaded(filter) {
    return (filter.boundary.minorSortId !== Infinity &&
        filter.boundary.majorSortId !== Infinity);
}
/**
 * Нужно ли отображать папку
 */
export function isVisible(filter) {
    switch (filter.kind) {
        case 'all':
        case 'unread':
            return true;
        // Предложки каналов и рекомендованные каналы отрисовываются без папки.
        case 'inboundRequest':
        case 'recommended':
            return false;
        default:
            return !filter.isHidden && (filter.channelIds.size > 0 || filter.hasMore);
    }
}
// #endregion
// #region SETTERS
/**
 * Добавляет список диалогов в конец папки
 */
export function push(filters, id, channels, hasMore) {
    for (const channel of channels) {
        updateBoundaries(filters, id, channel);
        refresh(filters, channel);
    }
    filters[id].hasMore = hasMore;
    if (!filters[id].hasMore) {
        filters[id].boundary = {
            majorSortId: 0,
            minorSortId: 0,
            channelId: Channel.resolveId(0),
        };
    }
}
/**
 * Обновляет положение диалога и\или вставляет\удаляет его
 */
export function refresh(filters, channel) {
    const shouldIncludeMap = shouldIncludeInFilters(filters, channel);
    Object.keys(filters).forEach((filterKind) => {
        const { channelIds } = filters[filterKind];
        const isIncluded = channelIds.has(channel.id);
        const shouldInclude = shouldIncludeMap[filterKind];
        if (isIncluded && !shouldInclude) {
            channelIds.delete(channel.id);
        }
        if (!isIncluded && shouldInclude) {
            channelIds.add(channel.id);
        }
    });
    return;
}
function shouldIncludeInFilters(filters, channel) {
    /*
     * Сначала удаляем канал из всех папок,
     * чтобы потом вставить его в нужную
     */
    const result = {
        all: false,
        archive: false,
        unread: false,
        inboundRequest: false,
        recommended: false,
    };
    if (!channel.isMember) {
        if (isWithinBoundary(filters.inboundRequest, channel)) {
            result.inboundRequest =
                isInboundRequest(channel, filters) &&
                    !channel.isHiddenForInboundRequests;
        }
        if (isWithinBoundary(filters.recommended, channel)) {
            result.recommended = Channel.isRecommended(channel);
        }
        return result;
    }
    if (channel.isArchived) {
        if (isWithinBoundary(filters.archive, channel)) {
            result.archive = true;
        }
        /*
         * Если канал архивный, то он не может попасть в другие папки,
         * делаем ранний выход
         */
        return result;
    }
    if (isWithinBoundary(filters.all, channel)) {
        result.all = true;
    }
    if (Channel.isUnread(channel) && isWithinBoundary(filters.unread, channel)) {
        result.unread = true;
    }
    return result;
}
/**
 * Устанавливает счетчики непрочитанных у папок
 */
export function updateCounters(filters, { unread, archiveTotal, unreadUnmuted, inboundRequestsTotal, recommendedTotal, }) {
    if (unread !== undefined) {
        filters.all.unreadCount = unread;
        filters.unread.unreadCount = unread;
    }
    if (unreadUnmuted !== undefined) {
        filters.all.unreadUnmutedCount = unreadUnmuted;
        filters.unread.unreadUnmutedCount = unreadUnmuted;
    }
    if (archiveTotal !== undefined) {
        filters.archive.totalCount = archiveTotal;
    }
    if (inboundRequestsTotal !== undefined) {
        filters.inboundRequest.totalCount = inboundRequestsTotal;
    }
    if (recommendedTotal !== undefined) {
        filters.recommended.totalCount = recommendedTotal;
    }
}
/**
 * Сортировка каналов по убыванию с учетом правил платформы.
 */
export function sorter(aChannel, bChannel) {
    if (aChannel.majorSortId !== bChannel.majorSortId) {
        return bChannel.majorSortId - aChannel.majorSortId;
    }
    const aLast = Channel.lastPost({ channel: aChannel, withPending: true });
    const bLast = Channel.lastPost({ channel: bChannel, withPending: true });
    if (aLast?.kind === 'Pending' || bLast?.kind === 'Pending') {
        return (bLast?.sentAt ?? 0) - (aLast?.sentAt ?? 0);
    }
    if (bChannel.minorSortId !== aChannel.minorSortId) {
        return bChannel.minorSortId - aChannel.minorSortId;
    }
    return aChannel.id - bChannel.id;
}
// #endregion
/**
 * Высчитывает новые границы "видимости" для папки
 */
function updateBoundaries(filters, id, channel) {
    if (Channel.isHidden(channel)) {
        return;
    }
    if (channel.majorSortId < filters[id].boundary.majorSortId) {
        filters[id].boundary = {
            channelId: channel.id,
            majorSortId: channel.majorSortId,
            minorSortId: channel.minorSortId,
        };
    }
    else if (channel.majorSortId === filters[id].boundary.majorSortId &&
        channel.minorSortId < filters[id].boundary.minorSortId) {
        filters[id].boundary.channelId = channel.id;
        filters[id].boundary.minorSortId = channel.minorSortId;
    }
    else if (channel.majorSortId === filters[id].boundary.majorSortId &&
        channel.minorSortId === filters[id].boundary.minorSortId) {
        filters[id].boundary.channelId = channel.id;
    }
    /*
      В целях оптимизации, при обновлении границ общей папки
      сразу сдвигаем границы для папки непрочитанных.
      Это позволит мгновенно показать непрочитанные из кэша.
     */
    if (id === 'all') {
        updateBoundaries(filters, 'unread', channel);
    }
}
/**
 * Возвращает true, если канал находится "в пределах видимости" папки
 * каналы выходящие за пределы не отображаются
 */
function isWithinBoundary(filter, channel) {
    if (Channel.isHidden(channel)) {
        return false;
    }
    if (channel.majorSortId < filter.boundary.majorSortId) {
        return false;
    }
    if (channel.majorSortId > filter.boundary.majorSortId) {
        return true;
    }
    if (channel.minorSortId < filter.boundary.minorSortId) {
        return false;
    }
    if (channel.minorSortId > filter.boundary.minorSortId) {
        return true;
    }
    if (channel.id > filter.boundary.channelId) {
        return false;
    }
    return true;
}
export function isInboundRequest(channel, filters) {
    return (channel.isInboundRequest ||
        filters.inboundRequest.channelIds.has(channel.id));
}
//# sourceMappingURL=ChannelFilters.js.map