import { toNonEmpty } from '../../core/utils/misc';
const eventOptions = { passive: false, capture: true };
/**
 * Вместо тысячи комментов - один со ссылками на баги сафари
 * https://bugs.webkit.org/show_bug.cgi?id=176454
 * https://bugs.webkit.org/show_bug.cgi?id=141832
 *
 * Зачем нужен BounceDisabler: https://blog.opendigerati.com/the-eccentric-ways-of-ios-safari-with-the-keyboard-b5aa3f34228d
 *
 * Все началось с ME-32443, продолжилось ME-33529, ME-33050 (пусть ими и закончится).
 */
export class BounceDisabler {
    startX = 0;
    startY = 0;
    onTouchMove(e) {
        const touches = getTouches(e);
        if (!e.target ||
            !touches ||
            isZoomGesture(touches) ||
            isHorizontalScroll(this.startX, this.startY, touches)) {
            return;
        }
        let element = e.target;
        while (element !== document.body) {
            if (isRangeElement(element)) {
                return;
            }
            const canBounce = isScrollable(element);
            if (canBounce) {
                const willBounce = canBounce(this.startY, touches[0].screenY);
                if (willBounce) {
                    e.preventDefault();
                }
                return;
            }
            const nextElement = element.parentElement;
            if (nextElement) {
                element = nextElement;
            }
            else {
                break;
            }
        }
        /**
         * Не нашлось ни одного родителя со скроллом - отключаем скролл
         */
        e.preventDefault();
    }
    onTouchStart(e) {
        const touches = getTouches(e);
        if (!touches) {
            return;
        }
        this.startX = touches[0].screenX;
        this.startY = touches[0].screenY;
    }
    enable() {
        document.addEventListener('touchstart', this.onTouchStart, eventOptions);
        document.addEventListener('touchmove', this.onTouchMove, eventOptions);
    }
    disable() {
        document.removeEventListener('touchstart', this.onTouchStart, eventOptions);
        document.removeEventListener('touchmove', this.onTouchMove, eventOptions);
    }
    static supported() {
        /**
         * Чтобы не упало
         * try/catch для FF 56, в котором getComputedStyle, есть, но он undefined
         */
        try {
            const testDiv = document.createElement('div');
            document.documentElement.appendChild(testDiv);
            // @ts-expect-error Свойства WebkitOverflowScrolling нет в CSSStyleDeclaration
            testDiv.style.WebkitOverflowScrolling = 'touch';
            const isScrollSupported = 'getComputedStyle' in window &&
                window
                    .getComputedStyle(testDiv)
                    .getPropertyValue('-webkit-overflow-scrolling') === 'touch';
            document.documentElement.removeChild(testDiv);
            return isScrollSupported;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
}
function getTouches(event) {
    return toNonEmpty(Array.from(event.touches));
}
function isZoomGesture(touches) {
    const ratio = window.innerWidth / window.document.documentElement.clientWidth;
    /**
     * Зум одним пальцем и тапом невозможен
     */
    if (touches.length === 1) {
        return false;
    }
    /**
     * Если соотношение не идентичное, значит был применен scale
     */
    return ratio !== 1;
}
function isHorizontalScroll(startX, startY, touches) {
    /**
     * Лимит, при котором не случится вертикального скролла, но и
     * горизонтальный скролл не будет мукой (двигаться пальцем горизонтально по
     * прямой достаточно неудобно)
     */
    const VERTICAL_LIMIT = 10;
    const { screenY, screenX } = touches[0];
    const betweenVerticalLimits = screenY <= startY + VERTICAL_LIMIT && screenY >= startY - VERTICAL_LIMIT;
    return startX !== screenX && betweenVerticalLimits;
}
/**
 * На случай, если в будущем будет range элемент, проигнорируем его
 */
function isRangeElement(element) {
    return (element.nodeName === 'INPUT' && element.getAttribute('type') === 'range');
}
function isScrollable(element) {
    const style = window.getComputedStyle(element);
    const scrolling = style.getPropertyValue('-webkit-overflow-scrolling');
    const overflowY = style.getPropertyValue('overflow-y');
    const height = parseInt(style.getPropertyValue('height'), 10);
    /**
     * Определяем, может ли элемент сроллиться
     */
    const scrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
    const canScroll = element.scrollHeight > element.offsetHeight;
    if (scrollable && canScroll) {
        return (startY, currentY) => {
            /**
             * Определяем по тачам юзера куда он движется
             */
            const up = startY <= currentY;
            const down = startY >= currentY;
            /**
             * Если вверх или вниз, а там не будет места, то страница будет баунситься
             */
            const isAtTop = up && element.scrollTop === 0;
            const isAtBottom = down && element.scrollHeight - element.scrollTop === height;
            /**
             * Произойдет ли баунс
             */
            return isAtTop || isAtBottom;
        };
    }
    return false;
}
//# sourceMappingURL=BounceDisabler.js.map