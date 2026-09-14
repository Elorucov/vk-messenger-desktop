/**
 * label для type_messaging_action_item
 */
export const getLogEventLabel = () => {
    const params = new URLSearchParams(window.location.search);
    const { isCommnityMail, isChatMail, isPeerMail } = getLabelFlags(params);
    let label = 'user';
    if (isCommnityMail) {
        if (isChatMail) {
            label = 'community_chat';
        }
        else if (isPeerMail) {
            label = 'community_peer';
        }
        else {
            label = 'community';
        }
    }
    else {
        if (isChatMail) {
            label = 'user_chat';
        }
        else if (isPeerMail) {
            label = 'user_peer';
        }
        else {
            label = 'user';
        }
    }
    return label;
};
const getLabelFlags = (params) => {
    const isCommnityMail = !!params.get('community');
    const peerIdParam = params.get('peer');
    let isChatMail = !!params.get('chat');
    let isPeerMail = !!peerIdParam;
    const peerIdLimit = 2_000_000_000;
    const isReallyChatId = peerIdParam && +peerIdParam > peerIdLimit;
    if (isReallyChatId) {
        isChatMail = true;
        isPeerMail = false;
    }
    return {
        isCommnityMail,
        isChatMail,
        isPeerMail,
    };
};
//# sourceMappingURL=typeMessagingActionItem.js.map