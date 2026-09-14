import { mediaSession } from '../../../services/mediaFocusChannel';
import { isFirefox, isSafari } from '../constants';
export function setupMediaSessionHandlers({ onAudio, onVideo, onHangup, onRequestPictureInPicture, }) {
    if (isFirefox || isSafari) {
        // firefox в целом не умеет mediaSession.setActionHandler
        return;
    }
    setActionMediaHandler('togglemicrophone', onAudio);
    setActionMediaHandler('togglecamera', onVideo);
    setActionMediaHandler('hangup', onHangup);
    setActionMediaHandler('enterpictureinpicture', onRequestPictureInPicture);
}
export function dropMediaSessionHandlers() {
    setActionMediaHandler('togglemicrophone', null);
    setActionMediaHandler('togglecamera', null);
    setActionMediaHandler('hangup', null);
    setActionMediaHandler('enterpictureinpicture', null);
}
export function toggleMediaSessionIcons(audioEnabled, videoEnabled) {
    // @ts-expect-error TS2339: Property 'setMicrophoneActive' does not exist on type 'MediaSession'. experimental technology
    mediaSession.setMicrophoneActive?.(audioEnabled);
    // @ts-expect-error TS2339: Property 'setCameraActive' does not exist on type 'MediaSession'. experimental technology
    mediaSession.setCameraActive?.(videoEnabled);
}
function setActionMediaHandler(action, handler) {
    // @ts-expect-error TS2769: No overload matches this call. Значений больше чем в MediaSessionAction
    mediaSession.setActionHandler(action, handler);
}
//# sourceMappingURL=mediaSession.js.map