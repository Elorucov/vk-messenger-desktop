import { isDev } from '../utils/misc';
import * as TextChunk from '../model/TextChunk';
import * as Peer from '../model/Peer';
import * as Attach from '../model/Attach';
import { VK_DONUT_MINIAPP_ID } from '../config/config';
export function resolveCmid(id) {
    if (Number.isNaN(id)) {
        id = 0;
    }
    if (!id || id < 0) {
        // if (isDev) {
        //   /**
        //    * Если тебе хочется инициализировать отсутствующий айди,
        //    * то функцию надо вызывать без аргументов.
        //    */
        //   throw new Error('Айди поста никогда не должен быть равен 0!')
        // }
        /**
         * В данном случае нам можно воспользоваться кастом,
         * потому что:
         * 1. Это происходит внутри того же самого модуля, где объявлен айди - инкапсуляция
         * 2. На самом деле вся эта функцию создана, чтобы сделать типизацию строже.
         * 3. Это исключительный случай, когда по-другому не получится никак.
         */
        return 0;
    }
    return id;
}
export function resolveRandomId(id) {
    if (id >= 0) {
        if (isDev) {
            /**
             * Чтобы не было пересечений со cmid'ами поста, которые всегда строго больше нуля.
             */
            throw new Error('Рандом айди поста должен быть меньше 0!');
        }
        /**
         * В данном случае нам можно воспользоваться кастом,
         * потому что:
         * 1. Это происходит внутри того же самого модуля, где объявлен айди - инкапсуляция
         * 2. На самом деле вся эта функцию создана, чтобы сделать типизацию строже.
         * 3. Это исключительный случай, когда по-другому не получится никак.
         */
        return 0;
    }
    /**
     * Согласно докам, рандом айди должен помещаться в int32.
     *
     * Мы используем отрицательный рейндж для рандомных айдишников.
     * Подробнее можно почитать внутри resolveRandomId.
     */
    const MIN_INT_32 = 2 ** 31;
    return (id % MIN_INT_32);
}
export const DONUT_DURATION = [-1, 1, 2, 3, 4, 5, 6, 7];
export function isRandomId(id) {
    return id < 0;
}
export function toPlainText(post, opts) {
    return TextChunk.toPlainText(post.chunks, opts);
}
export function toRawText(post) {
    return TextChunk.toRawText(post.chunks);
}
export function toWallAttach(post) {
    return {
        id: post.cmid,
        kind: 'Wall',
        date: post.sentAt,
        authorId: Peer.resolveId(post.channelId),
        ownerId: Peer.resolveId(post.channelId),
        attaches: post.attaches,
        chunks: post.chunks,
        isAds: false,
        isDeleted: false,
        isVisibleFor: 'all',
        views: post.views,
    };
}
/**
 * Функция для обновления содержимого поста в случаях,
 * когда мы получили обновленную версию из АПИ / LP
 */
export function merge(newerPost, prevPost) {
    // Сохраняем имеющуюся информация о комментариях
    if (prevPost !== undefined && newerPost.kind === 'Normal') {
        newerPost.comments = {
            ...newerPost.comments,
            history: prevPost.comments.history,
            oneLevelCount: prevPost.comments.oneLevelCount,
            order: prevPost.comments.order,
            negativeRepliesPlaceholder: prevPost.comments.negativeRepliesPlaceholder,
            nextFrom: prevPost.comments.nextFrom,
            prevFrom: prevPost.comments.prevFrom,
        };
        /**
         * в событии 70002 не приходит reactionId и приходит устаревшие reactions
         * (даже если ты убрал свой лайк он всё равно придёт что он есть)
         * поэтому реакции обновляем только через шортполл и не перезаписываем при мердже получив пост по апи/лп/сокету
         */
        newerPost.reactionId = prevPost.reactionId;
        newerPost.reactions = prevPost.reactions;
    }
    return newerPost;
}
export function isEmpty(post) {
    return (post.chunks.length === 0 &&
        !Object.keys(post.attaches).find((key) => key !== 'unknown') &&
        !(post.kind === 'Normal' && post.donut?.placeholder?.text));
}
export function isDonutPlaceholder(post) {
    return Boolean(post.donut?.placeholder);
}
export function isDonut(post) {
    return Boolean(post.donut?.isDonut);
}
function parseCommentsList(comments, source, callback) {
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        // Невозможная ситуация
        if (!comment) {
            throw new Error('Wrong comment index access');
        }
        const isTargetComment = !callback({
            ...source,
            comment,
            onLevelIndex: i,
        });
        const isTargetInReplies = !isTargetComment &&
            !parseCommentsList(comment.replies.history, {
                kind: 'Comment',
                source: comment,
            }, callback);
        if (isTargetComment || isTargetInReplies) {
            return false;
        }
    }
    return true;
}
function parseCommentsTree(post, callback) {
    parseCommentsList(post.comments.history, {
        kind: 'Post',
        source: post,
    }, callback);
}
export function findCommentByCmid(post, cmid) {
    let comment;
    parseCommentsTree(post, (parseItem) => {
        if (parseItem.comment.cmid === cmid) {
            comment = parseItem.comment;
            return false;
        }
        return true;
    });
    return comment;
}
export function findLastComment(post, kind, rootCommentCmid) {
    let comment;
    const checkKind = (comment) => comment.kind === kind;
    parseCommentsTree(post, (parseItem) => {
        if (!checkKind(parseItem.comment)) {
            return true;
        }
        if (parseItem.kind === 'Post' && !rootCommentCmid) {
            comment = parseItem.comment;
        }
        if (parseItem.kind === 'Comment' &&
            rootCommentCmid === parseItem.source.cmid) {
            comment = parseItem.comment;
        }
        return true;
    });
    return comment;
}
export function replaceComment(post, comment) {
    parseCommentsTree(post, (parseItem) => {
        if (parseItem.comment.cmid !== comment.cmid) {
            return true;
        }
        if (parseItem.kind === 'Post') {
            parseItem.source.comments.history[parseItem.onLevelIndex] = comment;
        }
        if (parseItem.kind === 'Comment') {
            parseItem.source.replies.history[parseItem.onLevelIndex] = comment;
        }
        return false;
    });
}
export function deleteComment(post, cmid) {
    parseCommentsTree(post, (parseItem) => {
        if (parseItem.comment.cmid !== cmid) {
            return true;
        }
        if (parseItem.kind === 'Post') {
            parseItem.source.comments.history.splice(parseItem.onLevelIndex, 1);
            parseItem.source.comments.count -= 1;
            parseItem.source.comments.oneLevelCount -= 1;
        }
        if (parseItem.kind === 'Comment') {
            parseItem.source.replies.history.splice(parseItem.onLevelIndex, 1);
            parseItem.source.replies.count -= 1;
        }
        return false;
    });
}
/**
 * Неудаленные узлы истории с сервера.
 */
