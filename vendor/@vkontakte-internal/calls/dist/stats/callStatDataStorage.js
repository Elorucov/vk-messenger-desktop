import { ParticipantStatus } from '@vkontakte/calls-sdk';
let currentCallStatData = {
    timeStart: null,
    entryPoint: null,
    startType: null,
    isGroupCall: false,
    hadVideoEnabled: false,
    isOutgoingCall: false,
    connectionStep: null,
};
/*
 * Проверяем был ли достигнут следующий этап коннекта
 * и фиксируем, если был.
 * Таким образом определяем удалось ли пользователю успешно
 * соединиться с собеседником.
 * Во время звонка могут быть "откаты" на предыдущие этапы,
 * например при реконнекте. Также существуют статусы вне цепочки коннекта
 */
function getConnectionStep(newStep, curStep) {
    if (!newStep || !getCallStatusPrecedence(newStep)) {
        return curStep;
    }
    return getCallStatusPrecedence(newStep) > getCallStatusPrecedence(curStep) ? newStep : curStep;
}
function getCallStatusPrecedence(status) {
    switch (status) {
        case ParticipantStatus.WAITING:
            return 1;
        case ParticipantStatus.CONNECTING:
            return 2;
        case ParticipantStatus.CONNECTED:
            return 3;
        default:
            return 0;
    }
}
export const callStatDataStorage = {
    get() {
        return currentCallStatData;
    },
    set(data) {
        currentCallStatData = {
            ...currentCallStatData,
            ...data,
            connectionStep: getConnectionStep(data.connectionStep, currentCallStatData.connectionStep),
        };
    },
    reset() {
        currentCallStatData = {
            timeStart: null,
            entryPoint: null,
            startType: null,
            isGroupCall: false,
            hadVideoEnabled: false,
            isOutgoingCall: false,
            connectionStep: null,
        };
    },
};
//# sourceMappingURL=callStatDataStorage.js.map