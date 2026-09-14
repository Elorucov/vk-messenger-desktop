import { fromApiConvo } from '../../data/converter/ConvoConverter';
import * as Peer from '../../core/model/Peer';
import { fromApiMessage } from '../../data/converter/MessageConverter';
import { SEARCH_CONVOS_COUNT, SEARCH_MESSAGES_COUNT, SEARCH_POSTS_COUNT, } from '../../core/config/config';
import { fromApiSearchPost } from '../../data/converter/PostConverter';
import { fromApiChannel } from '../../data/converter/ChannelConverter';
import { getOwnerGroupId } from '../../data/store/State';
export async function searchConversations(apiFetch, featureFlags, insertIntoCache, query, group_id) {
    const response = await apiFetch('messages.searchConversations', {
        q: query,
        count: SEARCH_CONVOS_COUNT,
        extended: 1,
        group_id,
    });
    const { profiles, groups, items, contacts } = response;
    insertIntoCache({
        profiles,
        groups,
        conversations: items,
        contacts,
    });
    return items.reduce((acc, convo) => {
        const resultConvo = fromApiConvo(featureFlags, convo);
        if (resultConvo) {
            acc.add(resultConvo.convo.peerId);
        }
        return acc;
    }, new Set());
}
export async function searchMessages(apiFetch, logger, featureFlags, insertIntoCache, params) {
    const response = await apiFetch('messages.search', {
        ...params,
        extended: 1,
        count: SEARCH_MESSAGES_COUNT,
    });
    const { items, count, conversations, contacts, profiles, groups } = response;
    insertIntoCache({
        profiles,
        groups,
        conversations,
        contacts,
    });
    const results = items.reduce((result, apiMessage) => {
        const message = fromApiMessage(featureFlags, apiMessage).message;
        if (message.kind === 'Normal') {
            result.push(message);
        }
        else {
            logger.error(`Сообщение неожиданного типа вернулось из message.search: ${message.kind}`);
        }
        return result;
    }, []);
    return {
        results,
        count,
        apiItemsCount: items.length,
    };
}
export async function searchUsersGlobal(apiFetch, insertIntoCache, params) {
    const response = await apiFetch('users.search', params);
    const { items, count } = response;
    insertIntoCache({
        profiles: items,
    });
    const results = items.map((user) => Peer.resolveRealId('User', user.id));
    return {
        results,
        count,
    };
}
export async function searchPosts(apiFetch, logger, insertIntoCache, params) {
    const response = await apiFetch('wall.search', {
        owners_only: 1,
        query: params.query,
        offset: params.offset,
        domain: params.channelId,
        extended: 1,
        count: SEARCH_POSTS_COUNT,
    });
    const { items, count, profiles, groups } = response;
    insertIntoCache({
        profiles,
        groups,
    });
    const results = items.reduce((result, apiPost) => {
        const post = fromApiSearchPost(apiPost);
        if (!post) {
            return result;
        }
        result.push(post);
        return result;
    }, []);
    return {
        results,
        count,
        apiItemsCount: items.length,
    };
}
export async function searchChannels(apiFetch, insertIntoCache, { count, query, queryUUID, offset, }, featureFlags) {
    const response = await apiFetch('channels.search', {
        extended: 1,
        target: 'channels',
        q: query,
        query_uuid: queryUUID,
        count,
        offset,
    });
    const { channels: apiChannels, count: apiCount, groups, track_codes = [], } = response;
    insertIntoCache({
        channels: { items: apiChannels, groups, trackCodes: track_codes },
        /**
         * Даже если каналы уже когда-то находились в прошлых сеансах поиска по каналм
         * всё равно перезаписываем каналы, чтобы трек-код был актуальным (от текущего сеанса поиска)
         */
        dangerouslyOverwrite: true,
    });
    const items = apiChannels.reduce((acc, apiChannel, i) => {
        const group = groups?.find((item) => {
            if (apiChannel.channel.channel_type ===
                "community_channel" /* Channel.ChannelType.COMMUNITY_CHANNEL */) {
                return -item.id === apiChannel.channel.parent_id;
            }
            else {
                return -item.id === apiChannel.channel.channel_id;
            }
        });
        if (!group) {
            throw new Error('С бэка не приходит нужная группа для канала');
        }
        const channel = fromApiChannel(featureFlags, apiChannel, group, track_codes[i]);
        acc.push(channel);
        return acc;
    }, []);
    return {
        items,
        apiCount,
    };
}
export async function searchConversationMembers(apiFetch, insertIntoCache, { count, query: { query }, peerId, ownerId, }) {
    if (!query) {
        return {
            items: [],
            apiCount: 0,
        };
    }
    const response = await apiFetch('messages.searchConversationMembers', {
        q: query,
        count,
        peer_id: peerId,
        extended: 1,
        group_id: getOwnerGroupId(ownerId),
    });
    const { items, count: apiCount, contacts, profiles, groups } = response;
    insertIntoCache({
        profiles,
        groups,
        contacts,
        chatMembers: {
            peerId,
            members: items,
        },
    });
    return {
        items,
        apiCount,
    };
}
export async function searchSferumContacts(apiFetch, insertIntoCache, { query, count, }) {
    if (!query) {
        return {
            items: [],
            apiCount: 0,
        };
    }
    const response = await apiFetch('messagesEdu.usersSearch', {
        q: query,
        count,
        extended: 1,
    });
    const { sections = [], contacts, profiles, total_count: apiCount, edu_roles: roles = [], } = response;
    insertIntoCache({
        profiles,
        contacts,
    });
    const { rolesPerPeerId, mainRolesPerPeerId } = roles.reduce((acc, { main_roles: mainRole, user_id: rawPeerId, organizations = [] }) => {
        const peerId = Peer.resolveId(rawPeerId);
        if (!Peer.isUserPeerId(peerId) && !Peer.isContactPeerId(peerId)) {
            return acc;
        }
        const rolesPerOrganization = organizations.reduce((rolesPerOrgAcc, { organization_id: organizationId, roles }) => {
            const role = roles.map(({ details }) => details).join('; ');
            rolesPerOrgAcc.set(organizationId, role);
            return rolesPerOrgAcc;
        }, new Map());
        if (rolesPerOrganization.size > 0) {
            acc.rolesPerPeerId.set(peerId, rolesPerOrganization);
        }
        if (mainRole) {
            acc.mainRolesPerPeerId.set(peerId, mainRole);
        }
        return acc;
    }, {
        rolesPerPeerId: new Map(),
        mainRolesPerPeerId: new Map(),
    });
    const items = sections.reduce((itemsAcc, { organization_id: organizationId, peers: rawPeerIds = [], title }) => {
        const peerIds = rawPeerIds.reduce((peerIdsAcc, rawPeerId) => {
            const peerId = Peer.resolveId(rawPeerId);
            if (Peer.isUserPeerId(peerId) || Peer.isContactPeerId(peerId)) {
                return [...peerIdsAcc, peerId];
            }
            return peerIdsAcc;
        }, []);
        return [
            ...itemsAcc,
            ...peerIds.map((peerId) => {
                const peerRoles = rolesPerPeerId.get(peerId);
                let role;
                if (peerRoles && organizationId) {
                    role = peerRoles.get(organizationId);
                }
                else {
                    role = mainRolesPerPeerId.get(peerId);
                }
                return {
                    organizationId,
                    organizationTitle: title,
                    peerId,
                    role: role ?? '',
                };
            }),
        ];
    }, []);
    return {
        items,
        apiCount,
    };
}
//# sourceMappingURL=searchHelpers.js.map