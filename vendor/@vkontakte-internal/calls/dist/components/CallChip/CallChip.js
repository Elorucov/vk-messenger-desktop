import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { memo } from 'react';
import { classNames as cn } from '@vkontakte/vkjs';
export const CallChip = memo(({ value, onClick, selected, children, ...restProps }) => {
    const handleClick = () => onClick(value);
    return (_jsx("div", { className: cn('CallChip', { 'CallChip--selected': !!selected }), onClick: handleClick, ...restProps, children: children }));
});
CallChip.displayName = 'CallChip';
//# sourceMappingURL=CallChip.js.map