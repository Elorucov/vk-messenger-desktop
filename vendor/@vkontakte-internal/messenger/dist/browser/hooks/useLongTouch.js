import { useEffect } from 'react';
const LONG_PRESS_TIMEOUT = 500;
/**
 * Использование лонгтач события на мобильных устройствах
 *
 * Работает в андроиде и iOS
 */
export function useLongTouch(isEnabled, $ref, callback, longPressTimeout = LONG_PRESS_TIMEOUT) {
    useEffect(() => {
        const element = $ref.current;
        if (!isEnabled || !element) {
            return;
        }
        let timeout;
        const clearLongPressTimeout = () => {
            if (!timeout) {
                return;
            }
            window.clearTimeout(timeout);
            timeout = undefined;
        };
        const triggerContextAction = (event) => () => {
            clearLongPressTimeout();
            const cancelClick = (e) => {
                element.removeEventListener('touchend', cancelClick, true);
                e.preventDefault();
                e.stopPropagation();
            };
            // После окончания тача может вызваться клик, блокируем его
            element.addEventListener('touchend', cancelClick, {
                capture: true,
                once: true,
            });
            callback(event);
        };
        const handleTouchStart = (event) => {
            clearLongPressTimeout();
            timeout = window.setTimeout(triggerContextAction(event), longPressTimeout);
        };
        element.addEventListener('touchstart', handleTouchStart, {
            passive: true,
        });
        element.addEventListener('touchcancel', clearLongPressTimeout, true);
        element.addEventListener('touchend', clearLongPressTimeout, true);
        element.addEventListener('touchmove', clearLongPressTimeout, {
            passive: true,
        });
        return () => {
            clearLongPressTimeout();
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchcancel', clearLongPressTimeout, true);
            element.removeEventListener('touchend', clearLongPressTimeout, true);
            element.removeEventListener('touchmove', clearLongPressTimeout);
        };
    }, [callback, isEnabled, longPressTimeout, $ref]);
}
//# sourceMappingURL=useLongTouch.js.map