import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"button":["global",{"className":1}],"figure":["global",{"className":1}]} */
import { forwardRef } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
export var CallButtonTypes;
(function (CallButtonTypes) {
    CallButtonTypes["POSITIVE"] = "positive";
    CallButtonTypes["NEGATIVE"] = "negative";
    CallButtonTypes["REGULAR"] = "regular";
    CallButtonTypes["ON"] = "on";
    CallButtonTypes["OFF"] = "off";
    CallButtonTypes["CLEAR"] = "clear";
    CallButtonTypes["DISABLED"] = "disabled";
})(CallButtonTypes || (CallButtonTypes = {}));
export const CallButton = forwardRef(({ icon, text, type, className, ...restProps }, ref) => {
    const classes = cx('CallButton', `CallButton--${type}`, className, { 'CallButton--withText': !!text }, 'CallButton--withAnimation');
    const classesIcon = cx('CallButton__icon', 'CallButton__icon--withAnimation');
    const props = {
        ...restProps,
        onMouseDown: (e) => {
            e.preventDefault();
            if (restProps.onMouseDown) {
                restProps.onMouseDown(e);
            }
        },
    };
    return (_jsxs("button", { className: classes, ...props, disabled: props.disabled || type === CallButtonTypes.DISABLED, ref: ref, children: [_jsx("figure", { className: classesIcon, children: icon }), text] }));
});
CallButton.displayName = 'CallButton';
//# sourceMappingURL=CallButton.js.map