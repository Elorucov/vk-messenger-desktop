import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon56LogoVkMeColor":["@vkontakte-internal/icons-private",{"width":1,"height":1}],"Icon48LogoVkCalls":["@vkontakte-internal/icons-private",{"width":1,"height":1}],"span":["global",{"dangerouslySetInnerHTML":1}],"div":["global",{"className":1}],"Subhead":["@vkontakte-internal/vkcom-kit",{"dangerouslySetInnerHTML":1}]} */
import { Icon48LogoVkCalls, Icon56LogoVkMeColor } from '@vkontakte-internal/icons-private';
import { Icon16DownloadOutline } from '@vkontakte/icons';
import { Button, ButtonGroup, Checkbox, ModalBody, ModalBox, ModalMedia, ModalTextLayout, Spacing, Subhead, ModalDismissButton, } from '@vkontakte-internal/vkcom-kit';
import { getStartCallModalOptions } from '../../selectors';
import { useLang } from '../../hooks/useLang';
import { FocusTrapWrapper } from '../FocusTrapWrapper/FocusTrapWrapper';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { useConfig } from '../../services/config';
import { useVkmeContext } from '@vkontakte-internal/calls-core';
export function AppDownload({ isSkipJoinPage, onSkipJoinPage, onClose, onDownloadApp, isHideCheckbox, isAnonym, }) {
    const { getLang } = useLang();
    const startCallModalOptions = useTypedSelector(getStartCallModalOptions);
    const { sferum } = useConfig();
    const { isVkme } = useVkmeContext();
    const isVkMessengerDownload = sferum || (isVkme && isAnonym);
    // Попробуйте Звонки ВКонтакте для компьютера
    const label = isVkMessengerDownload
        ? getLang('calls_download_and_install_vk_messenger')
        : getLang('calls_download_and_install_vk_calls');
    return (_jsx(FocusTrapWrapper, { label: label, children: _jsxs(ModalBox, { children: [_jsx(ModalDismissButton, { onClick: onClose }), _jsx(ModalMedia, { children: isVkMessengerDownload ? (_jsx(Icon56LogoVkMeColor, { width: 72, height: 72 })) : (_jsx(Icon48LogoVkCalls, { width: 72, height: 72 })) }), _jsxs(ModalBody, { insetLevel: 1, children: [_jsx(ModalTextLayout
                        // Скачайте и установите приложение — в нём звонки ещё быстрее и стабильнее
                        , { 
                            // Скачайте и установите приложение — в нём звонки ещё быстрее и стабильнее
                            subheader: _jsx("span", { dangerouslySetInnerHTML: {
                                    __html: isVkMessengerDownload
                                        ? getLang('calls_app_download_vkme_modal_description')
                                        : getLang('calls_app_download_modal_description'),
                                } }), children: startCallModalOptions?.title ?? label }), _jsxs("div", { className: "StartCallModalModalBox__button-wrap", children: [_jsx(ButtonGroup, { stretched: true, gap: "s", mode: "vertical", align: "right", children: _jsx(Button, { size: "m", mode: "primary", before: _jsx(Icon16DownloadOutline, {}), stretched: true, onClick: () => onDownloadApp(startCallModalOptions?.desktopClientLink, startCallModalOptions?.desktopClientName), children: getLang('calls_download_app') }) }), _jsx(Spacing, { size: 16 }), !isHideCheckbox && (_jsx(Checkbox, { checked: isSkipJoinPage, onChange: onSkipJoinPage, children: _jsx(Subhead, { dangerouslySetInnerHTML: { __html: getLang('calls_always_open_in_browser_p1') } }) }))] })] })] }) }));
}
//# sourceMappingURL=AppDownload.js.map