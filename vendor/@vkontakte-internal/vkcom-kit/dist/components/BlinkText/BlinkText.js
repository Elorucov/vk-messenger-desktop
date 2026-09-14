import { jsx as _jsx } from "react/jsx-runtime";
import { classNames, noop } from '@vkontakte/vkjs';
import { useMountEffect } from '@vkontakte-internal/react-utils';
import { useRef } from 'react';
import styles from './BlinkText.module.css';
export const BlinkText = ({ shown, onHide = noop, duration = 2000, children, className, ...restProps }) => {
    const timeoutRef = useRef(undefined);
    useMountEffect(() => {
        /**
         * На случай, когда компонент сразу создан в состоянии "видим"
         */
        if (shown) {
            timeoutRef.current = window.setTimeout(() => {
                onHide();
            }, duration);
        }
        return () => {
            clearTimeout(timeoutRef.current);
        };
    });
    const handleTransitionEnd = (event) => {
        if (!shown || event.propertyName !== 'opacity') {
            return;
        }
        clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            onHide();
        }, duration);
    };
    return (_jsx("span", { ...restProps, className: classNames(styles.blinkText, shown && styles.blinkTextShown, className), onTransitionEnd: handleTransitionEnd, "aria-live": "polite", "aria-hidden": !shown, children: children }));
};
//# sourceMappingURL=BlinkText.js.map