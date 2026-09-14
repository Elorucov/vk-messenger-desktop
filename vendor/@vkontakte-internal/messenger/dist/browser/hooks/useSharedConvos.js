import { useReducer, useCallback, useMemo, useEffect } from 'react';
import * as Filters from '../../core/model/Filters';
import { exhaustivenessCheck, noop } from '../../core/utils/misc';
import { fromApiConvo } from '../../data/converter/ConvoConverter';
import { useFeatureFlags, useInsertIntoCache } from '../hooks/misc';
import { useApiFetch } from '../hooks/useApiFetch';
export const USE_SHARED_CONVOS_INITIAL_STATE = {
    peerIds: [],
    isLoading: false,
    hasFailed: false,
};
export function useSharedConvos(peerId, fetchOnMount = true) {
    const apiFetch = useApiFetch();
    const featureFlags = useFeatureFlags();
    const insertIntoCache = useInsertIntoCache();
    const [state, dispatch] = useReducer(reducer, USE_SHARED_CONVOS_INITIAL_STATE);
    const refetch = useCallback(async () => {
        dispatch({ type: 'setIsLoading', payload: true });
        try {
            const { profiles, groups, items, contacts } = await apiFetch('messages.getSharedConversations', {
                peer_id: peerId,
                extended: 1,
            });
            insertIntoCache({
                profiles,
                groups,
                conversations: items,
                contacts,
            });
            const convos = [];
            for (const convo of items) {
                const model = fromApiConvo(featureFlags, convo);
                if (!model?.convo.peerId) {
                    continue;
                }
                void convos.push(model.convo);
            }
            const sortedConvos = convos.sort(Filters.sorter);
            const peerIds = sortedConvos.map((convo) => convo.peerId);
            dispatch({ type: 'setPeerIds', payload: peerIds });
        }
        catch {
            dispatch({ type: 'setHasFailed', payload: true });
        }
    }, [peerId, apiFetch, featureFlags, insertIntoCache]);
    useEffect(() => {
        if (!fetchOnMount) {
            return;
        }
        void refetch().catch(noop);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return useMemo(() => ({ ...state, refetch }), [state, refetch]);
}
function reducer(state, action) {
    switch (action.type) {
        case 'setPeerIds':
            return {
                ...state,
                isLoading: false,
                hasFailed: false,
                peerIds: action.payload,
            };
        case 'setHasFailed': {
            if (action.payload) {
                return {
                    ...state,
                    peerIds: [],
                    isLoading: false,
                    hasFailed: action.payload,
                };
            }
            return { ...state, hasFailed: action.payload };
        }
        case 'setIsLoading': {
            if (action.payload) {
                return { ...state, isLoading: action.payload, hasFailed: false };
            }
            return { ...state, isLoading: action.payload };
        }
        default:
            return exhaustivenessCheck(action);
    }
}
//# sourceMappingURL=useSharedConvos.js.map