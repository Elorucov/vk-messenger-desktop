import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Tappable } from '../Adopted';
import { useDropdownActionSheetContext } from './DropdownActionSheetContext';
import styles from './DropdownActionSheetHorizontalItem.module.css';
export const DropdownActionSheetHorizontalItem = ({ children, header, href, onClick, keepOpen, ...restProps }) => {
    const { setIsShown } = useDropdownActionSheetContext();
    const handleClick = (event) => {
        onClick?.(event);
        if (!keepOpen) {
            setIsShown(false);
        }
    };
    return (_jsxs(Tappable, { "data-testid": "dropdownactionsheet-horizontalitem", className: styles.root, onClick: handleClick, href: href, ...restProps, children: [_jsx("div", { className: styles.image, children: children }), _jsx("div", { className: styles.header, children: header })] }));
};
//# sourceMappingURL=DropdownActionSheetHorizontalItem.js.map