import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":4}]} */
import { useEffect, useRef } from 'react';
import { getFocusableElements } from '../../helpers/accessibility';
export const FocusTrap = ({ autoFocus, children, hasFirstFocusableElement, isAlertDialog, }) => {
    const focusableElementsRef = useRef([]);
    const previousFocusedElementRef = useRef(null);
    const beforeStubRef = useRef(null);
    const afterStubRef = useRef(null);
    const contentRef = useRef(null);
    const onFocus = (event) => {
        const focusableElements = focusableElementsRef.current;
        const content = contentRef.current;
        if (!content || !focusableElements.length) {
            return;
        }
        if (event.target === beforeStubRef?.current) {
            focusableElements[focusableElements.length - 1].focus();
        }
        if (event.target === afterStubRef?.current) {
            focusableElements[0].focus();
        }
    };
    useEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return;
        }
        focusableElementsRef.current = getFocusableElements(content);
    }, [children]);
    useEffect(() => {
        if ((autoFocus || hasFirstFocusableElement) &&
            hasFocusedElement() &&
            !contentRef.current?.contains(document.activeElement)) {
            previousFocusedElementRef.current = document.activeElement;
        }
        return () => {
            setTimeout(() => {
                previousFocusedElementRef.current?.focus();
            });
        };
    }, []);
    useEffect(() => {
        // часть элементов могут ещё не быть отрисованы, делаем задержку
        setTimeout(() => {
            // Если до этого был элемент с фокусом и передана настройка, то устанавливаем фокус
            // на первый фокусируемый элемент
            if ((hasFocusedElement() || isAlertDialog) && (autoFocus || hasFirstFocusableElement)) {
                const container = contentRef.current;
                const elements = focusableElementsRef.current;
                if (container) {
                    if (hasFirstFocusableElement) {
                        const focusable = elements.find((item) => item.dataset.focusFirst);
                        if (focusable) {
                            focusable.focus();
                            return;
                        }
                    }
                    if (autoFocus) {
                        const first = elements[0];
                        if (first) {
                            first.focus();
                        }
                    }
                }
            }
        }, 500);
    }, []);
    return (_jsxs("div", { className: "FocusTrap", onFocusCapture: onFocus, children: [_jsx("div", { className: "FocusTrap__stub", tabIndex: 0, ref: beforeStubRef }), _jsx("div", { className: "FocusTrap__content", ref: contentRef, children: children }), _jsx("div", { className: "FocusTrap__stub", tabIndex: 0, ref: afterStubRef })] }));
};
function hasFocusedElement() {
    return Boolean(document.activeElement && document.activeElement !== document.body);
}
//# sourceMappingURL=FocusTrap.js.map