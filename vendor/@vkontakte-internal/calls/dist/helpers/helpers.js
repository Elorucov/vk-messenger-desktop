import { isChatPeer, isUserPeer } from '@vkontakte-internal/vkjs/lib/im/Helpers';
import { v4 } from 'uuid';
import { CLIENT_ERROR_UNKNOWN, FatalError, SDK_ERROR_AUTH, SdkErrorType } from '../constants';
import { EMPTY_PEER_ID, vkIdToPeerId, peerIdToVkId, ServerError, isGroupCallByVkId, } from '@vkontakte-internal/calls-core';
import { pause } from '@vkontakte-internal/vkjs/lib/PromiseUtils';
import { decodeHTMLEntities, formatDuration, isObjectLike, isString, leadingZero, localStorage, } from '@vkontakte/vkjs';
import { normalizeUser } from './user';
import { HangupType, MediaOption, ParticipantStatus } from '@vkontakte/calls-sdk';
import { Ranges, prepareBasePhotoUrl } from '@vkontakte-internal/vk-utils';
export { shallowEqual } from 'react-redux';
/**
 * Преобразовывает пользователя в формат беседы
 * @param {Object} user User object
 * @return{{peerId: *, tab: *}}
 */
export function convertUserObject(user) {
    let shortName = user.shortName;
    let firstName = user.firstName;
    let lastName = user.lastName;
    if (!(shortName && firstName)) {
        [firstName, lastName] = user.name.split(' ');
        shortName = fetchUserShortName(firstName, lastName, user.name);
    }
    return {
        ...user,
        peerId: vkIdToPeerId(user.id),
        tab: user.name,
        shortName,
        firstName,
    };
}
export function fetchUserShortName(first, last, name) {
    if (first) {
        const visibleLast = last ? (last.length > 2 ? last.substring(0, 1) + '.' : last) : '';
        return visibleLast ? `${first} ${visibleLast}` : first;
    }
    return name ?? '';
}
export function fixConversationFromApi({ callInProgress = false, ...conversation }) {
    if (!conversation.call_in_progress && callInProgress) {
        conversation.call_in_progress = callInProgress;
    }
    return conversation;
}
export function convertClientData([conversation, members]) {
    const fixedConversation = conversation && fixConversationFromApi(conversation);
    return [
        fixedConversation &&
            ('peerId' in fixedConversation
                ? fixedConversation
                : convertUserObject(fixedConversation)),
        members ? members.map(convertUserObject) : [],
    ];
}
export function normalizeProfiles(profiles) {
    return profiles.map(normalizeUser);
}
export function convertServerData({ items, profiles = [], }) {
    const [conversation] = items;
    const normalizedConversation = normalizeConversation(conversation);
    const normalizedMembers = normalizeProfiles(profiles);
    return [
        {
            ...normalizedConversation,
            tab: normalizedConversation.name,
        },
        isUserPeer(peerIdToVkId(normalizedConversation.peerId) ?? 0)
            ? [
                {
                    ...(normalizedMembers &&
                        normalizedMembers.filter(({ peerId }) => peerId === normalizedConversation.peerId)[0]),
                    ...normalizedConversation,
                },
            ]
            : normalizedMembers,
        conversation,
    ];
}
export function convertCallerFromLongpoll({ caller_info: { first_name: firstName, is_nft: isNft, last_name: lastName, photo_base: photoBase, photo_400: photo400, user_id: id, }, }) {
    const name = `${firstName} ${lastName}`;
    return {
        id,
        peerId: vkIdToPeerId(id),
        name,
        tab: name,
        photo: photoBase ? prepareBasePhotoUrl(photoBase, 400) : photo400,
        firstName,
        lastName,
        shortName: fetchUserShortName(firstName, lastName, name),
        is_nft: !!isNft,
    };
}
export function convertChatFromLongpoll({ chat_id: chatId, photo_base: photoBase, photo_400: photo400, title, }) {
    return {
        peerId: vkIdToPeerId(Ranges.convertChatIdToChatPeerId(chatId)),
        tab: title,
        name: title,
        photo: photoBase ? prepareBasePhotoUrl(photoBase, 400) : photo400,
    };
}
export function getVkIdFromLongpoll(payload) {
    const callerInfo = payload['caller_info'];
    const chatInfo = payload['chat_info'];
    return chatInfo ? Ranges.convertChatIdToChatPeerId(chatInfo['chat_id']) : callerInfo['user_id'];
}
export function isGroupCallEvent(e) {
    return !!e.payload['chat_info'];
}
export function calculateCallDuration(ts) {
    const PADDING_THRESHOLD = 9 * 60 + 59;
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - ts) / 1000));
    if (diff === 0) {
        return '00:00';
    }
    return diff <= PADDING_THRESHOLD ? '0' + formatDuration(diff) : formatDuration(diff);
}
function formatDiffDuration(diff) {
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    const formattedHours = leadingZero(hours);
    const formattedMinutes = leadingZero(minutes);
    const formattedSeconds = leadingZero(seconds);
    return hours > 0
        ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
        : `${formattedMinutes}:${formattedSeconds}`;
}
export function calculateTimeLeft(ts) {
    const diff = Math.max(0, Math.floor((ts - Date.now()) / 1000));
    if (diff === 0) {
        return {
            timeString: '00:00',
            shouldSetWarning: true,
            timeFinished: true,
        };
    }
    return {
        timeString: formatDiffDuration(diff),
        shouldSetWarning: diff < 60,
        timeFinished: diff <= 0,
    };
}
export function getTextForApiErrorByCode(code, isGroupCall, getLang, customError) {
    switch (+code) {
        case ServerError.CALL_JOIN_NOT_ALLOWED:
        case ServerError.MESSAGES_CALL_JOIN_NOT_ALLOWED: {
            return getLang('calls_join_error_require_access');
        }
        case ServerError.MESSAGES_OUTDATED_CALL_LINK:
        case ServerError.OUTDATED_CALL_LINK:
            return getLang('calls_join_error_outdated_link');
        case ServerError.CALL_NOT_FOUND:
        case ServerError.MESSAGES_CALL_NOT_FOUND: {
            return getLang('calls_join_error_text');
        }
        case ServerError.CALL_INVALID_JOIN_LINK:
        case ServerError.MESSAGES_CALL_INVALID_JOIN_LINK: {
            return getLang('calls_invalid_join_link');
        }
        case ServerError.MESSAGES_PRIVACY: {
            if (customError === 'edu_callee_is_unavailable_by_its_schedule') {
                return getLang('calls_privacy_error_due_schedule');
            }
            return getLang('calls_privacy_error');
        }
        case ServerError.MESSAGES_BUSY: {
            return isGroupCall ? getLang('calls_chat_busy_error') : getLang('calls_busy_error');
        }
        case ServerError.CAPTCHA_ERROR:
        case ServerError.FLOOD_CONTROL: {
            return getLang('calls_flood_error');
        }
        case ServerError.MESSAGES_REQUIRE_AUTH:
        case ServerError.REQUIRE_AUTH: {
            return getLang('calls_join_error_require_auth');
        }
        case ServerError.UNKNOWN:
        case ServerError.INTERNAL:
        case ServerError.INVALID_REQUEST:
        case ServerError.MESSAGES_OLD_RECEIVER_APP:
        default: {
            return getLang('calls_start_error');
        }
    }
}
/**
 * Возвращает ошибки с заголовками, для лучшего оформления в ui. Если нет подготовленной версии, то делается фоллбек на getTextForApiErrorByCode
 * @param code
 * @param isGroupCall
 * @param getLang
 */
