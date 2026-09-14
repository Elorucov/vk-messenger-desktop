import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListCopyControl } from '../ListCopyControl/ListCopyControl';
import { useLang } from '../../hooks/useLang';
import { Div, getColorClass, List, SimpleCell } from '@vkontakte-internal/vkcom-kit';
import { Icon20Chain, Icon20ChevronRightOutline } from '@vkontakte/icons';
export const CallManagementMenu = ({ isLinkBlockShown, linkBlockTitle, onLinkBlockClick, callUrlLink, }) => {
    const { getLang } = useLang();
    return (_jsx(List, { children: isLinkBlockShown && (_jsx(Div, { paddingTop: 0, paddingBottom: 0, children: _jsxs(SimpleCell, { onClick: onLinkBlockClick, before: _jsx("div", { "data-testid": "calls_call_management_modal_link_icon", children: _jsx(Icon20Chain, { className: getColorClass('color_text_primary') }) }), indicator: _jsx("span", { "data-testid": "calls_call_management_modal_link_setup", children: getLang('calls_menu_link_setup') }), after: _jsx(Icon20ChevronRightOutline, { className: getColorClass('color_text_secondary') }), children: [_jsx("span", { "data-testid": "calls_call_management_modal_link_title", children: linkBlockTitle }), callUrlLink && (_jsx(ListCopyControl, { value: callUrlLink, copyText: getLang('calls_menu_link_copy'), doneText: getLang('calls_menu_link_copied') }))] }) })) }));
};
//# sourceMappingURL=CallManagementMenu.js.map