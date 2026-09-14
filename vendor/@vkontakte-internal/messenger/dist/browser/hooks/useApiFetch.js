import { useRef, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { IApi } from '../../data/env/IApi';
import { useBrowserEnv } from '../hooks/misc';
/**
 * Рекомендуется использовать только там, где это не вредит, а избавляет от
 * мемори ликов при анмаунте — то есть в методах чтения данных.
 *
 * @returns Alias на обычный `api.fetch`, но со встроенным `dangerouslyAbort`.
 */
export function useApiFetch() {
    const trackIds = useApiFetchInstrumentation();
    return useApiFetchCallback('fetch', trackIds);
}
/**
 * Рекомендуется использовать только там, где это не вредит, а избавляет от
 * мемори ликов при анмаунте — то есть в методах чтения данных.
 *
 * @returns Alias на `api.fetchMany`, но со встроенным `dangerouslyAbort`.
 */
export function useApiFetchMany() {
    const trackIds = useApiFetchInstrumentation();
    return useApiFetchMultiCallback('fetchMany', trackIds);
}
/**
 * Рекомендуется использовать только там, где это не вредит, а избавляет от
 * мемори ликов при анмаунте — то есть в методах чтения данных.
 *
 * @returns Alias на `api.fetchSeq`, но со встроенным `dangerouslyAbort`.
 */
export function useApiFetchSeq() {
    const trackIds = useApiFetchInstrumentation();
    return useApiFetchMultiCallback('fetchSeq', trackIds);
}
/**
 * @returns Alias на `api.fetchForExternalLibs`, но со встроенным
 * `dangerouslyAbort`. Рекомендуется использовать только там, где это не
 * вредит, а избавляет от мемори ликов при анмаунте — то есть в методах
 * чтения данных.
 */
export function useApiFetchForExternalLibs() {
    const trackIds = useApiFetchInstrumentation();
    return useApiFetchCallback('fetchForExternalLibs', trackIds);
}
function useApiFetchInstrumentation() {
    const { api } = useBrowserEnv();
    const trackIds = useRef(new Set());
    useEffect(() => () => {
        for (const trackId of trackIds.current.values()) {
            api.dangerouslyAbort(trackId);
            void trackIds.current.delete(trackId);
        }
    }, [api]);
    return trackIds;
}
function useApiFetchCallback(kind, trackIds) {
    const { api } = useBrowserEnv();
    return useCallback((method, params, opts) => {
        const resolvedMethod = resolveApiFetchMethod(method);
        const trackId = opts?.trackId ??
            IApi.resolveTrackId(resolvedMethod, generateRequestId());
        void trackIds.current.add(trackId);
        return api[kind](resolvedMethod, params, {
            ...opts,
            trackId,
        }).finally(() => {
            // Удаляем `trackId` для уже отработавших запросов, чтобы не
            // переполнять наш Set.
            void trackIds.current.delete(trackId);
        });
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, kind]);
}
function resolveApiFetchMethod(method) {
    if (!isApiFetchMethod(method)) {
        throw new Error('Unknown API method');
    }
    return method;
}
function isApiFetchMethod(method) {
    return Boolean(method);
}
const API_FETCH_MULTI_METHOD = 'execute';
function useApiFetchMultiCallback(kind, trackIds) {
    const { api } = useBrowserEnv();
    return useCallback((reqs, opts) => {
        const trackId = opts?.trackId ??
            IApi.resolveTrackId(API_FETCH_MULTI_METHOD, generateRequestId());
        trackIds.current.add(trackId);
        return api[kind](reqs, {
            ...opts,
            trackId,
        }).finally(() => {
            // Удаляем `trackId` для уже отработавших запросов, чтобы не
            // переполнять наш Set.
            void trackIds.current.delete(trackId);
        });
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, kind]);
}
function generateRequestId() {
    return nanoid(5);
}
//# sourceMappingURL=useApiFetch.js.map