export function getDetailedTextForApiErrorByCode(code, isGroupCall, getLang) {
    switch (+code) {
        case ServerError.CALL_JOIN_NOT_ALLOWED:
        case ServerError.MESSAGES_CALL_JOIN_NOT_ALLOWED: {
            return {
                title: getLang('calls_join_error_common_join_to_title'),
                message: getLang('calls_join_error_require_access_message'),
            };
        }
        case ServerError.OUTDATED_CALL_LINK:
        case ServerError.MESSAGES_OUTDATED_CALL_LINK:
            return {
                title: getLang('calls_join_error_outdated_link_title'),
                message: getLang('calls_join_error_outdated_link_message'),
            };
        case ServerError.CALL_NOT_FOUND:
        case ServerError.MESSAGES_CALL_NOT_FOUND: {
            return {
                title: getLang('calls_join_error_common_join_to_title'),
                message: getLang('calls_join_error_text'),
            };
        }
        case ServerError.CALL_INVALID_JOIN_LINK:
        case ServerError.MESSAGES_CALL_INVALID_JOIN_LINK: {
            return {
                title: getLang('calls_join_error_common_join_to_title'),
                message: getLang('calls_invalid_join_link'),
            };
        }
        case ServerError.MESSAGES_PRIVACY: {
            return {
                title: getLang('calls_join_error_common_call_to_title'),
                message: getLang('calls_privacy_error_message'),
            };
        }
        case ServerError.MESSAGES_BUSY: {
            if (isGroupCall) {
                return {
                    title: getLang('calls_chat_busy_error_title'),
                    message: getLang('calls_chat_busy_error_message'),
                };
            }
            return {
                title: getLang('calls_join_error_common_call_to_title'),
                message: getLang('calls_busy_error'),
            };
        }
        case ServerError.CAPTCHA_ERROR:
        case ServerError.FLOOD_CONTROL: {
            return {
                title: getLang('calls_join_error_common_call_to_title'),
                message: getLang('calls_flood_error_message'),
            };
        }
        case ServerError.MESSAGES_REQUIRE_AUTH:
        case ServerError.REQUIRE_AUTH: {
            return {
                title: getLang('calls_join_error_common_join_to_title'),
                message: getLang('calls_join_error_require_auth'),
            };
        }
        case ServerError.UNKNOWN:
        case ServerError.INTERNAL:
        case ServerError.INVALID_REQUEST:
        case ServerError.MESSAGES_OLD_RECEIVER_APP:
        default: {
            return {
                title: getLang('calls_join_error_common_call_to_title'),
                message: getLang('calls_start_error_message'),
            };
        }
    }
}
export function getTextForServerErrorByMessage(errorMessage, _isGroupCall, getLang) {
    switch (true) {
        case errorMessage.search('error.webrtc.auth.required') !== -1: {
            return getLang('calls_join_error_require_auth');
        }
        case errorMessage.search('error.webrtc.auth.banned') !== -1: {
            return getLang('calls_join_error_banned');
        }
        case errorMessage.search('error.webrtc.participant.check.blacklisted_by_caller') !== -1: {
            return getLang('calls_join_error_blacklisted_by_caller');
        }
        case errorMessage.search('error.webrtc.participant.check.privacy') !== -1: {
            return getLang('calls_join_error_banned');
        }
        case errorMessage.search('error.webrtc.participant.check.killed_call') !== -1: {
            return getLang('calls_join_error_killed_call');
        }
        case errorMessage.search('not.found.webrtc.conversation') !== -1: {
            return getLang('calls_join_error_not_found_conversation');
        }
        case errorMessage.search('error.participants.limit.exceeded') !== -1: {
            return getLang('calls_join_error_room_participants_exceeded');
        }
        default: {
            return getLang('calls_start_error');
        }
    }
}
export function isExternalErrorByMessage(errorMessage) {
    return errorMessage.startsWith('EXTERNAL_API_ERROR');
}
/**
 * Получаем текст для серверной ошибки, переданной SDK с EXTERNAL_API_ERROR
 *
 * @param {String} errorMessage
 * @param {Boolean} isGroupCall
 * @param {Function} getLang
 * @param {String} customError
 * @return {String}
 */
