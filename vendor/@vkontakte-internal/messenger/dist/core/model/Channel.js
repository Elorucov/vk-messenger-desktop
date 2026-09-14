import { Ranges } from '@vkontakte-internal/shared';
import { isDev } from '../utils/misc';
import * as Peer from './Peer';
import * as History from './History';
import * as Chain from './Chain';
import { POSTS_PER_PAGE } from '../config/config';
import { customAlphabet } from 'nanoid';
/**
 * Максимальное количество закрепленных каналов
 */
export const MAX_PINNED = 5;
export function canAdmin(channel) {
    return channel.adminLevel >= 3 /* Peer.GroupAdminLevel.Admin */;
}
export const CHANNELS_BASE_PATH = '/channels';
export function isChannelId(id) {
    return Ranges.isGroupId(id);
}
export function resolveId(id) {
    if (!isChannelId(id)) {
        // if (isDev) {
        //   /**
        //    * Если тебе хочется инициализировать отсутствующий айди,
        //    * то функцию надо вызывать без аргументов.
        //    */
        //   throw new Error(
        //     'Айди канала никогда не должен быть равен 0! Читай комментарий к ошибке.',
        //   )
        // }
        id = 0;
    }
    /**
     * В данном случае нам можно воспользоваться кастом,
     * потому что:
     * 1. Это происходит внутри того же самого модуля, где объявлен айди - инкапсуляция
     * 2. На самом деле вся эта функцию создана, чтобы сделать типизацию строже.
     * 3. Это исключительный случай, когда по-другому не получится никак.
     */
    return id;
}
export function toRealGroupId(channelId) {
    // Сейчас на практике айди канала - это пирайди группы,
    // поэтому воспользуемся конвертацией из пиров
    return Peer.toRealId(Peer.resolveId(channelId));
}
/**
 * Функция для обновления содержимого канала в случаях,
 * когда мы получили обновленную версию из АПИ
 */
export function merge(channel, newerChannel) {
    if (channel.id !== newerChannel.id) {
        throw new Error('Channel.merge вызван на 2 разных каналах');
    }
    const newHistory = newerChannel.history;
    newerChannel.history = channel.history;
    insertPosts(newerChannel, newHistory.confirmed);
    // TODO ME-39310
    // После реализации ME-38932, чистить pending узлы по randomId.
    return newerChannel;
}
// #region GETTERS
export function isEmpty(channel) {
    return History.isEmpty(channel.history);
}
export function isPostponedEmpty(channel) {
    return (channel.postponed.loaded && channel.postponed.history.segments.length === 0);
}
export function isPostUnread(channel, post) {
    return post.cmid > channel.inReadCmid;
}
export function isUnread(channel) {
    return channel.unreadCount > 0;
}
/**
 * Частный канал не показывает количество участников
 */
export function isPrivate(channel) {
    return channel.isPrivate;
}
/**
 * Закрытый канал показывает количество участников
 */
export function isClosed(channel) {
    return channel.isClosed;
}
/**
 * Проверяет является ли канал скрытым.
 * Канал может стать скрытым, например, при отписке.
 */
export function isHidden(channel) {
    return channel.majorSortId <= 0 && channel.minorSortId <= 0;
}
export function isPinned(channel) {
    return channel.majorSortId > 0;
}
/**
 * Возвращает ссылку на канал
 */
export function link(channel) {
    return channel.screenName
        ? `/${channel.screenName}`
        : `/club${toRealGroupId(channel.id)}`;
}
export function lastPost({ channel, withPending, }) {
    return History.lastNode({
        history: channel.history,
        withPending,
        withDeleted: false,
        withFailed: true,
    })?.item;
}
export function lastPostponedPost({ channel, }) {
    const lastSegment = channel.postponed.history.segments[channel.postponed.history.segments.length - 1];
    if (!lastSegment) {
        return undefined;
    }
    return (lastSegment.elements[lastSegment.elements.length - 1] ||
        lastSegment.elements[0]).content;
}
/**
 * Возвращает слайс истории вокруг cmid
 */
