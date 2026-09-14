import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"IconButton":["@vkontakte-internal/vkcom-kit",{"className":1}],"span":["global",{"className":1}],"div":["global",{"className":2}]} */
import { useEffect, useState } from 'react';
import { IconButton, RoundedGroup, TextTooltip } from '@vkontakte-internal/vkcom-kit';
import { classNames } from '@vkontakte/vkjs';
import { TOOLTIP_DELAY } from '../../constants';
export const CallsIconButton = ({ children, tooltip, className, isMainButton, onClick, active = false, disabled = false, isTooltipShown = true, getRootRef, ariaLabel, placement = 'top', offsetByCrossAxis, after, href, target, mode, appearance, ...rest }) => {
    const [tooltopShown, setTooltipShown] = useState(isTooltipShown);
    const mainButtonsModes = {
        active: 'shadow',
        disabled: 'transparent',
        normal: 'overlay',
    };
    let mainButtonsMode = mainButtonsModes.normal;
    if (active && !disabled) {
        mainButtonsMode = mainButtonsModes.active;
    }
    else if (disabled) {
        mainButtonsMode = mainButtonsModes.disabled;
    }
    const buttonClassName = classNames(className, {
        'Calls__iconButton_main--disabled': isMainButton && disabled,
    });
    useEffect(() => {
        if (tooltopShown) {
            setTooltipShown(() => false);
            setTimeout(() => setTooltipShown(() => true), 10);
        }
    }, [tooltip]);
    let iconButton = (_jsx(IconButton, { href: href, target: target, onClick: onClick, label: ariaLabel || tooltip || '', className: buttonClassName, getRootRef: getRootRef, disabled: disabled, ...rest, children: children }));
    if (isMainButton) {
        iconButton = _jsx(RoundedGroup.Item, { mode: mode || mainButtonsMode, children: iconButton });
    }
    else {
        iconButton = (_jsx(RoundedGroup.Item, { mode: active ? 'accent' : 'transparent', appearance: appearance, children: iconButton }));
    }
    const iconButtonWithAfter = (_jsxs("div", { className: "Calls__iconButton__wrapper", children: [iconButton, after && _jsx("span", { className: "Calls__iconButton__after", children: after })] }));
    if (!tooltopShown || !tooltip) {
        return iconButtonWithAfter;
    }
    return (_jsx(TextTooltip, { text: tooltip, hoverDelay: TOOLTIP_DELAY, placement: placement, offsetByCrossAxis: offsetByCrossAxis, usePortal: isMainButton, children: _jsx("div", { className: "Calls__iconButton__tooltip", children: iconButtonWithAfter }) }));
};
//# sourceMappingURL=CallsIconButton.js.map