export function allNormalSpreadedComments(post) {
    const comments = [];
    parseCommentsTree(post, (parseItem) => {
        if (parseItem.comment.kind === 'Normal') {
            comments.push(parseItem.comment);
        }
        return true;
    });
    return comments;
}
export function changeCommentsOrder(post, order) {
    post.comments.history = [];
    post.comments.order = order;
    post.comments.nextFrom = undefined;
    post.comments.prevFrom = undefined;
}
export function updateFakeNewsProperty(post, isFakeNews) {
    post.fakeNews = isFakeNews;
}
export function newPending(fields, text) {
    const randomId = resolveRandomId(-fields.sentAt);
    return {
        ...fields,
        kind: 'Pending',
        randomId,
        chunks: TextChunk.fromClientText(text),
        hasFailed: false,
    };
}
export function changeCommentsCanPost(post, canPost) {
    post.comments.canPost = canPost;
    post.comments.canView =
        canPost || (post.kind === 'Normal' ? post.comments.count !== 0 : false);
}
export function isFromCommunityChannel(post) {
    return post.channelType === "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */;
}
export function toPostChannelUrl(post) {
    const urlParams = new URLSearchParams({ cmid: String(post.cmid) });
    return `https://vk.com/im/channels/${post.channelId}?${urlParams.toString()}`;
}
// временные ограничения на репосты пока не доделаем все заглушки
export function isRepostsDisabledWithAdditionalRules(post, isForwardingDonatePostsAllowed) {
    return Boolean(isFromCommunityChannel(post) && // если это новый канал и...
        (post.ads.markedAsAds || // это реклама
            (post.donut?.isDonut && !isForwardingDonatePostsAllowed) || // это донат и форвардить его запрещено
            post.fakeNews || // это недостоверная инфа
            post.isDeleted || // это удаленный
            post.deleteInfo));
}
/**
 * Сейчас бэк возвращает ссылку на миниапп вкдонат только на платформе мвк.
 * В вкком и вкми вкдонаты возвращают ссылку не на миниапп, а на сообщество.
 * Поэтому не на всех платформах есть возможность открыть миниапп (в таком случае просто открываем новую вкладку с соо)
 */
export function getVKDonutMiniappParams(paywall) {
    const isDonsPaywallActionUrl = paywall.snippet.button.action?.url;
    if (!isDonsPaywallActionUrl) {
        return null;
    }
    const hash = new URL(isDonsPaywallActionUrl).hash.slice(1);
    if (!hash) {
        /**
         * Не спарсили ничего(
         * Скорее всего что-то поменялось
         */
        return null;
    }
    return { miniappId: Attach.resolveMiniAppId(VK_DONUT_MINIAPP_ID), hash };
}
export function isReactionsAvailable(post) {
    const isPostponed = post.kind === 'Postponed';
    const isDeleted = post.kind === 'Normal' && post.isDeleted;
    const isPaywall = isDonutPlaceholder(post);
    return !isPostponed && !isDeleted && !isPaywall;
}
//# sourceMappingURL=Post.js.map