export function historyAround(channel, cmid) {
    return History.around(channel.history, cmid);
}
/**
 * Возвращает слайс истории вокруг cmid
 */
export function postponedHistoryAround(channel, cmid) {
    const segmentIndex = Chain.getSegmentIndexByElementId(channel.postponed.history, cmid);
    if (segmentIndex === undefined) {
        return { slice: undefined, hasAfter: false, hasBefore: false };
    }
    const segments = channel.postponed.history.segments;
    const nextIndex = segmentIndex + 1;
    const prevIndex = segmentIndex - 1;
    const nextSegment = nextIndex < segments.length ? segments[nextIndex] : null;
    const prevSegment = prevIndex >= 0 ? segments[prevIndex] : null;
    return {
        slice: segments[segmentIndex],
        hasAfter: channel.postponed.hasMore || Boolean(nextSegment),
        hasBefore: Boolean(prevSegment),
    };
}
/**
 * Ищет пост в истории по его cmid
 */
export function findPostByCmid(channel, cmid) {
    const temp = History.findNodeByCmid(channel.history, cmid);
    if (temp.node?.kind === 'Node' || temp.node?.kind === 'DeletedNode') {
        return temp.node;
    }
    return;
}
/**
 * Ищет пост в истории по его cmid
 */
export function findPostInPostponedByCmid(channel, cmid) {
    return Chain.getElementById(channel.postponed.history, cmid)?.content;
}
function isPostInMediaViewerCache(channel, cmid) {
    return !!channel.mediaViewerCache.items.find((item) => item.cmid === cmid);
}
export function isCommunityChannel(channel) {
    return channel.channelType === "community_channel" /* ChannelType.COMMUNITY_CHANNEL */;
}
/**
 * Запрещены ли комментарии для канала
 * Для новых каналов (новые по функциональности), сво-во которое говорит о том,
 * запрещены ли комментарии в канале.
 * В канал прокинуто св-во wall, которое в старых каналах отражало уровень доступа
 * к комментариям стены, конфигурируемое в настройках сообщества.
 * Свойство наследуется из родительского (основного) канала
 */
export function isCommentsRestricted(channel) {
    return (isCommunityChannel(channel) &&
        channel.wall !== undefined &&
        channel.wall > 2 /* WallType.Limited */);
}
export function getCommunityChannelParentScreenName(channel) {
    if (isCommunityChannel(channel)) {
        return channel.parentId !== undefined
            ? `club${channel.parentId * -1}`
            : null;
    }
    return `club${channel.id * -1}`;
}
export function getPostsCmidsWithStubAttach(history) {
    return history.confirmed.reduce((cmids, historyNode) => {
        const attaches = historyNode.kind === 'Node' && historyNode.item.attaches;
        if (attaches &&
            (attaches.channelStubPhoto ||
                attaches.channelStubVideo ||
                attaches.channelStubAudio ||
                attaches.channelStubDoc)) {
            cmids.push(historyNode.item.cmid);
        }
        return cmids;
    }, []);
}
// #endregion
// #region SETTERS
/**
 * Добавляет пост в конец истории канала.
 *
 * TODO
 * На данный момент мы не можем различать ивент восстановления и нового сообщения
 * поэтому временно умеет восстанавливать посты.
 */
