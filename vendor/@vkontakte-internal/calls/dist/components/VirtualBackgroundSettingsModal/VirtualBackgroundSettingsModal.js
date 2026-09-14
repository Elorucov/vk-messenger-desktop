import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CallsModal } from '../../components/CallsModal';
import { EVideoOptionType } from '../../hooks/useVideoOptions';
import { useLang } from '../../hooks/useLang';
import { Button, Checkbox } from '@vkontakte-internal/vkcom-kit';
export const VirtualBackgroundSettingsModal = ({ onClose, onSubmit, children, onChangeVideoOption, videoOptions, }) => {
    const { getLang } = useLang();
    return (_jsx(CallsModal, { onClose: onClose, title: getLang('calls_virtual_background'), actionButtons: _jsxs(_Fragment, { children: [_jsx("div", { className: "VirtualBackgroundSettings__options", children: _jsx(Checkbox, { checked: !!videoOptions[EVideoOptionType.IS_VIDEO_MIRRORED], name: EVideoOptionType.IS_VIDEO_MIRRORED, onChange: onChangeVideoOption, noPadding: true, children: getLang('calls_mirror_display_view') }) }), _jsx(Button, { "data-testid": "calls_virtual_bg_cancel", size: "m", onClick: onClose, mode: "tertiary", children: getLang('calls_cancel') }), _jsx(Button, { "data-testid": "calls_virtual_bg_save", size: "m", mode: "primary", onClick: onSubmit, children: getLang('calls_save') })] }), className: "VirtualBackgroundSettingsModal", children: children }));
};
//# sourceMappingURL=VirtualBackgroundSettingsModal.js.map