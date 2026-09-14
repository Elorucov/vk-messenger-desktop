import { __decorate, __metadata } from "tslib";
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { API_VERSION, } from '@vkontakte-internal/api-schema-typescript';
import { CallsEventType, EMPTY_USER_ID, peerIdToVkId, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { scope } from '@vkontakte-internal/di';
import { CallsApi } from '@vkontakte-internal/plugins';
import { makeAutoObservable } from 'mobx';
import { setActiveCallData } from '../../actions/actions';
import { retryLoadCallPeers } from '../backend';
import { E_ACTION } from '../../constants';
import { bridgeEventBus } from '../eventBus';
import { getAnonymousAccessToken } from '../../helpers/apiGetter';
import { convertServerData, exponentialRetry, LockableQueue, } from '../../helpers/helpers';
import { handlePromiseError } from '../../helpers/logger';
import { isParticipantAnonym } from '../../helpers/participant';
import { normalizeContact, normalizeGroup, normalizeUser } from '../../helpers/user';
import { MessagesService } from '../messages';
import { userFields } from '../users';
import { StateBridge } from '../../utils/stateBridge';
const DEFAULT_RETRY_GET_CALL_PARTICIPANT = 10;
let ParticipantsService = class ParticipantsService {
    constructor(callsApi, messagesService, stateBridge) {
        this.callsApi = callsApi;
        this.messagesService = messagesService;
        this.stateBridge = stateBridge;
        this.queue = new LockableQueue();
        this.addToParticipantLoadingQueue = (peerIds, callId) => {
            const { callData } = this.stateBridge;
            const resultCallId = callId || callData.callId || '';
            this.queue.add(peerIds);
            if (this.promise) {
                return this.promise;
            }
            if (this.clearId) {
                clearTimeout(this.clearId);
            }
            this.clearId = setTimeout(() => {
                const lockId = LockableQueue.generateLockId();
                const onLoaded = this.promiseResolve;
                const load = async () => {
                    try {
                        await this.loadCallParticipants(this.queue, { callId: resultCallId, lockId });
                    }
                    catch (error) {
                        bridgeEventBus.emit(CallsEventType.ERROR, { error: error });
                        debugMessage(DebugMessageType.ERROR, error);
                        console.error(error);
                    }
                    this.queue.clearFinished(lockId);
                    this.queue.clearSkipped(lockId);
                    if (this.queue.getQueue().length) {
                        await load();
                    }
                };
                this.promiseResolve = undefined;
                load().finally(() => {
                    this.promise = undefined;
                    onLoaded?.();
                });
            }, 300);
            return (this.promise = new Promise((resolve) => {
                this.promiseResolve = resolve;
            }));
        };
        this.excludeFromParticipantLoadingQueue = (peerIds) => {
            this.queue.cancel(peerIds);
        };
        this.getCallParticipants = async (peerIds, { callId, lockId = LockableQueue.generateLockId(), retryGetCallParticipant = DEFAULT_RETRY_GET_CALL_PARTICIPANT, skipRetryDebugMessage, } = {}) => {
            const { anonymSecret, callData, me } = this.stateBridge;
            const resultCallId = callId || callData.callId || '';
            const queue = peerIds instanceof LockableQueue ? peerIds : new LockableQueue(peerIds);
            const doRequest = async (prevResponse, chunk) => {
                const missing = new Set(chunk);
                const params = isParticipantAnonym(me)
                    ? {
                        call_id: resultCallId,
                        device_id: 'anyId',
                        participant_ids: chunk.join(','),
                        secret: prevResponse.secret,
                        user_id: peerIdToVkId(me),
                    }
                    : { call_id: resultCallId, participant_ids: chunk.join(',') };
                debugMessage(DebugMessageType.DEBUG, {
                    type: 'request',
                    method: 'messages.getCallParticipants',
                    data: params,
                });
                let newResponse;
                const apiToken = getAnonymousAccessToken();
                if (apiToken) {
                    newResponse = await this.callsApi.getParticipantsByIds({
                        call_id: resultCallId,
                        participant_ids: chunk.join(','),
                        fields: userFields,
                    }, { accessToken: apiToken });
                }
                else {
                    newResponse = await this.messagesService.getCallParticipants({
                        options: { version: API_VERSION },
                        params,
                    });
                }
                [
                    ...(newResponse.profiles || []),
                    ...(newResponse.anonyms || []),
                    ...(newResponse.groups || []).map(normalizeGroup),
                    ...(newResponse.contacts || []),
                ].forEach((item) => missing.delete(vkIdToPeerId(item.id)));
                const response = {
                    count: newResponse.count + prevResponse.count,
                    secret: newResponse.secret,
                    profiles: (prevResponse.profiles || []).concat(newResponse.profiles || []),
                    anonyms: (prevResponse.anonyms || []).concat(newResponse.anonyms || []),
                    groups: (prevResponse.groups || []).concat(newResponse.groups || []),
                    contacts: (prevResponse.contacts || []).concat(newResponse.contacts || []),
                    missing,
                };
                debugMessage(DebugMessageType.DEBUG, {
                    type: 'response',
                    method: 'messages.getCallParticipants',
                    data: response,
                });
                return response;
            };
            const doExponentialRequest = exponentialRetry(doRequest);
            const retryMap = new Map();
            const takeChunk = async (response) => {
                const ids = await queue.take(lockId, 1000);
                if (ids.length) {
                    const { missing, ...result } = await doExponentialRequest(response, ids);
                    const timestamp = Date.now();
                    ids.forEach((id) => {
                        if (missing.has(id)) {
                            const tryCount = (retryMap.get(id) || 0) + 1;
                            if (tryCount > retryGetCallParticipant - 1) {
                                queue.skip(lockId, [id]);
                                retryMap.delete(id);
                            }
                            else {
                                queue.setTimeout(lockId, id, timestamp + Math.min(tryCount * 2, 5 * 60) * 1000);
                                retryMap.set(id, tryCount);
                            }
                        }
                        else {
                            queue.finish(lockId, [id]);
                            retryMap.delete(id);
                        }
                    });
                    return await takeChunk(result);
                }
                return response;
            };
            const result = await takeChunk({ secret: anonymSecret, count: 0 });
            if (!skipRetryDebugMessage) {
                const skipped = queue.getSkipped(lockId);
                if (skipped.length) {
                    debugMessage(DebugMessageType.ERROR, {
                        message: `While executing getCallParticipants, loading of the following participants was skipped after ${retryGetCallParticipant} failed attempts: ${skipped.join(',')}`,
                        data: skipped,
                    });
                }
            }
            return result;
        };
        /**
         * Универсальный экшен получения данных об участниках звонка по callId
         * Умеет запрашивать анонимных пользователей
         *
         * @param callId ID звонка
         * @param peerIds Массив ID, которые необходимо загрузить
         * @param lockId идентификатор блокировки получаемых из очереди элементов
         * @param retryGetCallParticipant количество повторных попыток запросить пропущенного участника
         */
        this.loadCallParticipants = async (peerIds, { callId, lockId = LockableQueue.generateLockId(), retryGetCallParticipant, } = {}) => {
            const { anonymSecret, callData, dispatch } = this.stateBridge;
            const resultCallId = callId || callData.callId || '';
            const queue = peerIds instanceof LockableQueue ? peerIds : new LockableQueue(peerIds);
            const isMessagesContact = (value) => typeof value?.calls_id === 'string';
            const load = async (isFirstTry) => {
                try {
                    const { anonyms = [], contacts = [], groups = [], profiles = [], secret, } = await this.getCallParticipants(queue, {
                        callId: resultCallId,
                        lockId,
                        ...(isFirstTry
                            ? { retryGetCallParticipant: 1, skipRetryDebugMessage: true }
                            : {
                                retryGetCallParticipant: (retryGetCallParticipant || DEFAULT_RETRY_GET_CALL_PARTICIPANT) - 1,
                            }),
                    });
                    if (secret && secret !== anonymSecret) {
                        dispatch({ type: E_ACTION.UPDATE_ANON_SECRET, secret });
                    }
                    // Из getCallParticipants группы приходят id не отрицательные, хотя у них id должен быть отрицательный
                    const normalizedGroups = groups.map(normalizeGroup);
                    const allParticipants = [...profiles, ...anonyms, ...normalizedGroups, ...contacts];
                    const peerIdList = [...queue.getFinished(lockId), ...(isFirstTry ? [] : queue.getSkipped(lockId))];
                    const cantFindInProfiles = peerIdList.filter((x) => {
                        return !allParticipants.find((y) => (y.id !== EMPTY_USER_ID && vkIdToPeerId(y.id) === x) ||
                            (isMessagesContact(y) && y.calls_id === x));
                    });
                    if (cantFindInProfiles.length > 0) {
                        const error = new Error(`callId: ${resultCallId}, timestamp: ${Date.now()}, cant find in participants: ${cantFindInProfiles.join(', ')}`);
                        bridgeEventBus.emit(CallsEventType.ERROR, { error });
                    }
                    const members = this.convertParticipantsToMember({
                        anonyms,
                        contacts,
                        profiles,
                    }).concat(normalizedGroups);
                    /**
                     * Отправляем полученные данные в стейт приложения
                     */
                    if (members.length > 0) {
                        dispatch({
                            type: E_ACTION.LOAD_PEERS,
                            members,
                        });
                    }
                }
                catch (error) {
                    bridgeEventBus.emit(CallsEventType.ERROR, { error });
                    debugMessage(DebugMessageType.ERROR, error);
                    console.error(error);
                }
            };
            await load(true);
            if (queue.getSkipped(lockId).length) {
                queue.moveToQueueByLockId(lockId);
                await load();
            }
        };
        this.loadCallPeersWithoutWaitingImagesAction = async (incomingCallId, peerId) => {
            const { dispatch } = this.stateBridge;
            try {
                // Загружаем всех участников беседы с сервера
                const [conversation, originalConversation] = convertServerData(await retryLoadCallPeers(peerId));
                const peerIds = originalConversation.map((member) => member.peerId);
                const members = this.convertParticipantsToMember(await this.getCallParticipants(peerIds, { callId: incomingCallId }));
                setActiveCallData(dispatch, originalConversation);
                dispatch({
                    type: E_ACTION.LOAD_PEERS,
                    conversation,
                    members,
                });
            }
            catch (error) {
                handlePromiseError(error);
            }
        };
        this.loadParticipantsVKInformation = async (externalIds) => {
            const { participants } = this.stateBridge;
            const peerIdsToLoad = externalIds.reduce((ids, externalId) => {
                const peerId = externalId.id;
                if (!participants[peerId]) {
                    ids.push(peerId);
                }
                return ids;
            }, []);
            if (!peerIdsToLoad.length) {
                return;
            }
            await this.addToParticipantLoadingQueue(peerIdsToLoad);
        };
        makeAutoObservable(this);
    }
    convertParticipantsToMember({ anonyms, contacts, groups, profiles, }) {
        return [
            ...(anonyms || []).map(normalizeUser),
            ...(contacts || []).map(normalizeContact),
            ...(groups || []).map(normalizeGroup),
            ...(profiles || []).map(normalizeUser),
        ];
    }
};
ParticipantsService = __decorate([
    scope.container(),
    __metadata("design:paramtypes", [CallsApi,
        MessagesService,
        StateBridge])
], ParticipantsService);
export { ParticipantsService };
//# sourceMappingURL=ParticipantsService.js.map