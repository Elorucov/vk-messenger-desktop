import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"Icon24Picture":["@vkontakte/icons",{"className":1}],"Icon24Video":["@vkontakte/icons",{"className":1}]} */
import { useCallback, useState } from 'react';
import { Icon24ArrowUpRectangle, Icon24Video, Icon24Picture, Icon12ChevronUp } from '@vkontakte/icons';
import { CallsIconButton } from '../CallsIconButton';
import { getMediaTestIdSuffix } from '../../helpers/helpers';
import { AppearanceProvider, DropdownActionSheet, AppRootProvider, Appearance, SizeType, } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
export const CallScreenShareButton = ({ isScreenSharingEnabled, onStopScreenShare, onStartScreenShare, onStartFastScreenShare, isScreenShareControlActive, }) => {
    const { getLang } = useLang();
    const [isDropdownShown, setIsDropdownShown] = useState(false);
    const notAllowedHint = getLang('calls_admin_permanent_mute_screen_share');
    const tooltipTitle = isScreenSharingEnabled
        ? getLang('calls_stop_screen_share')
        : getLang('calls_start_screen_share');
    const tooltip = isScreenShareControlActive ? tooltipTitle : notAllowedHint;
    const handleClick = useCallback(() => {
        setIsDropdownShown((isShown) => !isShown);
    }, []);
    const handleShownChange = useCallback((value) => {
        if (!value) {
            // В Сафари onShownChange для дропдауна срабатывает перед вызовом коллбэка onClick
            // при клике на кнопку
            setIsDropdownShown(value);
        }
    }, []);
    const dataTestId = `calls_call_footer_button_sharing${getMediaTestIdSuffix(isScreenSharingEnabled, isScreenShareControlActive)}`;
    if (isScreenSharingEnabled) {
        return (_jsx(CallsIconButton, { tooltip: tooltip, "data-testid": dataTestId, onClick: isScreenSharingEnabled ? onStopScreenShare : onStartScreenShare, active: isScreenSharingEnabled, disabled: !isScreenShareControlActive, children: _jsx(Icon24ArrowUpRectangle, {}) }));
    }
    const chevron = (_jsx(AppearanceProvider, { value: Appearance.DARK, children: _jsx("div", { className: "CallScreenShareButton__dropdownOpenIcon", children: _jsx(Icon12ChevronUp, {}) }) }));
    return (_jsx("div", { className: "CallScreenShareButton__outer", children: _jsx(AppRootProvider, { sizeY: SizeType.REGULAR, children: _jsx(AppearanceProvider, { value: Appearance.DARK, children: _jsx(DropdownActionSheet, { content: _jsxs(_Fragment, { children: [_jsx(DropdownActionSheet.Item, { "data-testid": "calls_call_footer_button_sharing_start", subtitle: getLang('calls_screen_share_action_subtitle'), onClick: onStartScreenShare, before: _jsx(Icon24Picture, { className: "CallScreenShareButton__dropdownItemIcon" }), multiline: true, hovered: true, children: getLang('calls_screen_share_action_title') }), _jsx(DropdownActionSheet.Item, { "data-testid": "calls_call_footer_button_sharing_fast_start", subtitle: getLang('calls_screen_share_fast_action_subtitle'), onClick: onStartFastScreenShare, before: _jsx(Icon24Video, { className: "CallScreenShareButton__dropdownItemIcon" }), multiline: true, children: getLang('calls_screen_share_fast_action_title') })] }), shown: isDropdownShown, onShownChange: handleShownChange, placement: "top-start", trigger: "click", width: 370, children: _jsx(CallsIconButton, { placement: "top-start", disabled: !isScreenShareControlActive, "data-testid": dataTestId, tooltip: tooltip, isTooltipShown: !isDropdownShown, onClick: handleClick, children: _jsxs(_Fragment, { children: [isDropdownShown && chevron, _jsx(Icon24ArrowUpRectangle, {})] }) }) }) }) }) }));
};
//# sourceMappingURL=CallScreenShareButton.js.map