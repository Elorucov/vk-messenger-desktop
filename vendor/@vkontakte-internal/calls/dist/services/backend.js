import { API_VERSION, } from '@vkontakte-internal/api-schema-typescript';
import { userFields } from './users';
import { exponentialRetry, normalizeProfiles } from '../helpers/helpers';
import { createApi, getAnonymousAccessToken, getApiWrapper } from '../helpers/apiGetter';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { get } from '../helpers/get';
import { handlePromiseError } from '../helpers/logger';
import { vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { CallErrorType } from '../constants';
import { APIErrorType, } from '@vkontakte-internal/api-client';
export { userFields };
// Использую отдельно строку так как из enum не подтягивается значение (непонятно почему)
export const baseUserFields = userFields;
export const groupFields = [
    'name',
    'photo_100',
    'photo_200',
    'can_upload_video',
    'custom_names_for_calls',
].join(',');
export const loadCallPeersByPeerIds = (peerIds) => {
    return createApi('messages.getConversationsById')({
        peer_ids: peerIds.join(','),
        extended: 1,
        fields: baseUserFields,
    });
};
export const loadCallPeers = (peerId) => {
    return createApi('messages.getConversationsById')({
        peer_ids: peerId,
        extended: 1,
        fields: baseUserFields,
    });
};
let timer = 0;
let peerIds = [];
let promiseResolve = [];
export const loadCallPeersWithThrottling = (peerId, timeout = 50) => {
    peerIds.push(peerId);
    return new Promise((resolve) => {
        promiseResolve.push(resolve);
        if (!timer) {
            timer = window.setTimeout(() => {
                loadCallPeersByPeerIds(peerIds)
                    .then((data) => {
                    promiseResolve.forEach((element) => {
                        element(data);
                    });
                    promiseResolve = [];
                })
                    .catch(handlePromiseError);
                peerIds = [];
                timer = 0;
            }, timeout);
        }
    });
};
export const retryLoadCallPeers = exponentialRetry(loadCallPeersWithThrottling, { errorType: CallErrorType.CANT_REACH_API });
export const getConversationMembers = (peerId, count, offset = 0) => {
    const params = {
        peer_id: peerId,
        fields: userFields.concat(',can_call'),
        extended: 1,
    };
    if (count) {
        params.count = count;
        params.offset = offset;
    }
    return createApi('messages.getConversationMembers')(params);
};
export const searchChatMembers = (peerId, q, count = 10) => {
    return createApi('messages.searchConversationMembers')({
        peer_id: peerId,
        q,
        count,
        fields: userFields.concat(',can_call'),
        extended: 1,
    });
};
export const updateCallSettings = (showChatHistory, callId) => {
    const params = {
        show_chat_history: showChatHistory ? 1 : 0,
        call_id: callId,
    };
    return createApi('calls.updateCallSettings')(params);
};
export const getCallSettings = (params) => {
    return createApi('calls.getCallSettings')(params);
};
export const getCallAuthToken = (isDev, groupId = 0) => {
    debugMessage(DebugMessageType.DEBUG, {
        type: 'request',
        method: 'messages.getCallToken',
        data: { isDev, groupId },
    });
    const params = { env: isDev ? 'development' : 'production' };
    // Бекенд не поддерживает 0 в качестве аргумента
    if (groupId !== 0) {
        params.group_id = groupId;
    }
    return createApi('messages.getCallToken')(params, {}, { version: API_VERSION }).then((data) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: 'messages.getCallToken',
            data,
        });
        return data;
    });
};
export const getCallUrlLink = (callId, invalidate, groupId = 0) => {
    const params = {
        call_id: callId,
        invalidate: invalidate ? 1 : 0,
    };
    // Бекенд не поддерживает 0 в качестве аргумента
    if (groupId !== 0) {
        params.group_id = groupId;
    }
    return createApi('messages.getJoinLink')(params);
};
export const messagesGetCallPreview = (link, overrideApiConfig = {}) => {
    debugMessage(DebugMessageType.DEBUG, {
        type: 'request',
        method: 'messages.getCallPreview',
        data: { link, fields: baseUserFields, device_id: 'anyId' },
    });
    return getApiWrapper()()('messages.getCallPreview', {
        link,
        fields: baseUserFields,
        device_id: 'anyId',
        extended: 1,
    }, overrideApiConfig).then((data) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: 'messages.getCallPreview',
            data,
        });
        return data;
    });
};
/**
 * @deprecated use MessagesApi
 */