export function getTextForServerError(errorMessage, isGroupCall, getLang, customError) {
    /**
     * Ожидайемый формат текста ошибки такой:
     * "EXTERNAL_API_ERROR (code: x, message: 'VCHAT_EXTERNAL_API_ERROR : x')"
     * x - здесь это коды ошибок. Нас интересует второе, так как именно он
     * приходит от бэка vk.com
     */
    const isExternalError = isExternalErrorByMessage(errorMessage);
    const errorDigits = errorMessage.match(/\d+/g);
    const code = errorDigits ? Number(errorMessage.match(/\d+/g)?.[1]) : CLIENT_ERROR_UNKNOWN;
    const sdkCode = errorDigits ? Number(errorMessage.match(/\d+/g)?.[0]) : CLIENT_ERROR_UNKNOWN;
    /**
     * Проверяем, что это ошибка не от нашего сервера
     * а от бэка ok
     */
    if (!isExternalError || Number.isNaN(code)) {
        switch (sdkCode) {
            case SDK_ERROR_AUTH: {
                return getLang('calls_start_error_auth');
            }
        }
        return getTextForServerErrorByMessage(errorMessage, isGroupCall, getLang);
    }
    /**
     * проверяем ошибки от js ok sdk
     */
    switch (errorMessage) {
        case HangupType.CANCELED: {
            return getLang('calls_hangup_error_canceled');
        }
        case HangupType.REJECTED: {
            return getLang('calls_hangup_error_rejected');
        }
        case HangupType.REMOVED: {
            return getLang('calls_hangup_error_removed');
        }
        case HangupType.HUNGUP: {
            return getLang('calls_hangup_error_hangup');
        }
        case HangupType.MISSED: {
            return getLang('calls_hangup_error_missed');
        }
        case HangupType.BUSY: {
            return getLang('calls_hangup_error_busy');
        }
        case HangupType.FAILED: {
            return getLang('calls_hangup_error_failed');
        }
        case HangupType.NETWORK_ERROR: {
            return getLang('calls_hangup_error_network_error');
        }
        case HangupType.CALLER_IS_BLOCKED: {
            return getLang('calls_hangup_error_caller_is_blocked');
        }
        case HangupType.NOT_FRIENDS: {
            return getLang('calls_hangup_error_not_friends');
        }
        case HangupType.CALLEE_IS_OFFLINE: {
            return getLang('calls_hangup_error_callee_is_offline');
        }
        case HangupType.UNKNOWN_ERROR: {
            return getLang('calls_hangup_error_unknown_error');
        }
        case HangupType.UNSUPPORTED: {
            return getLang('calls_hangup_error_unsupported');
        }
        case HangupType.OLD_VERSION: {
            return getLang('calls_hangup_error_old_version');
        }
        case HangupType.SERVICE_DISABLED: {
            return getLang('calls_hangup_error_service_disabled');
        }
        case HangupType.EXTERNAL_API_ERROR: {
            return getLang('calls_hangup_error_external_api_error');
        }
        case HangupType.SOCKET_CLOSED: {
            return getLang('calls_hangup_error_socket_closed');
        }
        case HangupType.NOT_FOUND: {
            return getLang('calls_hangup_error_not_found');
        }
    }
    /**
     * проверяем на ошибки от бэка vk
     */
    return getTextForApiErrorByCode(+code, isGroupCall, getLang, customError);
}
/**
 * отображаем текст для отловленных ошибках
 * @param {any} err
 * @param {boolean} _isGroupCall
 * @param {function} getLang
 *
 * @return {string|undefined}
 */
