import { VideoSuspendMode, VideoSuspendReason } from '@vkontakte-internal/calls-core';
import { MediaType } from '@vkontakte/calls-sdk';
export const getVideoSuspendReason = ({ deviceStreams, hasMovieStream, mediaSettings, mediaType, videoSuspendMode, }) => {
    if (videoSuspendMode === VideoSuspendMode.NEVER) {
        return;
    }
    if (videoSuspendMode === VideoSuspendMode.ALWAYS) {
        // detect by mediaSettings like in participantLayout
        const { isAnimojiEnabled, isVideoEnabled } = mediaSettings;
        // in server topology MediaType.CAMERA is used for animoji
        const hasAnotherStream = mediaType && mediaType !== MediaType.CAMERA;
        return (isAnimojiEnabled || isVideoEnabled) && !hasAnotherStream
            ? VideoSuspendReason.SETTINGS
            : undefined;
    }
    if (!deviceStreams) {
        return;
    }
    const streamIsSuspended = (mt) => {
        return deviceStreams.get(mt)?.isSuspended;
    };
    if (mediaType && deviceStreams.has(mediaType)) {
        // stream that could be shown exists and media type provided
        return streamIsSuspended(mediaType) ? VideoSuspendReason.NETWORK : undefined;
    }
    // all streams are stopped, use other device data
    const { isAnimojiEnabled, isVideoEnabled, isFastScreenSharingEnabled } = mediaSettings;
    const isSuspended = ((isVideoEnabled || isAnimojiEnabled) && streamIsSuspended(MediaType.CAMERA)) ||
        (isFastScreenSharingEnabled && streamIsSuspended(MediaType.SCREEN)) ||
        (hasMovieStream && (streamIsSuspended(MediaType.MOVIE) || streamIsSuspended(MediaType.STREAM)));
    return isSuspended ? VideoSuspendReason.NETWORK : undefined;
};
//# sourceMappingURL=utils.js.map