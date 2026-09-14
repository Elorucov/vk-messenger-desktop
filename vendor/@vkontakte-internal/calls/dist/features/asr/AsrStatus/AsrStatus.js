import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}]} */
import { AppearanceProvider, DropdownActionSheet, AppRootProvider, TextTooltip, } from '@vkontakte-internal/vkcom-kit';
import { Icon12Dropdown, Icon20Articles } from '@vkontakte/icons';
import { useState } from 'react';
import { useLang } from '../../../hooks/useLang';
export const AsrStatus = ({ actions, isCanManage, ownerName, isMeOwner }) => {
    const [isDropdownShown, setIsDropdownShown] = useState(false);
    const [isTooltipShown, setIsTooltipShown] = useState(false);
    const { getLang, langReplace } = useLang();
    let textTooltip = '';
    switch (true) {
        case isMeOwner: {
            textTooltip = getLang('calls_asr_owner_tooltip_me');
            break;
        }
        case !!ownerName: {
            textTooltip = langReplace(getLang('calls_asr_owner_tooltip'), { name: ownerName });
            break;
        }
        default: {
            textTooltip = getLang('calls_asr_owner_tooltip_unknown');
        }
    }
    return (_jsx(AppRootProvider, { children: _jsx("div", { className: "AsrStatus", children: _jsx(AppearanceProvider, { value: "dark", children: _jsx(DropdownActionSheet, { trigger: "click", content: actions, shown: isDropdownShown && isCanManage, onShownChange: setIsDropdownShown, children: _jsxs("div", { className: "AsrStatus__container", children: [_jsx(TextTooltip, { text: textTooltip, shown: isTooltipShown && !isDropdownShown, onShownChange: setIsTooltipShown, children: _jsx(Icon20Articles, {}) }), isCanManage && (_jsx("div", { className: "AsrStatus__containerDropdown", children: _jsx(Icon12Dropdown, {}) }))] }) }) }) }) }));
};
//# sourceMappingURL=AsrStatus.js.map