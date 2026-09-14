import { jsx as _jsx } from "react/jsx-runtime";
import { FormStatus as VKUIFormStatus } from '@vkontakte/vkui';
export const FormStatus = ({ header, title, ...restProps }) => {
    return _jsx(VKUIFormStatus, { title: header || title, ...restProps });
};
//# sourceMappingURL=FormStatus.js.map