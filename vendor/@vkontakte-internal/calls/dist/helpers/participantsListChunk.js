import { E_ACTION } from '../constants';
import { externalIdToString, } from '@vkontakte-internal/calls-core';
import { loadCallParticipantsAccumulate } from '../actions/actions';
export const PARTICIPANTS_LIST_TYPE = 'GRID';
export function isUseParticipantListChunk({ config }) {
    return Boolean(config?.enableParticipantListChunk);
}
export function getParticipantListChunk(SDK, { count, fromIdx = 0, fromMarker, roomId, ...restParameters }, { signal = null } = {}) {
    let isAborted = false;
    const onAbort = () => (isAborted = true);
    signal?.addEventListener('abort', onAbort, { once: true });
    return SDK.getParticipantListChunk({
        count,
        fromIdx: !fromMarker ? fromIdx : undefined,
        fromMarker,
        listType: PARTICIPANTS_LIST_TYPE,
        roomId,
        ...restParameters,
    })
        .then((response) => {
        return isAborted ? Promise.reject(new Error('aborted')) : response;
    })
        .finally(() => {
        signal?.removeEventListener('abort', onAbort);
    });
}
export function addParticipantsInCacheAndLoadInfo(state, dispatch, devices) {
    const loadInfoPromise = loadParticipantsVKInfromation(state, dispatch, devices.map(({ externalId }) => externalId));
    dispatchUpdateDevicesBatch(dispatch, devices);
    return loadInfoPromise;
}
function dispatchUpdateDevicesBatch(dispatch, devices) {
    const data = devices.reduce((data, device) => {
        const deviceId = externalIdToString(device.externalId);
        data[deviceId] = device;
        return data;
    }, {});
    dispatch({
        type: E_ACTION.UPDATE_PARTICIPANTS_BATCH,
        data,
    });
}
async function loadParticipantsVKInfromation(state, dispatch, externalIds) {
    const peerIdsToLoad = externalIds.reduce((ids, externalId) => {
        const peerId = externalId.id;
        if (!state.participants[peerId]) {
            ids.push(peerId);
        }
        return ids;
    }, []);
    if (!peerIdsToLoad.length) {
        return;
    }
    const callId = state.callData.callId || '';
    return loadCallParticipantsAccumulate(state, dispatch, callId, peerIdsToLoad);
}
//# sourceMappingURL=participantsListChunk.js.map