import * as Message from './Message';
import { lastNode } from './History';
export function updateMarkOnClose(remindList, history, peerId, convoInReadByCmid, vkm_wall_reply_required) {
    const peerRemindSetting = getSettingsByPeerId(remindList, peerId);
    const cmid = getLastRemindableMessageCmid(history, false, vkm_wall_reply_required);
    if (peerRemindSetting && peerRemindSetting.cmid < convoInReadByCmid) {
        remindList.delete(peerId);
    }
    if (peerRemindSetting && peerRemindSetting.cmid === cmid) {
        return;
    }
    if (cmid) {
        remindList.set(peerId, { cmid, showReminder: true });
    }
}
export function updateMarkOnOpen(remindList, history, peerId, vkm_wall_reply_required) {
    const cmid = getLastRemindableMessageCmid(history, false, vkm_wall_reply_required);
    if (!cmid) {
        return;
    }
    const peerRemindSetting = getSettingsByPeerId(remindList, peerId);
    if (!peerRemindSetting) {
        return;
    }
    const markIsShowing = checkMessageHasMark(remindList, peerId, cmid);
    if (markIsShowing) {
        remindList.set(peerId, { cmid, showReminder: false });
    }
}
export function updateMarkOnUserAction(remindList, history, peerId, currentUserReacted, vkm_wall_reply_required) {
    const cmid = getLastRemindableMessageCmid(history, currentUserReacted, vkm_wall_reply_required);
    if (!cmid) {
        return;
    }
    remindList.set(peerId, { cmid, showReminder: false });
}
export function checkMessageHasMark(remindList, peerId, cmid) {
    const peerRemindSetting = getSettingsByPeerId(remindList, peerId);
    return (peerRemindSetting !== undefined &&
        peerRemindSetting.cmid === cmid &&
        peerRemindSetting.showReminder);
}
export function initStateFromStorage(stateList, storedList) {
    storedList.forEach((peerRemindSetting, peerId) => {
        stateList.set(peerId, peerRemindSetting);
    });
}
function getSettingsByPeerId(remindList, peerId) {
    return remindList.get(peerId);
}
/**
 * Возвращает cmid последнего сообщения в истории, для которого
 * нужно показать пометку "ответить" в списке чатов
 * Подробнее:
 * - https://jira.mvk.com/browse/ME-72861
 * - https://jira.mvk.com/browse/ME-78100
 */
function getLastRemindableMessageCmid(history, currentUserReacted, vkm_wall_reply_required) {
    const lastMessage = lastNode({
        history,
        withPending: false,
        withDeleted: false,
        withFailed: false,
    })?.item;
    if (lastMessage === undefined ||
        lastMessage.kind !== 'Normal' ||
        lastMessage.isOut) {
        return null;
    }
    // по умолчанию смотрим, что нет реакции текущего юзера (currentUserReacted = false)
    const reactionCondition = currentUserReacted
        ? lastMessage.reactionId
        : !lastMessage.reactionId;
    if (((Message.isClipOnly(lastMessage) && !Message.hasText(lastMessage)) ||
        (Message.isPostOnly(lastMessage) && vkm_wall_reply_required)) &&
        reactionCondition) {
        return lastMessage.cmid;
    }
    return null;
}
//# sourceMappingURL=RemindAnswerToMessage.js.map