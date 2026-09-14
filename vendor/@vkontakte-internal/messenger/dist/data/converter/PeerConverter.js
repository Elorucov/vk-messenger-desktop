import * as Peer from '../../core/model/Peer';
import * as Picture from '../../core/model/Picture';
import * as TextChunk from '../../core/model/TextChunk';
import { fromApiPicture } from '../converter/PictureConverter';
import { Time, getTimeInSecondsSinceStartDay } from '../../core/utils/time';
import { exhaustivenessCheck } from '../../core/utils/misc';
import { isNumber } from '@vkontakte/vkjs';
export function fromApiUser(apiUser) {
    const sexMap = {
        0: 'unknown',
        1: 'female',
        2: 'male',
    };
    const friendStatusMap = {
        0: 'unfamiliar',
        1: 'outgoingRequest',
        2: 'incomingRequest',
        3: 'friends',
    };
    const lastSeen = {
        isOnline: !!apiUser.online_info?.is_online,
        at: apiUser.online_info?.status
            ? apiUser.online_info?.status
            : apiUser.online_info?.last_seen
                ? apiUser.online_info.last_seen * 1000
                : 'not_show',
    };
    const id = Peer.resolveRealId('User', apiUser.id);
    const isBlacklisted = Boolean(apiUser.blacklisted);
    const [, photoId] = apiUser.photo_id ? apiUser.photo_id.split('_') : [];
    const parsedPhotoId = photoId ? parseInt(photoId) : null;
    const languageId = apiUser.language
        ? fromApiLanguageId(parseInt(apiUser.language))
        : null;
    return {
        user: {
            kind: 'User',
            id,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            firstName: apiUser.first_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            firstNameGen: apiUser.first_name_gen || apiUser.first_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            firstNameAcc: apiUser.first_name_acc || apiUser.first_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            firstNameIns: apiUser.first_name_ins || apiUser.first_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            firstNameDat: apiUser.first_name_dat || apiUser.first_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            lastName: apiUser.last_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            lastNameGen: apiUser.last_name_gen || apiUser.last_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            lastNameAcc: apiUser.last_name_acc || apiUser.last_name,
            // @ts-expect-error апи обновило криво поля, но они рекваеред
            lastNameIns: apiUser.last_name_ins || apiUser.last_name,
            screenName: apiUser.screen_name,
            sex: apiUser.sex !== undefined ? sexMap[apiUser.sex] : 'unknown',
            photoId: parsedPhotoId && !isNaN(parsedPhotoId) ? parsedPhotoId : undefined,
            photo: fromApiPicture({
                baseUrl: apiUser.photo_base,
                photo50: apiUser.photo_50,
                photo100: apiUser.photo_100,
                photo200: apiUser.photo_200,
            }),
            isVerified: Boolean(apiUser.verified),
            isBlacklisted,
            isBlacklistedByMe: Boolean(apiUser.blacklisted_by_me),
            isProfileClosed: Boolean(apiUser.is_closed) && !apiUser.can_access_closed,
            isDeactivated: Boolean(apiUser.deactivated),
            deactivationReason: apiUser.deactivated,
            /**
             * полагаемся на то, что модуль звонков выбросит ошибку,
             * если звонить все же нельзя,
             */
            canCall: Boolean(apiUser.can_call),
            canChangeFriendship: apiUser.can_send_friend_request === 1,
            canInviteToChats: !!apiUser.can_invite_to_chats,
            canMessage: apiUser.can_write_private_message === 1,
            hasDefaultPhoto: apiUser.has_photo !== 1,
            followersCount: apiUser.followers_count || 0,
            friendship: apiUser.friend_status !== undefined
                ? friendStatusMap[apiUser.friend_status]
                : friendStatusMap[0],
            mutualFriends: isBlacklisted ? { hint: [], count: 0 } : undefined,
            contactName: apiUser.contact_name,
            occupation: apiUser.occupation,
            bdate: apiUser.bdate,
            city: apiUser.city,
            phone: apiUser.mobile_phone,
            employeeMark: apiUser.employee_mark,
            employeeWorkingState: apiUser.employee_working_state && {
                state: apiUser.employee_working_state.state,
                ts_to: apiUser.employee_working_state.ts_to * 1000,
                ts_from: apiUser.employee_working_state.ts_from * 1000,
            },
            isService: apiUser.is_service_account || apiUser.is_service,
            imageStatus: apiUser.image_status
                ? resolveImageStatus(apiUser.image_status)
                : undefined,
            eduRoles: apiUser.educational_profile?.edu_roles
                ? convertEduRoles(apiUser.educational_profile.edu_roles)
                : undefined,
            eduSchedule: apiUser.educational_profile?.schedule
                ? convertEduSchedule(apiUser.educational_profile.schedule)
                : undefined,
            languageId: isNumber(languageId) ? languageId : undefined,
        },
        lastSeen,
    };
}
export function fromApiGroup(apiGroup) {
    const id = Peer.resolveRealId('Group', apiGroup.id);
    if (!apiGroup.type) {
        throw new Error(`fromApiGroup содержит некорректный тип ${apiGroup.type}`);
    }
    const membership = {
        0: 'notMember',
        1: 'member',
        2: 'unsure',
        3: 'declined',
        4: 'outgoingRequest',
        5: 'incomingRequest',
    }[apiGroup.member_status || 0];
    return {
        kind: 'Group',
        id,
        type: apiGroup.type,
        // @ts-expect-error апи обновило криво поля, но они рекваеред
        name: apiGroup.name,
        screenName: apiGroup.screen_name,
        photo: fromApiPicture({
            baseUrl: apiGroup.photo_base,
            photo50: apiGroup.photo_50,
            photo100: apiGroup.photo_100,
            photo200: apiGroup.photo_200,
        }),
        activity: apiGroup.activity,
        memberCount: apiGroup.members_count || 0,
        membership: membership,
        isDeactivated: Boolean(apiGroup.deactivated),
        deactivationType: apiGroup.deactivated_type,
        deactivationMessage: TextChunk.fromTrustedServerText(apiGroup.deactivated_message || ''),
        isVerified: apiGroup.verified === 1,
        isClosed: Boolean(apiGroup.is_closed),
        isPrivate: apiGroup.is_closed === 2,
        canMessage: apiGroup.can_message === 1,
        canChangeMembership: apiGroup.ban_info?.end_date !== 0 &&
            (apiGroup.is_closed === 0 ||
                membership === 'member' ||
                membership === 'incomingRequest'),
        mutualFriends: apiGroup.is_closed === 2 && membership !== 'member'
            ? { hint: [], count: 0 }
            : undefined,
        isBlacklistedByMe: apiGroup.is_messages_blocked === 1,
        isBusinessBlacklistedByMe: !(apiGroup.can_send_notify === 1),
        site: apiGroup.site,
        adminLevel: apiGroup.admin_level || 0,
    };
}
export function fromApiContact(apiContact) {
    const id = Peer.resolveRealId('Contact', apiContact.id);
    const userId = Peer.resolveId(apiContact.user_id);
    return {
        kind: 'Contact',
        id,
        name: apiContact.name,
        userId: userId,
        phone: apiContact.phone,
        canWrite: apiContact.can_write,
        photo: fromApiPicture({
            // Пока нет отдельного поля с бейзурлом, поэтому берем его из имеющегося фото. Задача на поддержку - ME-42780
            baseUrl: Picture.getClearBaseUrl(apiContact.photo_50),
            photo50: apiContact.photo_50,
        }),
        lastSeen: apiContact.last_seen_status,
    };
}
export function fromApiAnonym(apiAnonym) {
    const id = Peer.resolveAnyId(apiAnonym.id);
    if (!Peer.isAnonymPeerId(id)) {
        return;
    }
    return {
        id,
        kind: 'Anonym',
        name: apiAnonym.name,
        photo: fromApiPicture({
            baseUrl: apiAnonym.photo_base,
            photo50: apiAnonym.photo_50,
            photo100: apiAnonym.photo_100,
            photo200: apiAnonym.photo_200,
            photo400: apiAnonym.photo_400,
        }),
    };
}
export function resolveImageStatus(status) {
    return {
        name: status.name,
        images: status.images.map((image) => ({
            url: image.url,
            width: image.width,
            height: image.height,
        })),
    };
}
function convertEduRoles(eduRoles) {
    return {
        mainRole: eduRoles.main_roles,
        mainRoleCode: eduRoles.main_role_code,
        organizations: fromApiOrganizations(eduRoles.organizations || []),
    };
}
export function fromApiOrganizations(organizations) {
    return organizations.map((org) => ({
        id: org.organization_id,
        name: org.organization_name,
        roles: org.roles.map((role) => ({
            code: role.role_code,
            name: role.details,
        })),
    }));
}
export function fromApiPrivacy(response) {
    const privacy = [];
    const fromCategorySetting = (id, setting) => {
        const fromList = (list) => {
            return {
                enabled: list?.allowed ?? [],
                disabled: list?.excluded ?? [],
            };
        };
        return {
            id,
            value: {
                type: 'category',
                value: setting.category,
                lists: fromList(setting.lists),
                owners: fromList(setting.owners),
                listsOwners: fromList(setting.lists_owners),
            },
        };
    };
    // Пока не используется, но можно использовать как появятся поддерживаемые бинарные настройки приватности
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fromBinarySetting = (id, setting) => {
        return {
            id,
            value: {
                type: 'boolean',
                enabled: setting.is_enabled,
            },
        };
    };
    response.settings.forEach((setting) => {
        switch (setting.key) {
            case 'bdate_visibility':
                switch (setting.value.type) {
                    case 'category':
                        privacy.push(fromCategorySetting(setting.key, setting.value));
                        break;
                    case 'binary':
                        // @todo Разделить обработку настроек приватности так, чтобы не пришлось дублировать этот switch
                        break;
                    default:
                        exhaustivenessCheck(setting.value);
                }
                break;
            default:
            // Остальные не поддерживаемые типы приватности нам пока не нужны
            // Нельзя сделать через exhaustivenessCheck поскольку в типах не описаны возможные значения setting.key
        }
    });
    return privacy;
}
export function convertEduSchedule(eduSchedule) {
    return {
        timezone: eduSchedule.timezone,
        intervals: eduSchedule.schedule_intervals.map(({ day_num, start, finish, ...restDay }) => {
            const startDate = new Date(start * Time.Second);
            const finishDate = new Date(finish * Time.Second);
            return {
                dayNumber: day_num,
                start: getTimeInSecondsSinceStartDay(startDate),
                finish: getTimeInSecondsSinceStartDay(finishDate),
                ...restDay,
            };
        }),
    };
}
function fromApiLanguageId(languageId) {
    return isLangId(languageId) ? languageId : null;
}
function isLangId(languageId) {
    return Object.values(Peer.LanguageId).includes(languageId);
}
//# sourceMappingURL=PeerConverter.js.map