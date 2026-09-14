import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useRef, useCallback, useEffect, useState } from 'react';
import { Banner } from '@vkontakte-internal/vkcom-kit';
import { CSSTransition } from 'react-transition-group';
import { useAutoDismissDelay } from './hooks';
const DEFAULT_AUTO_DISMISS_DELAY = 10000;
export const CallsBanner = ({ autoDismissDelay = DEFAULT_AUTO_DISMISS_DELAY, isOpen: propIsOpen, mode = 'tint', noPadding = true, onDismiss, onExited, testId, ...rest }) => {
    const [isIn, setIsIn] = useState(false);
    const transitionRef = useRef(null);
    const handleDismiss = useCallback((e) => {
        if (onDismiss) {
            // controlled banner
            onDismiss(e);
        }
        else {
            // uncontrolled banner
            setIsIn(false);
        }
    }, [onDismiss]);
    const tmtController = useAutoDismissDelay(autoDismissDelay, handleDismiss);
    useEffect(() => {
        // show banner if initial external prop is not explicitly set to false
        setIsIn(propIsOpen !== false);
        return () => tmtController.clear();
    }, [propIsOpen]);
    const handleExit = useCallback(() => {
        onExited?.();
    }, [onExited]);
    return (_jsx(CSSTransition, { in: isIn, classNames: "CallsBanner", nodeRef: transitionRef, onExited: handleExit, unmountOnExit: false, timeout: 200, children: _jsx("div", { className: "CallsBanner", ref: transitionRef, children: _jsx(Banner, { mode: mode, noPadding: noPadding, onDismiss: handleDismiss, "data-testid": testId, ...rest }) }) }));
};
//# sourceMappingURL=CallsBanner.js.map