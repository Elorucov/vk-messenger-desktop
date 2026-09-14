export function isAnimojiStreamAvailable(device) {
    if (device.mediaSettings?.isAnimojiEnabled) {
        return !!device.animojiStream || !!device.stream;
    }
    return false;
}
export function isParticipantScreenSharingEnabled(device) {
    return !!device?.mediaSettings?.isScreenSharingEnabled;
}
//# sourceMappingURL=media.js.map