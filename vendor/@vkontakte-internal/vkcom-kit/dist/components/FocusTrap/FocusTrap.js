import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * https://github.com/VKCOM/VKUI/issues/5093
 * Аналог компонента из VKUI, который они не экспортируют наружу
 */
import { useMountEffect } from '@vkontakte-internal/react-utils';
import { useEffect, useRef } from 'react';
const FOCUSABLE_ELEMENTS_STRING = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([hidden]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([hidden]):not([aria-hidden])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'audio',
    'video',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])',
];
export const getFocusableElements = (content = document) => {
    return Array.from(content.querySelectorAll(FOCUSABLE_ELEMENTS_STRING.join()))
        .filter((item) => item.offsetParent !== null)
        .filter((item) => item.tabIndex !== -1);
};
const hasFocusedElement = () => {
    return Boolean(document.activeElement && document.activeElement !== document.body);
};
export const FocusTrap = ({ autoFocus, children, hasFirstFocusableElement }) => {
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
        if (event.target === beforeStubRef.current) {
            focusableElements[focusableElements.length - 1].focus();
        }
        if (event.target === afterStubRef.current) {
            focusableElements[0].focus();
        }
    };
    useEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return;
        }
        // Отслеживаем изменения внутри контента, так как эфект не тригерится на апдейт контента внутри children
        // и если реакт компонент еще не загрузился внутри, то фокустрап просто не будет работать
        const wrapMutationObserver = new MutationObserver((records) => {
            for (const record of records) {
                const isHaveNewNode = record.type === 'childList';
                if (isHaveNewNode) {
                    focusableElementsRef.current = getFocusableElements(content);
                    return;
                }
            }
        });
        focusableElementsRef.current = getFocusableElements(content);
        wrapMutationObserver.observe(content, {
            childList: true,
            subtree: true,
        });
        return () => {
            wrapMutationObserver.disconnect();
        };
    }, []);
    useMountEffect(() => {
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
    });
    useMountEffect(() => {
        setTimeout(() => {
            if (autoFocus || hasFirstFocusableElement) {
                const container = contentRef.current;
                const elements = focusableElementsRef.current;
                if (!container)
                    return;
                if (hasFirstFocusableElement) {
                    const focusable = elements.find((item) => item.dataset.focusFirst);
                    if (focusable) {
                        focusable.focus();
                        return;
                    }
                }
                if (autoFocus && elements.length) {
                    elements[0].focus();
                }
            }
        });
    });
    return (_jsxs("div", { onFocusCapture: onFocus, children: [_jsx("div", { tabIndex: 0, ref: beforeStubRef }), _jsx("div", { ref: contentRef, children: children }), _jsx("div", { tabIndex: 0, ref: afterStubRef })] }));
};
//# sourceMappingURL=FocusTrap.js.map