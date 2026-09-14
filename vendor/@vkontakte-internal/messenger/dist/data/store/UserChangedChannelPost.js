import { exhaustivenessCheck } from '../../core/utils/misc';
import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as History from '../../core/model/History';
import * as Chain from '../../core/model/Chain';
const userActionLockKeysMap = {
    delete: 'delete',
    restore: 'restore',
    report: 'report',
    enable_comments: 'enable_comments',
    disable_comments: 'enable_comments',
};
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedChannelPost': {
            const { channelId, cmid, userAction } = action;
            const lockKey = getUserActionLockKey(userAction.kind, channelId, cmid);
            if (draft.locks.channelPostActions.has(lockKey)) {
                return [];
            }
            draft.locks.channelPostActions.add(lockKey);
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            const isCommunityChannel = Channel.isCommunityChannel(channel);
            const nodeData = action.isPostponed
                ? null
                : History.findNodeByCmid(channel.history, cmid);
            if (nodeData && nodeData.status === 'NotLoaded') {
                return [];
            }
            let fetchUserAction;
            switch (userAction.kind) {
                case 'delete': {
                    if (nodeData && nodeData.status === 'Deleted') {
                        break;
                    }
                    const isCommunityChannel = Channel.isCommunityChannel(channel);
                    if (action.isPostponed) {
                        isCommunityChannel
                            ? Channel.deleteCommunityChannelsPostponedPost(channel, cmid)
                            : Channel.deletePostponedPost(channel, cmid);
                    }
                    else {
                        Channel.deletePost(channel, cmid, isCommunityChannel
                            ? {
                                isRestorable: false,
                            }
                            : {
                                isRestorable: true,
                                isSpam: true,
                            });
                    }
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch('channels.deleteMessage', {
                            channel_id: channelId,
                            cmid: cmid,
                        })
                            .then((response) => Boolean(response))
                        : api
                            .fetch('wall.delete', {
                            owner_id: channelId,
                            post_id: cmid,
                        })
                            .then((response) => Boolean(response));
                    break;
                }
                case 'restore': {
                    if (action.isPostponed) {
                        Channel.restorePostponedPost(channel, cmid);
                    }
                    else {
                        if (nodeData && nodeData.status !== 'Deleted') {
                            break;
                        }
                        Channel.restorePost(channel, cmid);
                    }
                    fetchUserAction = (api) => api
                        .fetch('wall.restore', {
                        owner_id: channelId,
                        post_id: cmid,
                    })
                        .then((response) => Boolean(response));
                    break;
                }
                case 'report': {
                    if (nodeData && nodeData.status === 'Deleted') {
                        break;
                    }
                    Channel.deletePost(channel, cmid, {
                        isRestorable: true,
                        isSpam: true,
                    });
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch('channels.reportMessage', {
                            cmid,
                            channel_id: channelId,
                            reason: userAction.reason,
                        })
                            .then((response) => Boolean(response))
                        : api
                            .fetch('wall.reportPost', {
                            owner_id: channelId,
                            post_id: cmid,
                            reason: userAction.reason,
                        })
                            .then((response) => Boolean(response));
                    break;
                }
                case 'enable_comments':
                case 'disable_comments': {
                    if (nodeData && nodeData.status === 'Deleted') {
                        break;
                    }
                    const item = Chain.getElementById(channel.postponed.history, cmid);
                    if (action.isPostponed && item) {
                        Post.changeCommentsCanPost(item.content, userAction.kind === 'enable_comments');
                    }
                    else if (nodeData) {
                        Post.changeCommentsCanPost(nodeData.node.item, userAction.kind === 'enable_comments');
                    }
                    fetchUserAction = (api) => isCommunityChannel
                        ? api
                            .fetch(userAction.kind === 'enable_comments'
                            ? 'channels.openComments'
                            : 'channels.closeComments', {
                            channel_id: channelId,
                            cmid,
                        })
                            .then((response) => Boolean(response))
                        : api
                            .fetch(userAction.kind === 'enable_comments'
                            ? 'wall.openComments'
                            : 'wall.closeComments', {
                            owner_id: channelId,
                            post_id: cmid,
                        })
                            .then((response) => Boolean(response));
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        let hasFailed = false;
                        if (fetchUserAction) {
                            hasFailed = !(await fetchUserAction(api));
                        }
                        return {
                            type: 'UserChangedChannelPost_RequestCompleted',
                            channelId,
                            cmid,
                            hasFailed,
                            userAction,
                        };
                    }
                    catch (err) {
                        return {
                            type: 'UserChangedChannelPost_RequestCompleted',
                            channelId,
                            cmid,
                            hasFailed: true,
                            userAction,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChannelPost_RequestCompleted': {
            const { channelId, cmid, userAction, hasFailed } = action;
            const lockKey = getUserActionLockKey(userAction.kind, channelId, cmid);
            draft.locks.channelPostActions.delete(lockKey);
            if (hasFailed) {
                let undoAction;
                switch (userAction.kind) {
                    case 'delete':
                    case 'report': {
                        undoAction = {
                            kind: 'restore',
                        };
                        break;
                    }
                    case 'restore': {
                        undoAction = {
                            kind: 'delete',
                        };
                        break;
                    }
                    case 'enable_comments':
                    case 'disable_comments': {
                        undoAction = {
                            kind: userAction.kind === 'enable_comments'
                                ? 'disable_comments'
                                : 'enable_comments',
                        };
                        break;
                    }
                    default:
                        exhaustivenessCheck(userAction);
                }
                if (undoAction) {
                    handler(draft, {
                        type: 'UserChangedChannelPost',
                        userAction: undoAction,
                        channelId,
                        cmid,
                    }, featureFlags, envFeatureFlags);
                }
                draft.locks.channelPostActions.delete(lockKey);
            }
            return [];
        }
        default:
            exhaustivenessCheck(type);
    }
};
const getUserActionLockKey = (userAction, channelId, cmid) => `${userActionLockKeysMap[userAction]}-${channelId.toString()}-${cmid}`;
//# sourceMappingURL=UserChangedChannelPost.js.map