export const forceCallFinish = (callId) => {
    return createApi('messages.forceCallFinish')({ call_id: callId });
};
export const getAnonymCallToken = (link, userId, name, secret, overrideApiConfig) => {
    const params = {
        link,
        user_id: userId,
        name,
        secret,
        device_id: 'anyId',
    };
    debugMessage(DebugMessageType.DEBUG, {
        type: 'request',
        method: 'messages.getAnonymCallToken',
        data: params,
    });
    return getApiWrapper()()('messages.getAnonymCallToken', params, overrideApiConfig).then((data) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: 'messages.getAnonymCallToken',
            data,
        });
        return data;
    });
};
export const getContactCallToken = (contactId, isDev) => {
    return createApi('messages.getContactCallToken')({
        contact: contactId,
        env: isDev ? 'development' : 'production',
    });
};
export const getCallParticipants = (callId, peerIds, userId, isAnon = false, secret) => {
    const chunks = [];
    let leftPeers = Array.from(new Set(peerIds));
    while (leftPeers.length) {
        if (leftPeers.length > 1000) {
            chunks.push(leftPeers.slice(0, 1000));
            leftPeers = leftPeers.slice(1000);
        }
        else {
            chunks.push(leftPeers);
            leftPeers = [];
        }
    }
    async function doRequest(prevResponse, chunk) {
        const params = isAnon
            ? {
                call_id: callId,
                participant_ids: chunk.join(','),
                fields: baseUserFields,
                device_id: 'anyId',
                secret: prevResponse.secret,
                user_id: userId,
            }
            : { call_id: callId, participant_ids: chunk.join(','), fields: baseUserFields };
        debugMessage(DebugMessageType.DEBUG, {
            type: 'request',
            method: 'messages.getCallParticipants',
            data: params,
        });
        let newResponse;
        const apiToken = getAnonymousAccessToken();
        if (apiToken) {
            newResponse = await getApiWrapper()()('calls.getParticipantsByIds', {
                call_id: callId,
                participant_ids: chunk.join(','),
                fields: baseUserFields,
            }, { accessToken: apiToken });
        }
        else {
            newResponse = await getApiWrapper()()('messages.getCallParticipants', params, {
                version: API_VERSION,
            });
        }
        const response = {
            count: newResponse.count + prevResponse.count,
            secret: newResponse.secret,
            profiles: (prevResponse.profiles || []).concat(newResponse.profiles || []),
            anonyms: (prevResponse.anonyms || []).concat(newResponse.anonyms || []),
            groups: (prevResponse.groups || []).concat(newResponse.groups || []),
            contacts: (prevResponse.contacts || []).concat(newResponse.contacts || []),
        };
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: 'messages.getCallParticipants',
            data: response,
        });
        return response;
    }
    const doExponentialRequest = exponentialRetry(doRequest);
    const initialRequest = Promise.resolve({
        secret: secret,
        count: 0,
    });
    return chunks.reduce((result, chunk) => {
        return result.then((response) => doExponentialRequest(response, chunk));
    }, initialRequest);
};
export const voiceRoomsGetParticipants = (params, isAnon = false, userId, secret, fetchOptions) => {
    const method = createApi('voicerooms.getParticipants');
    const baseParams = {
        fields: baseUserFields,
    };
    if (isAnon) {
        baseParams.device_id = 'anyId';
        baseParams.secret = secret;
        baseParams.user_id = userId;
    }
    return method({ ...baseParams, ...params }, fetchOptions);
};
export const getGroupById = (groupId) => {
    return createApi('groups.getById')({
        group_ids: String(groupId),
        fields: groupFields,
    }, {}, { version: API_VERSION });
};
export const getUpcomingLives = (ownerIds) => {
    return createApi('video.getUpcomingLives')({
        owner_ids: ownerIds,
    });
};
export const getVideos = (ownerId, videos, needPrivacy, signal) => {
    return createApi('video.get')({
        owner_id: ownerId,
        videos: videos,
        need_privacy: needPrivacy,
    }, {
        signal,
    });
};
export const sendVideoEdit = (ownerId, videoId, name, description, privacyView) => {
    return createApi('video.edit')({
        owner_id: ownerId,
        video_id: videoId,
        name: name,
        desc: description,
        privacy_view: privacyView,
    });
};
export const loadUsers = (params) => {
    return createApi('users.get')(params);
};
export const videoLiveHeartbeat = (data) => {
    return createApi('video.liveHeartbeat')(data);
};
export const loadPrivacySettings = (params) => {
    return createApi('account.getPrivacySettings')(params);
};
export const getGroupsForCall = () => {
    return createApi('messages.getGroupsForCall')({ count: 200 });
};
export const getGroupMembers = (groupId, offset = 0, count = 10) => {
    let params = {
        fields: userFields.concat(',can_call_from_group'),
        group_id: String(groupId),
        offset: offset,
        count: count,
        sort: 'time_asc',
    };
    return createApi('groups.getMembers')(params);
};
export const searchUsers = (groupId, q = '') => {
    return createApi('users.search')({
        fields: userFields.concat(',can_call_from_group'),
        group_id: groupId,
        q: q,
    });
};
export function getCallParticipantsApiCall(callId, peerIds, isAnon = false, secret = '', userId = 0) {
    let params = {
        call_id: callId,
        participant_ids: peerIds.join(','),
        fields: baseUserFields,
    };
    if (isAnon) {
        params = { ...params, device_id: 'anyId', secret: secret, user_id: userId };
    }
    debugMessage(DebugMessageType.DEBUG, {
        type: 'request',
        method: 'messages.getCallParticipants',
        data: params,
    });
    return getApiWrapper()()('messages.getCallParticipants', params, {
        version: API_VERSION,
    }).then((response) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: 'messages.getCallParticipant',
            response,
        });
        return response;
    });
}
export function getGroupsForStreaming() {
    return createApi('video.getGroupsForStreaming')({});
}
export function getCurrentCalls(fields = userFields) {
    return createApi('messages.getCurrentCalls')({ fields });
}
export function queueSubscribe(params) {
    return createApi('queue.subscribe')(params, {}, {
        grouping: false,
    });
}
export function fetchCallsQueue(userId) {
    const params = {
        queue_ids: `calls_${userId}`,
    };
    return queueSubscribe(params).then((response) => {
        const { base_url, queues } = response;
        const { key, timestamp } = queues[0];
        return {
            baseUrl: base_url,
            key,
            timestamp,
            userId,
        };
    });
}
export function makeCallsQueueUrl(urlData) {
    const { baseUrl, key, userId, timestamp } = urlData;
    return `${baseUrl}?act=a_check&key=${key}&id=${userId}&ts=${timestamp}&wait=20`;
}
export function fetchUrl(url) {
    return fetch(url).then((response) => response.json());
}
/**
 * Апи для запроса истории звонков пользователя
 * @param count
 * @param startFrom
 * @param filter
 */
