import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { dateMonthFormat, getRepeatDescription } from '../../helpers';
import { useLangs } from '@vkontakte-internal/plugins';
import { timeFormat, isSameDate } from './utils';
import { ERepeatCallVariant } from '@vkontakte-internal/calls-core';
import { Icon12LiveBadgeColor } from '@vkontakte-internal/icons-private';
import { Icon12Repost } from '@vkontakte/icons';
import { EllipsisText, Flex, getColorClass, Spacing } from '@vkontakte-internal/vkcom-kit';
/** подпись под заголовком звонка */
export function Description({ call, isToday, isTomorrow, }) {
    const langs = useLangs();
    /** время начала и окончания звонка */
    const time = (() => {
        const startDate = new Date((call.schedule?.time || 0) * 1000);
        const endDate = new Date(((call.schedule?.time || 0) + (call.schedule?.duration || 0)) * 1000);
        const start = timeFormat.format(startDate);
        const end = timeFormat.format(endDate);
        return {
            start,
            startDate,
            end,
            endDate,
        };
    })();
    /** описание повторения или в какой именно день мероприятие */
    const dateOrRepeatText = (() => {
        const isTodayOrTomorrow = Boolean(isToday || isTomorrow);
        let desc = getRepeatDescription(time.startDate, call.schedule?.recurrence_rule || 'never', langs.getLang.bind(langs), langs.locale, isTodayOrTomorrow);
        let prefix = ', ';
        if (!desc) {
            // если единовременное мероприятие
            // либо если даты начала и конца звокна разные
            if (isTodayOrTomorrow || !isSameDate(time.startDate, time.endDate)) {
                // если оно сегодня или завтра -> оставляем только время
                return '';
            }
            desc = dateMonthFormat(time.startDate, langs.locale);
        }
        if (isTodayOrTomorrow || call.schedule?.recurrence_rule === ERepeatCallVariant.Daily) {
            prefix = ' · ';
        }
        return `${prefix}${desc}`;
    })();
    const timeInterval = (() => {
        if (isSameDate(time.startDate, time.endDate)) {
            return `${time.start} — ${time.end}`;
        }
        const startDesc = `${dateMonthFormat(time.startDate, langs.locale)} ${time.start}`;
        const endDesc = `${dateMonthFormat(time.endDate, langs.locale)} ${time.end}`;
        return `${startDesc} — ${endDesc}`;
    })();
    return (_jsxs("div", { className: getColorClass('color_text_secondary'), "data-testid": "calls_scheduled_calls_item_desc", children: [_jsxs(Flex, { align: "center", children: [call.broadcast?.video_id && (_jsxs(_Fragment, { children: [_jsx(Icon12LiveBadgeColor, { className: getColorClass('color_icon_tertiary') }), _jsx(Spacing, { size: 6, mode: "vertical" })] })), call.schedule?.recurrence_rule !== 'never' && (_jsxs(_Fragment, { children: [_jsx(Icon12Repost, { className: getColorClass('color_icon_tertiary') }), _jsx(Spacing, { size: 6, mode: "vertical" })] })), _jsx(EllipsisText, { children: `${timeInterval}${dateOrRepeatText}` })] }), call.group && _jsx(EllipsisText, { children: call.group.name })] }));
}
//# sourceMappingURL=Description.js.map