export function toVideoMessageTrack(progress, videoMessage, rootMessageId, messageSentAt, messageAuthorId) {
    return {
        ...videoMessage,
        id: `${rootMessageId}_${videoMessage.id}`,
        rootMessageId,
        progress,
        messageSentAt,
        messageAuthorId,
    };
}
export function getVideoSource(files) {
    return (files?.mp4_2160 ||
        files?.mp4_1440 ||
        files?.mp4_1080 ||
        files?.mp4_720 ||
        files?.mp4_480 ||
        files?.mp4_360 ||
        files?.mp4_240 ||
        files?.mp4_144 ||
        '');
}
//# sourceMappingURL=utils.js.map