import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { Children, useEffect, cloneElement, } from 'react';
import { setIsTransitionActive } from './model/transitionActive';
import styles from './View.module.css';
export function View({ switched, children, ...props }) {
    const transitionEndHandler = ({ target }) => {
        if (!(target instanceof HTMLDivElement)) {
            return;
        }
        if (!target.dataset.viewPanel) {
            return;
        }
        setIsTransitionActive(false);
    };
    useEffect(() => {
        setIsTransitionActive(true);
    }, [switched]);
    return (_jsx("div", { className: styles.view, ...props, children: Children.map(children, (child) => cloneElement(child, {
            'data-view-panel': true,
            'className': classNames(styles.panel, {
                [styles.panelSwitched]: switched,
            }),
            'onTransitionEnd': transitionEndHandler,
        })) }));
}
//# sourceMappingURL=View.js.map