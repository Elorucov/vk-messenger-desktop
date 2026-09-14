export const isScreenShareShown = (mediaSettings, isSecondaryStream) => {
    const isEnabled = !!mediaSettings?.isScreenSharingEnabled;
    if (isSecondaryStream) {
        const isCameraOrAnimojiEnabled = mediaSettings?.isVideoEnabled || mediaSettings?.isAnimojiEnabled;
        return isEnabled && !isCameraOrAnimojiEnabled;
    }
    return isEnabled;
};
//# sourceMappingURL=helpers.js.map