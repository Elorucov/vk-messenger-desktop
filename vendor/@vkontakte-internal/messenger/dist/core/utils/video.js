const spreadAttachVideos = (attaches) => {
    return [
        ...(attaches.videos || []),
        ...(attaches.wall?.attaches.videos || []),
        ...(attaches.wallReply?.attaches.videos || []),
    ];
};
export const findMessageVideoLayer = (message, videoId) => findVideoLayer(message, (item) => [
    ...(item.forwardedMessages ?? []),
    ...(item.replyMessage && item.replyMessage.kind !== 'ForeignExpired'
        ? [item.replyMessage]
        : []),
], videoId);
export const findPostVideoLayer = (post, videoId) => findVideoLayer(post, (item) => {
    if ('comments' in item && item.kind !== 'Postponed') {
        return [
            ...item.comments.history.filter((comment) => comment.kind === 'Normal'),
        ];
    }
    return [];
}, videoId);
export const findVideoLayer = (root, getItemTree, videoId) => {
    const queue = [root];
    while (queue.length !== 0) {
        const currentItem = queue.shift();
        if (!currentItem) {
            // Невозможный сценарий
            return undefined;
        }
        queue.push(...getItemTree(currentItem));
        const spreadedVideos = spreadAttachVideos(currentItem.attaches);
        const targetVideo = spreadedVideos.find((video) => video.id === videoId);
        if (targetVideo) {
            return targetVideo;
        }
    }
    return undefined;
};
//# sourceMappingURL=video.js.map