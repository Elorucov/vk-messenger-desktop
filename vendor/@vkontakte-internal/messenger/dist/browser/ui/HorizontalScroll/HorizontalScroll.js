import '../../ui/HorizontalScroll/HorizontalScroll.css';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, } from 'react';
import { Icon16Chevron, Icon24Chevron } from '@vkontakte/icons';
import cx from 'classnames';
import { animateScroll, easeInOutSine } from '../../utils/scroll';
import { observe } from 'react-intersection-observer';
import { throttle } from '../../../core/utils/misc';
const SCROLL_ANIMATION_DURATION = 250;
export const HorizontalScroll = forwardRef(({ className, children, showArrows, arrowsTopOffset, showBorders, showLeftBorder, showRightBorder, bordersColor = 'primary', arrowSize, isVerticalScrollable = false, arrowScrollStep, wheelScrollStep = arrowScrollStep, }, $horizontalScroll) => {
    const $wrapper = useRef(null);
    const $leftArrowTrigger = useRef(null);
    const $rightArrowTrigger = useRef(null);
    const $scrollQueue = useRef([]);
    const [canScrollLeft, setCanScrollLeft] = useState(true);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollTo = useCallback((scrollStep) => {
        const wrapperEl = $wrapper.current;
        if (!wrapperEl) {
            return;
        }
        $scrollQueue.current.push(() => doScroll(wrapperEl, scrollStep, $scrollQueue.current));
        if ($scrollQueue.current.length === 1 && $scrollQueue.current[0]) {
            $scrollQueue.current[0]();
        }
    }, []);
    /** Обработка вертикального скролла */
    useEffect(() => {
        const wrapperEl = $wrapper.current;
        if (!isVerticalScrollable || !wrapperEl) {
            return;
        }
        const handleScroll = throttle((e) => {
            const isVerticalScroll = e.deltaX === 0 && e.deltaY;
            if (isVerticalScroll) {
                scrollTo(Math.sign(e.deltaY) * wheelScrollStep);
            }
        }, SCROLL_ANIMATION_DURATION);
        wrapperEl.addEventListener('wheel', handleScroll, { passive: true });
        return () => {
            wrapperEl.removeEventListener('wheel', handleScroll);
            handleScroll.cancel();
        };
    }, [isVerticalScrollable, scrollTo, wheelScrollStep]);
    useEffect(() => {
        if (!$wrapper.current ||
            !$leftArrowTrigger.current ||
            !$rightArrowTrigger.current) {
            return;
        }
        const leftArrowCleanup = observe($leftArrowTrigger.current, (inView) => setCanScrollLeft(!inView), {
            root: $wrapper.current,
            threshold: 0.01,
        });
        const rightArrowCleanup = observe($rightArrowTrigger.current, (inView) => setCanScrollRight(!inView), {
            root: $wrapper.current,
            rootMargin: '0px',
            threshold: 0.01,
        });
        return () => {
            leftArrowCleanup();
            rightArrowCleanup();
        };
    }, []);
    useImperativeHandle($horizontalScroll, () => ({
        scrollTo,
    }), [scrollTo]);
    return (React.createElement("div", { className: cx('HorizontalScroll', `HorizontalScroll--${bordersColor}`) },
        showArrows && canScrollLeft && (React.createElement(HorizontalScrollArrow, { topOffset: arrowsTopOffset, size: arrowSize, direction: "left", onClick: () => scrollTo(-1 * arrowScrollStep) })),
        showArrows && canScrollRight && (React.createElement(HorizontalScrollArrow, { topOffset: arrowsTopOffset, size: arrowSize, direction: "right", onClick: () => scrollTo(arrowScrollStep) })),
        (showBorders || showLeftBorder) && (React.createElement("div", { className: cx('HorizontalScroll__leftBorder', {
                'HorizontalScroll__leftBorder--active': canScrollLeft,
            }) })),
        (showBorders || showRightBorder) && (React.createElement("div", { className: cx('HorizontalScroll__rightBorder', {
                'HorizontalScroll__rightBorder--active': canScrollRight,
            }) })),
        React.createElement("div", { ref: $wrapper, className: cx(className, 'HorizontalScroll__wrapper') },
            React.createElement("div", { ref: $leftArrowTrigger, className: "HorizontalScroll__borderTrigger HorizontalScroll__borderTrigger--left" }),
            React.createElement("div", { className: "HorizontalScroll__content" }, children),
            React.createElement("div", { ref: $rightArrowTrigger, className: "HorizontalScroll__borderTrigger HorizontalScroll__borderTrigger--right" }))));
});
const HorizontalScrollArrow = ({ topOffset, onClick, direction, size = 'm' }) => (React.createElement("div", { className: cx('HorizontalScrollArrow', `HorizontalScrollArrow--${direction}`, `HorizontalScrollArrow--size-${size}`), onClick: onClick },
    React.createElement("div", { className: "HorizontalScrollArrow__icon", style: { marginTop: topOffset } },
        size === 's' && React.createElement(Icon16Chevron, null),
        size === 'm' && React.createElement(Icon24Chevron, null))));
const doScroll = (wrapper, scrollStep, scrollQueue) => {
    const { scrollLeft: scrollFrom } = wrapper;
    const scrollTo = scrollFrom + scrollStep;
    animateScroll(wrapper, scrollFrom, scrollTo, 'horizontal', SCROLL_ANIMATION_DURATION, easeInOutSine, () => {
        scrollQueue.shift();
        if (scrollQueue.length > 0 && scrollQueue[0]) {
            scrollQueue[0]();
        }
    });
};
//# sourceMappingURL=HorizontalScroll.js.map