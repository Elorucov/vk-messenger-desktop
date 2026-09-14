import { useBrowserEnv } from '../../hooks/misc';
import { isSameYear } from '../../../core/utils/misc';
import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import './DateSeparator.css';
import { useNow } from '../../hooks/useNow';
export const DateSeparator = ({ date, isActive, isVisible, isThemed, }) => {
    const now = useNow(120 * 1000);
    const { lang } = useBrowserEnv();
    const text = lang.use(isSameYear(now, date) ? 'global_short_date' : 'global_date', {
        now,
        date,
    });
    return (React.createElement("span", { role: "heading", "aria-label": text, "aria-level": 3, className: cx('DateSeparator', {
            'DateSeparator--active': isActive,
            'DateSeparator--visible': !isActive || isVisible,
            'DateSeparator--themed': isThemed,
        }) }, text));
};
export const StickyDateSeparator = ({ className, date, registerStickyDate, forcedIsVisible, isThemed }) => {
    const [dateState, setDateState] = useState({
        isActive: false,
        isDisabled: false,
    });
    useEffect(() => {
        return registerStickyDate(date, (isActive, isDisabled) => setDateState({
            isActive,
            isDisabled,
        }));
    }, [date, registerStickyDate]);
    return (React.createElement("div", { role: "presentation", className: cx('StickyDateSeparator', className) },
        React.createElement(DateSeparator, { date: date, isActive: dateState.isActive, isVisible: !dateState.isDisabled || forcedIsVisible, isThemed: isThemed })));
};
StickyDateSeparator.displayName = 'StickyDateSeparator';
//# sourceMappingURL=DateSeparator.js.map