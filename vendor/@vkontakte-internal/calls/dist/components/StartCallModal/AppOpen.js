import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"span":["global",{"className":1}],"Icon56LogoVkMeColor":["@vkontakte-internal/icons-private",{"width":1,"height":1}],"Icon48LogoVkCalls":["@vkontakte-internal/icons-private",{"width":1,"height":1}],"div":["global",{"className":1}],"Subhead":["@vkontakte-internal/vkcom-kit",{"dangerouslySetInnerHTML":1}]} */
import { ModalBox, ModalBody, ModalTextLayout, ModalMedia, Checkbox, Subhead, Button, Spacing, ButtonGroup, ModalDismissButton, } from '@vkontakte-internal/vkcom-kit';
import { Icon48LogoVkCalls, Icon56LogoVkMeColor } from '@vkontakte-internal/icons-private';
import { useLang } from '../../hooks/useLang';
import { FocusTrapWrapper } from '../FocusTrapWrapper/FocusTrapWrapper';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { getStartCallModalOptions } from '../../selectors';
import { useConfig } from '../../services/config';
export const AppOpen = ({ isSkipJoinPage, onSkipJoinPage, onClose, onOpenApp, onJoinCall, isStartNewCall, isHideCheckbox, }) => {
    const { getLang } = useLang();
    const startCallModalOptions = useTypedSelector(getStartCallModalOptions);
    const { sferum } = useConfig();
    const getTitleText = () => {
        const [start, end] = (getLang('calls_press_open_app_in_window_p1') || '').split('{highlighted}');
        const mid = getLang('calls_press_open_app_in_window_p2');
        return (_jsxs(_Fragment, { children: [!!start && _jsxs("span", { children: [start, " "] }), !!mid && _jsxs("span", { className: "StartCallModalModalBox__header--highlighted", children: [mid, " "] }), !!end && _jsx("span", { children: end })] }));
    };
    return (_jsx(FocusTrapWrapper, { children: _jsxs(ModalBox, { children: [_jsx(ModalDismissButton, { onClick: onClose }), _jsx(ModalMedia, { children: sferum ? (_jsx(Icon56LogoVkMeColor, { width: 72, height: 72 })) : (_jsx(Icon48LogoVkCalls, { width: 72, height: 72 })) }), _jsxs(ModalBody, { insetLevel: 1, children: [_jsx(ModalTextLayout
                        // Если окно не появилось, нажмите кнопку ниже
                        , { 
                            // Если окно не появилось, нажмите кнопку ниже
                            subheader: getLang('calls_if_not_appeared_press_btn_above'), children: startCallModalOptions?.title ?? getTitleText() }), _jsxs("div", { className: "StartCallModalModalBox__button-wrap", children: [_jsxs(ButtonGroup, { stretched: true, gap: "s", mode: "vertical", align: "right", children: [_jsx(Button, { size: "m", mode: "primary", stretched: true, onClick: onOpenApp, children: startCallModalOptions?.buttonOpenLabel ?? getLang('calls_open_app_vk_calls') }), _jsx(Button, { size: "m", mode: "tertiary", stretched: true, onClick: onJoinCall, children: isStartNewCall
                                                ? // Начать звонок через браузер
                                                    getLang('calls_start_call_with_browser')
                                                : // Присоединиться к звонку через браузер
                                                    getLang('calls_join_call_in_browser') })] }), _jsx(Spacing, { size: 16 }), !isHideCheckbox && (_jsx(Checkbox, { checked: isSkipJoinPage, onChange: onSkipJoinPage, children: _jsx(Subhead, { dangerouslySetInnerHTML: { __html: getLang('calls_always_open_in_browser_p1') } }) }))] })] })] }) }));
};
//# sourceMappingURL=AppOpen.js.map