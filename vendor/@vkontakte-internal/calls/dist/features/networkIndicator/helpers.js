import { getColorClass } from '@vkontakte-internal/vkcom-kit';
import { NetworkStateColorClassMap, DEFAULT_BAD_THRESHOLD, DEFAULT_GOOD_THRESHOLD, DEFAULT_OVERPASS_THRESHOLD, } from './constants';
import { NetworkState } from '@vkontakte-internal/calls-core';
export function getNetworkStateByRating(networkRating, badThreshold = DEFAULT_BAD_THRESHOLD, goodThreshold = DEFAULT_GOOD_THRESHOLD) {
    if (networkRating >= goodThreshold) {
        return NetworkState.GOOD;
    }
    if (networkRating >= badThreshold) {
        return NetworkState.MEDIUM;
    }
    return NetworkState.BAD;
}
export function getNetworkStateColorClass(networkState) {
    if (networkState === NetworkState.GOOD || networkState === NetworkState.MEDIUM) {
        return undefined;
    }
    return getColorClass(NetworkStateColorClassMap[networkState]);
}
export function getNetworkRatingColorClass(networkRating, badThreshold = DEFAULT_BAD_THRESHOLD, goodThreshold = DEFAULT_GOOD_THRESHOLD) {
    const networkState = getNetworkStateByRating(networkRating, badThreshold, goodThreshold);
    return getNetworkStateColorClass(networkState);
}
/**
 * Расчет обновленного состояния сети с учетом прыдудущего
 * и границ коридоров перехода.
 *
 * Если nextNetworkRating лежит за границами текущего состояния по модулю
 * больше чем или равно overpassThreshold, то возвращаем nextNetworkRating без изменений.
 *
 * Иначе, если nextNetworkRating лежит за границами текущего состояния
 * по модулю меньше overpassThreshold, или nextNetworkRating равен верхней границе текущего состояния,
 * возвращаем скорректированное на overpassThreshold значение в сторону текущего состония.
 *
 * Иначе, возвращаем nextNetworkRating (он лежит в границах текущего состояния).
 *
 * @param {number} nextNetworkRating новый рейтинг сети, полученный от SDK
 * @param {number} prevNetworkRating предыдущий сохраненный рейтинг сети
 * @param {number} badThreshold верхняя граница плохого состояния сети (не включительно)
 * @param {number} goodThreshold нижняя граница хорошего состояния сети (включительно)
 * @param {number} overpassThreshold коридор перехода в другое состояние (насколько нужно выйти за границу,
 * чтобы перейти в другое состояние)
 * @returns {number} скорректированное значение рейтинга сети
 */
export function getCorrectedRating(nextNetworkRating, prevNetworkRating = 1, badThreshold = DEFAULT_BAD_THRESHOLD, goodThreshold = DEFAULT_GOOD_THRESHOLD, overpassThreshold = DEFAULT_OVERPASS_THRESHOLD) {
    if (overpassThreshold <= 0) {
        return nextNetworkRating;
    }
    const prevNetworkState = getNetworkStateByRating(prevNetworkRating);
    let minThreshold = 0;
    let maxThreshold = 1;
    switch (prevNetworkState) {
        case NetworkState.BAD: {
            minThreshold = 0;
            maxThreshold = badThreshold;
            break;
        }
        case NetworkState.MEDIUM: {
            minThreshold = badThreshold;
            maxThreshold = goodThreshold;
            break;
        }
        case NetworkState.GOOD: {
            minThreshold = goodThreshold;
            maxThreshold = 1;
            break;
        }
    }
    if (nextNetworkRating <= Number((minThreshold - overpassThreshold).toFixed(1)) ||
        nextNetworkRating >= Number((maxThreshold + overpassThreshold).toFixed(1))) {
        return nextNetworkRating;
    }
    if (nextNetworkRating < minThreshold) {
        return Number((nextNetworkRating + overpassThreshold).toFixed(1));
    }
    if (nextNetworkRating >= maxThreshold) {
        return Number((nextNetworkRating - overpassThreshold).toFixed(1));
    }
    return nextNetworkRating;
}
//# sourceMappingURL=helpers.js.map