export function callsGetHistory(count = 25, startFrom, filter = 'all') {
    const params = {
        count,
        fields: userFields + ',last_name_gen',
        filter,
    };
    // Нельзя передавать 0
    if (startFrom) {
        params.pagination_marker = startFrom;
    }
    return createApi('calls.getHistory')(params);
}
/**
 * Апи для удаления истории звонков пользователя до 50 шт.
 */
export function callsDeleteHistoryRecords(ids) {
    return createApi('calls.deleteHistoryRecords')({ record_ids: ids.join(',') });
}
/**
 * Апи для удаления истории всех звонков пользователя
 */
export function callsClearHistory() {
    return createApi('calls.clearHistory')({});
}
/**
 * Апи для удаления истории всех звонков группы
 */
export function callsClearGroupHistory(groupId) {
    return createApi('calls.clearGroupHistory')({
        group_id: groupId,
    });
}
/**
 * Апи для удаления истории звонков группы до 50 шт.
 */
export function callsDeleteGroupHistoryRecords(groupId, ids) {
    return createApi('calls.deleteGroupHistoryRecords')({ record_ids: ids.join(','), group_id: groupId });
}
/**
 * Апи для запроса истории звонков для сообщества
 * @param groupId
 * @param count
 * @param startFrom
 * @param filter
 */
