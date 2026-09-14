import { CallsEventType, EMPTY_USER_ID, } from '@vkontakte-internal/calls-core';
import { ConversationOption } from '@vkontakte/calls-sdk';
import * as Vmoji from '@vkontakte/calls-vmoji';
import { setConversationData } from '../../actions/actions';
import { ECallMembersActions } from '../../actions/callMembers';
import { E_ACTION } from '../../constants';
import { callStats } from '../../stats/clickHouse';
import { normalizeGroup } from '../../helpers/user';
import { getActiveParticipantsCount, isParticipantAnonymOrContact } from '../../helpers/participant';
import { convertClientData, convertServerData, getServerCustomError, getTextForClientError, getTextForServerError, tokenValidateRetryWrapper, } from '../../helpers/helpers';
import * as tokens from '../../tokens';
import { getCallAuthToken, getGroupById, retryLoadCallPeers } from '../backend';
/**
 * Подключает модуль Vmoji к SDK в случае соблюдения необходимых условий.
 *
 * @param {Object} SDK OKCallsSDK
 * @param {Object} config конфиг из глобального стейта
 */
export function initVmoji(SDK, config) {
    if (config.enableVmoji && !config.sferum && Vmoji.isBrowserSupported()) {
        SDK.setVmoji(Vmoji, SDK, {
            useAI: true,
            useFullClientRendering: false,
            useImageBitmapIfAvailable: false,
            useInitialFPSLimiting: true,
            useMainThreadRendering: true,
            useFPSControl: false,
            useTaskThrottling: false,
            decoderOptions: {
                useFrameBatching: false,
                useLowResolution: false,
                specificVersion: '1-3-2',
            },
        }, config.enableVmojiV2 ? 2 : 1);
    }
}
export function createInvalidTokenHandler({ authorize, getIsDev, getMyPeerId, onError, setIsAuthorized, }) {
    return async () => {
        try {
            const { token, apiBaseUrl } = await tokens.fetchTokenWithApiBaseUrl(getIsDev());
            await authorize(token, apiBaseUrl);
            setIsAuthorized(true);
            tokens.saveLocalTokenWithApiBaseUrl(token, apiBaseUrl, getMyPeerId());
        }
        catch (err) {
            onError?.(err);
        }
    };
}
/**
 * Запрашивает токен для авторизации и сразу же пытается авторизоваться.
 * Вызывается если токен звонка протух
 */
export async function handleInvalidToken(authorize, bridge, store) {
    try {
        const { token, apiBaseUrl } = await tokens.fetchTokenWithApiBaseUrl(store.getState().isDev);
        await authorize(token, apiBaseUrl);
        bridge.authorized = true;
        tokens.saveLocalTokenWithApiBaseUrl(token, apiBaseUrl, store.getState().me);
    }
    catch (err) {
        bridge.eventBus.emit(CallsEventType.ERROR, { error: err });
        console.error('Could not authorize with token request', err);
    }
}
export function resetAuthByGroupId(deps) {
    checkAuthByGroupId({ ...deps, groupId: EMPTY_USER_ID });
}
/**
 * Проверяет авторизацию у сообщества. В случае, если группа не совпадает, то делается повторная авторизация
 */
export async function checkAuthByGroupId({ authorize, authorizedGroupId, dispatch, groupId, isDev, onlyAuth = false, setAuthorizedGroupId, }) {
    const isNoGroup = !groupId && !authorizedGroupId;
    const isSameGroup = groupId && authorizedGroupId === groupId;
    if (isNoGroup || isSameGroup) {
        return;
    }
    if (!onlyAuth) {
        callStats.setEventCommonData();
        dispatch({
            type: ECallMembersActions.SET_GROUP_MEMBERS,
            count: 0,
            members: [],
            unableToCallGroupMembersIds: [],
        });
    }
    const { token, api_base_url } = await getCallAuthToken(isDev, groupId);
    await authorize(token, api_base_url);
    setAuthorizedGroupId(groupId);
    if (onlyAuth || !groupId) {
        return;
    }
    const { groups } = await getGroupById(-groupId);
    if (groups) {
        const [group] = groups;
        dispatch({
            type: E_ACTION.SET_GROUP,
            groupId: groupId,
            meGroup: normalizeGroup(group),
        });
        callStats.setEventCommonData({ group_id: groupId });
    }
}
/**
 * Загружает необходимые данные
 */
