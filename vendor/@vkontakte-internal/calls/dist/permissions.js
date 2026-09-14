import { MediaOption } from '@vkontakte/calls-sdk';
function requestPermissions(SDK, needVideo, needAudio) {
    return SDK.browser.getUserMedia(needVideo, needAudio).then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
    });
}
/**
 * @param SDK
 * @param mediaOptions нужно ли проверять разрешения на audio
 */
export function checkPermissions(SDK, mediaOptions) {
    const hasMicrophonePermission = SDK.browser.hasMicrophonePermission();
    const hasCameraPermission = SDK.browser.hasCameraPermission();
    const needRequestAudio = mediaOptions.includes(MediaOption.AUDIO) && !hasMicrophonePermission;
    const needRequestVideo = mediaOptions.includes(MediaOption.VIDEO) && !hasCameraPermission;
    if (needRequestAudio || needRequestVideo) {
        return requestPermissions(SDK, needRequestVideo, needRequestAudio);
    }
    return Promise.resolve();
}
//# sourceMappingURL=permissions.js.map