export function callsGetGroupHistory(groupId, count = 25, startFrom, filter = 'all') {
    const params = {
        group_id: groupId,
        count,
        fields: userFields + ',last_name_gen',
        filter,
    };
    // Нельзя передавать 0
    if (startFrom) {
        params.pagination_marker = startFrom;
    }
    return createApi('calls.getGroupHistory')(params);
}
export const photosGetAllImages = (params = {}) => {
    const api = getApiWrapper()();
    debugMessage(DebugMessageType.DEBUG, {
        type: 'request',
        method: 'photos.get',
        params,
    });
    return api('photos.get', { album_id: '-166', ...params }).then((response) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: 'photos.get',
            response,
        });
        return response;
    });
};
/** проверяет ответ с сервера на наличие ошибок */
const checkResponseForErrors = (response) => {
    const errorKeys = ['error_msg', 'error_code'];
    const isErrors = errorKeys.some((key) => get(key, response));
    if (isErrors) {
        return Promise.reject(response);
    }
    return Promise.resolve(response);
};
export const photosSaveBackgroundPhoto = (file) => {
    const apiGetBgServer = getApiWrapper()();
    const apiSaveBgPhoto = getApiWrapper()();
    debugMessage(DebugMessageType.DEBUG, {
        type: 'request',
        method: 'photos.getCallBackgroundsPhotoUploadServer',
    });
    return apiGetBgServer('photos.getCallBackgroundsPhotoUploadServer', {})
        .then(checkResponseForErrors)
        .then((response) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: 'photos.getCallBackgroundsPhotoUploadServer',
            response,
        });
        const formData = new FormData();
        formData.append('file1', file, file.name);
        debugMessage(DebugMessageType.DEBUG, {
            type: 'request',
            method: `[photoUploadUrl] ${response.upload_url}`,
            formData,
        });
        return fetch(response.upload_url, {
            method: 'POST',
            body: formData,
        })
            .then((r) => r.json())
            .then(checkResponseForErrors);
    })
        .then((json) => {
        debugMessage(DebugMessageType.DEBUG, {
            type: 'response',
            method: '[photoUploadUrl]',
            json,
        });
        debugMessage(DebugMessageType.DEBUG, {
            type: 'request',
            method: 'photos.saveBackgroundPhoto',
            json,
        });
        return apiSaveBgPhoto('photos.saveBackgroundPhoto', {
            response_json: JSON.stringify(json),
        });
    })
        .then(checkResponseForErrors);
};
export const photosDelete = (params) => {
    const api = getApiWrapper()();
    debugMessage(DebugMessageType.DEBUG, {
        type: 'request',
        method: 'photos.delete',
        params,
    });
    return api('photos.delete', params).then(checkResponseForErrors);
};
export const getFriends = (count = 10, offset = 0, order = 'hints') => {
    const fields = userFields.concat(',can_call,online_info');
    const data = {
        fields,
        count,
        offset,
        order,
        filters: 'without_banned,without_deleted,without_dead',
    };
    return createApi('friends.get')(data);
};
export const friendsSearch = (userId, q = '', count = 10, offset = 0) => {
    return createApi('friends.search')({
        user_id: userId,
        q,
        fields: userFields.concat(',can_call,online_info,photo_50'),
        count,
        offset,
        filters: 'without_banned,without_deleted,without_dead',
    });
};
export const messagesGetConversations = (params = {
    extended: 1,
    count: 30,
}) => {
    return createApi('messages.getConversations')(params);
};
export const messagesSend = (params = {}) => {
    return createApi('messages.send')(params);
};
export const callsStart = createApi('calls.start');
export const messagesSearch = (params = {}) => {
    const requestParams = {
        count: 20,
        extended: 1,
        ...params,
    };
    return createApi('messages.search')(requestParams);
};
export const messagesGetScheduledCalls = (params = {}) => {
    return createApi('messages.getScheduledCalls')(params);
};
export const messagesDeleteScheduledCall = (params) => {
    return createApi('messages.deleteScheduledCall')(params);
};
export const messagesEditCall = (params) => {
    return createApi('messages.editCall')(params);
};
export const getWatchTogetherAlbums = (params = {}, fetchOptions = {}) => {
    return createApi('video.getAlbums')(params, fetchOptions).then(checkResponseForErrors);
};
export const getWatchTogetherRecommended = (params = {}, fetchOptions = {}) => {
    return createApi('video.getWatchTogetherRecommendedVideos')(params, fetchOptions).then(checkResponseForErrors);
};
export const getWatchTogetherOwnerVideos = (params = {}, fetchOptions = {}) => {
    return createApi('video.getWatchTogetherOwnerVideos')(params, fetchOptions).then(checkResponseForErrors);
};
export const getSearchVideo = (params = {}, fetchOptions) => {
    params.united_video_only = 1;
    params.extended = 1;
    return createApi('video.search')(params, fetchOptions, {
        version: '5.167',
    }).then(checkResponseForErrors);
};
export const videoGet = (params, fetchOptions) => {
    const _params = {
        extended: 1,
        ...params,
    };
    return createApi('video.get')(_params, fetchOptions);
};
export const videoStartStreaming = createApi('video.startStreaming');
export const videoEditStreaming = createApi('video.editStreaming');
export const videoDelete = createApi('video.delete');
/**
 * @deprecated use CallMembersService
 */
