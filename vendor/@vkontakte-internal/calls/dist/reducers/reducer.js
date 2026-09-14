import { E_ACTION } from '../constants';
import { EMPTY_PEER_ID, ErrorHandleType, EVideoOptionType, externalIdToString, isSameExternalId, modalHasType, ModalType, Mode, peerIdToVkId, UIMode, VideoSuspendMode, vkIdToPeerId, } from '@vkontakte-internal/calls-core';
import { getInitialState } from './initialState';
import { applyDevicesBatch } from '../helpers/throttleAccumulateDispatch';
import { HangupType } from '@vkontakte/calls-sdk';
import { isEqual } from '@vkontakte/vkjs';
import { deepClone, objectForEach } from '../helpers/helpers';
import { videoOptionsStorage } from '../helpers/localStorage';
import { combineReducers } from 'redux';
import { voiceRoomReducer } from '../features/voiceRoom';
import { featureNotificationReducer } from '../features/notifications/featureNotification';
import { replaceMyPeerId, replaceParticipantPeerId } from './changeParticipantIdHandlers';
import { callMembersReducer } from './callMembers';
import { getCorrectedRating } from '../features/networkIndicator';
const getEmptyParticipant = (peerId) => ({
    firstName: '',
    id: peerIdToVkId(peerId),
    name: '',
    peerId,
    shortName: '',
});
const combinedReducers = combineReducers({
    // @ts-expect-error TS2322: Type '(state: IState | undefined, action: IActions) => IState' is not assignable to type 'Reducer<IState, IActions>'.
    voiceRoom: voiceRoomReducer,
    // @ts-expect-error TS2322: Type '(state: ICallMembersState | undefined, action: ICallMembersActions) => ICallMembersState' is not assignable to type ....
    callMembers: callMembersReducer,
    featureNotification: featureNotificationReducer,
});
/**
 * Попытка разделять фичи на раздельные редьюсеры в редаксе
 * @param state
 * @param action
 */
