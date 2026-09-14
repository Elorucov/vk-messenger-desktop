import { jsx as _jsx } from "react/jsx-runtime";
import { getColorClass, Link, DropdownActionSheet, Text } from '@vkontakte-internal/vkcom-kit';
import { useLangs } from '@vkontakte-internal/plugins';
export const Header = ({ showOwnerPicker, onLinkClick, ownerSelect, }) => {
    const langs = useLangs();
    if (showOwnerPicker && ownerSelect?.options?.length) {
        const { onChange, options, value } = ownerSelect;
        const buttonTitle = options.find(({ id }) => id === value)?.name ?? '';
        const dropdownContent = options.map(({ id, name }) => (_jsx(DropdownActionSheet.Item, { onClick: () => onChange({ id, name }), children: _jsx(Text, { weight: "3", className: getColorClass('color_text_link'), children: name }) }, id)));
        return (_jsx(DropdownActionSheet, { maxHeight: 350, width: 200, trigger: "click", content: dropdownContent, children: _jsx(Link, { "data-testid": "calls_scheduled_calls_select_owner", children: buttonTitle }) }));
    }
    if (onLinkClick && !showOwnerPicker) {
        const handleToScheduledClick = (event) => {
            if (onLinkClick) {
                onLinkClick(event, 'scheduled', 'calls?section=scheduled');
            }
        };
        return (_jsx(Link, { href: "/calls?section=scheduled", onClick: handleToScheduledClick, "data-testid": "calls_scheduled_calls_show_all", children: langs.getLang('calls_show_all') }));
    }
    return null;
};
//# sourceMappingURL=Header.js.map