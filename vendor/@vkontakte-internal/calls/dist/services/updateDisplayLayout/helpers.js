import { externalIdToString, minmax, VideoSuspendMode, } from '@vkontakte-internal/calls-core';
import { MediaType, } from '@vkontakte/calls-sdk';
export function areDimensionsValid(dimensions, isFullscreen) {
    const w = isFullscreen ? dimensions.ww : dimensions.gw;
    const h = isFullscreen ? dimensions.wh : dimensions.gh;
    return w > 0 && h > 0;
}
export function getGridItemSize(vw, vh, count) {
    /** расчет, в соответствии с классами в `CallGridNew.css` */
    let divider;
    switch (true) {
        case count === 1:
            divider = 1;
            break;
        case count === 2:
            divider = 2;
            break;
        case minmax(count, 3, 4): {
            /** высота контента участников */
            const h = Math.round(vh / 2 - 4);
            const w = Math.round(h * 1.77);
            // [!] return
            return [w, h];
        }
        case minmax(count, 5, 6):
            divider = 3;
            break;
        case minmax(count, 7, 12):
            divider = 4;
            break;
        default:
            divider = 5;
            break;
    }
    const w = Math.round(vw / divider - 2 * 2);
    const h = Math.round(w / 1.77);
    return [w, h];
}
export function isLayoutTrue(a) {
    const aAsStopStream = a;
    return aAsStopStream && !aAsStopStream.stopStream;
}
export function isEqualLayouts(a, b) {
    const aAsStopStream = a;
    const bAsStream = b;
    if (aAsStopStream.stopStream && bAsStream.stopStream) {
        return true;
    }
    else if (aAsStopStream.stopStream || bAsStream.stopStream) {
        return false;
    }
    const aAsLayout = a;
    const bAsLayout = b;
    return (aAsLayout.fit === bAsLayout.fit &&
        aAsLayout.width === bAsLayout.width &&
        aAsLayout.height === bAsLayout.height &&
        aAsLayout.priority === bAsLayout.priority &&
        a.streamName === b.streamName);
}
export function getLayoutId(peerDeviceId, mediaType = null, streamName) {
    const mediaTypeKey = mediaType ? `:${mediaType}` : '';
    const streamNameKey = streamName ? `:${streamName}` : '';
    return `${peerDeviceId}${mediaTypeKey}${streamNameKey}`;
}
export function getFirstEnabledMediaType(mediaFlags) {
    return [...mediaFlags.entries()].find((entry) => entry[1])?.[0];
}
export function getStopLayout(externalId, mediaType = null, streamName) {
    const result = {
        stopStream: true,
        uid: externalId,
        mediaType,
    };
    if (streamName) {
        result.streamName = streamName;
    }
    return result;
}
export function setSingleActiveDeviceLayout(currentLayouts, externalId, isVisible, mediaFlags, videoSuspendMode, getActiveLayoutFn) {
    const peerId = externalIdToString(externalId);
    const enabledMediaType = isVisible ? getFirstEnabledMediaType(mediaFlags) : undefined;
    const shouldSendLayout = enabledMediaType && !shouldSuspendMediaType(videoSuspendMode, enabledMediaType);
    if (shouldSendLayout) {
        currentLayouts.set(getLayoutId(peerId, enabledMediaType), getActiveLayoutFn(enabledMediaType));
    }
    mediaFlags.forEach((v, mediaType) => {
        if (mediaType !== enabledMediaType || shouldSuspendMediaType(videoSuspendMode, mediaType)) {
            currentLayouts.set(getLayoutId(peerId, mediaType), getStopLayout(externalId, mediaType));
        }
    });
    return !!shouldSendLayout;
}
const mediaTypesToSuspend = new Set([MediaType.CAMERA, MediaType.ANIMOJI]);
export function shouldSuspendMediaType(videoSuspendMode, mediaType) {
    return videoSuspendMode === VideoSuspendMode.ALWAYS && mediaTypesToSuspend.has(mediaType);
}
export function getMediaFlags(mediaSettings, topology, hasMovieStream) {
    const mediaFlags = new Map();
    const isServerTopology = topology === "SERVER" /* TransportTopology.SERVER */;
    const isAnimojiEnabled = !!mediaSettings?.isAnimojiEnabled;
    // 1st
    mediaFlags.set(MediaType.SCREEN, !!mediaSettings?.isScreenSharingEnabled && !hasMovieStream);
    // 2nd
    mediaFlags.set(MediaType.CAMERA, (!!mediaSettings?.isVideoEnabled || (isAnimojiEnabled && isServerTopology)) && !hasMovieStream);
    // 3rd
    mediaFlags.set(MediaType.ANIMOJI, isAnimojiEnabled && !isServerTopology && !hasMovieStream);
    return mediaFlags;
}
export function getLayout({ externalId, mediaType, streamName, width, height, priority, fit, }) {
    const result = {
        fit,
        width,
        height,
        priority,
        uid: externalId,
        mediaType,
    };
    if (streamName) {
        result.streamName = streamName;
    }
    return result;
}
//# sourceMappingURL=helpers.js.map