export function getTextForClientError(err, _isGroupCall, getLang) {
    switch (err) {
        default: {
            return getLang('calls_sorry_error');
        }
    }
}
/**
 * Вынимает custom_error из ошибки по статусу
 */
export function getServerCustomError(err) {
    const code = err.message.match(/\d+/g)?.[1];
    if (!code) {
        return;
    }
    /**
     * Ожидайемый формат текста ошибки: "x:y",
     * где 'x' - код общей ошибки, а 'y' текстовый код ошибки для более полного описания
     */
    const extendedMessage = err?.custom_error?.vchat_external_api_error?.extended_code;
    const prefixForSearch = `${code}:`;
    if (extendedMessage?.startsWith(prefixForSearch)) {
        return extendedMessage.slice(prefixForSearch.length);
    }
}
/**
 * Извлекает код ошибки из сообщения ошибки
 *
 * @param errorMessage {string} сообщение ошибки
 * @returns {number} код ошибки
 */
export function getErrorCodeByMessage(errorMessage) {
    const isExternalError = isExternalErrorByMessage(errorMessage);
    const errorNumbers = errorMessage.match(/\d+/g);
    /**
     * Для внешней ошибки из SDK сообщение имеет вид:
     * "EXTERNAL_API_ERROR (code: x, message: 'VCHAT_EXTERNAL_API_ERROR : y')",
     * где x и y - здесь это коды ошибок SDK и бекенда vk.com соответственно.
     *
     * В приоритете нас интересует код бекенда vk.com
     */
    return Number((isExternalError && errorNumbers?.[1]) || errorNumbers?.[0] || 0);
}
/**
 * Извлекает код ошибки из объектов ошибки
 * произвольного формата (VK API, OK API).
 *
 * @param error
 * @returns {number} код ошибки
 */
export function getErrorCode(error) {
    if (isString(error)) {
        return getErrorCodeByMessage(error);
    }
    const errorObj = (isObjectLike(error?.apiError) && error.apiError) || (isObjectLike(error?.error) && error.error) || error;
    if (!isObjectLike(errorObj)) {
        return 0;
    }
    const errorMessage = errorObj.message || errorObj.error_msg;
    const isExternalError = isString(errorMessage) && isExternalErrorByMessage(errorMessage);
    return ((isExternalError && getErrorCodeByMessage(errorMessage)) || errorObj.error_code || errorObj.code || 0);
}
export function getMessageForTextLimit(textLength, maxLength, getLang) {
    if (textLength > maxLength - 100) {
        if (textLength > maxLength) {
            return getLang('text_exceeds_symbol_limit', textLength - maxLength);
        }
        else {
            return getLang('text_N_symbols_remain', maxLength - textLength);
        }
    }
}
export function createPayload(vkId, mediaOptions, callerAppId, communityUserId = 0) {
    const isGroupCall = isGroupCallByVkId(vkId);
    const payload = {
        is_video: mediaOptions.includes(MediaOption.VIDEO),
        chat_id: isChatPeer(vkId) ? Ranges.convertChatPeerIdToChatId(vkId) : undefined,
        with_join_link: isGroupCall,
        /**
         * Флаг апдейченных групповых звонков
         */
        join_by_link: isGroupCall,
        community_user_id: communityUserId,
        caller_app_id: callerAppId,
    };
    return JSON.stringify(payload);
}
/**
 * @param {Object} state
 * @return {boolean}
 */
