import '../../ui/Snackbar/Snackbar.css';
import React, { memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Paragraph, Button } from '@vkontakte/vkui';
import { Icon12Cancel } from '@vkontakte/icons';
import { SnackbarTimerProvider } from './SnackbarContext';
export const Snackbar = memo(({ message, layout: layoutProps = 'horizontal', action, before, after, duration = 4000, onActionClick, onClose, mode = 'default', className, stopOnHover = true, isManuallyClosable = false, autoClose = true, requestClose = false, onRequestRemove, }) => {
    const { isMobileLayout } = useLayoutData();
    const [delay, setDelay] = useState(duration);
    useEffect(() => {
        setDelay(duration);
    }, [duration]);
    /**
     * В компоненте нет зависимости на коллбэк закрытия,
     * вызываем функцию из рефа, чтобы избежать ненужных
     * вызовов эффектов при изменении коллбэков ниже
     */
    const close = useRef(() => { });
    close.current = () => {
        onRequestRemove();
        onClose?.();
    };
    const handleActionClick = (e) => {
        if (action) {
            onActionClick?.(e);
        }
        close.current();
    };
    const onMouseEnter = () => {
        if (!stopOnHover) {
            return;
        }
        setDelay(null);
    };
    const onMouseLeave = () => {
        if (!stopOnHover) {
            return;
        }
        setDelay(duration);
    };
    useEffect(() => {
        if (delay == null || !autoClose) {
            return undefined;
        }
        let timeoutId = null;
        timeoutId = window.setTimeout(() => {
            close.current();
        }, delay);
        return () => {
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [autoClose, delay]);
    useEffect(() => {
        if (requestClose) {
            close.current();
        }
    }, [requestClose]);
    const layout = after || !isMobileLayout ? 'vertical' : layoutProps;
    return (React.createElement(SnackbarTimerProvider, { value: {
            duration,
            timeLeft: delay,
        } },
        React.createElement("div", { className: cx('Snackbar', `Snackbar--layout-${layout}`, `Snackbar--mode-${mode}`, className), onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave },
            React.createElement("div", { className: "Snackbar__body" },
                before && React.createElement("div", { className: "Snackbar__before" }, before),
                React.createElement("div", { className: "Snackbar__content" },
                    React.createElement(Paragraph, { className: "Snackbar__content-text" }, message),
                    action && (React.createElement(Button, { align: "left", hasHover: false, mode: "link", appearance: "accent", size: "s", className: "Snackbar__action", onClick: handleActionClick }, action))),
                after && React.createElement("div", { className: "Snackbar__after" }, after)),
            isManuallyClosable && (React.createElement(Button, { onClick: close.current, after: React.createElement(Icon12Cancel, null), mode: "tertiary", appearance: mode === 'dark' ? 'overlay' : 'neutral', size: "s", className: "Snackbar__close" })))));
});
//# sourceMappingURL=Snackbar.js.map