export const callsReducer = (state, action) => {
    const root = rootReducer(state, action);
    const combined = combinedReducers({
        voiceRoom: root.voiceRoom,
        callMembers: root.callMembers,
        featureNotification: root.featureNotification,
    }, action);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
        ...root,
        ...combined,
    };
};
function rootReducer(state, action) {
    switch (action.type) {
        case E_ACTION.LOAD_PEERS: {
            const conversation = action.conversation || state.callData.conversation;
            const mappedMembers = {};
            for (const user of action.members) {
                if (!(user && user.peerId)) {
                    continue;
                }
                mappedMembers[user.peerId] = {
                    ...(state.participants[user.peerId] || getEmptyParticipant(user.peerId)),
                    ...user,
                };
            }
            return {
                ...state,
                participants: {
                    ...state.participants,
                    ...mappedMembers,
                },
                callData: {
                    ...state.callData,
                    conversation,
                },
                peer: 'peerId' in action && action.peerId !== undefined ? action.peerId : state.peer,
                caller: 'caller' in action ? action.caller : state.caller,
            };
        }
        case E_ACTION.CHANGE_MODE: {
            const newType = action.mode !== Mode.READY && action.data?.type ? action.data.type : null;
            if (action.mode === Mode.READY || action.mode === Mode.FEEDBACK) {
                const meParticipant = state.participants[state.me];
                const noiseCancellation = videoOptionsStorage.queryOption(EVideoOptionType.NOISE_CANCELLATION_MODE);
                const initialState = getInitialState({
                    // previous id may be temporary contact id, restore vk id as peer id,
                    currentUser: {
                        ...meParticipant,
                        peerId: vkIdToPeerId(meParticipant.id),
                    },
                    callConversation: state.callData?.conversation,
                    options: {
                        anonymSecret: state.anonymSecret,
                        config: state.config,
                        localVideoResolution: state.localVideoResolution,
                        friends: state.callMembers.friends,
                        friendsCache: state.callMembers.friendsCache,
                        friendsCount: state.callMembers.friendsCount,
                        privacySettings: state.privacySettings,
                        ipSettingEnabled: state.ipSettingEnabled,
                        isDev: state.isDev,
                        noiseCancellation,
                        videoSuspendMode: state.videoSuspendMode,
                    },
                });
                if (action.mode === Mode.FEEDBACK) {
                    initialState.mode = Mode.FEEDBACK;
                    initialState.lastCallData = {
                        callId: state.callData?.callId ?? '',
                        peerId: state.peer ?? EMPTY_PEER_ID,
                        isVoiceRoom: state.isVoiceRoom ?? false,
                    };
                }
                // сохраняем состояния виртуального фона
                initialState.virtualBackgroundSettings = state.virtualBackgroundSettings;
                // сохраняем данные скачанного конфига реакций
                if (state.reactions?.reactions) {
                    initialState.reactions = { reactions: state.reactions.reactions };
                }
                // сохраняем данные по последнему звонку
                if (state.hangupType === HangupType.BUSY) {
                    // сохраняем имя оппонента, если было занято
                    initialState.lastCallData = {
                        ...(initialState.lastCallData || {}),
                        opponentName: state.participants[state.peer]?.name,
                    };
                }
                else if (state.hangupType === HangupType.KILLED ||
                    state.hangupType === HangupType.KILLED_WITHOUT_DELETE) {
                    // если звонок завершен для всех, проверяем, что мы инициатор
                    initialState.lastCallData = {
                        ...(initialState.lastCallData || {}),
                        callId: state.callData?.callId ?? '',
                        isMeEndedCallForAll: state.lastCallData?.isMeEndedCallForAll,
                    };
                }
                else if (state.hangupType === HangupType.HUNGUP) {
                    initialState.lastCallData = {
                        ...(initialState.lastCallData || {}),
                        callId: state.callData?.callId ?? '',
                    };
                }
                // сохраняем данные о наличии чата
                initialState.hasInCallChat = state.hasInCallChat;
                return initialState;
            }
            // чистим мапы перед выходом
            state.maps.peerIdToDevices.clear();
            const actionPeer = action.peerId;
            const defaultStatePeer = state.peer || EMPTY_PEER_ID;
            const nextState = {
                ...state,
                mode: action.mode,
                peer: actionPeer ?? defaultStatePeer,
                callData: {
                    ...state.callData,
                    type: newType,
                    ts: action.ts || state.callData.ts || null,
                    startCallModalOptions: {
                        ...state.callData.startCallModalOptions,
                        ...action.startCallModalOptions,
                    },
                },
                hangupType: state.hangupType,
                entryPoint: action.entryPoint || state.entryPoint,
                join: {
                    ...(state.join || {}),
                },
            };
            if (nextState.reactions?.feedback) {
                delete nextState.reactions.feedback;
            }
            if (action.joinLink && nextState.join) {
                nextState.join.joinLink = action.joinLink;
            }
            if (action.vkJoinLink && nextState.join) {
                nextState.join.vkJoinLink = action.vkJoinLink;
            }
            return nextState;
        }
        case E_ACTION.CHANGE_PARTICIPANT_ID:
            const { peerId, prevPeerId } = action;
            if (prevPeerId === state.me) {
                return replaceMyPeerId(state, peerId);
            }
            else {
                return replaceParticipantPeerId(state, prevPeerId, peerId);
            }
        case E_ACTION.HANGUP: {
            return {
                ...state,
                hangupType: action.data,
            };
        }
        case E_ACTION.TIME_START: {
            return {
                ...state,
                callData: {
                    ...state.callData,
                    ts: action.data,
                },
            };
        }
        case E_ACTION.LOCAL_TIME_START: {
            return {
                ...state,
                callData: {
                    ...state.callData,
                    localTimeStamp: action.data,
                },
            };
        }
        case E_ACTION.REMOVE_USER: {
            const id = externalIdToString(action.participantId);
            const updatedState = state.devices[id] ? getClearDeviceData(state, id) : { ...state };
            // обновляем мапу девайсов
            state.maps.peerIdToDevices.get(action.participantId.id)?.delete(id);
            if (state.mediaSharers[id]) {
                delete updatedState.mediaSharers[id];
            }
            if (state.participantsAddedByMe.has(action.participantId.id)) {
                const participantsAddedByMeUpdated = new Set(state.participantsAddedByMe);
                participantsAddedByMeUpdated.delete(action.participantId.id);
                updatedState.participantsAddedByMe = participantsAddedByMeUpdated;
            }
            if (isSameExternalId(state.voiceRoom.screenShare?.owner, action.participantId)) {
                updatedState.voiceRoom.screenShare = null;
            }
            return updatedState;
        }
        case E_ACTION.GROUP_CALL_SETUP: {
            return {
                ...state,
                modal: action.open
                    ? {
                        type: ModalType.GROUP_CALL_SETUP,
                        details: undefined,
                    }
                    : modalHasType(state.modal, ModalType.GROUP_CALL_SETUP) ||
                        modalHasType(state.modal, ModalType.MANAGEMENT)
                        ? // close if same modal opened
                            undefined
                        : // leave as is
                            state.modal,
                peer: action.peerId || state.peer || EMPTY_PEER_ID,
                preselectedIds: action.preselectedIds,
            };
        }
        case E_ACTION.TOGGLE_MODAL: {
            return {
                ...state,
                modal: action.isChild && state.modal ? { ...state.modal, child: action.modal } : action.modal,
            };
        }
        case E_ACTION.CHANGE_UI_MODE: {
            return {
                ...state,
                uiMode: action.mode || UIMode.DEFAULT,
            };
        }
        case E_ACTION.TOGGLE_ORATOR_MODE: {
            return {
                ...state,
                isOratorMode: action.isOratorMode,
            };
        }
        case E_ACTION.TOGGLE_PARTICIPANTS_ASIDE: {
            return {
                ...state,
                isShownParticipantsAside: action.isShownParticipantsAside,
            };
        }
        case E_ACTION.CALL_STATE: {
            const nextState = {
                ...state,
                callData: {
                    ...state.callData,
                    ...action.callData,
                },
                join: {
                    ...(state.join || {}),
                },
                externalId: action.externalId || state.externalId,
            };
            if (action.joinLink && nextState.join) {
                nextState.join.joinLink = action.joinLink;
            }
            if (action.vkJoinLink && nextState.join) {
                nextState.join.vkJoinLink = action.vkJoinLink;
            }
            return nextState;
        }
        case E_ACTION.CALL_NOTIFICATION: {
            return {
                ...state,
                notification: action.notification,
            };
        }
        case E_ACTION.JOIN: {
            return {
                ...state,
                mode: Mode.JOIN,
                join: action.data,
                entryPoint: action.entryPoint,
            };
        }
        case E_ACTION.CALL_BY_NAME: {
            return {
                ...state,
                mode: Mode.CALL_BY,
                callByName: action.data,
            };
        }
        case E_ACTION.ERROR: {
            return {
                ...state,
                mode: action.handleType === ErrorHandleType.FATAL ? Mode.ERROR : state.mode,
                errorShown: !action.isClosed,
                error: {
                    title: action.title,
                    text: action.text,
                    handleType: action.handleType,
                    callId: action.callId,
                },
            };
        }
        case E_ACTION.CHANGE_PARTICIPANT_ROLES: {
            const peerId = action.participantId;
            const prev = state.participants[peerId] || getEmptyParticipant(peerId);
            return {
                ...state,
                participants: {
                    ...state.participants,
                    [peerId]: {
                        ...prev,
                        roles: action.data,
                    },
                },
            };
        }
        case E_ACTION.SET_MEDIA_SHARER: {
            return {
                ...state,
                mediaSharers: {
                    ...state.mediaSharers,
                    [externalIdToString(action.participantId)]: action.isMediaSharingEnabled,
                },
            };
        }
        case E_ACTION.OFF_MEDIA_SHARERS: {
            const mediaSharers = deepClone(state.mediaSharers);
            objectForEach(mediaSharers, (_, key) => {
                mediaSharers[key] = false;
            });
            return {
                ...state,
                mediaSharers,
            };
        }
        case E_ACTION.UPDATE_PARTICIPANTS_BATCH: {
            return applyDevicesBatch(state, action.data);
        }
        case E_ACTION.REMOVE_DEVICE_FROM_CACHE: {
            const devices = { ...state.devices };
            if (Array.isArray(action.id)) {
                for (const id of action.id) {
                    delete devices[id];
                }
            }
            else {
                const id = action.id;
                delete devices[id];
            }
            return {
                ...state,
                devices: devices,
            };
        }
        case E_ACTION.SET_UNREAD_COUNT: {
            return {
                ...state,
                chatUnreadCount: action.chatUnreadCount,
                chatUpToMsgId: action.chatUpToMsgId ?? state.chatUpToMsgId,
            };
        }
        case E_ACTION.SHOW_CAUTION_BOX: {
            return {
                ...state,
                cautionShown: action.isOpen,
                isIncoming: action.isIncoming || state.isIncoming,
            };
        }
        case E_ACTION.SHOW_LOADER: {
            return {
                ...state,
                isLoaderVisible: action.data,
            };
        }
        case E_ACTION.SET_ENTRYPOINT: {
            return {
                ...state,
                entryPoint: action.entryPoint,
            };
        }
        case E_ACTION.SET_TOOLTIP: {
            const tooltips = action.tooltips
                ? action.tooltips
                : Object.keys(state.tooltips).reduce((tooltips, key) => {
                    tooltips[key] = false;
                    return tooltips;
                }, {});
            return {
                ...state,
                tooltips: {
                    ...state.tooltips,
                    ...tooltips,
                },
            };
        }
        case E_ACTION.MANUAL_ADD_PARTICIPANTS: {
            return {
                ...state,
                participantsAddedByMe: (action.participants || []).reduce((acc, peerId) => {
                    acc.add(peerId);
                    return acc;
                }, new Set(state.participantsAddedByMe)),
            };
        }
        case E_ACTION.SET_TRANSLATION: {
            return {
                ...state,
                translation: {
                    ...state.translation,
                    ...action.data,
                },
            };
        }
        case E_ACTION.UPDATE_ANON_SECRET: {
            return {
                ...state,
                anonymSecret: action.secret,
            };
        }
        case E_ACTION.SET_NOISE_CANCELLATION: {
            return {
                ...state,
                noiseCancellation: action.data,
            };
        }
        case E_ACTION.CHANGE_LOCAL_VIDEO_RESOLUTION: {
            return {
                ...state,
                localVideoResolution: action.data,
            };
        }
        case E_ACTION.SET_CONVERSATION_OPTIONS: {
            return {
                ...state,
                conversationOptions: action.data,
            };
        }
        case E_ACTION.UPDATE_CONVERSATION: {
            return {
                ...state,
                callData: {
                    ...state.callData,
                    conversation: state.callData.conversation
                        ? {
                            ...state.callData.conversation,
                            isService: Boolean(action.data),
                        }
                        : state.callData.conversation,
                },
            };
        }
        case E_ACTION.SET_PRIVACY_SETTINGS: {
            return {
                ...state,
                privacySettings: action.data,
            };
        }
        case E_ACTION.SET_GROUP: {
            return {
                ...state,
                groupId: action.groupId,
                meGroup: action.meGroup,
            };
        }
        case E_ACTION.SET_WAITING_HALL: {
            return {
                ...state,
                waitingHall: action.data,
            };
        }
        case E_ACTION.SET_SHOW_DESKTOP_NOTIFICATION: {
            return {
                ...state,
                shouldShowDesktopAppNotification: action.data,
            };
        }
        case E_ACTION.SET_SHOW_CHAT_HISTORY: {
            return {
                ...state,
                callData: {
                    ...state.callData,
                    showChatHistory: action.data,
                },
            };
        }
        case E_ACTION.SET_SHOW_WARNING_DESKTOP_NOTIFICATION: {
            return {
                ...state,
                shouldShowWarningDesktopAppNotification: action.data,
            };
        }
        case E_ACTION.SET_START_OPTIONS: {
            return {
                ...state,
                startOptions: action.data,
            };
        }
        case E_ACTION.VB_SET_USER_PHOTOS: {
            return updateVirtualBackgroundSettings(state, {
                photos: [...action.photos],
            });
        }
        case E_ACTION.VB_ADD_USER_PHOTO: {
            return updateVirtualBackgroundSettings(state, {
                photos: [action.photo, ...state.virtualBackgroundSettings.photos],
            });
        }
        case E_ACTION.VB_REMOVE_USER_PHOTO: {
            return updateVirtualBackgroundSettings(state, {
                photos: state.virtualBackgroundSettings.photos.filter(({ id }) => id !== action.photoId),
            });
        }
        case E_ACTION.VB_SET_VIDEO_OPTIONS: {
            return updateVirtualBackgroundSettings(state, {
                videoOptions: action.videoOptions,
            });
        }
        case E_ACTION.SET_CALL_PERMISSIONS: {
            if (isEqual(action.data, state.permissions)) {
                return state;
            }
            return {
                ...state,
                permissions: action.data,
            };
        }
        case E_ACTION.SET_PARTICIPANTS_CHUNK: {
            return {
                ...state,
                participantsChunk: {
                    countBefore: state.participantsChunk?.countBefore ?? 0,
                    ids: state.participantsChunk?.ids ?? [],
                    countAfter: state.participantsChunk?.countAfter ?? 0,
                    ...action.data,
                },
            };
        }
        case E_ACTION.SET_PARTICIPANT_HAND_STATE: {
            const key = action.key;
            const value = action.value;
            const handState = state.handState;
            const prevValue = handState?.[key] ?? false;
            if (prevValue === value) {
                return state;
            }
            const newHandState = { ...handState };
            newHandState[key] = value;
            // keep only raised hands
            if (!value) {
                delete newHandState[key];
            }
            return {
                ...state,
                handState: newHandState,
            };
        }
        case E_ACTION.SET_PARTICIPANT_DRAT_STATE: {
            const key = action.key;
            const value = action.value;
            const dratState = state.dratState;
            const prevValue = dratState?.[key] ?? false;
            if (prevValue === value) {
                return state;
            }
            const newDratState = { ...dratState };
            newDratState[key] = value;
            // keep only raised hands
            if (!value) {
                delete newDratState[key];
            }
            return {
                ...state,
                dratState: newDratState,
            };
        }
        case E_ACTION.CLEAN_LAST_CALL_DATA: {
            return updateLastCallData(state, {
                opponentName: undefined,
                isMeEndedCallForAll: undefined,
                isVoiceRoom: false,
            });
        }
        case E_ACTION.SET_LAST_CALL_DATA: {
            return updateLastCallData(state, action.data);
        }
        case E_ACTION.SET_LOCAL_DEVICE: {
            const updatedState = {
                ...state,
                localDevice: {
                    ...state.localDevice,
                    ...action.data,
                },
            };
            // При обновлении состояния сети от SDK рассчитываем отображаемое состояние
            // с учетом предыдущего состояния и границ коридоров перехода
            if ('networkStatus' in action.data) {
                const prevNetworkRating = state.localDevice.networkStatus;
                const correctedNetworkRating = getCorrectedRating(action.data.networkStatus, prevNetworkRating);
                updatedState.localDevice.networkStatus = correctedNetworkRating;
            }
            return updatedState;
        }
        case E_ACTION.SET_REACTIONS: {
            return {
                ...state,
                reactions: {
                    ...state.reactions,
                    ...action.data,
                },
            };
        }
        case E_ACTION.UPDATE_REACTIONS_HISTORY: {
            const historyMap = action.data.reduce((acc, item) => {
                return { ...acc, [item.peerId]: item };
            }, {});
            return {
                ...state,
                reactions: {
                    ...state.reactions,
                    feedbackHistory: {
                        ...state.reactions?.feedbackHistory,
                        ...historyMap,
                    },
                },
            };
        }
        case E_ACTION.SET_GLOBAL_MOVIE_SHARE_PERMISSION: {
            return {
                ...state,
                onlyAdminCanShareMovie: action.data,
            };
        }
        case E_ACTION.SET_GLOBAL_CALL_FEATURES: {
            return {
                ...state,
                callFeatures: {
                    ...state.callFeatures,
                    [action.key]: action.data,
                },
            };
        }
        case E_ACTION.SET_CALLS_QUEUE_RESPONSE: {
            return {
                ...state,
                callsQueueResponse: action.data,
            };
        }
        case E_ACTION.SET_RESTRICTED_CONVERSATION: {
            return { ...state, restrictedConversation: action.data };
        }
        case E_ACTION.SET_IS_VOICE_ROOM: {
            return {
                ...state,
                isVoiceRoom: action.data,
                videoSuspendMode: action.data ? VideoSuspendMode.NEVER : state.videoSuspendMode,
            };
        }
        case E_ACTION.SET_WAS_NETWORK_INDICATOR_SHOWN: {
            return {
                ...state,
                wasNetworkIndicatorShown: action.data,
            };
        }
        case E_ACTION.SET_VIDEO_SUSPEND_MODE: {
            return {
                ...state,
                videoSuspendMode: action.data,
            };
        }
        case E_ACTION.SET_HAS_IN_CALL_CHAT: {
            return {
                ...state,
                hasInCallChat: action.data,
            };
        }
        case E_ACTION.TOGGLE_IN_CALL_CHAT: {
            return {
                ...state,
                inCallChatOpened: !state.inCallChatOpened,
            };
        }
        case E_ACTION.SET_EFFECT_VOICE_CHANGE: {
            return {
                ...state,
                effectVoiceChange: action.data,
            };
        }
        default: {
            return state;
        }
    }
}
function getClearDeviceData(state, id) {
    const device = state.devices[id];
    const clearData = {
        status: undefined,
        statusData: undefined,
        wasConnected: undefined,
        mediaSettings: {},
    };
    if (device.movieStreamInfo) {
        clearData.movieStreamStoppedInfo = device.movieStreamInfo;
        clearData.movieStreamInfo = null;
    }
    return {
        ...state,
        devices: {
            ...state.devices,
            [id]: {
                ...device,
                ...clearData,
            },
        },
    };
}
/** хелпер для обновления состояния настроек фона */
function updateVirtualBackgroundSettings(state, obj) {
    return {
        ...state,
        virtualBackgroundSettings: {
            ...state.virtualBackgroundSettings,
            ...obj,
        },
    };
}
/** хелпер для обновления состояния данных по последнему звонку */
function updateLastCallData(state, obj) {
    return {
        ...state,
        lastCallData: {
            ...(state.lastCallData || {}),
            ...obj,
        },
    };
}
//# sourceMappingURL=reducer.js.map