export function loadConversationData(dispatch, vkId, conversationData, isDisabledSetConversationData = false) {
    const hasPreloadedData = !!conversationData;
    if (!hasPreloadedData && !vkId) {
        return Promise.reject('Cannot load data');
    }
    const promise = !!conversationData
        ? Promise.resolve(convertClientData(conversationData))
        : retryLoadCallPeers(vkId).then(convertServerData);
    return promise.then((response) => {
        if (!isDisabledSetConversationData) {
            const [conversation, members, originalConversation] = response;
            setConversationData(dispatch, { conversation, members, originalConversation, vkId });
        }
        return response;
    });
}
/**
 * Возвращает текст ошибки для метода звонка
 *
 * @param {Error|Object|Number|null} err
 * @param {Boolean} isGroupCall
 * @param {Function} getLang
 * @return {String}
 */
export function getCallStartErrorText(err, isGroupCall, getLang) {
    const isUnknownError = (err) => !!err;
    const isClientCaughtError = (err) => typeof err === 'number';
    const isServerError = (err) => {
        const { hangup, message } = err || {};
        return message && hangup === undefined;
    };
    const isVKAPIError = (err) => {
        const { error_msg } = err;
        return !!error_msg;
    };
    /** TODO: добавить обработку ошибков от ok api типа:
     * "api (error, code: 2, message: 'SERVICE : Service is temporary unavailable.')"
     */
    // const isOkServerCaughtError = (err: CallError) => typeof err.code === 'number';
    const isHangupWithServerError = (err) => {
        const { hangup, message } = err || {};
        return !!(hangup && message);
    };
    const isClientUncaughtError = (err) => {
        // @ts-expect-error TS0000: Wrong types
        return ['TypeError', 'SyntaxError', 'RangeError', 'EvalError', 'URIError'].includes(err?.__proto__?.name);
    };
    switch (true) {
        case isHangupWithServerError(err):
        case isServerError(err):
            return getTextForServerError(err.message, isGroupCall, getLang, getServerCustomError(err));
        case isClientUncaughtError(err):
            return getLang('calls_error');
        case isVKAPIError(err):
            return getTextForServerError(err.error_msg, isGroupCall, getLang);
        case isClientCaughtError(err):
            return getTextForClientError(err, isGroupCall, getLang);
        case isUnknownError(err):
        default:
            return getLang('calls_sorry_error');
    }
}
export const checkAreRoomsClosed = (legacyState, participantIdsByRoomIdMap, roomId) => {
    const activeParticipantsCount = getActiveParticipantsCount(legacyState);
    const participantsInMainRoom = (participantIdsByRoomIdMap.null?.length || 0) + 1;
    return roomId === null && participantsInMainRoom === activeParticipantsCount;
};
/**
 * 1 попытка авторизоваться.
 * Если пользователь аноним или бридж уже авторизован, то ничего не делаем.
 * В остальных случаях пытаемся использовать токен из опций или же запросить новый самостоятельно.
 * Если токен был устаревшим, то handleInvalidToken еще раз попытается нас авторизовать
 */
const createAuthorize = ({ authorize, getIsAuthorized, getIsDev, getMyPeerId, getToken, getApiBaseUrl, setIsAuthorized, }) => async () => {
    const isDev = getIsDev();
    const me = getMyPeerId();
    if (isParticipantAnonymOrContact(me) || getIsAuthorized()) {
        return;
    }
    let apiData = {
        token: getToken(),
        apiBaseUrl: getApiBaseUrl(),
    };
    // Если пользователь не анониним, но токен все равно не пришел, то запрашиваем его
    if (!isParticipantAnonymOrContact(me) && !apiData.token) {
        apiData = await tokens.fetchTokenWithApiBaseUrl(isDev);
        tokens.saveLocalTokenWithApiBaseUrl(apiData.token, apiData.apiBaseUrl, me);
    }
    // Токен из опций может прийти несколькими способами:
    // 1. Из шаблона php, но может и не прийти, потому что токена не оказалось в мемкеше.
    // 2. Его прокинули вручную, в mvk так.
    // Если токен пришел протухший, мы падаем и идем в retry который запрашивает токен через апи и кеширует.
    // Веб версия никак закешированный токен не использует, а mvk использует при инициализации
    // В будущем планируется в вебе при инициализации токен брать из localStorage
    await authorize(apiData.token, apiData.apiBaseUrl);
    setIsAuthorized(true);
};
export const createAuthorizeWithRetry = (deps) => 
// Если авторизация первый раз не пройдет, то попытаемся еще раз авторизоваться, но с новым токеном
tokenValidateRetryWrapper(createInvalidTokenHandler(deps), createAuthorize(deps));
/** добавляет поддержку `FEEDBACK`, если пользователь её явно не передал */
export function patchCallOptionsFeedback(options) {
    if (!(options.conversationOptions || {}).hasOwnProperty(ConversationOption.FEEDBACK)) {
        return {
            ...options,
            conversationOptions: {
                ...options.conversationOptions,
                FEEDBACK: true,
            },
        };
    }
    return options;
}
//# sourceMappingURL=utils.js.map