export function appendPost(channel, post, randomId) {
    const existingNode = History.findNodeByCmid(channel.history, post.cmid);
    const lastCmid = History.lastCmid(channel.history);
    const isBeforeLast = lastCmid !== undefined && lastCmid >= post.cmid;
    if (isBeforeLast &&
        existingNode.status === 'Deleted' &&
        post.kind === 'Normal') {
        // Временный хак, см TODO в комментарии к фукнции.
        // Если такой пост удален, то восстанавливаем его.
        restorePost(channel, post.cmid, post);
        return;
    }
    /**
     * @TODO https://jira.mvk.com/browse/ME-38932
     * Передавать в appendPost randomId для удаления пендинг поста.
     */
    const pendingItem = removePendingPostByCmid(channel, post.cmid)?.item;
    const linkAttach = pendingItem?.attaches.link;
    /**
     * С бека могли прийти неполные данные, так как он не дожидается парсинга ссылок в сниппеты.
     * Поэтому подмешиваем локальную инфу в данные из апи.
     */
    if (linkAttach) {
        if (post.attaches.link) {
            post.attaches.link = {
                ...post.attaches.link,
                image: post.attaches.link.image || linkAttach.image,
                title: post.attaches.link.title || linkAttach.title,
            };
        }
        else {
            post.attaches.link = linkAttach;
        }
    }
    // При добавлении нового поста считаем что в медиа-кеше могло что-то появиться
    channel.mediaViewerCache.hasNext = true;
    History.append(channel.history, post, randomId);
}
function removePendingPostByCmid(channel, cmid) {
    const pendingNode = channel.history.pending.find((node) => node.item.cmid === cmid);
    if (pendingNode !== undefined) {
        History.removePending(channel.history, pendingNode.item.randomId);
    }
    return pendingNode;
}
/**
 * Замена поста в канале
 */
export function replacePost(channel, updatedPost) {
    // Очитска кеша медиапросмотрщика если пост было в кеше
    isPostInMediaViewerCache(channel, updatedPost.cmid) &&
        clearMediaViewerCache(channel);
    History.replace(channel.history, updatedPost);
}
/**
 * Удаление поста в канале
 */
export function deletePost(channel, cmid, options) {
    // Очитска кеша медиапросмотрщика если пост было в кеше
    isPostInMediaViewerCache(channel, cmid) && clearMediaViewerCache(channel);
    History.remove(channel.history, cmid, options);
}
export function deletePostponedPost(channel, cmid) {
    const item = Chain.getElementById(channel.postponed.history, cmid);
    if (!item) {
        return;
    }
    item.content.markDeleted = true;
}
export function deleteCommunityChannelsPostponedPost(channel, cmid) {
    Chain.removeElement(channel.postponed.history, cmid);
}
/**
 * Восстановление поста в канале
 */
export function restorePost(channel, cmid, post) {
    History.restore(channel.history, cmid, post);
    // Очишаем кеш медиапросмотрщика, так как пост мог быть восстановлен в любом месте истории
    clearMediaViewerCache(channel);
}
export function restorePostponedPost(channel, cmid) {
    const item = Chain.getElementById(channel.postponed.history, cmid);
    if (!item) {
        return;
    }
    delete item.content.markDeleted;
}
/**
 * Вставка постов в историю
 */
export function insertPosts(channel, insertItems) {
    History.insert(channel.history, insertItems);
}
/**
 * Вставка постов в историю
 */
export function insertPostponedPosts(channel, insertItems) {
    if (!insertItems.length) {
        return;
    }
    if (!channel.postponed.hasMore &&
        channel.postponed.history.segments[0] &&
        channel.postponed.history.segments.length === 1) {
        channel.postponed.history.segments = [
            Chain.increaseSegment(channel.postponed.history.segments[0], insertItems, channelPostComapreFn),
        ];
        return;
    }
    channel.postponed.history = Chain.addElements(channel.postponed.history, insertItems, channelPostComapreFn);
}
export const channelPostComapreFn = function (a, b) {
    switch (true) {
        case a.content.cmid === b.content.cmid:
            return 0;
        case a.content.sentAt === b.content.sentAt:
            return a.content.cmid - b.content.cmid;
        default:
            return a.content.sentAt - b.content.sentAt;
    }
};
/**
 * Удаление части истории канала, если в истории стало храниться слишком
 * много постов.
 */
export function cleanup(channel) {
    const aroundCmid = channel.unreadCount > 0 ? channel.inReadCmid : undefined;
    History.cleanup(channel.history, POSTS_PER_PAGE * 1.5, aroundCmid);
}
/**
 * Удаление истории канала
 */
