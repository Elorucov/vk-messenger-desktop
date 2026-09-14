import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Tappable":["Adopted",{"className":1}],"Icon24ChevronLeft":["@vkontakte/icons",{"className":1}],"Footnote":["Adopted",{"className":1}]} */
import { Icon24Cancel, Icon24ChevronLeft } from '@vkontakte/icons';
import { classNames } from '@vkontakte/vkjs';
import { useEffect, useId, useMemo, useState, } from 'react';
import { Footnote, ModalDismissButton, Tappable, VisuallyHidden } from '../../Adopted';
import { useModalBoxContext } from '../ModalBox/ModalBoxContext';
import { ModalHeaderButton } from '../ModalHeaderButton/ModalHeaderButton';
import { ModalHeaderContextProvider } from './ModalHeaderContext';
import styles from './ModalHeader.module.css';
export const ModalHeader = ({ className, onBack, backLabel, before, children, indicator, centered, after, subtitle, onClose, closeAriaLabel, hideBackLabel, noSeparator, getRootRef, ...restProps }) => {
    const contentId = useId();
    const { stretched, setHeaderId } = useModalBoxContext();
    const [containsTabs, setContainsTabs] = useState(false);
    const context = useMemo(() => ({
        registerTabs: () => setContainsTabs(true),
    }), [setContainsTabs]);
    useEffect(() => {
        setHeaderId(contentId);
        return () => setHeaderId();
    }, [contentId, setHeaderId]);
    const hasAfter = Boolean(after);
    const hasSubtitle = Boolean(subtitle);
    const hasBackButton = Boolean(backLabel);
    return (_jsxs("div", { ref: getRootRef, "data-testid": "modalheader", ...restProps, className: classNames(styles.container, (hasBackButton || centered) && styles.containerWithBefore, hasAfter && styles.containerWithAfter, containsTabs && styles.containerNoSpacing, hasSubtitle && styles.containerWithSubtitle, noSeparator && styles.containerNoSeparator, className), children: [_jsxs("div", { "data-testid": "modalheader-before", className: styles.before, children: [hasBackButton && (_jsxs(Tappable, { "data-testid": "modalheader-backbutton", className: styles.backButton, activeMode: "opacity", hoverMode: "opacity", onClick: onBack, children: [_jsx(Icon24ChevronLeft, { className: styles.backIcon, "aria-hidden": true }), hideBackLabel ? (_jsx(VisuallyHidden, { children: backLabel })) : (_jsx("span", { className: styles.backLabel, children: backLabel }))] })), before] }), Boolean(children) && (_jsxs("div", { className: styles.content, children: [_jsx(ModalHeaderContextProvider, { value: context, children: _jsxs("div", { id: contentId, "data-testid": "modalheader-title", className: classNames(styles.title, 'vkuiInternalTabsWithCustomSpacing'), children: [children, hasSubtitle && (_jsx(Footnote, { "data-testid": "modalheader-subtitle", className: styles.subtitle, children: subtitle }))] }) }), Boolean(indicator) && (_jsx("div", { "data-testid": "modalheader-indicator", className: styles.indicator, children: indicator }))] })), _jsxs("div", { className: styles.after, children: [after, onClose &&
                        (stretched ? (_jsx(ModalHeaderButton, { className: styles.closeButton, onClick: onClose, "aria-label": closeAriaLabel, "data-testid": "modal-close-button", children: _jsx(Icon24Cancel, {}) })) : (_jsx(ModalDismissButton, { "data-testid": "modal-close-button", onClick: onClose, children: closeAriaLabel })))] })] }));
};
//# sourceMappingURL=ModalHeader.js.map