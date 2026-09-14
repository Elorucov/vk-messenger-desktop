import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { getColorClass, IconButton, RoundedGroup, TextTooltip, ToolButton, EllipsisText, Spinner, } from '@vkontakte-internal/vkcom-kit';
const iconModeModifiers = {
    medium: 'color_icon_medium',
    negative: 'color_icon_negative',
    secondary: 'color_icon_secondary',
};
export function ToolbarButton({ ariaLabel, children, dataTestId, disabled, getRootRef, Icon, iconMode = 'medium', isIconOnly, loading, maxWidth, mode = 'secondary', onClick, tooltip, }) {
    const preparedAriaLabel = useMemo(() => ariaLabel.replace(/<br\/?>/gi, ' '), [ariaLabel]);
    const icon = _jsx(Icon, { className: getColorClass(iconModeModifiers[iconMode] || iconModeModifiers.medium) });
    const content = isIconOnly ? (_jsx(RoundedGroup.Item, { mode: mode, children: _jsx(IconButton, { label: preparedAriaLabel, "data-testid": dataTestId, getRootRef: getRootRef, disabled: disabled, onClick: onClick, size: 48, children: loading ? _jsx(Spinner, { size: "m" }) : icon }) })) : (_jsx(RoundedGroup.Item, { mode: mode, children: _jsx(ToolButton, { "aria-label": preparedAriaLabel, appearance: "neutral", borderRadiusMode: "inherit", "data-testid": dataTestId, getRootRef: getRootRef, IconCompact: () => (loading ? _jsx(Spinner, { stretched: false, size: "m" }) : icon), IconRegular: () => (loading ? _jsx(Spinner, { stretched: false, size: "m" }) : icon), disabled: disabled, onClick: onClick, children: _jsx(EllipsisText, { disableNativeTitle: true, maxLines: 2, maxWidth: maxWidth, children: children }) }) }));
    return tooltip ? (_jsx(TextTooltip, { placement: "top", description: tooltip, textAlign: "center", children: _jsx("div", { children: content }) })) : (content);
}
//# sourceMappingURL=ToolbarButton.js.map