export function cleanHistory(channel) {
    channel.history = {
        confirmed: [],
        pending: [],
    };
}
/**
 * Прочтение постов в канале вплоть до переданного.
 */
export function readUntil(channel, inReadBy, newUnreadCount) {
    /**
     * Если мы не получили обновление для счетчика непрочитанных,
     * значит читаем оптимистично и должны его высчитать сами.
     *
     * Поскольку мы ожидаем, что этот код отрабатывает только
     * при оптимистичном прочтении, мы рассчитываем,
     * что на момент исполнения прочитываемые посты загружены
     * в канал.
     * А значит, мы можем посчитать новый счетчик корректно.
     */
    if (newUnreadCount === undefined) {
        const readAmount = channel.history.confirmed.filter((node) => node.kind === 'Node' &&
            isPostUnread(channel, node.item) &&
            node.item.cmid <= inReadBy).length;
        newUnreadCount = Math.max(0, channel.unreadCount - readAmount);
    }
    channel.inReadCmid = inReadBy;
    channel.unreadCount = newUnreadCount;
}
/**
 * Раз/архивация канала
 */
export function setArchived(channel, isArchived) {
    channel.isArchived = isArchived;
    if (isArchived) {
        channel.majorSortId = 0;
    }
}
/**
 * Включение/отключение уведомлений канала
 */
export function setMuted(channel, value) {
    channel.isMuted = value;
}
/**
 * Вступление/покидание канала
 */
export function setMembership(channel, isMember) {
    channel.isMember = isMember;
    if (!isMember) {
        channel.majorSortId = 0;
        channel.memberStatus = 0;
        return;
    }
}
/**
 * Обновление идентификаторов сортировки канала
 */
export function setSortId(channel, change) {
    if (typeof change.majorSortId !== 'undefined') {
        channel.majorSortId = change.majorSortId;
    }
    if (typeof change.minorSortId !== 'undefined') {
        channel.minorSortId = change.minorSortId;
    }
}
export function setPhotos(channel, photo) {
    if (!channel.photo) {
        channel.photo = {};
    }
    channel.photo.photo50 = photo.photo50;
    channel.photo.photo100 = photo.photo100;
    channel.photo.baseUrl = photo.photo;
    channel.photo.thumbhashUrl = photo.thumbHashUrl;
}
export function setAdminLevel(channel, level) {
    if (level === 0 /* Peer.GroupAdminLevel.Member */ ||
        level === 1 /* Peer.GroupAdminLevel.Moderator */ ||
        level === 2 /* Peer.GroupAdminLevel.Editor */ ||
        level === 3 /* Peer.GroupAdminLevel.Admin */) {
        channel.adminLevel = level;
    }
}
export function setRights(channel, rights) {
    channel.rights = { ...channel.rights, ...rights };
}
export function resetPostponed(channel) {
    channel.postponed.hasMore = false;
    channel.postponed.loaded = false;
    channel.postponed.history.segments = [];
}
export function clearMediaViewerCache(channel) {
    channel.mediaViewerCache = {
        items: [],
        hasPrev: true,
        hasNext: true,
    };
}
/**
 * Неудаленные узлы истории с сервера.
 */
export function allConfirmedHistoryNodes(channel) {
    return channel.history.confirmed.reduce((result, node) => {
        if (node.kind === 'Node') {
            result.push(node);
        }
        return result;
    }, []);
}
/**
 * Неудаленные узлы истории с сервера и на отправку.
 */
