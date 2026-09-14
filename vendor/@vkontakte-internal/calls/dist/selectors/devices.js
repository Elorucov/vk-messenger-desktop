import { isSameExternalId, externalIdToString, } from '@vkontakte-internal/calls-core';
export const getDevices = (state) => state.devices;
export function getRemoteDeviceByExternalId(data, externalId) {
    return data.devices[externalIdToString(externalId)];
}
export const createDeviceByExternalIdSelector = (externalId) => (state) => {
    const { externalId: myExternalId } = state;
    if (myExternalId && isSameExternalId(myExternalId, externalId)) {
        return state.localDevice;
    }
    else {
        return getRemoteDeviceByExternalId(state, externalId);
    }
};
//# sourceMappingURL=devices.js.map