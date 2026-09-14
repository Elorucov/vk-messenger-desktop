import React, { forwardRef } from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { useNow } from '../../hooks/useNow';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
export const Time = forwardRef(({ formattedDate, ariaVersionFormattedDate, withDot, className }, ref) => {
    return (React.createElement(React.Fragment, null,
        React.createElement("span", { ref: ref, className: className, "aria-hidden": true },
            withDot ? '· ' : '',
            formattedDate),
        React.createElement(VisuallyHidden, { Component: "span" }, ariaVersionFormattedDate)));
});
export const FormattedDate = ({ timestamp, variant, withDot, className, shortMonths, }) => {
    const { lang } = useBrowserEnv();
    const now = useNow();
    const formattedDate = lang.formatDate(timestamp, {
        now,
        variant,
        shortMonths,
    });
    const ariaVersionFormattedDate = lang.formatDate(timestamp, {
        now,
        variant: 'time-ago',
        shortMonths,
    });
    return (React.createElement(Time, { className: className, withDot: withDot, formattedDate: formattedDate, ariaVersionFormattedDate: ariaVersionFormattedDate }));
};
//# sourceMappingURL=Time.js.map