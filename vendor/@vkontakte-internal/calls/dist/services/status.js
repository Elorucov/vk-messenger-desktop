import { jsx as _jsx } from "react/jsx-runtime";
import { HANGUP_TYPE_BUSY, HANGUP_TYPE_CALLEE_IS_OFFLINE, HANGUP_TYPE_CALLER_IS_BLOCKED, HANGUP_TYPE_CANCELED, HANGUP_TYPE_EXTERNAL_API_ERROR, HANGUP_TYPE_FAILED, HANGUP_TYPE_HUNGUP, HANGUP_TYPE_MISSED, HANGUP_TYPE_NOT_FOUND, HANGUP_TYPE_NOT_FRIENDS, HANGUP_TYPE_OLD_VERSION, HANGUP_TYPE_REJECTED, HANGUP_TYPE_REMOVED, HANGUP_TYPE_SERVICE_DISABLED, HANGUP_TYPE_UNKNOWN_ERROR, HANGUP_TYPE_UNSUPPORTED, } from '../constants';
import { isGroupCallByPeerAndMe, } from '@vkontakte-internal/calls-core';
import { ParticipantStatus } from '@vkontakte/calls-sdk';
import { ParticipantStatusContainer } from '../containers/ParticipantStatusContainer';
import { ActivityIndicator } from '../components/ActivityIndicator/ActivityIndicator';
import { getActiveParticipantsCount, getPeerIdDeviceInfo } from '../helpers/participant';
import { isMiniAppSource } from '../helpers/apps';
/**
 * Получает статус окончания звонка или null
 */
export function getHangupStatus(hangupType, getLang) {
    if (hangupType) {
        switch (hangupType) {
            // Собеседник занят
            case HANGUP_TYPE_BUSY:
                return getLang('calls_busy');
            // Собеседник не в сети
            case HANGUP_TYPE_CALLEE_IS_OFFLINE:
                return getLang('calls_callee_is_offline');
            // Собеседник отклонил вызов
            case HANGUP_TYPE_REJECTED:
                return getLang('calls_rejected_status');
            // Собственные действия или повесили трубку
            // Реакция в интерфейсе не нужна
            case HANGUP_TYPE_CANCELED:
            case HANGUP_TYPE_MISSED:
            case HANGUP_TYPE_HUNGUP:
            case HANGUP_TYPE_REMOVED:
                return null;
            // Error statuses
            case HANGUP_TYPE_CALLER_IS_BLOCKED:
            case HANGUP_TYPE_EXTERNAL_API_ERROR:
            case HANGUP_TYPE_FAILED:
            case HANGUP_TYPE_NOT_FRIENDS:
            case HANGUP_TYPE_OLD_VERSION:
            case HANGUP_TYPE_SERVICE_DISABLED:
            case HANGUP_TYPE_NOT_FOUND:
            case HANGUP_TYPE_UNKNOWN_ERROR:
            case HANGUP_TYPE_UNSUPPORTED:
                return getLang('calls_error');
        }
    }
    return null;
}
/**
 * Получает статус участника или null
 */
export const getParticipantStatus = (state, peerId) => {
    let device;
    if (peerId === state.me) {
        device = state.localDevice;
    }
    else {
        device = getPeerIdDeviceInfo(peerId, state.devices);
    }
    const isMiniApp = isMiniAppSource(state.entryPoint?.source);
    return device?.status === ParticipantStatus.CONNECTED ||
        device?.status === ParticipantStatus.WAITING_HALL ||
        getActiveParticipantsCount(state) < 2 ? null : ( // В этот момент уверены, что участник полноценный и есть все поля
    _jsx(ParticipantStatusContainer, { status: device?.status ?? ParticipantStatus.WAITING, isMiniApp: isMiniApp }));
};
export const getWaitingStatus = (state, getLang) => {
    const isWaiting = (isGroupCallByPeerAndMe(state.peer, state.me) ? state.callData.ts : state.callData.localTimeStamp) ===
        undefined;
    return isWaiting ? _jsx(ActivityIndicator, { children: getLang('calls_status_waiting') }) : null;
};
export const getCallStatus = (state, getLang) => state
    ? getHangupStatus(state.hangupType, getLang) ||
        getParticipantStatus(state, isGroupCallByPeerAndMe(state.peer, state.me) ? state.me : state.peer) ||
        getWaitingStatus(state, getLang)
    : '';
//# sourceMappingURL=status.js.map