import React, { useEffect, useId, useRef, } from 'react';
import '../../ui/MainPanel/MainPanel.css';
import cx from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { Icon24Cancel } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { FocusTrap } from '../../ui/FocusTrap/FocusTrap';
import { onElementKeyDownFactory } from '../../utils/elementKeyDown';
export const MainPanel = ({ className, children, title, isOpen, onClose, withTransition = true, withHeader = true, ...attributes }) => {
    const nodeRef = useRef(null);
    const titleRef = useRef(null);
    const { lang } = useBrowserEnv();
    const titleId = useId();
    const onKeyDown = onElementKeyDownFactory((keyCombo, event) => {
        if (keyCombo === 'Escape') {
            event.preventDefault();
            onClose();
        }
    });
    useEffect(() => {
        if (isOpen) {
            titleRef.current?.focus({ preventScroll: true });
        }
    }, [isOpen]);
    const renderPanel = () => (React.createElement(FocusTrap, { disableByClickOutside: true, autoFocus: false, returnFocus: false, disabled: !isOpen },
        React.createElement("div", { ref: nodeRef, className: cx('MainPanel', className), onKeyDown: onKeyDown, role: "dialog", "aria-labelledby": titleId, "aria-modal": true, ...attributes },
            withHeader && (React.createElement("div", { className: "MainPanel__header" },
                React.createElement("h2", { ref: titleRef, tabIndex: -1, id: titleId, className: "MainPanel__title" }, title),
                React.createElement("div", { className: "MainPanel__actions" },
                    React.createElement("button", { "aria-label": lang.use('me_close'), className: "MainPanel__close", onClick: onClose },
                        React.createElement(Icon24Cancel, null))))),
            React.createElement("div", { className: "MainPanel__content" }, children))));
    return withTransition ? (React.createElement(CSSTransition, { nodeRef: nodeRef, in: isOpen, addEndListener: (done) => nodeRef.current?.addEventListener('transitionend', done, false), mountOnEnter: true, unmountOnExit: true, appear: true, classNames: "MainPanel--fade" }, renderPanel())) : isOpen ? (renderPanel()) : null;
};
//# sourceMappingURL=MainPanel.js.map