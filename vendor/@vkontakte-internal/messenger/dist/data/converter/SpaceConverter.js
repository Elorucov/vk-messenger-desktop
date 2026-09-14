import * as Space from '../../core/model/Space';
import * as Peer from '../../core/model/Peer';
import * as TextChunk from '../../core/model/TextChunk';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { fromApiPicture } from '../converter/PictureConverter';
export function fromApiSpace(apiSpace) {
    const incompleteSpace = {
        kind: 'Incomplete',
        id: Space.resolveId(apiSpace.id),
        version: apiSpace.entity_version,
        name: apiSpace.name,
        description: TextChunk.fromServerText(apiSpace.description || ''),
        shortName: apiSpace.short_name || '',
        position: apiSpace.position,
        unreadCount: apiSpace.viewer_data.notifications_for_user?.unread_count || 0,
        isPrivate: apiSpace.is_private ?? false,
        avatar: fromApiPicture({
            baseUrl: apiSpace.photo_base,
            thumbhashUrl: apiSpace.thumb_hash,
        }),
        cover: fromApiPicture({
            baseUrl: apiSpace.cover,
            thumbhashUrl: apiSpace.cover_thumb_hash,
        }),
        membersCount: apiSpace.members_count,
        viewerData: {
            isChangingMembership: false,
            isMember: Boolean(apiSpace.viewer_data.is_member),
            isBanned: Boolean(apiSpace.viewer_data.is_banned),
            isOwner: Boolean(apiSpace.viewer_data.is_owner),
            roleIds: apiSpace.viewer_data.role_ids,
            notificationSettings: fromApiNotificationSettings(apiSpace.viewer_data.notification_settings),
            notificationsForUser: apiSpace.viewer_data.notifications_for_user && {
                roomIds: apiSpace.viewer_data.notifications_for_user?.room_ids.map(Space.resolveRoomId),
            },
        },
    };
    if (!('sections' in apiSpace)) {
        return incompleteSpace;
    }
    return {
        ...incompleteSpace,
        kind: 'Space',
        defaultRoomId: apiSpace.default_room_id
            ? Space.resolveRoomId(apiSpace.default_room_id)
            : undefined,
        sections: new Map(apiSpace.sections.map((apiSection) => {
            const section = fromApiSection(apiSection);
            return [section.id, section];
        })),
        rooms: new Map(apiSpace.rooms.map((apiRoom) => {
            const room = fromApiRoom(apiRoom);
            return [room.id, room];
        })),
        roles: [],
    };
}
export function fromApiSpaceCall(apiSpacesCall) {
    return {
        id: Space.resolveCallId(apiSpacesCall.call_id),
        vkJoinLink: apiSpacesCall.join_link,
        okJoinLink: apiSpacesCall.ok_join_link,
        participantsList: apiSpacesCall.participants.list?.map(Peer.resolveId) || [],
        //  SPC-TODO узнать почему опциональное поле
        participantsCount: apiSpacesCall.participants.count || 0,
    };
}
export function fromApiSpaceTribune(apiSpacesTribune) {
    if (!apiSpacesTribune.room_id) {
        // Невозможный сценарий: в схеме это поле должно быть обязательно,
        // но наш бэк использует звонковую схему и объект, но гарантирует наличие room_id
        throw new Error('Не удалось получить данные голосовой трибуны');
    }
    const status = apiSpacesTribune.status ?? 'closed';
    const tribune = {
        id: Space.resolveTribuneId(apiSpacesTribune.room_id),
        participantsCount: apiSpacesTribune.participants_count || 0,
        ownerId: Peer.resolveId(apiSpacesTribune.owner_id),
        guestSpeakers: apiSpacesTribune.guest_speakers_owners?.map(Peer.resolveId) || [],
        // @ts-expect-error
        speakersInRoom: apiSpacesTribune.speakers_in_room.map(Peer.resolveId),
    };
    if (status === 'closed') {
        return { ...tribune, status };
    }
    const vkJoinLink = apiSpacesTribune.join_link;
    const okJoinLink = apiSpacesTribune.ok_join_link;
    if (!vkJoinLink || !okJoinLink) {
        throw new Error('Не удалось получить данные голосовой трибуны');
    }
    return { ...tribune, status, vkJoinLink, okJoinLink };
}
export function fromApiRoom(apiRoom) {
    let relatedEntity;
    switch (apiRoom.related_entity.type) {
        case 'conversation': {
            const peerId = Peer.resolveId(apiRoom.related_entity.peer_id);
            if (!Peer.isChatPeerId(peerId)) {
                // SPC-TODO: что тут делать?
                throw new Error('TODO');
            }
            relatedEntity = {
                kind: 'RoomChat',
                peerId,
            };
            break;
        }
        case 'channel': {
            relatedEntity = {
                kind: 'RoomChannel',
                // @ts-expect-error
                peerId: Peer.resolveId(apiRoom.related_entity.peer_id),
            };
            break;
        }
        case 'call': {
            const peerId = Peer.resolveId(apiRoom.related_entity.peer_id);
            if (!Peer.isChatPeerId(peerId)) {
                // SPC-TODO: что тут делать?
                throw new Error('TODO');
            }
            relatedEntity = {
                kind: 'RoomCall',
                peerId,
                callId: Space.resolveCallId(apiRoom.related_entity.call_id),
            };
            break;
        }
        case 'tribune': {
            const peerId = Peer.resolveId(apiRoom.related_entity.peer_id);
            if (!Peer.isChatPeerId(peerId)) {
                // SPC-TODO: что тут делать?
                throw new Error('TODO');
            }
            relatedEntity = {
                kind: 'RoomTribune',
                peerId,
                callId: Space.resolveCallId(apiRoom.related_entity.call_id),
                tribuneId: Space.resolveTribuneId(apiRoom.related_entity.tribune_id),
            };
            break;
        }
        default:
            exhaustivenessCheck(apiRoom.related_entity);
    }
    const sectionId = apiRoom.section_id === undefined
        ? apiRoom.section_id
        : Space.resolveSectionId(apiRoom.section_id);
    return {
        id: Space.resolveRoomId(apiRoom.id),
        version: apiRoom.entity_version,
        sectionId,
        position: apiRoom.position,
        isPrivate: Boolean(apiRoom.is_private),
        isMember: Boolean(apiRoom.is_member),
        permissions: apiRoom.permissions || [],
        relatedEntity,
    };
}
export function fromApiSection(apiSection) {
    return {
        id: Space.resolveSectionId(apiSection.id),
        version: apiSection.entity_version,
        name: apiSection.name,
        isService: Boolean(apiSection.is_service),
        position: apiSection.position,
    };
}
export function fromApiNotificationSettings(apiSettings) {
    if (!apiSettings) {
        return {
            muteTill: 0,
            useSound: true,
        };
    }
    return {
        muteTill: apiSettings.mute_till * 1000,
        useSound: Boolean(apiSettings.use_sound),
    };
}
//# sourceMappingURL=SpaceConverter.js.map