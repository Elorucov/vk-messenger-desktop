/**
 * Создание Segment
 * @param elements - отсортированный массив из Elements, не может быть пустым
 * @returns возвращает Segment
 */
function createSegment(elements) {
    const [firstElement, ...other] = elements;
    if (!firstElement) {
        throw Error('Сегмент не может быть пустым');
    }
    return {
        elements: [firstElement, ...other],
    };
}
export function getSegmentIndexByElementId(chain, id) {
    const segmentIndex = chain.segments.findIndex(({ elements }) => elements.find((element) => element.id === id));
    if (segmentIndex < 0) {
        return undefined;
    }
    return segmentIndex;
}
export function getElementById(chain, id) {
    for (const { elements } of chain.segments) {
        const element = elements.find((element) => element.id === id);
        if (element) {
            return element;
        }
    }
    return undefined;
}
export function addElements(chain, newElements, compareFn = defaultCompareFn) {
    const result = [];
    let segmentToUpdate = createSegment(newElements);
    let breakpoint = 0;
    while (breakpoint < chain.segments.length) {
        const segment = chain.segments[breakpoint];
        if (!segment) {
            throw Error('Вышли за границы отрезка.');
        }
        const segmentToUpdateLimits = {
            left: segmentToUpdate.elements[0],
            right: segmentToUpdate.elements[segmentToUpdate.elements.length - 1] ||
                segmentToUpdate.elements[0],
        };
        const segmentLimits = {
            left: segment.elements[0],
            right: segment.elements[segment.elements.length - 1] || segment.elements[0],
        };
        if (compareFn(segmentToUpdateLimits.right, segment.elements[0]) < 0) {
            break;
        }
        const isIntersect = checkIntersection(segmentLimits, segmentToUpdateLimits, compareFn);
        if (isIntersect) {
            const newSegment = increaseSegment(segment, segmentToUpdate.elements, compareFn);
            segmentToUpdate = newSegment;
        }
        else {
            result.push(segment);
        }
        breakpoint++;
    }
    return {
        segments: [
            ...result,
            segmentToUpdate,
            ...chain.segments.slice(breakpoint, chain.segments.length),
        ],
    };
}
/**
 *
 * @param segment Segment в который хотим добавить новый элементы
 * @param elements
 * @param compareFn функция сравнения двух элементов, работает по аналогии с Array.sort
 * @returns Возвращает новый Segment
 */
export function increaseSegment(segment, elements, compareFn) {
    const updatedElements = mergeElements(segment.elements, elements, compareFn);
    const [firstElement, ...other] = updatedElements;
    if (!firstElement) {
        throw Error('Сегмент не может быть пустым');
    }
    return {
        elements: [firstElement, ...other],
    };
}
export function removeElement(chain, id) {
    const segmentIndex = getSegmentIndexByElementId(chain, id);
    if (segmentIndex === undefined) {
        return;
    }
    const segment = chain.segments[segmentIndex];
    if (!segment) {
        return;
    }
    const newElements = segment.elements.filter((element) => element.id !== id);
    if (newElements.length === 0) {
        chain.segments = [
            ...chain.segments.slice(0, segmentIndex),
            ...chain.segments.slice(segmentIndex + 1, chain.segments.length),
        ];
    }
    else {
        chain.segments[segmentIndex] = createSegment(newElements);
    }
}
function mergeElements(elements, update, compareFn = defaultCompareFn) {
    const firstUpdateElement = update[0];
    const lastUpdateElement = update[update.length - 1];
    if (!firstUpdateElement || !lastUpdateElement) {
        return elements;
    }
    const elementsLength = elements.length;
    let leftBreakpoint = 0;
    let rightBreakpoint = 0;
    while (leftBreakpoint < elements.length) {
        const element = elements[leftBreakpoint];
        if (!element) {
            throw Error('Вышли за границы отрезка.');
        }
        if (compareFn(firstUpdateElement, element) <= 0) {
            break;
        }
        leftBreakpoint++;
    }
    while (rightBreakpoint < elements.length) {
        const element = elements[rightBreakpoint];
        if (!element) {
            throw Error('Вышли за границы отрезка.');
        }
        if (compareFn(lastUpdateElement, element) < 0) {
            break;
        }
        rightBreakpoint++;
    }
    return [
        ...elements.slice(0, leftBreakpoint),
        ...update,
        ...elements.slice(rightBreakpoint, elementsLength),
    ];
}
/**
 * Проверка пересекаются ли отрезки
 * @param segmentBorders
 * @param newSegmentBorders
 */
export function checkIntersection(segmentBorders, newSegmentBorders, compareFn = defaultCompareFn) {
    const isRightIntersection = compareFn(segmentBorders.right, newSegmentBorders.left) >= 0 &&
        compareFn(segmentBorders.left, newSegmentBorders.left) <= 0;
    const isLeftIntersection = compareFn(segmentBorders.left, newSegmentBorders.right) <= 0 &&
        compareFn(segmentBorders.right, newSegmentBorders.left) >= 0;
    return isRightIntersection || isLeftIntersection;
}
function defaultCompareFn(a, b) {
    return a.id - b.id;
}
//# sourceMappingURL=Chain.js.map