export const searchCallParticipants = (callId, { userId, isAnon = false, secret, search }, fetchOptions) => {
    const method = 'messages.getCallParticipants';
    const baseParams = {
        call_id: callId,
        fields: baseUserFields,
        search,
    };
    const params = isAnon
        ? {
            ...baseParams,
            device_id: 'anyId',
            secret: secret,
            user_id: userId,
        }
        : baseParams;
    debugMessage(DebugMessageType.DEBUG, { type: 'request', method, params });
    return getApiWrapper()()(method, params, { version: API_VERSION }, fetchOptions).then((newResponse) => {
        debugMessage(DebugMessageType.DEBUG, { type: 'response', method, data: newResponse });
        return {
            count: newResponse.count,
            secret: newResponse.secret,
            profiles: newResponse.profiles || [],
            anonyms: newResponse.anonyms || [],
            groups: newResponse.groups || [],
        };
    });
};
export const callsGetReactions = (params = {}, fetchOptions) => {
    return createApi('calls.getReactions')(params, fetchOptions);
};
export const callsGetJoinHistory = (params, fetchOptions) => {
    return createApi('calls.getCallJoinHistory')(params, fetchOptions).then((data) => data.csv);
};
export const callsGetParticipants = (params, fetchOptions) => {
    params.fields = baseUserFields; // стандартные поля пользователей
    return createApi('calls.getParticipants')(params, fetchOptions);
};
export const callsGetUserSettings = () => {
    return createApi('calls.getUserSettings')({}, {}, { maxRetries: 0 });
};
export const callsSetUserSettings = (params) => {
    return createApi('calls.setUserSettings')(params);
};
export const callsEditParticipantName = (params) => {
    return createApi('calls.editParticipantName', true)(params);
};
export const callsDeleteParticipantName = (params) => {
    return createApi('calls.deleteParticipantName', true)(params);
};
export const callsCheckParticipantName = (params) => {
    return createApi('calls.checkParticipantName')(params);
};
export function fetchCallsAnonymQueue(userId, secret, deviceId) {
    const params = {
        anonym_auth_user_id: userId,
        secret,
        device_id: deviceId,
    };
    return createApi('calls.subscribeToQueue', true)(params);
}
export function makeCallsAnonymQueueUrl(urlData, userId) {
    const { base_url, queues } = urlData.queue_subscription_info;
    const { key, timestamp } = queues[0];
    return `${base_url}?act=a_check&key=${key}&id=${userId}&ts=${timestamp}&wait=20`;
}
export const getAsrTranscriptions = createApi('calls.getAsrTranscriptions');
export const editAsrTranscription = createApi('calls.editAsrTranscription');
export const deleteAsrTranscriptions = createApi('calls.deleteAsrTranscriptions');
export const prepareCallsSettings = (callsSettings) => {
    const toggles = Object.fromEntries(callsSettings.toggles.map((toggle) => [toggle.name, toggle.enabled ?? false]));
    return { ...callsSettings, toggles };
};
/**
 *  Возвращает набор тогглов и каких-то базовых настроек для звонков
 */
