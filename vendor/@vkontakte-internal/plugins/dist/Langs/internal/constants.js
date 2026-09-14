const SECOND = 1;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
/**
 * ⏳ Временные константы, выраженные в секундах
 */
export const TIME_UNITS = {
    SECOND,
    MINUTE,
    HOUR,
    DAY,
};
/**
 * ⏳🈯 Переводы для временных констант в <i>именительном</i> падеже
 *
 * @see {TIME_UNITS}
 * @see {ITimeFormatterCase}
 */
export const TIME_UNIT_LANGS_NOMINATIVE = {
    [TIME_UNITS.MINUTE]: 'global_minutes',
    [TIME_UNITS.HOUR]: 'global_hours',
    [TIME_UNITS.DAY]: 'global_days_accusative',
};
/**
 * ⏳🈯 Переводы для временных констант в <i>винительном</i> падеже
 *
 * @see {TIME_UNITS}
 * @see {ITimeFormatterCase}
 */
export const TIME_UNIT_LANGS_ACCUSATIVE = {
    [TIME_UNITS.MINUTE]: 'global_minutes_accusative',
    [TIME_UNITS.HOUR]: 'global_hours_accusative',
    [TIME_UNITS.DAY]: 'global_days_accusative',
};
/**
 * ⏳🈯 Переводы для временных констант в кратком представлении
 *
 * @see {TIME_UNITS}
 * @see {ITimeFormatterCase}
 */
export const TIME_UNIT_LANGS_NOMINATIVE_SHORT = {
    [TIME_UNITS.MINUTE]: 'global_short_minutes',
    [TIME_UNITS.HOUR]: 'global_short_hours',
    [TIME_UNITS.DAY]: 'global_short_days',
};
/**
 * ⏳🈯 Ассоциативный контейнер между падежами и переводами для временных констант
 *
 * * `Key` — {@link ITimeFormatterCase|падеж}
 * * `Value` — {@link TIME_UNIT_LANGS_ACCUSATIVE|набор переводов для временных констант}
 */
export const TIME_UNIT_LANG_CASE_MAP = {
    nominative: TIME_UNIT_LANGS_NOMINATIVE,
    accusative: TIME_UNIT_LANGS_ACCUSATIVE,
    nominative_short: TIME_UNIT_LANGS_NOMINATIVE_SHORT,
};
//# sourceMappingURL=constants.js.map