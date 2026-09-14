import * as Channel from '../../core/model/Channel';
import * as Post from '../../core/model/Post';
import * as Peer from '../../core/model/Peer';
import * as TextChunk from '../../core/model/TextChunk';
import { fromApiPost } from './PostConverter';
import { fromApiPicture } from '../converter/PictureConverter';
export const fromApiChannel = (featureFlags, apiChannelWithLastPost, apiChannelGroup, searchTrackCode) => {
    const { channel: apiChannel, last_message: apiLastPost } = apiChannelWithLastPost;
    const post = apiLastPost && fromApiPost(apiLastPost).post;
    const history = {
        confirmed: [],
        pending: [],
    };
    if (post) {
        history.confirmed =
            // Если айди последнего поста равен 1, то в канале есть только один пост
            post.cmid > 1
                ? [
                    {
                        kind: 'GapNode',
                        fromCmid: Post.resolveCmid(1),
                        toCmid: Post.resolveCmid(post.cmid - 1),
                    },
                    { kind: 'Node', item: post },
                ]
                : [{ kind: 'Node', item: post }];
    }
    const isMuted = !apiChannel.user_data.notification_settings.is_enabled ||
        (apiChannel.user_data.notification_settings.disable_duration || 0) > 0;
    const inReadCmid = Post.resolveCmid(apiChannel.user_data?.read_state?.read_up_to_cmid || 0);
    const menu = apiChannelGroup.menu?.items?.length
        ? apiChannelGroup.menu?.items?.map((item) => ({
            id: item.id,
            title: item.title,
            url: item.url,
            cover: item.cover,
            counter: item.counter,
        }))
        : undefined;
    const parentResolvedId = Peer.resolveId(apiChannel.parent_id);
    let parentId = undefined;
    if (Peer.isGroupPeerId(parentResolvedId)) {
        parentId = parentResolvedId;
    }
    const useChannelsMeta = featureFlags.vkm_channels_meta;
    const photoUrl = featureFlags.vkm_channels_meta
        ? fromApiPicture({
            baseUrl: apiChannel.photo_base,
        })
        : fromApiPicture({
            baseUrl: apiChannelGroup.photo_base,
            photo50: apiChannelGroup.photo_50,
            photo100: apiChannelGroup.photo_100,
        });
    const name = useChannelsMeta
        ? apiChannel.title || ''
        : apiChannelGroup.name || '';
    return {
        kind: 'Channel',
        id: Channel.resolveId(apiChannel.channel_id),
        unreadCount: apiChannel.user_data.read_state?.unread_count || 0,
        isArchived: !!apiChannel.user_data?.is_archived,
        isMuted,
        notificationsDisabledUntil: apiChannel.user_data.notification_settings.disable_duration || 0,
        inReadCmid,
        majorSortId: apiChannel.sort_id.major_id,
        minorSortId: apiChannel.sort_id.minor_id,
        membersCount: apiChannelGroup.members_count || 0,
        subscribersCount: apiChannel.members_count,
        isOwner: Boolean(apiChannel.user_data.is_owner),
        isParentGroupMember: Boolean(apiChannelGroup.is_member),
        isMember: apiChannel.user_data.is_member,
        adminLevel: apiChannelGroup.admin_level || 0,
        photo: photoUrl,
        name,
        description: TextChunk.fromServerText(apiChannelGroup.description || ''),
        activity: apiChannelGroup.activity || '',
        isVerified: !!apiChannelGroup.verified,
        screenName: apiChannelGroup.screen_name,
        isActive: Boolean(apiChannel.active),
        history,
        postponed: {
            history: {
                segments: [],
            },
            hasMore: false,
            loaded: false,
            count: apiChannel.postponed_count ?? 0,
        },
        rights: {
            canSendDonut: !!apiChannelGroup.can_post_donut,
            canPost: !!apiChannelGroup.can_post,
        },
        pending: {},
        isRepostsDisabled: Boolean(apiChannelGroup.reposts_disabled),
        actionButton: {
            isEnabled: Boolean(apiChannelGroup.action_button?.is_enabled),
            title: apiChannelGroup.action_button?.title,
            type: apiChannelGroup.action_button?.action_type,
            target: {
                appId: apiChannelGroup.action_button?.target?.app_id,
                email: apiChannelGroup.action_button?.target?.email,
                googleStoreURL: apiChannelGroup.action_button?.target?.google_store_url,
                isInternal: apiChannelGroup.action_button?.target?.is_internal,
                itunesURL: apiChannelGroup.action_button?.target?.itunes_url,
                phone: apiChannelGroup.action_button?.target?.phone,
                url: apiChannelGroup.action_button?.target?.url,
                userId: apiChannelGroup.action_button?.target?.user_id,
            },
        },
        menu,
        isClosed: Boolean(apiChannelGroup.is_closed),
        isPrivate: apiChannelGroup.is_closed === 2,
        mediaViewerCache: { items: [], hasPrev: true, hasNext: true },
        canMessage: Boolean(apiChannelGroup.can_message),
        banInfo: apiChannel.user_data.ban_info
            ? {
                comment: apiChannel.user_data.ban_info.comment,
                // на момент написания комментария - бекенд не возвращает reason = 0
                reason: apiChannel.user_data.ban_info.reason ?? 0,
                endDate: apiChannel.user_data.ban_info.end_date
                    ? apiChannel.user_data.ban_info.end_date * 1000
                    : 0,
            }
            : undefined,
        wall: apiChannelGroup.wall,
        channelType: apiChannel.channel_type,
        parentId,
        memberStatus: apiChannelGroup.member_status,
        version: apiChannel.version,
        ageLimits: apiChannelGroup.age_limits,
        warningNotification: apiChannelGroup?.warning_notification
            ?.id,
        searchTrackCode,
    };
};
//# sourceMappingURL=ChannelConverter.js.map