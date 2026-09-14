import * as Channel from '../../core/model/Channel';
import * as Attach from '../../core/model/Attach';
import * as History from '../../core/model/History';
import * as Post from '../../core/model/Post';
import * as Peer from '../../core/model/Peer';
import * as Organisers from '../../core/model/Organisers';
import * as UserChangedComposerDraft from './UserChangedComposerDraft';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { fromApiPost } from '../converter/PostConverter';
const DAY_IN_SEC = 60 * 60 * 24;
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    switch (action.type) {
        case 'UserHitPostSend': {
            const { text, attaches, channelId, publishAt, options, visibility, donutDelay, onComplete, onFail, forwardingPost, ads, } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            const attachments = Attach.ids(attaches).join(',');
            if (!text && !attachments && !forwardingPost) {
                return [];
            }
            let pending = undefined;
            if (publishAt === undefined) {
                const attachesWithForward = forwardingPost
                    ? {
                        ...attaches,
                        wall: {
                            kind: 'Wall',
                            id: forwardingPost.cmid,
                            date: Date.now(),
                            authorId: Peer.resolveRealId('Group', -forwardingPost.channelId),
                            attaches: forwardingPost.attaches,
                            isDeleted: false,
                            isVisibleFor: 'all',
                            isAds: !!forwardingPost.ads.markedAsAds,
                            chunks: forwardingPost.chunks,
                        },
                    }
                    : attaches;
                pending = Post.newPending({
                    channelType: isCommunityChannel
                        ? "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */
                        : "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */,
                    channelId,
                    attaches: attachesWithForward,
                    sentAt: +new Date(),
                }, text);
                History.appendPending(channel.history, pending);
            }
            return [
                async function ({ api }) {
                    try {
                        /**
                         * В обход правил и под страхом штрафа автор может опубликовать рекламный пост без erid.
                         * Важно не посылать ord_external_id если он null или undefined, потому что бэк воспримет это просто как неправильный erid
                         */
                        const ord = featureFlags.vkm_ord
                            ? ads.predId
                                ? { ord_external_id: ads.predId }
                                : {}
                            : { ord_erid: ads.erId };
                        const params = {
                            channel_id: channelId,
                            message: text,
                            attachments,
                            publish_date: publishAt && Math.floor(publishAt.getTime() / 1000),
                            close_comments: convertBoolOption(!options.has('enable_comments')),
                            mark_as_ads: convertBoolOption(ads.isAd),
                            ...ord,
                            mute_notifications: convertBoolOption(options.has('mute_notifications')),
                            signed: convertBoolOption(options.has('signed')),
                            donut_paid_duration: visibility === 'all'
                                ? undefined
                                : donutDelay === -1
                                    ? donutDelay
                                    : donutDelay * DAY_IN_SEC,
                        };
                        let response = undefined;
                        let rawCmid;
                        if (forwardingPost) {
                            const res = await api.fetch('wall.repost', {
                                object: `wall${forwardingPost.channelId}_${forwardingPost.cmid}`,
                                message: params.message,
                                group_id: Math.abs(channelId),
                                close_comments: params.close_comments,
                                publish_date: params.publish_date,
                                mark_as_ads: params.mark_as_ads,
                                mute_notifications: params.mute_notifications,
                            });
                            rawCmid = res.post_id;
                        }
                        else {
                            response = await api.fetch('channels.sendMessage', {
                                ...params,
                                guid: Channel.generateGuid(),
                                from_group: 1,
                            });
                            rawCmid = response.cmid;
                        }
                        onComplete(Post.resolveCmid(rawCmid));
                        return {
                            type: 'UserHitPostSend_RequestCompleted',
                            hasFailed: false,
                            randomId: pending?.randomId,
                            channelId,
                            cmid: Post.resolveCmid(rawCmid),
                            response,
                        };
                    }
                    catch (err) {
                        onFail(err);
                        return {
                            type: 'UserHitPostSend_RequestCompleted',
                            hasFailed: true,
                            randomId: pending?.randomId,
                            channelId,
                        };
                    }
                },
            ];
        }
        case 'UserHitPostSend_RequestCompleted': {
            const { hasFailed, randomId, channelId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (hasFailed) {
                if (randomId) {
                    History.removePending(channel.history, randomId);
                }
                return [];
            }
            const pending = randomId && History.findPendingNode(channel.history, randomId);
            if (!pending) {
                return [];
            }
            pending.item.cmid = action.cmid;
            if (!action.response) {
                return [];
            }
            const { post, reactions } = fromApiPost(action.response);
            for (const reaction of reactions) {
                draft.reactionsOld.set(reaction.id, reaction);
            }
            Channel.appendPost(channel, post);
            Organisers.refreshChannels(draft.organisers, channel);
            UserChangedComposerDraft.handler(draft, {
                type: 'ComposerDraftsUpdateNeeded',
                foreignKind: "post" /* ComposerDraft.ForwardKind.Post */,
                itemsToReplace: [post],
            }, featureFlags, envFeatureFlags);
            return [];
        }
        default:
            exhaustivenessCheck(action);
    }
};
const convertBoolOption = (value) => value !== undefined ? Number(value) && 1 : value;
//# sourceMappingURL=UserHitPostSend.js.map