import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"span":["global",{"className":2}]} */
import { formatTimeHHMMSS, getHours } from './utils';
import { classNames as cx } from '@vkontakte/vkjs';
export const PlayTime = ({ current, total }) => {
    const currentHours = getHours(current);
    const totalHours = getHours(total);
    const currentFormatted = formatTimeHHMMSS(current);
    const totalFormatted = formatTimeHHMMSS(total);
    const currentClasses = cx('CallsMoviePlayerPlayTime__current', 'CallsMoviePlayerPlayTime__value', {
        'CallsMoviePlayerPlayTime__value--withHours': !!currentHours,
    });
    const totalClasses = cx('CallsMoviePlayerPlayTime__total', 'CallsMoviePlayerPlayTime__value', {
        'CallsMoviePlayerPlayTime__value--withHours': !!totalHours,
    });
    return (_jsxs("div", { className: "CallsMoviePlayerPlayTime", children: [_jsx("span", { className: currentClasses, "data-testid": "calls_watch_together_player_time_current", children: currentFormatted }), "\u00A0/\u00A0", _jsx("span", { className: totalClasses, "data-testid": "calls_watch_together_player_time_all", children: totalFormatted })] }));
};
//# sourceMappingURL=PlayTime.js.map