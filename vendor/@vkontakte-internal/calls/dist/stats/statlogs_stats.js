/**
 * Сбор продуктовой статистики в Statlogs
 *
 * https://vk.com/statlogs?act=show&key1=web2&name=calls_stats3
 *
 * Описание фиксируемых сценариев:
 * https://paper.dropbox.com/doc/YQs2PLseZlXfaTYhN3yPs#:uid=538723224148423381550054&h2=%D0%A1%D1%82%D0%B0%D1%82%D0%B8%D1%81%D1%82%D0%B8%D0%BA%D0%B0
 */
import { HANGUP_TYPE_BUSY, HANGUP_TYPE_CANCELED, HANGUP_TYPE_MISSED, HANGUP_TYPE_REJECTED, HANGUP_TYPE_HUNGUP, CallType, } from '../constants';
import { CallStatFailReason, CallStatReachedType, CallStatResult, } from '@vkontakte-internal/calls-core';
import { callStatDataStorage } from './callStatDataStorage';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
let statlogEventsHandler;
function saveCallStatEvent(callId, stat) {
    const statValues = [
        stat.type || '',
        stat.result,
        stat.failReason || '',
        stat.callSource || '',
        stat.totalDuration,
    ];
    if (statlogEventsHandler) {
        statlogEventsHandler({
            name: 'call_stats',
            value: callId,
            keys: statValues,
        });
    }
}
export function setStatlogEventsHandler(handler) {
    statlogEventsHandler = handler;
}
export function addCallStatEvent(hangupType, conversationId, isReconnecting, isDebugMode) {
    const { startType, entryPoint, timeStart, isGroupCall, hadVideoEnabled, isOutgoingCall } = callStatDataStorage.get();
    const isSuccessfulCall = !hangupType || // force call finish case
        (hangupType === HANGUP_TYPE_HUNGUP && !isReconnecting);
    const type = startType && getCallReachedType(startType, isGroupCall, hadVideoEnabled);
    const callStat = {
        type,
        result: isSuccessfulCall ? CallStatResult.SUCCESS : CallStatResult.FAIL,
        failReason: isSuccessfulCall ? null : getCallFailReason(hangupType, isReconnecting),
        callSource: entryPoint,
        totalDuration: timeStart ? Date.now() - timeStart : 0,
    };
    if (isOutgoingCall) {
        isDebugMode && console.log(callStat);
        saveCallStatEvent(conversationId, callStat);
    }
}
function getCallReachedType(startType, isGroupCall, hadVideoEnabled) {
    let reachedType;
    if (startType === CallType.VIDEO) {
        reachedType = isGroupCall ? CallStatReachedType.GROUP_VIDEO : CallStatReachedType.VIDEO;
    }
    else if (hadVideoEnabled) {
        reachedType = isGroupCall ? CallStatReachedType.GROUP_AUDIO_TO_VIDEO : CallStatReachedType.AUDIO_TO_VIDEO;
    }
    else {
        reachedType = isGroupCall ? CallStatReachedType.GROUP_AUDIO : CallStatReachedType.AUDIO;
    }
    return reachedType;
}
export function getCallFailReason(hangupType, isReconnecting) {
    const isOutgoing = callStatDataStorage.get().isOutgoingCall;
    const reachedConnectionStep = callStatDataStorage.get().connectionStep;
    switch (true) {
        case isReconnecting:
            return CallStatFailReason.CONNECTION_LOST;
        case hangupType === HANGUP_TYPE_CANCELED:
            return CallStatFailReason.LOCAL_DECLINE;
        case hangupType === HANGUP_TYPE_REJECTED:
            return CallStatFailReason.REMOTE_DECLINE;
        case hangupType === HANGUP_TYPE_BUSY:
            return CallStatFailReason.REMOTE_BUSY;
        case hangupType === HANGUP_TYPE_MISSED:
            return isOutgoing ? CallStatFailReason.REMOTE_TIMEOUT : null;
        case reachedConnectionStep === ParticipantStatus.CONNECTING:
            return CallStatFailReason.REMOTE_FAILED_ACCEPT;
        case !reachedConnectionStep:
            return CallStatFailReason.REMOTE_NO_CONNECT;
        default:
            return null;
    }
}
//# sourceMappingURL=statlogs_stats.js.map