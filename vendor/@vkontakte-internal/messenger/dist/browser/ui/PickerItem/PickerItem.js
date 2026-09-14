import React, { useMemo } from 'react';
import { Icon20CheckCircleOff, Icon20CheckCircleOn, Icon24ChevronCompactRight, } from '@vkontakte/icons';
import cx from 'classnames';
import '../../ui/PickerItem/PickerItem.css';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
export const PickerItem = ({ controlType = 'check', controlSide = 'left', selected, onSelection, children, className, ariaLabel, ...attributes }) => {
    const icon = useMemo(() => {
        switch (controlType) {
            case 'arrow':
                return React.createElement(Icon24ChevronCompactRight, { className: "PickerItem__arrow" });
            case 'check': {
                return selected ? React.createElement(Icon20CheckCircleOn, null) : React.createElement(Icon20CheckCircleOff, null);
            }
            default:
                exhaustivenessCheck(controlType);
        }
    }, [controlType, selected]);
    const handleEnterPress = (keyCombo, event) => {
        if (keyCombo === 'Enter') {
            event.stopPropagation();
            event.preventDefault();
            onSelection();
        }
    };
    return (React.createElement("div", { ...attributes, className: cx('PickerItem', `PickerItem--${controlSide}`, { 'PickerItem--selected': selected }, className), tabIndex: 0, role: "checkbox", "aria-checked": selected, onClick: onSelection, "aria-label": ariaLabel, onKeyDown: onElementKeyDownFactory(handleEnterPress) },
        React.createElement("button", { type: "button", className: "PickerItem__button", tabIndex: -1 }, icon),
        React.createElement("div", { className: "PickerItem__content" }, children)));
};
//# sourceMappingURL=PickerItem.js.map