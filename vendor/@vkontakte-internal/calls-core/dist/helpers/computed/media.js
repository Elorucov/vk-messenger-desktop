import { objectSome } from '../base';
import { isAnimojiStreamAvailable, isParticipantScreenSharingEnabled } from '../simple';
export function isSeparatedScreenStreamAvailable(device) {
    if (isParticipantScreenSharingEnabled(device)) {
        return !!device.screenSharingStream;
    }
    return false;
}
export function isParticipantWithVideo(device) {
    return (!!device.mediaSettings?.isVideoEnabled ||
        isAnimojiStreamAvailable(device) ||
        isSeparatedScreenStreamAvailable(device));
}
export function isParticipantWithMovie(device) {
    return !!device.movieStream && !!device.movieStreamInfo;
}
export function isAnyoneWithVideo(state) {
    if (isParticipantWithVideo(state.localDevice)) {
        return true;
    }
    return objectSome(state.devices, (device) => {
        return !!(device.wasConnected && isParticipantWithVideo(device));
    });
}
//# sourceMappingURL=media.js.map