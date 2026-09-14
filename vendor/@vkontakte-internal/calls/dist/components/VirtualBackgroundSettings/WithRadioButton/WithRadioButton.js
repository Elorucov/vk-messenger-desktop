import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2,"style":1}]} */
import { useCallback } from 'react';
import { Radio } from '@vkontakte-internal/vkcom-kit';
import { classNames as cx } from '@vkontakte/vkjs';
export const WithRadioButton = ({ children, className, style, passedRef, ...props }) => {
    /**
     * затычка для:
     * @see https://stackoverflow.com/questions/36715901/reactjs-error-warning/36716016
     */
    const onChange = useCallback(() => { }, []);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: cx(className), style: style, ref: passedRef, children: children }), _jsx("div", { className: "VirtualBackgroundSettings__item--radio", children: _jsx(Radio, { ...props, onChange: onChange }) })] }));
};
//# sourceMappingURL=WithRadioButton.js.map