import * as Post from '../../core/model/Post';
import * as TextChunk from '../../core/model/TextChunk';
import * as Peer from '../../core/model/Peer';
import * as Channel from '../../core/model/Channel';
import * as Reaction from '../../core/model/Reaction';
import * as ReactionOld from '../../core/model/ReactionOld';
import { apiAttachWallOwnerId, fromApiChannelMessageAttach, fromApiWallAttach, } from './AttachConverter';
import { fromApiPostReaction } from './ReactionConverter';
// @TODO: Парсить данные из апи каналов, когда реакции добавят в поле лайков
const apiMockReactions = {
    id: 'reactions',
    items: [
        {
            id: 0,
            title: 'Нравится',
            asset: {
                animation_url: 'https://vk.com/reaction/3-reactions-0?c_uniq_tag=83b2081a8e4adfc36ee536f5f1b4ad470174c89678369a4b9dc5547614a3955e',
                images: [
                    {
                        url: 'https://vk.com/reaction/1-reactions-0-48?c_uniq_tag=e6bee176471af6e4f7ca0f57ac099847d57b8101bf07944e47b42b097a6d8455',
                        width: 48,
                        height: 48,
                    },
                    {
                        url: 'https://vk.com/reaction/1-reactions-0-72?c_uniq_tag=d6f55fe94c0add8f817b447cbd804768752eb996c06ef222b39eb3fd35834780',
                        width: 72,
                        height: 72,
                    },
                ],
                title: {
                    color: {
                        foreground: {
                            light: 'FF3347',
                            dark: 'FF5C5C',
                        },
                        background: {
                            light: 'FFEDED',
                            dark: '3E2526',
                        },
                    },
                },
                title_color: {
                    light: 'FF3347',
                    dark: 'FF5C5C',
                },
            },
        },
        {
            id: 1,
            title: 'Смешно',
            asset: {
                animation_url: 'https://vk.com/reaction/3-reactions-1?c_uniq_tag=a47193579880c0f53dd597a15d3bd57d4827820687c73d6128df2720647b42b9',
                images: [
                    {
                        url: 'https://vk.com/reaction/1-reactions-1-48?c_uniq_tag=8f5eb3a1d6a6ec81aceff211782af3c9e9a5d1c837f0bfade6965a6844786f8b',
                        width: 48,
                        height: 48,
                    },
                    {
                        url: 'https://vk.com/reaction/1-reactions-1-72?c_uniq_tag=c852fcad6e67059878dcf1905e3e416fd89fbc61222ead100935a6fcc1dab4c9',
                        width: 72,
                        height: 72,
                    },
                ],
                title: {
                    color: {
                        foreground: {
                            light: 'FF8000',
                            dark: 'FFC233',
                        },
                        background: {
                            light: 'FFF2D6',
                            dark: '352E23',
                        },
                    },
                },
                title_color: {
                    light: 'FF8000',
                    dark: 'FFC233',
                },
            },
        },
        {
            id: 2,
            title: 'Ого!',
            asset: {
                animation_url: 'https://vk.com/reaction/3-reactions-2?c_uniq_tag=b946fcbe262642bc920331746b6eccd9f175bb17d8ef37e54d232fa35ca2c750',
                images: [
                    {
                        url: 'https://vk.com/reaction/1-reactions-2-48?c_uniq_tag=2a6544dce8827d216db7ea91eafc726cd3a823f5d465ba00216901a6de2801ad',
                        width: 48,
                        height: 48,
                    },
                    {
                        url: 'https://vk.com/reaction/1-reactions-2-72?c_uniq_tag=5a0663f3d38dd6fbcf3e4973610d50641420631c9df30b6cf80eee0dd5c5efee',
                        width: 72,
                        height: 72,
                    },
                ],
                title: {
                    color: {
                        foreground: {
                            light: 'FF8000',
                            dark: 'FFC233',
                        },
                        background: {
                            light: 'FFF2D6',
                            dark: '352E23',
                        },
                    },
                },
                title_color: {
                    light: 'FF8000',
                    dark: 'FFC233',
                },
            },
        },
        {
            id: 3,
            title: 'Восторг',
            asset: {
                animation_url: 'https://vk.com/reaction/3-reactions-3?c_uniq_tag=c6ed3add99e841dccda5479c8e21779954e61e0fba15f94a2ae16706df492123',
                images: [
                    {
                        url: 'https://vk.com/reaction/1-reactions-3-48?c_uniq_tag=eda1a2c18d733b356babdeed5f52cdcc64dd59f1f69776a133fc34a5627eecee',
                        width: 48,
                        height: 48,
                    },
                    {
                        url: 'https://vk.com/reaction/1-reactions-3-72?c_uniq_tag=be09c5080773a9ba78984406588c7371e48073e80b842eb7c9a817f7b435379b',
                        width: 72,
                        height: 72,
                    },
                ],
                title: {
                    color: {
                        foreground: {
                            light: 'FF8000',
                            dark: 'FFC233',
                        },
                        background: {
                            light: 'FFF2D6',
                            dark: '352E23',
                        },
                    },
                },
                title_color: {
                    light: 'FF8000',
                    dark: 'FFC233',
                },
            },
        },
        {
            id: 5,
            title: 'Печаль',
            asset: {
                animation_url: 'https://vk.com/reaction/3-reactions-5?c_uniq_tag=c61122c8c334154cb10ccf0e0687057bf1f0f40c2817198b2e1150df534c22c4',
                images: [
                    {
                        url: 'https://vk.com/reaction/1-reactions-5-48?c_uniq_tag=31bcb230babad96120a62589c52af22811aaba54d4ed73a36cfd499d9d94102f',
                        width: 48,
                        height: 48,
                    },
                    {
                        url: 'https://vk.com/reaction/1-reactions-5-72?c_uniq_tag=a840d0eb581c133d97638ff5bf34f4b33f3fb8557b932cfe3516925b88e2f151',
                        width: 72,
                        height: 72,
                    },
                ],
                title: {
                    color: {
                        foreground: {
                            light: '4986CC',
                            dark: '71AAEB',
                        },
                        background: {
                            light: 'EDF3FA',
                            dark: '27303C',
                        },
                    },
                },
                title_color: {
                    light: '4986CC',
                    dark: '71AAEB',
                },
            },
        },
        {
            id: 4,
            title: '&$#%!',
            asset: {
                animation_url: 'https://vk.com/reaction/3-reactions-4?c_uniq_tag=063e6b2dd888bb5a9716cf6153f03bf9c0c9707713b857eed8fe1e4e09aea2b3',
                images: [
                    {
                        url: 'https://vk.com/reaction/1-reactions-4-48?c_uniq_tag=c80e3224c299a73384c057ff065c9458dcd533d57a1458875eb98883c3a96783',
                        width: 48,
                        height: 48,
                    },
                    {
                        url: 'https://vk.com/reaction/1-reactions-4-72?c_uniq_tag=a0eddba1ec31f96adbb9afa2c6c14bec055b95f8d9f113bdf759fb5a9c9054f0',
                        width: 72,
                        height: 72,
                    },
                ],
                title: {
                    color: {
                        foreground: {
                            light: 'EF5203',
                            dark: 'FA5300',
                        },
                        background: {
                            light: 'FDEBE8',
                            dark: '3C2421',
                        },
                    },
                },
                title_color: {
                    light: 'EF5203',
                    dark: 'FA5300',
                },
            },
        },
    ],
};
export function fromApiPost(apiPost) {
    const isFromCommunityChannel = apiPost.cm_payload &&
        apiPost.channel_type === "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */;
    return isFromCommunityChannel
        ? fromApiCommunityChannelPost(apiPost)
        : fromApiWallPost(apiPost);
}
function fromApiWallPost(apiPost) {
    const apiPostWall = {
        ...apiPost?.attachments?.[0]?.wall,
        attachments: getAttachments(apiPost),
        inner_type: 'wall_wallpost',
    };
    const copyHistory = apiPostWall?.copy_history?.[0];
    let attaches = {};
    /**
     *  Так как пост приходит в виде аттача wall, первый по вложенности copy_history
     *  должен быть представлен в виде аттача wall а не WallHistory
     */
    if (copyHistory && copyHistory.from_id !== 0) {
        const copyOwnerId = apiAttachWallOwnerId(copyHistory);
        const isWallReply = copyHistory.post_type === 'reply';
        let isVisibleFor = 'all';
        if (copyHistory.friends_only === 1) {
            isVisibleFor = 'friends';
        }
        if (copyHistory.best_friends_only === 1) {
            isVisibleFor = 'best_friends';
        }
        attaches = {
            ...attaches,
            ...(isWallReply
                ? {
                    wallReply: {
                        kind: 'WallReply',
                        id: copyHistory.id || 0,
                        postId: copyHistory.reply_post_id || 0,
                        authorId: Peer.resolveId(copyHistory.from_id),
                        ownerId: Peer.resolveId(copyOwnerId),
                        parentsStack: copyHistory.parents_stack,
                        date: (copyHistory.date || 0) * 1000,
                        chunks: TextChunk.fromServerText(copyHistory.text || ''),
                        attaches: fromApiWallAttach(copyHistory),
                    },
                }
                : {
                    wall: {
                        kind: 'Wall',
                        isAds: copyHistory.post_type === 'post_ads',
                        id: copyHistory.id || 0,
                        authorId: Peer.resolveId(copyHistory.from_id),
                        ownerId: Peer.resolveId(copyOwnerId),
                        date: (copyHistory.date || 0) * 1000,
                        chunks: TextChunk.fromServerText(copyHistory.text || ''),
                        attaches: fromApiWallAttach(copyHistory),
                        isDeleted: copyHistory.is_deleted || false,
                        isVisibleFor,
                    },
                }),
        };
        apiPostWall.copy_history = undefined;
    }
    if (apiPostWall?.attachments) {
        attaches = { ...attaches, ...fromApiWallAttach(apiPostWall) };
    }
    const reactions = [];
    const reactionIds = [];
    apiMockReactions.items.forEach((apiReaction) => {
        const convertedReaction = fromApiPostReaction(apiReaction);
        if (convertedReaction) {
            reactions.push(convertedReaction);
            reactionIds.push(convertedReaction.id);
        }
    });
    return {
        post: {
            kind: 'Normal',
            cmid: Post.resolveCmid(apiPost.cmid),
            channelType: apiPost.channel_type || "channel" /* Channel.ChannelType.CHANNEL */,
            chunks: apiPostWall?.text
                ? TextChunk.fromServerText(apiPostWall.text)
                : [],
            views: apiPostWall?.views?.count || 0,
            sentAt: apiPost.time * 1000,
            updatedAt: apiPost.update_time && apiPost.update_time * 1000,
            channelId: Channel.resolveId(apiPost.author_id),
            likes: {
                count: apiPostWall?.likes?.count || 0,
                reactionId: Boolean(apiPostWall?.likes?.user_likes)
                    ? ReactionOld.resolveId(apiPostWall?.reactions?.user_reaction)
                    : undefined,
                availableReactionIds: reactionIds,
                peerIds: new Set(),
            },
            reposts: {
                count: apiPostWall?.reposts?.count || 0,
                isReposted: Boolean(apiPostWall?.reposts?.user_reposted),
            },
            comments: {
                count: apiPostWall?.comments?.count || 0,
                oneLevelCount: 0,
                canView: Boolean(apiPostWall?.comments?.can_view),
                canPost: Boolean(apiPostWall?.comments?.can_post),
                canOpen: Boolean(apiPostWall?.comments?.can_open),
                canClose: Boolean(apiPostWall?.comments?.can_close),
                history: [],
                //бек не поддерживает пока сортировку по "интересным" для новых каналов
                //TODO: comments: ждем доработку на беке, чтобы он возращал тип
                //https://jira.mvk.com/browse/ME-70639
                //@ts-expect-error
                order: apiPost.type ? 'old' : 'interesting',
            },
            attaches,
            donut: {
                isDonut: apiPostWall.donut?.is_donut,
                placeholder: apiPostWall.donut?.placeholder
                    ? {
                        text: apiPostWall.donut.placeholder?.text,
                        button: apiPostWall.donut.placeholder?.button,
                    }
                    : undefined,
                duration: fromApiDonutDuration(apiPostWall.donut?.paid_duration),
            },
            signerId: apiPostWall.signer_id
                ? Peer.resolveId(apiPostWall.signer_id)
                : undefined,
            reactionId: Number.isInteger(apiPostWall?.reactions?.user_reaction)
                ? Reaction.resolveId(apiPostWall?.reactions?.user_reaction)
                : undefined,
            reactions: apiPostWall.reactions
                ? fromApiMessageReactions(apiPostWall.reactions.items)
                : new Map(),
            ads: {
                markedAsAds: Boolean(apiPostWall.marked_as_ads),
                erid: apiPostWall.author_ad?.ad_marker,
                eridUrl: apiPostWall.author_ad?.advertiser_info_url,
            },
            canEdit: Boolean(apiPostWall.can_edit),
            trackCode: apiPostWall.track_code,
            isDeleted: Boolean(apiPostWall.is_deleted),
            deleteInfo: apiPostWall.deleted_reason
                ? {
                    reason: apiPostWall.deleted_reason,
                    details: apiPostWall.deleted_details,
                }
                : undefined,
        },
        reactions,
    };
}
export function fromApiCommunityChannelPost(apiPost) {
    let attaches = {};
    if (apiPost?.attachments) {
        attaches = { ...attaches, ...fromApiChannelMessageAttach(apiPost) };
    }
    const reactions = [];
    const reactionIds = [];
    apiMockReactions.items.forEach((apiReaction) => {
        const convertedReaction = fromApiPostReaction(apiReaction);
        if (convertedReaction) {
            reactions.push(convertedReaction);
            reactionIds.push(convertedReaction.id);
        }
    });
    return {
        post: {
            kind: 'Normal',
            channelType: apiPost.channel_type || "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */,
            cmid: Post.resolveCmid(apiPost.cmid),
            chunks: apiPost.text ? TextChunk.fromServerText(apiPost.text) : [],
            views: apiPost.cm_payload?.counters?.views?.count || 0,
            sentAt: apiPost.time * 1000,
            updatedAt: apiPost.update_time && apiPost.update_time * 1000,
            channelId: Channel.resolveId(apiPost.author_id),
            parentId: apiPost.parent_id
                ? Channel.resolveId(apiPost.parent_id)
                : undefined,
            likes: {
                count: apiPost.cm_payload?.counters?.reactions?.count || 0,
                reactionId: Boolean(apiPost.cm_payload?.counters?.reactions?.user_reaction)
                    ? ReactionOld.resolveId(apiPost.cm_payload?.counters?.reactions?.user_reaction)
                    : undefined,
                availableReactionIds: reactionIds,
                peerIds: new Set(),
            },
            reposts: {
                count: apiPost.cm_payload?.counters?.reposts?.count || 0,
                isReposted: Boolean(apiPost.cm_payload?.counters?.reposts?.user_reposted),
            },
            comments: {
                count: apiPost.cm_payload?.counters?.comments?.count || 0,
                oneLevelCount: 0,
                canView: Boolean(apiPost.cm_payload?.counters?.comments?.can_view),
                canPost: Boolean(apiPost.cm_payload?.counters?.comments?.can_post),
                canOpen: Boolean(apiPost.cm_payload?.counters?.comments?.can_open),
                canClose: Boolean(apiPost.cm_payload?.counters?.comments?.can_close),
                history: [],
                // На данный момент сортировка "сначала интересные" в новых каналах не
                // реализована, поэтому фолбечимся до "сначала старые" по умолчанию.
                // TODO: вернуть 'interesting' после реализации механизма на бэке.
                order: 'old',
            },
            attaches,
            donut: {
                isDonut: apiPost.cm_payload?.donut?.is_donut,
                placeholder: apiPost.cm_payload?.donut?.placeholder
                    ? {
                        text: apiPost.cm_payload?.donut.placeholder?.text,
                        button: apiPost.cm_payload?.donut.placeholder?.button,
                    }
                    : undefined,
                duration: fromApiDonutDuration(apiPost.cm_payload?.donut?.paid_duration),
                paywall: apiPost.cm_payload?.donut?.paywall,
            },
            signerId: apiPost.cm_payload?.signer_id
                ? Peer.resolveId(apiPost.cm_payload?.signer_id)
                : undefined,
            reactionId: Number.isInteger(apiPost.cm_payload?.counters?.reactions?.user_reaction)
                ? Reaction.resolveId(apiPost.cm_payload?.counters?.reactions?.user_reaction)
                : undefined,
            reactions: apiPost.cm_payload?.counters?.reactions
                ? fromApiMessageReactions(apiPost.cm_payload?.counters?.reactions.items)
                : new Map(),
            ads: {
                markedAsAds: Boolean(apiPost.cm_payload?.marked_as_ads),
                erid: apiPost.cm_payload?.ads_info?.ad_marker,
                eridUrl: apiPost.cm_payload?.ads_info?.advertiser_info_url,
            },
            canEdit: Boolean(apiPost.cm_payload?.can_edit),
            trackCode: apiPost.cm_payload?.track_code,
            isDeleted: Boolean(apiPost.cm_payload?.is_deleted),
            deleteInfo: apiPost.cm_payload?.deleted_reason
                ? {
                    reason: apiPost.cm_payload?.deleted_reason,
                    details: apiPost.cm_payload?.deleted_details,
                }
                : undefined,
            fakeNews: Boolean(apiPost.cm_payload?.fake_news),
            mediascopeResearchUrls: apiPost.research?.urls,
            mediascopeResearchEvents: apiPost.research?.events,
        },
        reactions,
    };
}
export function fromApiMessageReactions(apiReactions) {
    return apiReactions
        .sort((a, b) => b.count - a.count)
        .reduce((acc, cur) => {
        acc.set(Reaction.resolveId(cur.id), {
            reactionId: Reaction.resolveId(cur.id),
            count: cur.count,
        });
        return acc;
    }, new Map());
}
export function fromApiDonutDuration(duration) {
    if (duration === -1 || duration === undefined) {
        return -1;
    }
    return (duration / 60 / 60 / 24);
}
function getAttachments(post) {
    const wall = post?.attachments?.[0]?.wall;
    const geo = wall?.geo;
    const attachments = wall?.attachments || [];
    return geo ? [...attachments, { type: 'geo', geo }] : attachments;
}
export function fromApiSearchPost(apiPost) {
    if (apiPost.type === 'ads' || apiPost.type === 'donut_wall_donate_block') {
        return;
    }
    function isNormalPost(apiPost) {
        return apiPost.title === undefined;
    }
    if (!isNormalPost(apiPost)) {
        return;
    }
    const copyHistory = apiPost.copy_history?.[0];
    let attaches = {};
    /**
     *  Так как пост приходит в виде аттача wall, первый по вложенности copy_history
     *  должен быть представлен в виде аттача wall а не WallHistory
     */
    if (copyHistory) {
        const copyOwnerId = apiAttachWallOwnerId(copyHistory);
        const isWallReply = copyHistory.post_type === 'reply';
        let isVisibleFor = 'all';
        if (copyHistory.friends_only === 1) {
            isVisibleFor = 'friends';
        }
        if (copyHistory.best_friends_only === 1) {
            isVisibleFor = 'best_friends';
        }
        attaches = {
            ...attaches,
            ...(isWallReply
                ? {
                    wallReply: {
                        kind: 'WallReply',
                        id: copyHistory.id || 0,
                        postId: copyHistory.reply_post_id || 0,
                        authorId: Peer.resolveId(copyHistory.from_id),
                        ownerId: Peer.resolveId(copyOwnerId),
                        parentsStack: copyHistory.parents_stack,
                        date: (copyHistory.date || 0) * 1000,
                        chunks: TextChunk.fromServerText(copyHistory.text || ''),
                        attaches: fromApiWallAttach(copyHistory),
                    },
                }
                : {
                    wall: {
                        kind: 'Wall',
                        isAds: copyHistory.post_type === 'post_ads',
                        id: copyHistory.id || 0,
                        authorId: Peer.resolveId(copyHistory.from_id),
                        ownerId: Peer.resolveId(copyOwnerId),
                        date: (copyHistory.date || 0) * 1000,
                        chunks: TextChunk.fromServerText(copyHistory.text || ''),
                        attaches: fromApiWallAttach(copyHistory),
                        isDeleted: copyHistory.is_deleted || false,
                        isVisibleFor,
                        views: copyHistory.views?.count,
                        donut: {
                            isDonut: copyHistory.donut?.is_donut,
                            placeholder: copyHistory.donut?.placeholder
                                ? {
                                    text: copyHistory.donut.placeholder?.text,
                                    button: copyHistory.donut.placeholder?.button,
                                }
                                : undefined,
                            duration: fromApiDonutDuration(copyHistory.donut?.paid_duration),
                        },
                    },
                }),
        };
        apiPost.copy_history = undefined;
    }
    if (apiPost?.attachments) {
        attaches = { ...attaches, ...fromApiWallAttach(apiPost) };
    }
    return {
        kind: 'Normal',
        channelType: "channel" /* Channel.ChannelType.CHANNEL */,
        cmid: Post.resolveCmid(apiPost.id || 0),
        chunks: apiPost?.text ? TextChunk.fromServerText(apiPost.text) : [],
        views: apiPost?.views?.count || 0,
        sentAt: (apiPost.date || 0) * 1000,
        updatedAt: apiPost.edited && apiPost.edited * 1000,
        channelId: Channel.resolveId(apiPost.owner_id || 0),
        likes: {
            count: apiPost?.likes?.count || 0,
            reactionId: undefined,
            availableReactionIds: [],
            peerIds: new Set(),
        },
        reactions: new Map(),
        reposts: {
            count: apiPost?.reposts?.count || 0,
            isReposted: Boolean(apiPost?.reposts?.user_reposted),
        },
        comments: {
            count: apiPost?.comments?.count || 0,
            oneLevelCount: 0,
            canView: Boolean(apiPost?.comments?.can_view),
            canPost: Boolean(apiPost?.comments?.can_post),
            canOpen: Boolean(apiPost?.comments?.can_open),
            canClose: Boolean(apiPost?.comments?.can_close),
            history: [],
            order: 'old',
        },
        attaches,
        donut: {
            isDonut: apiPost.donut?.is_donut,
            placeholder: apiPost.donut?.placeholder
                ? {
                    text: apiPost.donut.placeholder?.text,
                    button: apiPost.donut.placeholder?.button,
                }
                : undefined,
            duration: fromApiDonutDuration(apiPost.donut?.paid_duration),
        },
        signerId: apiPost.signer_id ? Peer.resolveId(apiPost.signer_id) : undefined,
        ads: {
            markedAsAds: Boolean(apiPost.marked_as_ads),
            erid: apiPost.author_ad?.ad_marker,
            eridUrl: apiPost.author_ad?.advertiser_info_url,
        },
        canEdit: Boolean(apiPost.can_edit),
        isDeleted: Boolean(apiPost.is_deleted),
        deleteInfo: apiPost.deleted_reason
            ? {
                reason: apiPost.deleted_reason,
                details: apiPost.deleted_details,
            }
            : undefined,
    };
}
export function fromApiPostonedPost(apiPost) {
    const isFromCommunityChannel = apiPost.cm_payload &&
        apiPost.channel_type === "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */;
    return isFromCommunityChannel
        ? fromApiChannelMessagePostponedPost(apiPost)
        : fromApiWallPostponedPost(apiPost);
}
function fromApiWallPostponedPost(apiPost) {
    const apiPostWall = {
        ...apiPost?.attachments?.[0]?.wall,
        attachments: getAttachments(apiPost),
        inner_type: 'wall_wallpost',
    };
    const copyHistory = apiPostWall?.copy_history?.[0];
    let attaches = {};
    /**
     *  Так как пост приходит в виде аттача wall, первый по вложенности copy_history
     *  должен быть представлен в виде аттача wall а не WallHistory
     */
    if (copyHistory && copyHistory.from_id !== 0) {
        const copyOwnerId = apiAttachWallOwnerId(copyHistory);
        const isWallReply = copyHistory.post_type === 'reply';
        let isVisibleFor = 'all';
        if (copyHistory.friends_only === 1) {
            isVisibleFor = 'friends';
        }
        if (copyHistory.best_friends_only === 1) {
            isVisibleFor = 'best_friends';
        }
        attaches = {
            ...attaches,
            ...(isWallReply
                ? {
                    wallReply: {
                        kind: 'WallReply',
                        id: copyHistory.id || 0,
                        postId: copyHistory.reply_post_id || 0,
                        authorId: Peer.resolveId(copyHistory.from_id),
                        ownerId: Peer.resolveId(copyOwnerId),
                        parentsStack: copyHistory.parents_stack,
                        date: (copyHistory.date || 0) * 1000,
                        chunks: TextChunk.fromServerText(copyHistory.text || ''),
                        attaches: fromApiWallAttach(copyHistory),
                    },
                }
                : {
                    wall: {
                        kind: 'Wall',
                        isAds: copyHistory.post_type === 'post_ads',
                        id: copyHistory.id || 0,
                        authorId: Peer.resolveId(copyHistory.from_id),
                        ownerId: Peer.resolveId(copyOwnerId),
                        date: (copyHistory.date || 0) * 1000,
                        chunks: TextChunk.fromServerText(copyHistory.text || ''),
                        attaches: fromApiWallAttach(copyHistory),
                        isDeleted: copyHistory.is_deleted || false,
                        isVisibleFor,
                    },
                }),
        };
        apiPostWall.copy_history = undefined;
    }
    if (apiPostWall?.attachments) {
        attaches = { ...attaches, ...fromApiWallAttach(apiPostWall) };
    }
    return {
        post: {
            kind: 'Postponed',
            channelType: apiPost.channel_type || "channel" /* Channel.ChannelType.CHANNEL */,
            cmid: Post.resolveCmid(apiPost.cmid),
            chunks: apiPostWall?.text
                ? TextChunk.fromServerText(apiPostWall.text)
                : [],
            sentAt: (apiPostWall.date || 0) * 1000,
            channelId: Channel.resolveId(apiPost.author_id),
            attaches,
            donut: {
                isDonut: apiPostWall.donut?.is_donut,
                placeholder: apiPostWall.donut?.placeholder
                    ? {
                        text: apiPostWall.donut.placeholder?.text,
                        button: apiPostWall.donut.placeholder?.button,
                    }
                    : undefined,
                duration: fromApiDonutDuration(apiPostWall.donut?.paid_duration),
            },
            signerId: apiPostWall.signer_id
                ? Peer.resolveId(apiPostWall.signer_id)
                : undefined,
            ads: {
                markedAsAds: Boolean(apiPostWall.marked_as_ads),
                erid: apiPostWall.author_ad?.ad_marker,
                eridUrl: apiPostWall.author_ad?.advertiser_info_url,
            },
            canEdit: Boolean(apiPostWall.can_edit),
            comments: {
                canView: Boolean(apiPostWall?.comments?.can_view),
                canPost: Boolean(apiPostWall?.comments?.can_post),
                canOpen: Boolean(apiPostWall?.comments?.can_open),
                canClose: Boolean(apiPostWall?.comments?.can_close),
            },
        },
    };
}
function fromApiChannelMessagePostponedPost(apiPost) {
    let attaches = {};
    if (apiPost?.attachments) {
        attaches = { ...attaches, ...fromApiChannelMessageAttach(apiPost) };
    }
    return {
        post: {
            kind: 'Postponed',
            channelType: apiPost.channel_type || "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */,
            cmid: Post.resolveCmid(apiPost.cmid),
            chunks: apiPost.text ? TextChunk.fromServerText(apiPost.text) : [],
            sentAt: (apiPost.cm_payload?.publish_date || 0) * 1000,
            channelId: Channel.resolveId(apiPost.author_id),
            parentId: apiPost.parent_id
                ? Channel.resolveId(apiPost.parent_id)
                : undefined,
            attaches,
            donut: {
                isDonut: apiPost.cm_payload?.donut?.is_donut,
                placeholder: apiPost.cm_payload?.donut?.placeholder
                    ? {
                        text: apiPost.cm_payload?.donut.placeholder?.text,
                        button: apiPost.cm_payload?.donut.placeholder?.button,
                    }
                    : undefined,
                duration: fromApiDonutDuration(apiPost.cm_payload?.donut?.paid_duration),
                paywall: apiPost.cm_payload?.donut?.paywall,
            },
            signerId: apiPost.cm_payload?.signer_id
                ? Peer.resolveId(apiPost.cm_payload?.signer_id)
                : undefined,
            ads: {
                markedAsAds: Boolean(apiPost.cm_payload?.ads_info),
                erid: apiPost.cm_payload?.ads_info?.ad_marker,
                eridUrl: apiPost.cm_payload?.ads_info?.advertiser_info_url,
            },
            canEdit: Boolean(apiPost.cm_payload?.can_edit),
            comments: {
                canView: Boolean(apiPost.cm_payload?.counters?.comments?.can_view),
                canPost: Boolean(apiPost.cm_payload?.counters?.comments?.can_post),
                canOpen: Boolean(apiPost.cm_payload?.counters?.comments?.can_open),
                canClose: Boolean(apiPost.cm_payload?.counters?.comments?.can_close),
            },
        },
    };
}
//# sourceMappingURL=PostConverter.js.map