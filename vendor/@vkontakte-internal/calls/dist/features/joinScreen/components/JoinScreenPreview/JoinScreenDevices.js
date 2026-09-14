import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { DropdownActionSheet, RoundedOverlayButton, TextTooltip } from '@vkontakte-internal/vkcom-kit';
import { useMemo } from 'react';
import styles from './JoinScreenDevices.module.css';
import { classNames } from '@vkontakte/vkjs';
import { offset } from '@floating-ui/core';
import { Icon20CheckCircleOn } from '@vkontakte/icons';
import { useLang } from '../../../../hooks/useLang';
import { DivWithRootRef } from '../../../../components/DivWithRootRef/DivWithRootRef';
export const JoinScreenDevices = ({ micButtonProps, camButtonProps, isMicAvailable, isCamAvailable, isProfileLoaded, disableDevices, checkDisableDevices, }) => {
    const { getLang } = useLang();
    const customMiddlewares = useMemo(() => {
        return [offset({ mainAxis: 8, crossAxis: 10 })];
    }, []);
    const controlButton = (isAvailable, { getRootRef, dropdown: { devices, selectedDeviceId, onDeviceSelect, ...dropdownProps }, ...buttonProps }, tooltipText) => {
        if (disableDevices) {
            return _jsx(RoundedOverlayButton, { ...buttonProps });
        }
        return !isAvailable ? (_jsx(TextTooltip, { text: tooltipText, maxWidth: 259, appearance: "white", placement: "top-end", children: _jsx(DivWithRootRef, { getRootRef: getRootRef, children: _jsx(RoundedOverlayButton, { ...buttonProps }) }) })) : (_jsx(RoundedOverlayButton, { ...buttonProps, rightControlDropdownProps: {
                content: devices.map((device) => {
                    return (_jsx(DropdownActionSheet.Item, { after: device.deviceId === selectedDeviceId ? _jsx(Icon20CheckCircleOn, {}) : null, onClick: () => onDeviceSelect(device.deviceId), children: device.label || '' }, device.deviceId));
                }),
                placement: 'top-end',
                trigger: 'click',
                ariaLabel: getLang('calls_choose_device'),
                customMiddlewares,
                ...dropdownProps,
            } }));
    };
    return (_jsxs("div", { className: classNames(styles.root, !isProfileLoaded && styles.noProfileData), onMouseEnter: checkDisableDevices, children: [controlButton(isMicAvailable, micButtonProps, _jsxs(_Fragment, { children: [_jsx("b", { children: getLang('calls_settings_no_mic') }), _jsx("br", {}), getLang('calls_mic_not_available')] })), controlButton(isCamAvailable, camButtonProps, _jsxs(_Fragment, { children: [_jsx("b", { children: getLang('calls_no_camera') }), _jsx("br", {}), getLang('calls_cam_not_available')] }))] }));
};
//# sourceMappingURL=JoinScreenDevices.js.map