export function isInReconnect(state) {
    if (state.localDevice.status === ParticipantStatus.RECONNECT) {
        return true;
    }
    return objectSome(state.devices, (device) => {
        return device.status === ParticipantStatus.RECONNECT;
    });
}
export const compose = (fn, ...wrappers) => (...args) => wrappers.reduce((acc, wrapper) => {
    return wrapper(acc);
}, fn)(...args);
export function exponentialRetry(fn, { attempts = 10, error, errorType, isForceBreak = () => false, staticTimeoutSec, timeout = 0, } = {}) {
    return (...args) => {
        return attempts > 0
            ? pause(timeout, null)
                .then(() => fn(...args))
                .catch((err) => exponentialRetry(fn, {
                // Do not retry on api error yet:
                attempts: err.type === SdkErrorType.API || isForceBreak(err) ? 0 : attempts - 1,
                error: err,
                errorType,
                isForceBreak,
                staticTimeoutSec,
                timeout: staticTimeoutSec ?? Math.min((timeout || 1) * 2, 5 * 60),
            })(...args))
            : Promise.reject(errorType ?? error);
    };
}
export const tokenValidateRetryWrapper = (tokenInvalidate, fn) => (...args) => {
    return fn(...args).catch((e) => {
        if (e.error === FatalError.AUTH) {
            return tokenInvalidate().then(() => {
                return fn(...args);
            });
        }
        throw e;
    });
};
export function getParticipantsListLabel(members, shown, getName, getLang, langNumeric, membersCount = 0, showCount = 3) {
    const divider = ', ';
    const getParticipantName = (member) => decodeHTMLEntities(getName(member) || '');
    if (membersCount === 0 && members.length > 0) {
        membersCount = members.length;
    }
    // Добрыня, Алёша, Илья и еще 5 человек
    if (membersCount > shown.length) {
        const count = membersCount - shown.length;
        const names = members.slice(0, showCount).map(getParticipantName).join(divider);
        return langNumeric(count, 'calls_members_list_label', getLang('calls_members_list_label', 'raw')).replace('{name}', names);
    }
    // Добрыня, Алёша и Илья
    // Добрыня и Алёша
    if (shown.length > 1) {
        const before = shown.length > 2
            ? members.slice(0, 2).map(getParticipantName).join(divider)
            : getParticipantName(members[0]);
        const after = getParticipantName(members[shown.length - 1]);
        return getLang('calls_and').replace('{before}', before).replace('{after}', after);
    }
    // Добрыня
    if (shown.length === 1) {
        return getParticipantName(members[0]);
    }
    // Если перевелись богатыри на Руси
    return '';
}
export function getJoinCallLabel(getLang, langNumeric, membersCount = 0) {
    if (membersCount > 0) {
        return langNumeric(membersCount, 'calls_members_count_label', getLang('calls_members_count_label', membersCount)).replace('%s', String(membersCount));
    }
    return getLang('calls_empty_call');
}
export function normalizePreviewData(getLang, { join_link, preview, profiles, anonyms, call_id, room }) {
    const allMembers = [...(anonyms || []), ...(profiles || [])];
    const normalizedMembers = allMembers.map(normalizeUser);
    return {
        joinLink: join_link,
        room,
        callId: call_id,
        title: preview?.title,
        membersCount: preview?.members_count,
        photo_100: preview?.photo?.photo_100,
        photo_200: preview?.photo?.photo_200,
        members: normalizedMembers,
        // TODO vkurnakov: небольшой текущий костыль, работает только из-за механизмов фолбэка
        conversationData: {
            peerId: EMPTY_PEER_ID,
            canAddMembers: true,
            tab: getLang('calls_new_call_title'),
        },
    };
}
export function normalizeConversation(conversation) {
    if (conversation.chat_settings) {
        let result = {
            peerId: vkIdToPeerId(conversation.peer.id),
            tab: conversation.chat_settings.title,
            name: conversation.chat_settings.title,
            canAddMembers: conversation.chat_settings.acl.can_invite,
            adminIds: conversation.chat_settings.admin_ids,
            ownerId: conversation.chat_settings.owner_id || -1,
            isService: conversation.chat_settings.is_service,
        };
        if (conversation.chat_settings.photo) {
            result.photo = conversation.chat_settings.photo.photo_200 || conversation.chat_settings.photo.photo_100;
        }
        return result;
    }
    return {
        canAddMembers: true,
        peerId: vkIdToPeerId(conversation.peer.id),
    };
}
export function getCallsLocalstorageKeys() {
    return Object.keys(localStorage).filter((name) => name.includes('_okcls_'));
}
/** если передано число, вернет `Promise` с паузой в `delay` секунд */
export const conditionalPausedPromise = (delay) => {
    if (typeof delay === 'number' && !Number.isNaN(delay)) {
        return pause(delay, undefined);
    }
    return Promise.resolve();
};
/** проверяем, пустой ли объект */
export const isEmpty = (value) => {
    const type = typeof value;
    switch (type) {
        case 'boolean':
        case 'string':
        case 'undefined':
        case 'number':
            return !value;
        case 'function':
        case 'bigint':
        case 'symbol':
            return true;
        case 'object':
            if (value === null) {
                return false;
            }
            if (Array.isArray(value)) {
                return !value.length;
            }
            return !Object.keys(value).length;
    }
};
export const objectMap = (obj, callback) => {
    const result = [];
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        result.push(callback(obj[key], key));
    }
    return result;
};
export const objectReduce = (obj, callback, initialValue) => {
    let currentValue = initialValue;
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        currentValue = callback(currentValue, obj[key], key);
    }
    return currentValue;
};
export const objectForEach = (obj, callback) => {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        callback(obj[key], key);
    }
};
export function objectSome(obj, callback) {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        if (callback(obj[key], key)) {
            return true;
        }
    }
    return false;
}
export function objectFind(obj, callback) {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        if (callback(obj[key], key)) {
            return obj[key];
        }
    }
}
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const noop = (...args) => { };
export const capitalize = (str) => {
    if (!str.length) {
        return '';
    }
    return str.charAt(0)?.toLocaleUpperCase() + str.slice(1);
};
export const shorten = (str, maxLen) => {
    if (str.length <= maxLen) {
        return str;
    }
    return str
        .slice(0, Math.max(maxLen - 3, 0))
        .trim()
        .concat('...');
};
export const getCallable = (value) => {
    return typeof value === 'function' ? value() : value;
};
/**
 * @description Selects an index in the specified array using the binary search algorithm.
 *  The evaluator receives an element and determines whether the desired index
 *  is before, at, or after it
 * @param compareFn Evaluator function that receives 2 arguments (the element and the index).
 *  Should return a negative number, zero, or a positive number
 *  depending on whether the desired index is before, at, or after the
 *  element passed to it.
 * @returns index of the search key, if it is contained in the array
 *  otherwise, <tt>(-(<i>insertion point</i>) - 1)</tt>.
 *  The <i>insertion point</i> is defined as the point at which the
 *  key would be inserted into the array
 */
