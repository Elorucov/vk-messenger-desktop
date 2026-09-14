import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
export const Stub = (props) => {
    const { children, className, ...nativeProps } = props;
    return (_jsx("div", { ...nativeProps, "data-testid": "calls_call_stub", className: classNames('CallsStub', className), children: children || 'No results.' }));
};
//# sourceMappingURL=Stub.js.map