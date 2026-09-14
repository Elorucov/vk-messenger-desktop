import { batch } from 'react-redux';
import { E_ACTION } from '../constants';
import { CallsEventType, EMPTY_USER_ID, isEmptyPeerId, NotificationType, peerIdToVkId, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { convertServerData, vou } from '../helpers/helpers';
import { getCallParticipants, getCallUrlLink, loadCallPeers, messagesGetChatPreview, retryLoadCallPeers, } from '../services/backend';
import { normalizeContact, normalizeGroup, normalizeUser } from '../helpers/user';
import { changeConversationOptions, ConversationOption, debugMessage, DebugMessageType, } from '@vkontakte/calls-sdk';
import { handlePromiseError } from '../helpers/logger';
import { isParticipantAnonym } from '../helpers/participant';
import { safeWriteClipboard } from '../utils/safeWriteClipboard';
import { bridgeEventBus } from '../services/eventBus';
const isMessagesContact = (value) => typeof value?.calls_id === 'string';
export function loadCallPeersWithoutWaitingImagesAction(state, dispatch, peerId, incomingCallId) {
    // Загружаем всех участников беседы с сервера
    return retryLoadCallPeers(peerId)
        .then(async (data) => {
        const [conversation, originalConversation] = convertServerData(data);
        const myPeerId = state.me;
        const currentUserId = peerIdToVkId(myPeerId);
        const anonymSecret = state.anonymSecret;
        const anonymId = vou(currentUserId < 0, currentUserId);
        const peerIds = originalConversation.map((member) => member.peerId);
        const { profiles = [], anonyms = [], groups = [], contacts = [],
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
         } = await getCallParticipants(incomingCallId, peerIds, anonymId, currentUserId < 0, anonymSecret);
        const members = [];
        for (let anonym of anonyms) {
            members.push(normalizeUser(anonym));
        }
        for (let contact of contacts) {
            members.push(normalizeContact(contact));
        }
        for (let profile of profiles) {
            members.push(normalizeUser(profile));
        }
        for (let group of groups) {
            members.push(normalizeGroup(group));
        }
        setActiveCallData(dispatch, originalConversation);
        dispatch({
            type: E_ACTION.LOAD_PEERS,
            conversation,
            members,
        });
    })
        .catch(handlePromiseError);
}
export function loadActiveCallDataAction(enableParticipantListChunk, dispatch, peerId) {
    if (isEmptyPeerId(peerId)) {
        return Promise.resolve();
    }
    return loadCallPeers(peerId)
        .then(({ items, profiles }) => {
        const [conversation] = items;
        batch(() => {
            setActiveCallData(dispatch, conversation);
            setInitialPeers(enableParticipantListChunk, dispatch, profiles);
        });
    })
        .catch(handlePromiseError);
}
export function getChatIsService(peerId) {
    if (isEmptyPeerId(peerId)) {
        return Promise.resolve(false);
    }
    return messagesGetChatPreview({ peer_id: Number(peerId) }).then(({ preview }) => {
        const { is_service } = preview.chat_settings;
        return !!is_service;
    });
}
const accumulate = {
    acc: [],
    timer: 0,
    promise: null,
    promiseResolve: null,
    tasks: 0,
    timeout: 300,
};
export function loadCallParticipantsAccumulate(state, dispatch, callId, peerIds) {
    accumulate.acc.push(...peerIds);
    if (accumulate.timer) {
        clearTimeout(accumulate.timer);
    }
    accumulate.timer = window.setTimeout(() => {
        const peerIds = accumulate.acc;
        const onLoaded = accumulate.promiseResolve;
        accumulate.promise = null;
        accumulate.promiseResolve = null;
        accumulate.acc = [];
        loadCallParticipants(state, dispatch, callId, peerIds)
            .catch((e) => {
            bridgeEventBus.emit(CallsEventType.ERROR, { error: e });
            debugMessage(DebugMessageType.ERROR, e);
            console.error(e);
        })
            .finally(onLoaded);
    }, accumulate.timeout);
    return (accumulate.promise =
        accumulate.promise ??
            new Promise((resolve) => {
                accumulate.promiseResolve = resolve;
            }));
}
/**
 * Универсальный экшен получения данных об участниках звонка по callId
 * Умеет запрашивать анонимных пользователей
 *
 * @param state Стейт приложения
 * @param dispatch Диспатч
 * @param callId ID звонка
 * @param peerIds Массив ID, которые необходимо загрузить
 */
function loadCallParticipants(state, dispatch, callId, peerIds) {
    const { anonymSecret, me } = state;
    const isAnonym = isParticipantAnonym(me);
    const anonymId = isAnonym ? peerIdToVkId(me) : undefined;
    return (getCallParticipants(callId, peerIds, anonymId, isAnonym, anonymSecret ?? '')
        .then(({ profiles = [], anonyms = [], secret, groups = [], contacts = [] }) => {
        if (secret) {
            dispatch({ type: E_ACTION.UPDATE_ANON_SECRET, secret });
        }
        // Из getCallParticipants группы приходят id не отрицательные, хотя у них id должен быть отрицательный
        const normalizedGroups = groups.map(normalizeGroup);
        const allParticipants = [...profiles, ...anonyms, ...normalizedGroups, ...contacts];
        const cantFindInProfiles = peerIds.filter((x) => {
            return !allParticipants.find((y) => (y.id !== EMPTY_USER_ID && vkIdToPeerId(y.id) === x) ||
                (isMessagesContact(y) && y.calls_id === x));
        });
        if (cantFindInProfiles.length > 0) {
            const error = new Error(`callId: ${callId}, timestamp: ${Date.now()}, cant find in participants: ${cantFindInProfiles.join(', ')}`);
            bridgeEventBus.emit(CallsEventType.ERROR, { error });
        }
        const members = [];
        for (let anonym of anonyms) {
            members.push(normalizeUser(anonym));
        }
        for (let contact of contacts) {
            members.push(normalizeContact(contact));
        }
        for (let profile of profiles) {
            members.push(normalizeUser(profile));
        }
        members.push(...normalizedGroups);
        return members;
    })
        /**
         * Отправляем полученные данные в стейт приложения
         */
        .then((members) => {
        if (members.length > 0) {
            dispatch({
                type: E_ACTION.LOAD_PEERS,
                members,
            });
        }
    })
        .catch((error) => {
        bridgeEventBus.emit(CallsEventType.ERROR, { error });
        debugMessage(DebugMessageType.ERROR, error);
        console.error(error);
    }));
}
export function loadCallUrlLink(dispatch, callId, invalidate, groupId = 0) {
    return getCallUrlLink(callId, invalidate, groupId).then(({ join_link: callUrlLink, short_credentials: callShortCredentials }) => {
        dispatch({
            type: E_ACTION.CALL_STATE,
            callData: {
                callUrlLink,
                callShortCredentials,
            },
        });
        return callUrlLink;
    });
}
export function setActiveCallData(dispatch, conversation) {
    if (conversation && conversation.call_in_progress) {
        const chatUnreadCount = conversation.unread_count;
        const chatUpToMsgId = conversation.last_message_id;
        const hasUrlLink = conversation.call_in_progress.has_link;
        const canFinishCall = conversation.call_in_progress.can_finish_call;
        dispatch({
            type: E_ACTION.CALL_STATE,
            callData: {
                canFinishCall,
                hasUrlLink,
            },
        });
        if (chatUnreadCount || chatUpToMsgId) {
            dispatch({
                type: E_ACTION.SET_UNREAD_COUNT,
                chatUnreadCount,
                chatUpToMsgId,
            });
        }
    }
}
export function setShowChatHistory(showChatHistory) {
    return {
        type: E_ACTION.SET_SHOW_CHAT_HISTORY,
        data: showChatHistory,
    };
}
export function setConversationData(dispatch, { conversation, members, originalConversation, vkId }) {
    setActiveCallData(dispatch, originalConversation || conversation);
    dispatch({
        type: E_ACTION.LOAD_PEERS,
        conversation,
        members,
        ...(vkId ? { peerId: vkIdToPeerId(vkId) } : {}),
    });
}
export function setAnonymousJoin(allow) {
    return changeConversationOptions({ [ConversationOption.REQUIRE_AUTH_TO_JOIN]: allow });
}
export function setWaitingHallEnabled(value) {
    return changeConversationOptions({ [ConversationOption.WAITING_HALL]: value });
}
export async function loadAndCopyJoinLink(dispatch, callId, groupId = 0) {
    try {
        const url = await loadCallUrlLink(dispatch, callId, false, groupId);
        const result = await safeWriteClipboard(url);
        if (result) {
            dispatch({
                type: E_ACTION.CALL_NOTIFICATION,
                notification: {
                    type: NotificationType.LINK_COPIED_TO_CLIPBOARD,
                },
            });
        }
    }
    catch (err) {
        debugMessage(DebugMessageType.ERROR, 'failed to load call link', err?.message);
    }
}
function setInitialPeers(enableParticipantListChunk, dispatch, profiles) {
    if (!profiles ||
        // чанки получают эти данные через onConversationParticipantListChunk
        enableParticipantListChunk) {
        return;
    }
    dispatch({
        type: E_ACTION.LOAD_PEERS,
        members: profiles.map(normalizeUser),
    });
}
//# sourceMappingURL=actions.js.map