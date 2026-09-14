import { jsx as _jsx } from "react/jsx-runtime";
import { ConfigProvider as VKUIConfigProvider, } from '@vkontakte/vkui';
export const ConfigProvider = ({ appearance, colorScheme, ...restProps }) => {
    return _jsx(VKUIConfigProvider, { colorScheme: appearance || colorScheme, ...restProps });
};
//# sourceMappingURL=ConfigProvider.js.map