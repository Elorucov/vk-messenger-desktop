import { currentBrowser } from '../helpers/currentBrowser';
export const getIsSferum = (state) => state.config.sferum;
export const getBrowserWarnings = (state) => state.config.browserWarnings;
export const getIsVideoSuspendSupported = (state) => {
    return !state.isVoiceRoom;
};
export const getIsVideoSuspendAutoModeAvailable = (state) => {
    const { callData } = state;
    // Firefox does not support tcc for audio
    return !currentBrowser.isFirefox && callData.topology === "SERVER" /* TransportTopology.SERVER */;
};
export const getConfigDeviceId = (state) => state.config?.deviceId;
export const getIsEnabledRoomTimer = (state) => state.config?.enableRoomTimer;
//# sourceMappingURL=config.js.map