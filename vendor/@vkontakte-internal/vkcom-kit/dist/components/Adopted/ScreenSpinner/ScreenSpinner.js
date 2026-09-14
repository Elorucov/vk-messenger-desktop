import { jsx as _jsx } from "react/jsx-runtime";
import { ScreenSpinner as VKUIScreenSpinner, } from '@vkontakte/vkui';
// eslint-disable-next-line @vkontakte-internal/vkcom-plugins/no-invalid-component-props-name
export const ScreenSpinnerComponent = ({ mode = 'default', caption, size, label, ...restProps }) => {
    return (_jsx(VKUIScreenSpinner, { label: caption || label, mode: mode === 'default' ? 'shadow' : mode, ...restProps }));
};
const ScreenSpinnerContainer = ({ caption, mode, ...restProps }) => {
    return (_jsx(VKUIScreenSpinner.Container, { label: caption, mode: mode === 'default' ? 'shadow' : mode, ...restProps }));
};
export const ScreenSpinner = Object.assign(ScreenSpinnerComponent, {
    Container: ScreenSpinnerContainer,
    Loader: VKUIScreenSpinner.Loader,
    SwapIcon: VKUIScreenSpinner.SwapIcon,
});
//# sourceMappingURL=ScreenSpinner.js.map