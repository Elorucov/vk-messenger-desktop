import { getFlagValueByBitOffset, } from '../utils/misc';
import * as History from './History';
export const TAG_LIMIT = 20;
export const TAG_NAME_LIMIT = 20;
export const TAG_COLOR_LIST = [
    'ffc107',
    'ffa000',
    'ff5c5c',
    'e64646',
    'bbaa84',
    'aaaeb3',
    'a162de',
    '9e8d6b',
    '7ececf',
    '7a6c4f',
    '792ec0',
    '76787a',
    '6bc76b',
    '63b9ba',
    '5c9ce6',
    '539b9c',
    '5181b8',
    '4bb34b',
    '45678f',
    '454647',
];
export function resolveId(rawId) {
    return rawId;
}
export function resolveMask(rawMask) {
    return rawMask;
}
// #region GETTERS
export function getBoundaryMinorId(tags, mask) {
    return tags.filterMap.get(mask)?.boundaryMinorId ?? 0;
}
export function hasMore(tags, mask) {
    return tags.filterMap.get(mask)?.hasMore ?? true;
}
export function isLoaded(tags, mask) {
    return ![Infinity, 0].includes(getBoundaryMinorId(tags, mask));
}
export function empty() {
    return {
        filterMap: new Map(),
        items: [],
    };
}
export function hasBit(tag) {
    return typeof tag.bit !== 'undefined';
}
export function isTagIncludeConvo(tag, convo) {
    return !!convo.minorSortId && !!convo.tags?.has(tag.id);
}
export function getLockId(mask) {
    return `tag_${mask}`;
}
/**
 * Сортировка диалогов по убыванию с учетом правил платформы.
 */
export function sorter(aConvo, bConvo) {
    if (aConvo.isDrafted !== bConvo.isDrafted) {
        return Number(bConvo.isDrafted) - Number(aConvo.isDrafted);
    }
    const aLast = History.lastNode({
        history: aConvo.history,
        withDeleted: false,
        withPending: true,
        withFailed: false,
    })?.item;
    const bLast = History.lastNode({
        history: bConvo.history,
        withDeleted: false,
        withPending: true,
        withFailed: false,
    })?.item;
    if (aLast?.kind === 'Queued' || bLast?.kind === 'Queued') {
        return (bLast?.sentAt ?? 0) - (aLast?.sentAt ?? 0);
    }
    if (bConvo.minorSortId !== aConvo.minorSortId) {
        return bConvo.minorSortId - aConvo.minorSortId;
    }
    /**
     * Если беседы совсем идентичные по ID сортировки, то сортируем по Peer.Id чтобы чаты не прыгали при повторной
     * сортировке. Кейс валидный для нескольких чатов в которые ушло первое сообщение, и отправка зафейлилась.
     */
    return bConvo.peerId - aConvo.peerId;
}
export function getSelectedTags(tags, mask) {
    const tagMap = convertMask(tags, mask);
    return Object.entries(tagMap).reduce((acc, [id, hasTag]) => {
        if (hasTag) {
            const tag = tags.find((item) => item.id === resolveId(Number(id)));
            if (tag) {
                acc.push(tag);
            }
        }
        return acc;
    }, []);
}
export function getPeerIdsIntersection(tags) {
    return tags.reduce((acc, tag, index) => {
        if (index === 0) {
            return [...tag.peerIds.values()];
        }
        if (!acc.length) {
            return acc;
        }
        const set = new Set(tag.peerIds);
        return acc.filter((item) => set.has(item));
    }, []);
}
// #endregion
// #region SETTERS
/**
 * Добавляет список диалогов в конец папки
 */
export function push(tags, mask, convos, hasMore) {
    if (!tags.filterMap.has(mask)) {
        tags.filterMap.set(mask, {
            boundaryMinorId: Infinity,
            // по умолчанию считаем, что есть
            hasMore: true,
        });
    }
    const filter = tags.filterMap.get(mask);
    for (const convo of convos) {
        updateBoundaries(tags, mask, convo);
    }
    filter.hasMore = hasMore;
    if (!filter.hasMore) {
        filter.boundaryMinorId = 1;
    }
}
/**
 * Обновляет положение диалога и\или вставляет\удаляет его
 */
export function refresh(tags, convo) {
    for (const tag of tags.items) {
        const isIncluded = tag.peerIds.has(convo.peerId);
        const shouldInclude = isTagIncludeConvo(tag, convo);
        if (isIncluded && !shouldInclude) {
            tag.peerIds.delete(convo.peerId);
        }
        if (!isIncluded && shouldInclude) {
            tag.peerIds.add(convo.peerId);
        }
    }
}
export function deleteTag(tags, tagId) {
    const index = tags.items.findIndex((tag) => tag.id === tagId);
    if (index === -1) {
        return;
    }
    tags.items.splice(index, 1);
}
export function setName(tag, name) {
    tag.name = name;
}
export function replaceTag(tags, newTag) {
    const index = tags.items.findIndex((f) => f.id === newTag.id);
    if (index === -1) {
        return;
    }
    tags.items.splice(index, 1, newTag);
}
// #endregion
function updateBoundaries(tags, mask, convo) {
    const filter = tags.filterMap.get(mask);
    if (filter && filter.boundaryMinorId > convo.minorSortId) {
        filter.boundaryMinorId = convo.minorSortId;
    }
}
export function convertMask(tags, mask) {
    const tagMap = tags.reduce((acc, item) => {
        if (hasBit(item)) {
            acc[item.id] = item.bit;
        }
        return acc;
    }, {});
    /**
     * Тайпскрипт не может определить перегрузку, помогаем ему
     */
    return typeof mask === 'number'
        ? getFlagValueByBitOffset(mask, tagMap)
        : getFlagValueByBitOffset(mask, tagMap);
}
export function toAdUrl(adId, isMailRuAd) {
    return isMailRuAd
        ? `https://ads.vk.com/hq/dashboard/ads/${adId}`
        : `https://vk.com/ads?act=office&union_id=${adId}&utm_medium=community_messages_ad_tag&utm_source=dialog`;
}
//# sourceMappingURL=Tag.js.map