import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"CustomScrollView":["Adopted",{"className":1}],"Popover":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { usePatchChildrenRef, useStableCallback } from '@vkontakte-internal/react-utils';
import { useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { CustomScrollView, Popover } from '../Adopted';
import { DropdownActionSheetCheckbox } from './DropdownActionSheetCheckbox';
import { DropdownActionSheetProvider } from './DropdownActionSheetContext';
import { DropdownActionSheetEmptyIcon } from './DropdownActionSheetEmptyIcon';
import { DropdownActionSheetHorizontalItem } from './DropdownActionSheetHorizontalItem';
import { DropdownActionSheetHorizontalItems, } from './DropdownActionSheetHorizontalItems';
import { DropdownActionSheetItem } from './DropdownActionSheetItem';
import { DropdownActionSheetSeparator } from './DropdownActionSheetSeparator';
import styles from './DropdownActionSheet.module.css';
const modeModifiersMap = {
    primary: styles.containerModePrimary,
    secondary: undefined,
};
const sizeModifiersMap = {
    s: styles.containerSizeS,
    m: styles.containerSizeM,
};
const paddingModifiersMap = {
    none: undefined,
    s: styles.contentPaddingS,
    m: styles.contentPaddingM,
    default: styles.contentPaddingDefault,
};
const DropdownActionSheetComponent = ({ mode = 'secondary', size = 'm', shown, width, maxHeight, trigger = 'hover', content, padding = 'default', onShownChange, className, children: childrenProp, ...restProps }) => {
    const [isCalculatedShown, setIsCalculatedShown] = useState(shown || false);
    const scrollViewRef = useRef(null);
    const isShown = shown ?? isCalculatedShown;
    const setIsShown = useStableCallback((value, reason) => {
        if (shown === undefined) {
            setIsCalculatedShown(value);
        }
        onShownChange?.(value, reason);
    });
    const contextValue = useMemo(() => ({
        size,
        setIsShown,
    }), [size, setIsShown]);
    content = (_jsx("div", { "data-testid": "dropdownactionsheet-content", className: classNames(styles.content, sizeModifiersMap[size], paddingModifiersMap[padding]), children: content }));
    if (maxHeight && width) {
        content = (_jsx("div", { ref: scrollViewRef, style: { maxHeight }, children: _jsx(CustomScrollView, { boxRef: scrollViewRef, className: styles.scrollView, noOverscroll: true, children: content }) }));
    }
    const [childrenRef, children] = usePatchChildrenRef(childrenProp);
    // TODO: https://jira.mvk.com/browse/VKCOMKIT-1702
    useLayoutEffect(() => {
        childrenRef.current?.setAttribute('aria-expanded', String(isShown));
    }, [childrenRef, isShown]);
    return (_jsx(DropdownActionSheetProvider, { value: contextValue, children: _jsx(Popover, { "data-testid": "dropdownactionsheet", className: classNames(styles.container, modeModifiersMap[mode], className), width: width, maxWidth: width, content: content, trigger: trigger, shown: isShown, onShownChange: setIsShown, ...restProps, children: children }) }));
};
export const DropdownActionSheet = Object.assign(DropdownActionSheetComponent, {
    Item: DropdownActionSheetItem,
    Checkbox: DropdownActionSheetCheckbox,
    EmptyIcon: DropdownActionSheetEmptyIcon,
    Separator: DropdownActionSheetSeparator,
    HorizontalItem: DropdownActionSheetHorizontalItem,
    HorizontalItems: DropdownActionSheetHorizontalItems,
});
//# sourceMappingURL=DropdownActionSheet.js.map