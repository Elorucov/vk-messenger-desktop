import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1,"style":1}]} */
import { useMemo } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { getIdForColorCalculation } from '../../helpers/user';
export const BlurredBackground = ({ id, className, children }) => {
    const gradient = useMemo(() => {
        const n = getIdForColorCalculation(id);
        const red = 48 + (n % 3) * 4;
        const green = 48 + (n % 4) * 5;
        const blue = 52 + (n % 5) * 6;
        return `radial-gradient(circle, rgb(${red},${green},${blue}) 40%, #0a0a0a 100%)`;
    }, [id]);
    const classes = cx('BlurredBackground', className);
    return (_jsx("div", { className: classes, style: { background: gradient }, children: children }));
};
//# sourceMappingURL=BlurredBackground.js.map