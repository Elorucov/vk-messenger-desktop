import { Mode } from '@vkontakte-internal/calls-core';
/**
 * Проверка события входящего звонка из лонгпола на то,
 * может ли веб его принять
 */
const isValidIncomingCall = (e) => {
    // call_id есть у звонков ОК-ов и нет у ICQ-шных
    return Boolean(e.value.call_id);
};
/**
 * Проверяет событие из лонгпола на то, что это звонок,
 * на который можно отреагировать
 */
export function isAcceptableIncomingCall(callMode, e) {
    return isValidIncomingCall(e) && callMode !== Mode.INCOMING && callMode !== Mode.CALL;
}
//# sourceMappingURL=utils.js.map