export function allHistoryNodes(channel) {
    return [...allConfirmedHistoryNodes(channel), ...channel.history.pending];
}
export function disableWarningNotification(channel) {
    channel.warningNotification = undefined;
}
function setIsHiddenForInboundRequests(channel, value) {
    channel.isHiddenForInboundRequests = value;
}
export function setIsInboundRequest(channel, value) {
    if (value) {
        // Предварительно (и принудительно) мьютим приходящие предложки.
        setMuted(channel, true);
        // Показываем снова потенциально скрытые до текущего момента предложки.
        setIsHiddenForInboundRequests(channel, false);
    }
    channel.isInboundRequest = value;
}
export function isInboundRequest(channel) {
    return channel.kind === 'Channel' && !!channel.isInboundRequest;
}
export function acceptInboundRequest(channel, isLocalChange) {
    // Перед подпиской на предложенный канал читаем всю историю.
    const lastPostCmid = History.lastCmid(channel.history);
    if (typeof lastPostCmid !== 'undefined') {
        readUntil(channel, lastPostCmid, 0);
    }
    setMuted(channel, false);
    channel.isMember = true;
    setIsHiddenForInboundRequests(channel, true);
    if (!isLocalChange) {
        channel.isInboundRequest = false;
    }
}
export function undoAcceptInboundRequest(channel) {
    setMuted(channel, true);
    channel.isMember = false;
    setIsHiddenForInboundRequests(channel, false);
}
export function rejectInboundRequest(channel, isLocalChange) {
    setIsHiddenForInboundRequests(channel, true);
    if (!isLocalChange) {
        /**
         * Нет разницы это только локальное изменение или оно пришло глобально по сокету (лонгполлу).
         * Но помнить и учитывать этот момент нужно!!!
         */
    }
}
export function undoRejectInboundRequest(channel) {
    setIsHiddenForInboundRequests(channel, false);
}
export function setIsRecommended(channel, value) {
    channel.isRecommended = value;
}
export function isRecommended(channel) {
    return (channel.kind === 'Channel' && !!channel.isRecommended && !channel.isMember);
}
export function safeGet(channels, channelId) {
    const channel = channels.get(channelId);
    if (channel) {
        return channel;
    }
    if (isDev) {
        throw new Error(`Канал ${channelId} не найден в кэше! Обрати внимание на то как загружаются недостающие данные в сторе.`);
    }
    // TODO: разобраться с кастом
    return channels.get(resolveId(0));
}
export function findMediaViewerCacheItem(channel, id, cmid) {
    return channel.mediaViewerCache.items.find((item) => id === item.id && cmid === item.cmid);
}
export function setBanInfo(channel, banInfo) {
    channel.banInfo = banInfo;
}
export function setDeletionMark(channel, isDeleted) {
    channel.isDeleted = isDeleted;
}
export function generateGuid() {
    // псевдо UUID (тк сгенерен не по спеке), маскируемся под uuid, чтобы пройти
    // валидатор на беке
    function* generate() {
        const nanoid = customAlphabet('1234567890abcdef', 32)();
        yield nanoid.substring(0, 8);
        yield nanoid.substring(8, 12);
        yield nanoid.substring(12, 16);
        yield nanoid.substring(16, 20);
        yield nanoid.substring(20, 32);
    }
    return [...generate()].join('-');
}
// в channels.getById, например, в extended, group возвращается с положительным id.
// конвертируем его поэтому в правильный рендж со знаком "-"
export function fromApiGroupIdToGroupRangeId(channelId) {
    // тут проверяем что он из ренжа группы, но положительного
    if (channelId >= 1 && channelId < 1000000000) {
        return -channelId;
    }
    throw new Error('New channel group range convert error');
}
const REPORT_REASON_IDS = [
    0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 21, 22, 24, 25,
    26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46,
    100, 101, 200, 201, 203, 204, 401, 402, 403, 404, 405, 406, 407, 408,
];
export function isReportReasonId(id) {
    if (typeof id !== 'number') {
        return false;
    }
    for (let i = 0, len = REPORT_REASON_IDS.length; i < len; i += 1) {
        if (REPORT_REASON_IDS[i] !== id) {
            continue;
        }
        return true;
    }
    return false;
}
// временные ограничения на репосты пока не доделаем все заглушки
export function isRepostsDisabledWithAdditionalRules(channel) {
    return Boolean(isCommunityChannel(channel) && (isPrivate(channel) || isClosed(channel)));
}
//# sourceMappingURL=Channel.js.map