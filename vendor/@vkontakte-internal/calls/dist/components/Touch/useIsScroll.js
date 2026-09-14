import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
/**
 * @todo
 * сейчас реализация именно под `vk.com body`
 */
export const useIsScroll = (selector) => {
    const [isScroll, setIsScroll] = useState({ h: false, v: false });
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const timeout = useRef(undefined);
    useLayoutEffect(() => {
        setIsScroll(getIsScroll(selector));
    }, [selector]);
    useEffect(() => {
        const callback = () => {
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            timeout.current = setTimeout(() => {
                setIsScroll(getIsScroll(selector));
            }, 300);
        };
        window.addEventListener('resize', callback);
        return () => {
            window.removeEventListener('resize', callback);
        };
    }, [selector]);
    return isScroll;
};
function getIsScroll(selector) {
    const result = { h: false, v: false };
    if (!selector) {
        return result;
    }
    const el = document.querySelector(selector);
    if (!el) {
        debugMessage(DebugMessageType.ERROR, {
            hook: 'useDragStaticElement',
            desc: `padding.checkScrollSelector (=${selector}) is invalid`,
        });
        return result;
    }
    if (el.scrollHeight > window.innerHeight) {
        result.v = true;
    }
    if (el.scrollWidth > window.innerWidth) {
        result.h = true;
    }
    return result;
}
//# sourceMappingURL=useIsScroll.js.map