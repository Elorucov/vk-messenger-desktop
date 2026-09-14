/**
 * Пример работы count & offset:
 * Нужно загрузить 20 элементов, 10 в прошлое и 10 в будущее, тогда COUNT = 20; OFFSET = -10
 * Нужно загрузить 10 элементов в прошлое, тогда COUNT = 10; OFFSET = 0
 * Нужно загрузить 10 элементов в будущее, тогда COUNT = 10; OFFSET = -10
 */
const FETCH_COUNT_BOTH = 20;
const FETCH_COUNT_PREV_NEXT = FETCH_COUNT_BOTH / 2;
const FETCH_OFFSET_BOTH = -FETCH_COUNT_BOTH / 2;
const FETCH_OFFSET_PREV = 0;
const FETCH_OFFSET_NEXT = FETCH_OFFSET_BOTH;
export const FETCH_COUNT_MAP = {
    prev: FETCH_COUNT_PREV_NEXT,
    next: FETCH_COUNT_PREV_NEXT,
    both: FETCH_COUNT_BOTH,
};
export const FETCH_OFFSET_MAP = {
    prev: FETCH_OFFSET_PREV,
    next: FETCH_OFFSET_NEXT,
    both: FETCH_OFFSET_BOTH,
};
//# sourceMappingURL=utils.js.map