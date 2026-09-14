import { getOffsetRect } from '../utils/misc';
import { exhaustivenessCheck } from '../../core/utils/misc';
const AXIS_KEYS = {
    vertical: {
        scrollSize: 'scrollHeight',
        scrollPosition: 'scrollTop',
        containerSize: 'clientHeight',
    },
    horizontal: {
        scrollSize: 'scrollWidth',
        scrollPosition: 'scrollLeft',
        containerSize: 'clientWidth',
    },
};
export function scrollToElement(container, content, element, align, margin = 0) {
    const { offsetHeight: containerHeight } = container;
    const { top: elementTop, height: elementHeight } = getOffsetRect(element, content);
    let newScrollTop;
    switch (align) {
        case 'upper': {
            newScrollTop = elementTop - margin;
            break;
        }
        case 'bottom': {
            newScrollTop = elementTop + elementHeight - containerHeight + margin;
            break;
        }
        case 'center': {
            newScrollTop = elementTop + (elementHeight - containerHeight) / 2;
            break;
        }
        default:
            exhaustivenessCheck(align);
    }
    container.scrollTop = newScrollTop;
    return newScrollTop;
}
export function animateScroll(container, scrollFrom, scrollTo, axis, duration = 600, timingFn = easeOut, onScrollEnd) {
    const axisKeys = AXIS_KEYS[axis];
    const { [axisKeys.containerSize]: containerSize, [axisKeys.scrollSize]: scrollSize, } = container;
    let scrollAmount = scrollTo - scrollFrom;
    if (scrollAmount < 0) {
        scrollAmount = Math.max(scrollAmount, -scrollFrom);
    }
    else if (scrollAmount > 0) {
        scrollAmount = Math.min(scrollAmount, scrollSize - containerSize - scrollFrom);
    }
    if (scrollAmount === 0) {
        return onScrollEnd?.();
    }
    if (duration === 0) {
        container[axisKeys.scrollPosition] = scrollTo;
        return onScrollEnd?.();
    }
    let startTime;
    const step = (currentTime) => {
        if (startTime === undefined) {
            startTime = currentTime;
        }
        const progress = timingFn(Math.min(1, (currentTime - startTime) / duration));
        container[axisKeys.scrollPosition] = Math.ceil(scrollFrom + scrollAmount * progress);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
        else {
            onScrollEnd?.();
        }
    };
    requestAnimationFrame(step);
}
export function easeOut(x) {
    return 1 - (1 - x) ** 4;
}
export function easeInOutSine(x) {
    return 0.5 * (1 - Math.cos(Math.PI * x));
}
//# sourceMappingURL=scroll.js.map