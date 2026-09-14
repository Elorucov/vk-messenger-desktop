import React from 'react';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
/**
 * Это тот же UsersStack, только для участников звонка.
 *
 * Дело в том, что в activeCall, аттаче звонка и других
 * связных со звонком сущностях в участниках звонка только
 * три фотографии, а UsersStack высчитывает баблик с +N по
 * длине массива. Здесь недостающие дополняются.
 */
export const CallParticipantsStack = ({ visibleCount = 3, photos, participantsCount, removePlusOne = true, ...props }) => {
    /**
     * В activeCall будет не более 3 участников по количеству фотографий,
     * имитируем оставшихся, т.к. UsersStack считает по длине массива photos.
     */
    const othersCount = Math.max(0, participantsCount - visibleCount);
    const canRemovePlusOne = participantsCount <= 3 && othersCount === 1;
    return (React.createElement(UsersStack, { count: participantsCount, visibleCount: removePlusOne && canRemovePlusOne ? visibleCount + 1 : visibleCount, photos: photos, ...props }));
};
//# sourceMappingURL=CallParticipantsStack.js.map