import { useEffect, useCallback, useRef } from 'react';
import { isParticipantAnonym } from '../../../helpers/participant';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { voiceRoomsGetParticipants } from '../../../services/backend';
import { getAnonymSecret, getCallId, getMyId } from '../../../selectors';
import { normalizeGroup, normalizeUser } from '../../../helpers/user';
import { peerIdToVkId } from '@vkontakte-internal/calls-core';
import { getIsVoiceRoomTribuneMode, getVoiceRoomListenersPage, getVoiceRoomListenersPagesIsLoading, getVoiceRoomListenersUpdateKey, LISTENERS_PAGE_SIZE, setVoiceRoomListenersCount, setVoiceRoomListenersPages, setVoiceRoomListenersPagesIsLoading, } from '../../../features/voiceRoom';
import { handlePromiseError } from '../../../helpers/logger';
import { batch } from 'react-redux';
import { updateAnonSecret } from '../../../actions';
export function useFetchListeners() {
    const pageRef = useRef(null);
    const updateKeyRef = useRef(null);
    const dispatch = useTypedDispatch();
    const page = useTypedSelector(getVoiceRoomListenersPage);
    const isLoading = useTypedSelector(getVoiceRoomListenersPagesIsLoading);
    const meId = useTypedSelector(getMyId);
    const callId = useTypedSelector(getCallId);
    const anonymSecret = useTypedSelector(getAnonymSecret);
    const updateKey = useTypedSelector(getVoiceRoomListenersUpdateKey);
    const isTribune = useTypedSelector(getIsVoiceRoomTribuneMode);
    const getChunk = useCallback(async ({ page, size = LISTENERS_PAGE_SIZE, signal }) => {
        if (page < 0 || !callId) {
            return { listeners: [], count: 0 };
        }
        const offset = page * size;
        const { profiles = [], anonyms = [], groups = [], count, secret, } = await voiceRoomsGetParticipants({
            call_id: callId,
            filter: 'listeners',
            offset,
            count: LISTENERS_PAGE_SIZE,
        }, isParticipantAnonym(meId), peerIdToVkId(meId), anonymSecret, { signal });
        return {
            listeners: [
                ...profiles.map(normalizeUser),
                ...anonyms.map(normalizeUser),
                ...groups.map(normalizeGroup),
            ],
            count,
            secret,
        };
    }, [callId, meId, anonymSecret]);
    const update = useCallback(async (signal) => {
        try {
            dispatch(setVoiceRoomListenersPagesIsLoading(true));
            const prevPage = page - 1;
            const nextPage = page + 1;
            const [prev, current, next] = await Promise.all([
                getChunk({ page: prevPage, signal }),
                getChunk({ page: page, signal }),
                getChunk({ page: nextPage, signal }),
            ]);
            const secret = prev.secret || current.secret || next.secret;
            const nextCount = Math.max(prev.count, current.count, next.count);
            batch(() => {
                if (secret) {
                    dispatch(updateAnonSecret(secret));
                }
                dispatch(setVoiceRoomListenersCount(nextCount || 0));
                dispatch(setVoiceRoomListenersPages({
                    [prevPage]: prev.listeners,
                    [page]: current.listeners,
                    [nextPage]: next.listeners,
                }));
                dispatch(setVoiceRoomListenersPagesIsLoading(false));
            });
        }
        catch (e) {
            dispatch(setVoiceRoomListenersPagesIsLoading(false));
            handlePromiseError(e);
        }
    }, [page, getChunk]);
    useEffect(() => {
        if (!isTribune) {
            // В голосовых комнатах нет слушателей, только в режиме трибуны
            return;
        }
        const ac = new AbortController();
        if (page !== pageRef.current || updateKey !== updateKeyRef.current) {
            pageRef.current = page;
            updateKeyRef.current = updateKey;
            update(ac.signal).catch(handlePromiseError);
        }
        return () => {
            ac.abort();
        };
    }, [update, updateKey]);
    return { isLoading };
}
//# sourceMappingURL=useFetchListeners.js.map