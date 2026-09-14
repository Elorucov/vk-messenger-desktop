import { objectForEach, externalIdToString, ROOM_MAIN_ID, mapParticipantPermissions, } from '@vkontakte-internal/calls-core';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { convertParticipantStateFromSdk } from './participant';
import { getCorrectedRating } from '../features/networkIndicator';
export const DEFAULT_THROTTLE_TIMEOUT = 100;
/** @used_only_in_reducer */
export function applyDevicesBatch(state, batch) {
    if (!Object.keys(batch).length) {
        // prevent excessive state update
        return state;
    }
    const nextState = {
        ...state,
        devices: {
            ...state.devices,
        },
    };
    const { peerIdToDevices } = state.maps;
    objectForEach(batch, (next) => {
        const deviceId = externalIdToString(next.externalId);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const prev = state.devices[deviceId] || {};
        // обновляем стейт
        if (prev?.status === undefined && next.status === ParticipantStatus.HANGUP) {
            delete nextState.devices[deviceId];
        }
        else {
            // обновляем мапу девайсов пользователя
            let deviceSet = peerIdToDevices.get(next.externalId.id);
            if (!deviceSet) {
                deviceSet = new Set();
                peerIdToDevices.set(next.externalId.id, deviceSet);
            }
            deviceSet.add(deviceId);
            const statusData = next.statusData ? { ...prev.statusData, ...next.statusData } : prev.statusData;
            const wasConnected = prev.wasConnected || next.status === ParticipantStatus.CONNECTED;
            const mediaSettings = Object.assign({}, prev.mediaSettings, next.mediaSettings);
            // В случае, когда roomId не прокинут - берем актуальное значение из девайса,
            // либо если оно отсутствует, то помещаем в основной зал
            let roomId = (next.roomId !== undefined ? next.roomId : prev.roomId) ?? ROOM_MAIN_ID;
            // При обновлении состояния сети от SDK рассчитываем отображаемое состояние
            // с учетом предыдущего состояния и границ коридоров перехода
            const networkStatus = next.networkStatus !== undefined
                ? getCorrectedRating(next.networkStatus, prev.networkStatus)
                : prev.networkStatus;
            nextState.devices[deviceId] = {
                ...state.devices[deviceId],
                ...batch[deviceId],
                statusData,
                wasConnected,
                mediaSettings,
                roomId,
                networkStatus,
            };
        }
    });
    return nextState;
}
export function mapExternalParticipantToDevice(externalParticipant) {
    return {
        externalId: externalParticipant.uid,
        mediaSettings: externalParticipant.mediaSettings,
        markers: externalParticipant.markers,
        status: externalParticipant.status || ParticipantStatus.CONNECTING,
        statusData: externalParticipant.participantState
            ? convertParticipantStateFromSdk(externalParticipant.participantState)
            : undefined,
        wasConnected: false,
        permissions: mapParticipantPermissions(externalParticipant.muteStates),
    };
}
//# sourceMappingURL=throttleAccumulateDispatch.js.map