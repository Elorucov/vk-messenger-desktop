import { jsx as _jsx } from "react/jsx-runtime";
import { classNames as cx } from '@vkontakte/vkjs';
import Input from '../Input/Input';
export const BlockSearchInput = ({ className, getRef, ...props }) => {
    return _jsx(Input, { ...props, className: cx(className, 'BlockSearchInput'), getRef: getRef });
};
//# sourceMappingURL=BlockSearchInput.js.map