export function binarySearch(arr, compareFn) {
    let min = 0;
    let max = arr.length;
    let found = false;
    while (min < max) {
        const middle = Math.floor((min + max) / 2);
        const result = compareFn(arr[middle], middle);
        if (result > 0) {
            min = middle + 1;
        }
        else {
            max = middle;
            found = !result;
        }
    }
    return found ? min : ~min;
}
export const isBoolean = (value) => {
    return typeof value === 'boolean';
};
/**
 * проверяет, что `x` больше или равен `min` или меньше или равен `max`
 * @param inclusive - включать `min` и `max` в сравнение, по-умолчанию `true`;
 */
export const minmax = (x, min, max, inclusive = true) => {
    if (!inclusive) {
        return x > min && x < max;
    }
    return x >= min && x <= max;
};
export const anyMatchInArray = (source, _target) => {
    if (!source || !_target) {
        return false;
    }
    const target = Array.isArray(_target) ? _target : [_target];
    if (!source.length && !target.length) {
        return true;
    }
    if (source.length && !target.length) {
        return false;
    }
    const set = new Set(source);
    return target.every((value) => set.has(value));
};
export const isArraysEqual = (source, target) => {
    if (!source && !target) {
        return true;
    }
    else if (!source || !target) {
        return false;
    }
    return source.length === target.length && source.every((element, index) => element === target[index]);
};
/** вернет последний элемент массива или `undefined` */
export const last = (arr) => {
    if (!arr.length) {
        return undefined;
    }
    return arr[arr.length - 1];
};
export const deepClone = (source) => {
    return Array.isArray(source)
        ? source.map((item) => deepClone(item))
        : source instanceof Date
            ? new Date(source.getTime())
            : source && typeof source === 'object'
                ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
                    const propDesc = Object.getOwnPropertyDescriptor(source, prop);
                    propDesc && Object.defineProperty(o, prop, propDesc);
                    o[prop] = deepClone(source[prop]);
                    return o;
                }, Object.create(Object.getPrototypeOf(source)))
                : source;
};
export const shuffle = (array) => {
    const length = array.length;
    const shuffled = array.slice();
    let index = -1;
    while (++index < length) {
        const rand = Math.floor(Math.random() * length);
        const value = shuffled[rand];
        shuffled[rand] = shuffled[index];
        shuffled[index] = value;
    }
    return shuffled;
};
export const createTimeout = (fn, delay) => {
    const t = setTimeout(fn, delay);
    return () => clearTimeout(t);
};
export const createImmediate = (fn) => {
    setTimeout(fn, 0);
};
/** возвращает `value`, если `check == true`, в противном случае возвращает `undefined` */
export function vou(check, value) {
    return check ? value : undefined;
}
/**
 * Для кнопов управления медиа нужен суффикс,
 * который покажет для автотестов доступно ли медиа,
 * и если доступно - включено или нет
 */
