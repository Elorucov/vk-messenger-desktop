import { SausageViewModes, VoiceRoomMode, } from '@vkontakte-internal/calls-core';
import { E_ACTION } from './actionTypes';
import { getMembersMap, getNewVoiceRoomListenersPages, getNewVoiceRoomListenersUpdateKey, getPromotionRequestMap, getUpdatedPromotionRequests, getUpdatedPromotionRequestsProfiles, removeVoiceRoomListeners, } from './helpers';
import { INITIAL_END_VISIBLE_SPEAKER_INDEX_GRID, INITIAL_START_VISIBLE_SPEAKER_INDEX } from '../constants';
export const initialState = {
    sausageView: SausageViewModes.PARTICIPANTS,
    mode: VoiceRoomMode.TRIBUNE,
    listeners: {
        totalCount: 0,
        pages: {},
        page: 0,
        pagesIsLoading: false,
        updateKey: '',
    },
    promotionRequests: {
        totalCount: 0,
        profiles: {},
        requests: {},
        isHandUp: false,
    },
    visibleSpeakersIndexes: {
        start: INITIAL_START_VISIBLE_SPEAKER_INDEX,
        end: INITIAL_END_VISIBLE_SPEAKER_INDEX_GRID,
    },
    notification: null,
    modal: null,
    screenShare: null,
    roomName: '',
};
export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case E_ACTION.SET_VOICE_ROOM_LISTENERS_PAGES: {
            return {
                ...state,
                listeners: {
                    ...state.listeners,
                    pages: getNewVoiceRoomListenersPages(action.data),
                },
            };
        }
        case E_ACTION.REMOVE_VOICE_ROOM_LISTENERS: {
            const { pagesMap, removedCount } = removeVoiceRoomListeners(state.listeners.pages, action.data);
            return {
                ...state,
                listeners: {
                    ...state.listeners,
                    pages: pagesMap,
                    totalCount: state.listeners.totalCount - removedCount,
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_LISTENERS_PAGE: {
            return {
                ...state,
                listeners: {
                    ...state.listeners,
                    page: action.data,
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_LISTENERS_COUNT: {
            return {
                ...state,
                listeners: {
                    ...state.listeners,
                    totalCount: action.data,
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_LISTENERS_UPDATE_KEY: {
            return {
                ...state,
                listeners: {
                    ...state.listeners,
                    updateKey: getNewVoiceRoomListenersUpdateKey(action.data),
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_PROMOTION_REQUESTS_TOTAL_COUNT: {
            return {
                ...state,
                promotionRequests: {
                    ...state.promotionRequests,
                    totalCount: action.data,
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_PROMOTION_REQUESTS: {
            return {
                ...state,
                promotionRequests: {
                    ...state.promotionRequests,
                    requests: getPromotionRequestMap(action.data),
                },
            };
        }
        case E_ACTION.CLEAR_VOICE_ROOM_PROMOTION_REQUESTS_STATE: {
            return {
                ...state,
                promotionRequests: initialState.promotionRequests,
            };
        }
        case E_ACTION.UPDATE_VOICE_ROOM_PROMOTION_REQUESTS: {
            const { requests, profiles } = getUpdatedPromotionRequests(state.promotionRequests, action.data);
            return {
                ...state,
                promotionRequests: {
                    ...state.promotionRequests,
                    requests,
                    profiles,
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_PROMOTION_REQUESTS_PROFILES: {
            return {
                ...state,
                promotionRequests: {
                    ...state.promotionRequests,
                    profiles: getMembersMap(action.data),
                },
            };
        }
        case E_ACTION.UPDATE_VOICE_ROOM_PROMOTION_REQUESTS_PROFILES: {
            return {
                ...state,
                promotionRequests: {
                    ...state.promotionRequests,
                    profiles: getUpdatedPromotionRequestsProfiles(state.promotionRequests.profiles, action.data),
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_PROMOTION_REQUESTS_HAND_UP: {
            return {
                ...state,
                promotionRequests: {
                    ...state.promotionRequests,
                    isHandUp: action.data,
                },
            };
        }
        case E_ACTION.SET_VOICE_ROOM_VISIBLE_SPEAKERS_INDEXES: {
            return {
                ...state,
                visibleSpeakersIndexes: action.data,
            };
        }
        case E_ACTION.SET_VOICE_ROOM_MODE: {
            return {
                ...state,
                mode: action.data,
            };
        }
        case E_ACTION.SET_VOICE_ROOM_SAUSAGE_VIEW: {
            return {
                ...state,
                sausageView: action.data,
            };
        }
        case E_ACTION.SET_VOICE_ROOM_NOTIFICATION: {
            return {
                ...state,
                notification: action.data,
            };
        }
        case E_ACTION.SET_VOICE_ROOM_MODAL: {
            return {
                ...state,
                modal: action.data,
            };
        }
        case E_ACTION.SET_VOICE_ROOM_SCREEN_SHARE: {
            return {
                ...state,
                screenShare: action.data,
            };
        }
        case E_ACTION.SET_VOICE_ROOM_INITIAL_DATA: {
            return {
                ...state,
                ...action.data,
            };
        }
        default: {
            return state;
        }
    }
};
//# sourceMappingURL=reducer.js.map