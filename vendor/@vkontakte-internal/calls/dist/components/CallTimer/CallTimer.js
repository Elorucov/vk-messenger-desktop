import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Добавляет часы для того, чтобы скринридер корректно читал часы-минуты-секунды
 * @param duration время в формате hh:mm:ss либо mm:ss
 *
 * Если в таймере только минуты и секунды, то добавим 00 часов.
 */
const addHoursForScreenReader = (duration) => {
    const durArray = duration.split(':');
    if (durArray.length === 2) {
        durArray.unshift('00');
    }
    return durArray.join(':');
};
export const CallTimer = ({ duration, label = '', dataTestId = 'calls_call_timer' }) => (_jsx("div", { className: "CallTimer", "data-testid": dataTestId, role: "timer", "aria-label": `${label} ${addHoursForScreenReader(duration)}`, "data-duration": duration }));
//# sourceMappingURL=CallTimer.js.map