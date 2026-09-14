import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as History from '../../core/model/History';
import * as ReactionOld from '../../core/model/ReactionOld';
import * as Reaction from '../../core/model/Reaction';
import { exhaustivenessCheck } from '../../core/utils/misc';
/**
 * Ограничение, установленное беком для метода channels.getChannelMessagesCounters
 */
export const MAX_POLL_CMIDS = 200;
export const handler = (draft, action) => {
    switch (action.type) {
        case 'PollChannelPosts': {
            const { channelId, fromCmid, toCmid: rawToCmid } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind !== 'Channel') {
                return [];
            }
            const toCmid = rawToCmid ?? History.lastCmid(channel.history);
            if (!toCmid) {
                return [];
            }
            const slice = History.around(channel.history, fromCmid);
            if (slice === undefined) {
                return [];
            }
            const cmids = slice.nodes
                .reduce((acc, node) => {
                const cmid = History.nodeCmid(node);
                if (cmid !== undefined && cmid >= fromCmid && cmid <= toCmid) {
                    acc.push(cmid);
                }
                return acc;
            }, [])
                .slice(-MAX_POLL_CMIDS);
            return [
                async function shortPollChannelPosts({ api }) {
                    try {
                        const response = await api.fetch('channels.getChannelMessagesCounters', {
                            channel_id: channelId,
                            cmids: cmids.join(','),
                        });
                        return {
                            type: 'PollChannelPosts_RequestSucceed',
                            channelId,
                            response,
                        };
                    }
                    catch (err) {
                        console.error(err);
                    }
                    return {
                        type: 'Noop',
                    };
                },
            ];
        }
        case 'PollChannelPosts_RequestSucceed': {
            const { channelId, response } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind !== 'Channel') {
                return [];
            }
            response.items?.forEach((item) => {
                if (item?.reactions?.items && item.reactions.items.length > 0) {
                    item.reactions.items.sort((a, b) => {
                        if (b.count > a.count) {
                            return 1;
                        }
                        else if (b.count < a.count) {
                            return -1;
                        }
                        else {
                            return a.id - b.id;
                        }
                    });
                }
                const itemNode = Channel.findPostByCmid(channel, Post.resolveCmid(item.message_id));
                if (!itemNode) {
                    return;
                }
                if (itemNode.kind === 'Node') {
                    updatePolledPost(itemNode.item, item);
                }
            });
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const updatePolledPost = (post, countersItem) => {
    if (countersItem.comments) {
        post.comments = {
            ...post.comments,
            canPost: !!(countersItem.comments.can_post ?? post.comments.canPost),
            canView: !!(countersItem.comments.can_view ?? post.comments.canView),
            count: countersItem.comments.count ?? post.comments.count,
        };
    }
    /**
     * Если reactions === undefined, значит нужно обнулить счетчики и реакцию пользователя.
     * В противном случае выставить те значения, которые пришли.
     */
    if (!countersItem.reactions) {
        post.likes.count = 0;
        post.likes.reactionId = undefined;
        post.reactionId = undefined;
        post.reactions = new Map();
    }
    else {
        post.likes = {
            ...post.likes,
            count: countersItem.reactions.count,
            reactionId: countersItem.reactions.user_reaction !== undefined
                ? ReactionOld.resolveId(countersItem.reactions.user_reaction)
                : undefined,
        };
        post.reactionId =
            countersItem.reactions.user_reaction !== undefined
                ? Reaction.resolveId(countersItem.reactions.user_reaction)
                : undefined;
        post.reactions = countersItem.reactions.items.reduce((mappedReactions, reaction) => {
            const reactionId = Reaction.resolveId(reaction.id);
            mappedReactions.set(reactionId, { reactionId, count: reaction.count });
            return mappedReactions;
        }, new Map());
    }
    if (countersItem.reposts) {
        post.reposts = {
            count: countersItem.reposts.count,
            isReposted: !!(countersItem.reposts.user_reposted ?? post.reposts.isReposted),
        };
    }
    post.views = countersItem.views?.count ?? post.views;
};
//# sourceMappingURL=PollChannelPosts.js.map