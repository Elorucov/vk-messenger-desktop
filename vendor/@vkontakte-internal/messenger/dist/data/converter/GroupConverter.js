import * as Peer from '../../core/model/Peer';
export const banInfoFromApi = (banInfo) => {
    const { comment, comment_visible, reason, date, end_date, admin_id } = banInfo;
    return {
        comment: comment || '',
        isCommentVisible: comment_visible || false,
        reason: reason || 0,
        endDate: end_date && end_date * 1000,
        adminId: Peer.resolveId(admin_id),
        date: date && date * 1000,
    };
};
export const parseReason = (reason) => {
    const num = Number(reason);
    if (num >= 0 && num <= 4 && Number.isInteger(num)) {
        return num;
    }
    throw new Error(`Invalid reason: ${reason}`);
};
//# sourceMappingURL=GroupConverter.js.map