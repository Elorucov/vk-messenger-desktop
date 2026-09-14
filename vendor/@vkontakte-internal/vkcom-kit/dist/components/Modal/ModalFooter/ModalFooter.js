import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { Children } from 'react';
import { ButtonGroup } from '../../Adopted';
import { ModalFooterCheckbox } from './ModalFooterCheckbox/ModalFooterCheckbox';
import styles from './ModalFooter.module.css';
const ModalFooterComponent = ({ className, before, children, actions, noSeparator, getRootRef, ...restProps }) => {
    return (_jsxs("div", { ref: getRootRef, "data-testid": "modalfooter", ...restProps, className: classNames(styles.container, noSeparator && styles.containerNoSeparator, className), children: [Boolean(before) && (_jsx("div", { "data-testid": "modalfooter-before", className: styles.before, children: before })), Boolean(children) && (_jsx("div", { "data-testid": "modalfooter-in", className: styles.content, children: children })), Children.count(actions) > 0 && (_jsx("div", { className: styles.actionButtons, children: _jsx(ButtonGroup, { "data-testid": "modalfooter-actions", gap: "m", children: actions }) }))] }));
};
export const ModalFooter = Object.assign(ModalFooterComponent, {
    Checkbox: ModalFooterCheckbox,
});
//# sourceMappingURL=ModalFooter.js.map