import { PopUpPositionTypes } from '../constants';
/**
 * Если нам дали блок, у которого clientHeight показывается больше, чем наш viewport.
 * Такое может случиться, если сам блок не имеет скрола, а скролится внутри другого блока.
 */
function checkViewPortHeight(height) {
    return Math.min(height, document.documentElement.clientHeight);
}
/**
 * Если нам дали блок, у которого clientWidth показывается больше, чем наш viewport.
 * Такое может случиться, если сам блок не имеет скрола, а скролится внутри другого блока.
 */
function checkViewPortWidth(width) {
    return Math.min(width, document.documentElement.clientWidth);
}
export function getPlayBackAreaStyle(type, { fullScreenHeaderElement, fullScreenFooterElement, fullScreenElement, fixedElement, footerElement, headerElement, animationFooterElement, position, }, isAnimationLayer = false) {
    const isFullScreen = type === PopUpPositionTypes.FullScreen;
    const { top: fullScreenElementTop, left: fullScreenElementLeft, bottom: fullScreenElementBottom, } = fullScreenElement.getBoundingClientRect();
    const playBackAreaContainer = isFullScreen ? fullScreenElement : fixedElement;
    const { top: playBackAreaContainerTop, bottom: playBackAreaContainerBottom, left: playBackAreaContainerLeft, width: playBackAreaContainerWidth, } = playBackAreaContainer.getBoundingClientRect();
    const { bottom: fixedHeaderElementBottom } = headerElement?.getBoundingClientRect() || {
        bottom: -Infinity,
    };
    const { bottom: fullScreenHeaderElementBottom } = fullScreenHeaderElement?.getBoundingClientRect() || {
        bottom: -Infinity,
    };
    const isNeedForceTopFullScreen = Math.max(fixedHeaderElementBottom, playBackAreaContainerTop) < 0;
    const isTopFullScreen = type === PopUpPositionTypes.TopFullScreen || isNeedForceTopFullScreen;
    const isFixedScreen = !isFullScreen && !isTopFullScreen;
    const headerElementBottom = isFixedScreen ? fixedHeaderElementBottom : fullScreenHeaderElementBottom;
    const footerContainer = isFullScreen ? fullScreenFooterElement : footerElement;
    const footerIsVisible = footerContainer?.getClientRects().length;
    const animationFooterIsVisible = animationFooterElement?.getClientRects().length;
    let footerContainerTop;
    if (isAnimationLayer && animationFooterElement && animationFooterIsVisible) {
        footerContainerTop = animationFooterElement.getBoundingClientRect().top;
    }
    else if (footerContainer && footerIsVisible) {
        footerContainerTop = footerContainer.getBoundingClientRect().top;
    }
    else {
        footerContainerTop = Infinity;
    }
    /**
     * Нам нужна эта переменная т.к мы считаем позицию относительно fullscreen элемента, а не viewport, когда position absolute
     */
    let minAvailableTop = 0;
    /**
     * Если top нашего fullScreen -100, то в рамках него minAvailableTop будет 100 и наоборот
     */
    if (position === 'absolute') {
        minAvailableTop = -fullScreenElementTop;
    }
    const canBeTop = [];
    /**
     * Считаем что наш топ это конец шапки
     */
    if (headerElementBottom > 0) {
        canBeTop.push(minAvailableTop + headerElementBottom);
    }
    /**
     * Считаем что наш топ это начало контейнера
     */
    if (isFixedScreen && playBackAreaContainerTop >= 0) {
        canBeTop.push(minAvailableTop + playBackAreaContainerTop);
    }
    /**
     * Считаем что наш топ это начало страницы
     */
    if (fullScreenElementTop < 0) {
        canBeTop.push(minAvailableTop);
    }
    const top = Math.max(...canBeTop, 0);
    const maxAvailableHeight = fullScreenElement === document.body
        ? document.documentElement.clientHeight
        : checkViewPortHeight(fullScreenElementBottom);
    const canBeHeight = [
        minAvailableTop + maxAvailableHeight,
        /**
         * Низ нашего контейнера
         */
        playBackAreaContainer === document.body
            ? document.documentElement.clientHeight
            : minAvailableTop + playBackAreaContainerBottom,
        /**
         * Низ футера контейнера
         */
        minAvailableTop + footerContainerTop,
    ];
    const height = Math.min(...canBeHeight) - top;
    const width = checkViewPortWidth(playBackAreaContainerWidth);
    const left = playBackAreaContainerLeft - fullScreenElementLeft;
    const style = { position };
    style.top = `${top}px`;
    style.left = `${left}px`;
    style.width = `${width}px`;
    style.height = `${height}px`;
    const topByViewport = top - minAvailableTop;
    return { playBackAreaStyle: style, topByViewport };
}
//# sourceMappingURL=getPlayBackAreaStyle.js.map