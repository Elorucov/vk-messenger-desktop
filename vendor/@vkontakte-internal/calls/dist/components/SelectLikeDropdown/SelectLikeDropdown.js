import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"style":2,"className":1}]} */
import { useMemo, useRef, useState } from 'react';
import { DropdownActionSheet, Link, CustomScrollView, } from '@vkontakte-internal/vkcom-kit';
import styles from './SelectLikeDropdown.module.css';
export const SelectLikeDropdown = ({ ariaLabel, maxHeight, maxWidth, onChange, options, selectedId, ...props }) => {
    const [shown, setShown] = useState(false);
    const selectedItem = useMemo(() => {
        const selectedItem = options.find((option) => option.value === selectedId);
        return selectedItem || options[0];
    }, [selectedId]);
    const onSelect = (option) => {
        onChange(option);
        setShown(false);
    };
    const renderedOptions = options.map((option) => {
        return (_jsx(DropdownActionSheet.Item, { selected: option.value === selectedId, onClick: () => onSelect(option), multiline: true, children: option.label }, option.value));
    });
    let content = renderedOptions;
    let padding = 'default';
    const scrollViewRef = useRef(null);
    if (maxHeight && maxWidth) {
        padding = 'none';
        content = (_jsx("div", { style: { maxWidth }, children: _jsx(CustomScrollView, { boxRef: scrollViewRef, noOverscroll: true, children: _jsx("div", { ref: scrollViewRef, className: styles.scrollViewInner, style: { maxHeight }, children: renderedOptions }) }) }));
    }
    return (_jsx(DropdownActionSheet, { shown: options.length > 1 && shown, onShownChange: setShown, offsetByCrossAxis: 1, trigger: "click", placement: "bottom-end", ...props, padding: padding, content: content, children: _jsx(Link, { Component: "button", "aria-expanded": shown, "aria-label": `${ariaLabel} ${selectedItem?.label}`, disabled: options.length <= 1 || props.disabled, children: selectedItem?.label }) }));
};
//# sourceMappingURL=SelectLikeDropdown.js.map