export const getIsLocalVideoEnabled = (state) => {
    return !!state.localDevice.mediaSettings?.isVideoEnabled;
};
export const getIsScreenSharingEnabled = (state) => {
    return !!state.localDevice.mediaSettings?.isScreenSharingEnabled;
};
//# sourceMappingURL=video.js.map