export function resolveId(id) {
    if (Number.isNaN(id) || id === undefined) {
        id = 0;
    }
    return id;
}
/**
 * Добавляет список диалогов в конец
 */
export function insertComments(videoConvo, newComments, hasMore) {
    videoConvo.hasMore = hasMore;
    videoConvo.comments = newComments.concat(videoConvo.comments);
}
/**
 * Добавляет комментарий в начало
 */
export function addComment(videoConvo, newComment) {
    const hasComment = videoConvo.comments.findLastIndex((comment) => comment.cmid === newComment.cmid) !== -1;
    if (!hasComment) {
        videoConvo.comments = videoConvo.comments.concat([newComment]);
    }
}
/**
 * Помечает комментарий как удаленный
 */
export function deleteComment(videoConvo, commentId) {
    const comment = videoConvo.comments.find((comment) => comment.cmid === commentId);
    if (comment) {
        comment.kind = 'Deleted';
    }
}
/**
 * Восстанавливает комментарий
 */
export function restoreComment(videoConvo, commentId) {
    const comment = videoConvo.comments.find((comment) => comment.cmid === commentId);
    if (comment) {
        comment.kind = 'Normal';
    }
}
/**
 * Можно ли показывать чат
 */
export function canShowPlayer(videoConvos, video) {
    const videoConvo = videoConvos.get(resolveId(video.id));
    // конво не создан, разрешаем
    if (videoConvo === undefined) {
        return true;
    }
    return videoConvo.isCommentsForceHidden === false;
}
//# sourceMappingURL=VideoConvo.js.map