import { getAgeDiff } from '../../../helpers/time';
var E_DATE_PARTS;
(function (E_DATE_PARTS) {
    E_DATE_PARTS["HOURS"] = "hours";
    E_DATE_PARTS["MINUTES"] = "minutes";
    E_DATE_PARTS["SECONDS"] = "seconds";
})(E_DATE_PARTS || (E_DATE_PARTS = {}));
export function formatTimeDiff(ts, langUtils) {
    const { getLang, langNumeric, langReplace } = langUtils;
    const values = getAgeDiff(ts, true);
    const keys = [E_DATE_PARTS.HOURS, E_DATE_PARTS.MINUTES, E_DATE_PARTS.SECONDS];
    for (const key of keys) {
        const value = values[key];
        if (value) {
            switch (key) {
                case E_DATE_PARTS.HOURS: {
                    return langReplace(langNumeric(value, 'voicerooms_promotion_request_time_minutes', getLang('voicerooms_promotion_request_time_hours', 'raw')), {
                        time: String(value),
                    });
                }
                case E_DATE_PARTS.MINUTES: {
                    return langReplace(langNumeric(value, 'voicerooms_promotion_request_time_minutes', getLang('voicerooms_promotion_request_time_minutes', 'raw')), {
                        time: String(value),
                    });
                }
                case E_DATE_PARTS.SECONDS: {
                    return getLang('voicerooms_promotion_request_time_now');
                }
            }
            return getLang('voicerooms_promotion_request_time_now');
        }
    }
    return getLang('voicerooms_promotion_request_time_now');
}
//# sourceMappingURL=helpers.js.map