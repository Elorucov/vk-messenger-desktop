import { exhaustivenessCheck } from '../../core/utils/misc';
import { insertChannels } from '../store/State';
import * as Channel from '../../core/model/Channel';
import * as ChannelFilters from '../../core/model/ChannelFilters';
import * as Organisers from '../../core/model/Organisers';
import * as Attach from '../../core/model/Attach';
import * as Peer from '../../core/model/Peer';
const userActionLockKeysMap = {
    archive: 'archive',
    unarchive: 'archive',
    join: 'join',
    delete: 'delete',
    leave: 'join',
    pin: 'pin',
    unpin: 'pin',
    mute: 'mute',
    unmute: 'mute',
    mark_read: 'mark_read',
    report: 'report',
    join_inbound_request: 'join_inbound_request',
    leave_inbound_request: 'join_inbound_request',
    restore_inbound_request: 'restore_inbound_request',
};
function isChannelsJoinResponse(res) {
    return typeof res === 'object' && res && 'channel' in res;
}
export const handler = (draft, action, featureFlags, envFeatureFlags) => {
    const { type } = action;
    switch (type) {
        case 'UserChangedChannel': {
            const { channelId, userAction, onFail, onComplete, trackCode } = action;
            const lockKey = getUserActionLockKey(action.userAction, channelId);
            if (draft.locks.channelActions.has(lockKey)) {
                return [];
            }
            draft.locks.channelActions.add(lockKey);
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            let fetchUserAction;
            switch (userAction) {
                case 'archive': {
                    Channel.setArchived(channel, true);
                    Organisers.refreshChannels(draft.organisers, channel);
                    fetchUserAction = (api) => api.fetch('channels.archive', {
                        channel_ids: String(channelId),
                    });
                    break;
                }
                case 'unarchive': {
                    Channel.setArchived(channel, false);
                    Organisers.refreshChannels(draft.organisers, channel);
                    fetchUserAction = (api) => api.fetch('channels.unarchive', {
                        channel_ids: String(channelId),
                        extended: 1,
                    });
                    break;
                }
                case 'join': {
                    fetchUserAction = (api) => api.fetch('channels.join', {
                        channel_id: channelId,
                        extended: 1,
                        source: action.source,
                        invite_code: trackCode,
                    });
                    break;
                }
                case 'leave': {
                    fetchUserAction = (api) => api.fetch('channels.leave', {
                        channel_id: channelId,
                    });
                    break;
                }
                case 'delete': {
                    Channel.setMembership(channel, false);
                    Organisers.refreshChannels(draft.organisers, channel);
                    fetchUserAction = (api) => api.fetch('channels.delete', {
                        channel_id: channelId,
                    });
                    break;
                }
                case 'mute': {
                    Channel.setMuted(channel, true);
                    fetchUserAction = (api) => api.fetch('channels.setNotificationMode', {
                        channel_id: channelId,
                        mode: 'disabled',
                    });
                    break;
                }
                case 'unmute': {
                    Channel.setMuted(channel, false);
                    fetchUserAction = (api) => api.fetch('channels.setNotificationMode', {
                        channel_id: channelId,
                        mode: 'enabled',
                    });
                    break;
                }
                case 'mark_read': {
                    const lastPost = Channel.lastPost({ channel, withPending: false });
                    if (lastPost) {
                        const lastCmid = lastPost.cmid;
                        channel.inReadCmid = lastCmid;
                        fetchUserAction = (api) => api.fetch('channels.markAsRead', {
                            last_read_cmid: lastCmid,
                            channel_id: channelId,
                        });
                    }
                    break;
                }
                case 'pin': {
                    fetchUserAction = (api) => api.fetch('channels.pin', {
                        channel_id: channelId,
                    });
                    break;
                }
                case 'unpin': {
                    fetchUserAction = (api) => api.fetch('channels.unpin', {
                        channel_id: channelId,
                    });
                    break;
                }
                case 'report': {
                    const { payload } = action;
                    fetchUserAction = (api) => api.fetch('reports.add', {
                        type: 'community_channel',
                        owner_id: channelId,
                        reason: payload?.reason,
                        comment: payload?.comment,
                    });
                    break;
                }
                case 'join_inbound_request': {
                    if (!ChannelFilters.isInboundRequest(channel, draft.organisers.channelFilters)) {
                        break;
                    }
                    Channel.acceptInboundRequest(channel, true);
                    Organisers.refreshChannels(draft.organisers, channel);
                    fetchUserAction = (api) => api.fetch('channels.join', {
                        channel_id: channelId,
                        extended: 1,
                        source: action.source,
                    });
                    break;
                }
                case 'leave_inbound_request': {
                    if (!ChannelFilters.isInboundRequest(channel, draft.organisers.channelFilters)) {
                        break;
                    }
                    Channel.rejectInboundRequest(channel, true);
                    Organisers.refreshChannels(draft.organisers, channel);
                    fetchUserAction = (api) => api.fetch('channels.leave', {
                        channel_id: channelId,
                    });
                    break;
                }
                case 'restore_inbound_request': {
                    fetchUserAction = (api) => api.fetch('channels.restoreInboundRequest', {
                        channel_id: channelId,
                    });
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            return [
                async function applyAction({ api }) {
                    try {
                        const response = fetchUserAction && (await fetchUserAction(api));
                        if (response) {
                            onComplete?.();
                        }
                        else {
                            onFail?.();
                        }
                        return {
                            type: 'UserChangedChannel_RequestCompleted',
                            channelId,
                            hasFailed: !response,
                            response,
                            userAction,
                        };
                    }
                    catch (err) {
                        onFail?.(err);
                        return {
                            type: 'UserChangedChannel_RequestCompleted',
                            channelId,
                            hasFailed: true,
                            userAction,
                        };
                    }
                },
            ];
        }
        case 'UserChangedChannel_RequestCompleted': {
            const { channelId, userAction, hasFailed, response } = action;
            const lockKey = getUserActionLockKey(userAction, channelId);
            draft.locks.channelActions.delete(lockKey);
            const channel = draft.channels.get(channelId);
            // Невозможный сценарий, это проверяется в UserChangedChannel
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            if (hasFailed) {
                switch (userAction) {
                    case 'archive': {
                        Channel.setArchived(channel, false);
                        Organisers.refreshChannels(draft.organisers, channel);
                        break;
                    }
                    case 'unarchive': {
                        Channel.setArchived(channel, true);
                        Organisers.refreshChannels(draft.organisers, channel);
                        break;
                    }
                    case 'mute': {
                        Channel.setMuted(channel, false);
                        break;
                    }
                    case 'unmute': {
                        Channel.setMuted(channel, true);
                        break;
                    }
                    case 'join_inbound_request': {
                        Channel.undoAcceptInboundRequest(channel);
                        Organisers.refreshChannels(draft.organisers, channel);
                        break;
                    }
                    case 'leave_inbound_request': {
                        Channel.undoRejectInboundRequest(channel);
                        Organisers.refreshChannels(draft.organisers, channel);
                        break;
                    }
                    case 'delete':
                    case 'join':
                    case 'leave':
                    case 'report':
                    case 'mark_read':
                    case 'pin':
                    case 'restore_inbound_request':
                    case 'unpin': {
                        break;
                    }
                    default:
                        exhaustivenessCheck(userAction);
                }
            }
            switch (userAction) {
                case 'join': {
                    if (response && isChannelsJoinResponse(response)) {
                        // Предварительно очищаем историю, чтобы полностью обновить ее
                        Channel.cleanHistory(channel);
                        const group = response?.groups?.at(0);
                        const memberStatus = group?.member_status;
                        insertChannels(draft, {
                            apiChannels: [response.channel],
                            apiGroups: response.groups || [],
                            dangerouslyMerge: true,
                            featureFlags,
                        });
                        handler(draft, {
                            type: 'UserUpdateChannelInfo',
                            channelId,
                            memberStatus,
                        }, featureFlags, envFeatureFlags);
                    }
                    break;
                }
                case 'leave':
                case 'report':
                case 'archive':
                case 'unarchive':
                case 'delete':
                case 'mute':
                case 'unmute':
                case 'mark_read':
                case 'pin':
                case 'unpin':
                case 'join_inbound_request':
                case 'leave_inbound_request':
                case 'restore_inbound_request': {
                    break;
                }
                default:
                    exhaustivenessCheck(userAction);
            }
            return [
                userAction === 'leave' &&
                    async function () {
                        return {
                            type: 'UserLeftChannel',
                            channelId,
                        };
                    },
            ];
        }
        case 'UserSetChannelPhoto': {
            const { channelId, photo } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind !== 'Channel') {
                return [];
            }
            Channel.setPhotos(channel, {
                photo50: Attach.preview(photo, 50, 50, true)?.url,
                photo100: Attach.preview(photo, 100, 100, true)?.url,
                photo: photo.originalImage,
                thumbHashUrl: photo.thumbhashUrl,
            });
            return [];
        }
        case 'UserUpdateChannelInfo': {
            const { channelId, name, description, canMessage, memberStatus, isClosed, isMember, isParentGroupMember, disableWarning,
            // /safety/10/32
             } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind !== 'Channel') {
                return [];
            }
            if (name) {
                channel.name = name;
            }
            if (description !== undefined) {
                channel.description = description;
            }
            if (canMessage !== undefined) {
                channel.canMessage = canMessage;
                const peer = draft.peers.get(Peer.resolveId(channelId));
                if (!peer || peer.kind !== 'Group') {
                    return [];
                }
                peer.canMessage = canMessage;
            }
            if (memberStatus !== undefined) {
                channel.memberStatus = memberStatus;
            }
            if (isClosed !== undefined) {
                channel.isClosed = isClosed;
            }
            if (isMember !== undefined) {
                channel.isMember = isMember;
            }
            if (isParentGroupMember !== undefined) {
                channel.isParentGroupMember = isParentGroupMember;
            }
            if (disableWarning) {
                channel.warningNotification = undefined;
            }
            Organisers.refreshChannels(draft.organisers, channel);
            return [];
        }
        case 'UserLeftChannel': {
            const { channelId } = action;
            return [
                async function ({ api }) {
                    try {
                        const { groups: apiGroups = [], items } = await api.fetch('channels.getById', {
                            channel_ids: channelId.toString(),
                            extended: 1,
                        }, {
                            retries: 2,
                        });
                        const group = apiGroups?.at(0);
                        const isClosed = !!(group?.is_closed ?? false);
                        const isMember = items?.at(0)?.channel.user_data.is_member;
                        const isParentGroupMember = !!(group?.is_member ?? false);
                        const memberStatus = group?.member_status;
                        return {
                            type: 'UserUpdateChannelInfo',
                            channelId,
                            isClosed,
                            isMember,
                            isParentGroupMember,
                            memberStatus,
                        };
                    }
                    catch (e) {
                        return {
                            type: 'Noop',
                        };
                    }
                },
            ];
        }
        case 'UserAcceptedModerationWarning': {
            const { channelId, groupId, notificationId } = action;
            const channel = draft.channels.get(channelId);
            if (!channel || channel.kind === 'ChannelRestricted') {
                return [];
            }
            return [
                async function ({ api }) {
                    try {
                        const response = await api.fetch('groups.hideWarning', {
                            group_id: Math.abs(groupId),
                            notification_id: notificationId,
                        });
                        if (response === 1) {
                            return {
                                type: 'UserUpdateChannelInfo',
                                channelId,
                                disableWarning: true,
                            };
                        }
                        return {
                            type: 'Noop',
                        };
                    }
                    catch (e) {
                        return {
                            type: 'Noop',
                        };
                    }
                },
            ];
        }
        default:
            exhaustivenessCheck(type);
    }
};
const getUserActionLockKey = (userAction, channelId) => `${userActionLockKeysMap[userAction]}-${channelId.toString()}`;
//# sourceMappingURL=UserChangedChannel.js.map