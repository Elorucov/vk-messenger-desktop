import { ERepeatCallVariant } from '@vkontakte-internal/calls-core';
/** маппер для приведения `rrule` в формат фронта */
export const mapRecurrenceRule = (rrule) => {
    switch (rrule) {
        case 'weekdays':
        case 'weekend': {
            return ERepeatCallVariant.WeeklyOnDayType;
        }
        case undefined: {
            return ERepeatCallVariant.Never;
        }
        default: {
            return rrule;
        }
    }
};
//# sourceMappingURL=mapRecurrenceRule.js.map