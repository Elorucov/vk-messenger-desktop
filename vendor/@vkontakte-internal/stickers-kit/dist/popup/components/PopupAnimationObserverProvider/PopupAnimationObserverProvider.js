import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { PopupAnimationObserver } from '../../native';
import { PopupAnimationObserverContext } from './usePopupAnimationObserver';
export function PopupAnimationObserverProvider({ children }) {
    const observerRef = useRef(undefined);
    useEffect(() => {
        observerRef.current = new PopupAnimationObserver();
    }, []);
    return (_jsx(PopupAnimationObserverContext.Provider, { value: {
            observerRef,
        }, children: children }));
}
//# sourceMappingURL=PopupAnimationObserverProvider.js.map