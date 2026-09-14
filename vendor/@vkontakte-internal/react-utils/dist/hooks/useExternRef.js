import { useRef, useMemo } from 'react';
function setRef(element, ref) {
    if (ref) {
        if (typeof ref === 'function') {
            ref(element);
        }
        else {
            ref.current = element;
        }
    }
}
/**
 * Взято из VKUI (в 4-й версии библиотеки нет импорта этого хука)
 */
export function useExternRef(...externRefs) {
    const stableRef = useRef(null);
    return useMemo(() => ({
        get current() {
            return stableRef.current;
        },
        set current(el) {
            stableRef.current = el;
            externRefs.forEach((ref) => {
                if (ref) {
                    setRef(el, ref);
                }
            });
        },
    }), externRefs);
}
//# sourceMappingURL=useExternRef.js.map