import { VolumeDetector } from '@vkontakte/calls-sdk';
import { makeSharedState } from '@vkontakte-internal/utils';
const getMediaStreamMap = makeSharedState('callsVolumeDetectorMediaStreamMap', () => new Map(), { version: 1 });
export function createVolumeDetector(mediaStream, callback, timeout = 150) {
    if (!mediaStream || !callback)
        return;
    const mediaStreamMap = getMediaStreamMap();
    if (mediaStreamMap.has(mediaStream)) {
        const volumeDetectorData = mediaStreamMap.get(mediaStream);
        volumeDetectorData.callbacks.add(callback);
        return volumeDetectorData.getDestroy(callback);
    }
    const track = mediaStream?.getAudioTracks().find((audio) => !audio.contentHint);
    if (track) {
        const instance = new VolumeDetector('local', track.clone());
        const intervalId = setInterval(() => {
            const value = instance?.getLevel().real || 0;
            mediaStreamMap.get(mediaStream)?.callbacks.forEach((item) => item(value));
        }, timeout);
        const getDestroy = (currentCallback) => () => {
            const volumeDetectorData = mediaStreamMap.get(mediaStream);
            if (volumeDetectorData?.callbacks.has(currentCallback)) {
                if (volumeDetectorData.callbacks.size < 2) {
                    clearInterval(intervalId);
                    instance.track.stop();
                    instance.destroy();
                    mediaStreamMap.delete(mediaStream);
                }
                else {
                    volumeDetectorData.callbacks.delete(currentCallback);
                }
            }
        };
        mediaStreamMap.set(mediaStream, {
            callbacks: new Set([callback]),
            getDestroy,
            instance,
        });
        return getDestroy(callback);
    }
}
//# sourceMappingURL=volumeDetector.js.map