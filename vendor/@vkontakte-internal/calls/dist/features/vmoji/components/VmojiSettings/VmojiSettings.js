import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}]} */
import { getMiniappVmojiEditLink } from '../../../../helpers/url';
import { VmojiCharacterIdLoadingStatus } from '../../../../services/vmoji';
import { Image, Skeleton, Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../../hooks/useLang';
import { getCDNLink } from '@vkontakte-internal/calls-core';
export const VmojiSettings = ({ isVmojiCreated, isVmojiPreviewGenerated, isVmojiCapture, vmojiPreviewSrc, loadingStatus, onToggle, onEdit, onCreate, }) => {
    const { getLang } = useLang();
    let onMainAction;
    let mainActionText;
    if (isVmojiCreated) {
        onMainAction = onToggle;
        mainActionText = !isVmojiCapture
            ? getLang('calls_vmoji_settings_enable')
            : getLang('calls_vmoji_settings_disable');
    }
    else {
        onMainAction = onCreate;
        mainActionText = getLang('calls_vmoji_settings_create_character');
    }
    const isEditingLoading = loadingStatus === VmojiCharacterIdLoadingStatus.LOADING;
    const isEditingDisabled = loadingStatus === VmojiCharacterIdLoadingStatus.FAILED;
    const vmojiPreviewPlaceholder = isVmojiCreated ? (_jsx(Skeleton, { width: 180, height: 180, borderRadius: 18 })) : (
    // eslint-disable-next-line react/forbid-elements
    _jsx("img", { src: getCDNLink('calls-vmoji-intro-1x.png', 2), srcSet: `${getCDNLink('calls-vmoji-intro-2x.png', 2)} 2x`, width: "282", height: "168", alt: "" }));
    return (_jsxs("div", { className: "VmojiSettings", children: [vmojiPreviewSrc ? (
            // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
            _jsx(Image, { src: vmojiPreviewSrc, size: 180, borderRadius: "l" })) : (vmojiPreviewPlaceholder), _jsx("div", { className: "VmojiSettings__title", children: getLang('calls_vmoji_settings_title') }), _jsx("div", { className: "VmojiSettings__subtitle", children: getLang('calls_vmoji_settings_subtitle') }), _jsx("div", { className: "VmojiSettings__btn-main", children: isEditingLoading || isEditingDisabled ? (_jsx(Button, { size: "m", href: getMiniappVmojiEditLink(), target: "_blank", children: mainActionText })) : (_jsx(Button, { size: "m", onClick: onMainAction, disabled: isVmojiCreated && !isVmojiPreviewGenerated, children: mainActionText })) }), isVmojiCreated && (_jsx("div", { className: "VmojiSettings__btn-edit", children: _jsx(Button, { loading: isEditingLoading, disabled: isEditingDisabled, mode: "tertiary", size: "m", onClick: onEdit, children: getLang('calls_vmoji_settings_edit') }) }))] }));
};
//# sourceMappingURL=VmojiSettings.js.map