export async function getSettings() {
    return prepareCallsSettings(await createApi('calls.getSettings')({}));
}
export async function executeUserSettings(vkUserId) {
    const request = `
return [
  wait(fork(
  API.users.get({
    user_ids: ${vkIdToPeerId(vkUserId)},
    fields: '${userFields}',
  })
)),
  API.calls.getSettings({}),
];
  `;
    const [userResponse, settingsResponse] = await createApi('execute')({
        code: request,
    });
    const [user] = normalizeProfiles(userResponse);
    const toggles = Object.fromEntries(settingsResponse.toggles.map((toggle) => [toggle.name, toggle.enabled ?? false]));
    const privacySettings = {
        callsIp: settingsResponse.settings.calls_ip,
    };
    return {
        user,
        privacySettings,
        params: {
            ...settingsResponse,
            toggles,
        },
    };
}
/**
 * Возвращает набор инициализирующий аргументов для Bridge
 */
export async function executeGetCallsSettings(vkId) {
    const { user, privacySettings, params } = await executeUserSettings(vkId);
    const { toggles, settings } = params;
    const callsCredentials = {
        key: settings.public_key,
        is_dev: settings.is_dev,
        privacySettings,
        ip_setting_enabled: settings.ip_setting_enabled,
        me: user,
    };
    return { settings, toggles, callsCredentials };
}
export async function getMember(vkId) {
    const response = await createApi('users.get')({
        user_ids: vkIdToPeerId(vkId),
        fields: userFields,
    });
    const [member] = normalizeProfiles(response);
    return member;
}
/**
 * Хелпер чтоб, понять, что ошибка точно принадлежит api запросу
 * @param err
 */
export const isAPIErrorWithType = (err) => 'type' in err &&
    typeof err.type === 'string' &&
    [APIErrorType.API_ERROR, APIErrorType.NETWORK_ERROR].includes(err.type);
/**
 * Новый метод для запроса conversations
 * @param callId
 * @param hallId
 */
export function getConversationByCall(callId, hallId) {
    const params = { call_id: callId };
    if (hallId) {
        params.hall_id = hallId;
    }
    return createApi('calls.getConversationByCall')(params);
}
/**
 * Возвращает текущий входящий звонок, используем на случай если в очереди потерялись эвенты
 * **Использовать данную функцию, только когда пользователь авторизован**
 */
export async function getInboundCall() {
    const response = await createApi('messages.getInboundCalls')({});
    const [activeCall] = response.items ?? [];
    return activeCall ?? null;
}
export function getHelpHints(hintIds) {
    return createApi('account.getHelpHints')({
        hints: hintIds?.join(','),
    }).then((response) => response.items);
}
export async function hideHelpHint(hintId) {
    return createApi('account.hideHelpHint')({
        hint_id: hintId,
    });
}
export function getCallTranslationLink(callId, hallId) {
    const params = { call_id: callId };
    if (hallId !== null) {
        params.hall_id = hallId;
    }
    return createApi('calls.getBroadcast')(params);
}
/**
 * @name request
 * @description метод отправки логов в api
 * @param params содежрит тип события и поле ошибки
 */
export const sendTrackEvents = (params) => {
    const events = JSON.stringify(params);
    return createApi('stats.trackEvents')({ events });
};
export const getPhotoMessagesUploadServer = () => {
    return createApi('photos.getMessagesUploadServer')({});
};
export const saveMessagesPhoto = (params) => {
    return createApi('photos.saveMessagesPhoto')(params);
};
export function getThumbUploadUrl(params) {
    return createApi('video.getThumbUploadUrl')(params);
}
export function saveUploadedThumb(params) {
    return createApi('video.saveUploadedThumb')(params);
}
export function updateVideoThumb(params) {
    return createApi('video.edit')(params);
}
/**
 * @deprecated use plugins/StatEventsApi depends on CALL-25077
 */
export function addMiniAppsStatEvents(params) {
    return createApi('statEvents.addMiniApps')(params);
}
export const loadContacts = (params) => {
    return getApiWrapper()()('account.getContactList', params);
};
export const messagesEditChat = (params) => {
    return getApiWrapper()()('messages.editChat', params);
};
export const messagesGetChatPreview = (params) => {
    return getApiWrapper()()('messages.getChatPreview', params);
};
//# sourceMappingURL=backend.js.map