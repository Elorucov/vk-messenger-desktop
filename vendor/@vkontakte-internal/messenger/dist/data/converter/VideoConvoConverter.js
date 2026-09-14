import * as VideoConvo from '../../core/model/VideoConvo';
export function fromAttachVideoConvo(attach, hasMore, isCommentsForceHidden = false) {
    return {
        kind: 'VideoConvo',
        id: VideoConvo.resolveId(attach.id),
        ownerId: attach.ownerId,
        canComment: Boolean(attach.canComment),
        comments: [],
        hasMore,
        type: attach.type,
        accessKey: attach.accessKey,
        isCommentsForceHidden,
    };
}
//# sourceMappingURL=VideoConvoConverter.js.map