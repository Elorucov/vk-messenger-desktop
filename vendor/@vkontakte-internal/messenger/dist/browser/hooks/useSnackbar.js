import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { SnackbarContainer, } from '../ui/Snackbar/SnackbarContainer';
import { Snackbar } from '../ui/Snackbar/Snackbar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { createSnackbar, snackbarStore, } from '../../data/store/snackbarStore';
/**
 * Единый хранитель всех снэкбаров
 */
export const SnackbarProvider = memo((props) => {
    const [state, setState] = useState(snackbarStore.getState());
    useEffect(() => {
        const unsubscribe = snackbarStore.subscribe(setState);
        return () => {
            unsubscribe();
            snackbarStore.reset();
        };
    }, []);
    return (React.createElement(SnackbarContainer, { ...props },
        React.createElement(TransitionGroup, { component: "ul", className: "SnackbarContainer__list" }, state.map((snackbar) => (React.createElement(TransitionedSnackbar, { key: snackbar.id, timeout: 400, classNames: "SnackbarContainer__item-" },
            React.createElement(Snackbar, { ...snackbar })))))));
});
/**
 * Создать снэкбар из компонентов реакта
 */
export function useSnackbar() {
    return useMemo(() => createSnackbar(), []);
}
const TransitionedSnackbar = ({ children, ...props }) => {
    const nodeRef = useRef(null);
    return (React.createElement(CSSTransition, { ...props, nodeRef: nodeRef },
        React.createElement("li", { className: "SnackbarContainer__item", ref: nodeRef }, children)));
};
//# sourceMappingURL=useSnackbar.js.map