export const getMediaTestIdSuffix = (isEnabled, isAllowed) => {
    if (isAllowed) {
        return isEnabled ? '_enabled' : '_disabled';
    }
    else {
        return '_blocked';
    }
};
export class LockableQueue {
    static generateLockId() {
        return v4();
    }
    constructor(items) {
        this.canceled = new Set();
        this.finished = new Map();
        this.locksMap = new Map();
        this.skipped = new Map();
        this.timeoutMap = new Map();
        this.timeoutQueue = new Map();
        this.queue = new Set(items);
    }
    add(items) {
        items.forEach((item) => {
            if (!this.has(item)) {
                this.canceled.delete(item);
                this.queue.add(item);
                this.timeoutQueue.values().next().value?.();
            }
        });
    }
    cancel(items) {
        if (!items.length) {
            return;
        }
        const result = this.delete(items);
        [...result.entries()].forEach(([item, isDeleted]) => isDeleted && this.canceled.add(item));
    }
    clearFinished(lockId) {
        if (lockId) {
            this.finished.delete(lockId);
        }
        else {
            this.finished.clear();
        }
    }
    clearSkipped(lockId) {
        if (lockId) {
            this.skipped.delete(lockId);
        }
        else {
            this.skipped.clear();
        }
    }
    delete(items) {
        const result = new Map(items.map((item) => [item, false]));
        if (!items.length) {
            return result;
        }
        [...new Set([...this.locksMap.keys(), ...this.timeoutMap.keys(), ...this.skipped.keys()])]
            .map((lockId) => this.deleteByLockId(lockId, items))
            .forEach((map) => {
            if (map instanceof Map) {
                [...map.entries()].forEach(([item, isDeleted]) => isDeleted && result.set(item, true));
            }
        });
        items.forEach((item) => {
            if (this.queue.delete(item)) {
                result.set(item, true);
            }
        });
        items.forEach((item) => {
            if (this.queue.delete(item)) {
                result.set(item, true);
            }
        });
        return result;
    }
    /**
     * Удалить все заблокированные по lockId элементы
     *
     * @param lockId идентификатор блокировки получаемых из очереди элементов
     * @param items список удаляемых элементов
     *    Если не указаны то удаляются все заблокированные по lockId элементы
     */
    deleteByLockId(lockId, items) {
        if (!lockId) {
            throw new Error('lockId: should not be empty');
        }
        const locked = this.locksMap.get(lockId);
        const timeouts = this.timeoutMap.get(lockId);
        const result = items ? new Map(items.map((item) => [item, false])) : undefined;
        let isDeletedLock;
        let isDeletedTimeout;
        if (locked) {
            if (items) {
                items.forEach((item) => {
                    if (this.deleteFromLocksMap(locked, lockId, item) && result) {
                        result.set(item, true);
                    }
                });
            }
            else if (this.deleteFromLocksMap(locked, lockId)) {
                isDeletedLock = true;
            }
        }
        if (timeouts) {
            if (items) {
                items.forEach((item) => {
                    if (this.deleteFromTimeoutMap(timeouts, lockId, item) && result) {
                        result.set(item, true);
                    }
                });
            }
            else if (this.deleteFromTimeoutMap(timeouts, lockId)) {
                isDeletedTimeout = true;
            }
            if (isDeletedTimeout) {
                this.timeoutQueue.get(lockId)?.();
            }
        }
        return result || !!isDeletedLock || !!isDeletedTimeout;
    }
    deleteFromLocksMap(set, lockId, item) {
        let isDeleted;
        if (typeof item === 'undefined' || ((isDeleted = set.delete(item)) && !set.size)) {
            this.locksMap.delete(lockId);
            isDeleted = true;
        }
        return !!isDeleted;
    }
    deleteFromSkipped(set, lockId, item) {
        let isDeleted;
        if (typeof item === 'undefined' || ((isDeleted = set.delete(item)) && !set.size)) {
            this.skipped.delete(lockId);
            isDeleted = true;
        }
        return !!isDeleted;
    }
    deleteFromTimeoutMap(map, lockId, item) {
        let isDeleted;
        if (typeof item === 'undefined' || ((isDeleted = map.delete(item)) && !map.size)) {
            this.timeoutMap.delete(lockId);
            isDeleted = true;
        }
        return !!isDeleted;
    }
    finish(lockId, items) {
        if (!lockId) {
            throw new Error('lockId: should not be empty');
        }
        if (!items.length) {
            return;
        }
        const result = this.deleteByLockId(lockId, items);
        if (result instanceof Map) {
            [...result.entries()].forEach(([item, isDeleted]) => {
                if (isDeleted) {
                    const finished = this.finished.get(lockId) || new Set();
                    finished.add(item);
                    if (!this.finished.has(lockId)) {
                        this.finished.set(lockId, finished);
                    }
                }
            });
        }
    }
    getCanceled() {
        return [...this.canceled];
    }
    getFinished(lockId) {
        if (typeof lockId === 'string' && !lockId) {
            throw new Error('lockId: should not be empty');
        }
        return lockId
            ? [...(this.finished.get(lockId) || [])]
            : [...this.finished.values()].reduce((acc, finished) => [...acc, ...finished], []);
    }
    getQueue() {
        return [...this.queue];
    }
    getSkipped(lockId) {
        if (typeof lockId === 'string' && !lockId) {
            throw new Error('lockId: should not be empty');
        }
        return lockId
            ? [...(this.skipped.get(lockId) || [])]
            : [...this.skipped.values()].reduce((acc, skipped) => [...acc, ...skipped], []);
    }
    has(item) {
        return (this.queue.has(item) ||
            [...this.locksMap.values()].some((locked) => locked.has(item)) ||
            [...this.timeoutMap.values()].some((timeouts) => timeouts.has(item)) ||
            [...this.finished.values()].some((finished) => finished.has(item)));
    }
    moveToQueue(items) {
        if (!items.length) {
            return;
        }
        [...new Set([...this.locksMap.keys(), ...this.timeoutMap.keys(), ...this.skipped.keys()])].forEach((lockId) => this.moveToQueueByLockId(lockId, items));
    }
    moveToQueueByLockId(lockId, items) {
        if (!lockId) {
            throw new Error('lockId: should not be empty');
        }
        const locked = this.locksMap.get(lockId);
        const timeouts = this.timeoutMap.get(lockId);
        const skipped = this.skipped.get(lockId);
        if (locked?.size || timeouts?.size || skipped?.size) {
            const lockedAndTimeoutsResult = this.deleteByLockId(lockId, items);
            const result = new Map(lockedAndTimeoutsResult instanceof Map ? lockedAndTimeoutsResult : []);
            if (lockedAndTimeoutsResult === true) {
                [...(locked || []), ...(timeouts?.keys() || [])].forEach((item) => result.set(item, true));
            }
            if (skipped) {
                if (items) {
                    items.forEach((item) => {
                        if (this.deleteFromSkipped(skipped, lockId, item)) {
                            result.set(item, true);
                        }
                    });
                }
                else if (this.deleteFromSkipped(skipped, lockId)) {
                    [...(skipped || [])].forEach((item) => result.set(item, true));
                }
            }
            [...result.entries()].forEach(([item, isDeleted]) => isDeleted && this.queue.add(item));
        }
    }
    /**
     * Установить таймаут на получения элемента из списка заблокированных по lockId
     *
     * @param lockId идентификатор блокировки получаемых из очереди элементов
     * @param item
     * @param timeoutUntil временная метка (в миллисекундах) до которого элемент не будет возвращаться
     */
    setTimeout(lockId, item, timeoutUntil) {
        if (!lockId) {
            throw new Error('lockId: should not be empty');
        }
        const locked = this.locksMap.get(lockId);
        if (locked && locked.has(item) && timeoutUntil > Date.now()) {
            const timeouts = this.timeoutMap.get(lockId) || new Map();
            locked.delete(item);
            timeouts.set(item, timeoutUntil);
            if (!this.timeoutMap.has(lockId)) {
                this.timeoutMap.set(lockId, timeouts);
            }
        }
    }
    skip(lockId, items) {
        if (!lockId) {
            throw new Error('lockId: should not be empty');
        }
        if (!items.length) {
            return;
        }
        const result = this.deleteByLockId(lockId, items);
        if (result instanceof Map) {
            [...result.entries()].forEach(([item, isDeleted]) => {
                if (isDeleted) {
                    const skipped = this.skipped.get(lockId) || new Set();
                    skipped.add(item);
                    if (!this.skipped.has(lockId)) {
                        this.skipped.set(lockId, skipped);
                    }
                }
            });
        }
    }
    /**
     * Получить список элементов из очереди
     *
     * @param lockId идентификатор блокировки получаемых из очереди элементов
     *   Запрашиваемый список элементов:
     *     - попадает в отдельную очередь блокировки, из которой их можно получать повторно по тому же идентификатору
     *     - может быть исключён из очереди только явно, через: delete, deleteByLockId, unlock или unlockByLockId
     *     - получает возможность применять setTimeout для элементов:
     *       1. В случае, если есть элементы помимо тех, на которые установлен таймаут, то они возвращаются сразу,
     *          даже если их меньше чем запрошено
     *       2. В случае, если больше нет элементов помимо тех, на которые установлен таймаут,
     *          то будет ждать пока закончится ближайший таймаут, но в случае добавления в очередь нового элемента,
     *          ожидание будет прервано и будет взят элемент из очереди
     * @param partLimit количество запрашиваемых элементов
     */
    async take(lockId, partLimit = 1) {
        if (!lockId) {
            throw new Error('lockId: should not be empty');
        }
        const result = new Set();
        const locks = this.locksMap.get(lockId) || new Set();
        const locksIterator = locks.values();
        const timeouts = this.timeoutMap.get(lockId) || new Map();
        let timeoutsIterator = timeouts.entries();
        let minTimeoutUntil = 0;
        do {
            const lockedItem = locksIterator.next();
            if (!lockedItem.done) {
                result.add(lockedItem.value);
            }
            else {
                const timeoutsItem = timeoutsIterator.next();
                if (!timeoutsItem.done) {
                    const [id, timeoutUntil] = timeoutsItem.value;
                    if (timeoutUntil <= Date.now()) {
                        this.deleteFromTimeoutMap(timeouts, lockId, id);
                        locks.add(id);
                        result.add(id);
                    }
                    else {
                        minTimeoutUntil = timeoutUntil;
                    }
                }
                else {
                    const queueItem = this.queue.values().next();
                    if (!queueItem.done) {
                        const item = queueItem.value;
                        if (this.queue.delete(item)) {
                            result.add(item);
                            locks.add(item);
                        }
                    }
                    else if (minTimeoutUntil && !result.size && !this.timeoutQueue.has(lockId)) {
                        await this.waitUntil(lockId, minTimeoutUntil);
                        timeoutsIterator = timeouts.entries();
                    }
                    else {
                        break;
                    }
                }
            }
        } while (result.size < partLimit);
        if (!this.locksMap.has(lockId) && locks.size) {
            this.locksMap.set(lockId, locks);
        }
        return [...result];
    }
    waitUntil(lockId, timeoutUntil) {
        return new Promise((resolve) => {
            const timeoutQueue = this.timeoutQueue;
            const data = {
                clear() {
                    clearTimeout(this.clearId);
                    timeoutQueue.delete(lockId);
                    resolve(true);
                },
            };
            data.clearId = setTimeout(data.clear.bind(data), timeoutUntil - Date.now() + 1);
            this.timeoutQueue.set(lockId, data.clear.bind(data));
        });
    }
}
//# sourceMappingURL=helpers.js.map