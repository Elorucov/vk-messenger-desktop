import { __decorate } from "tslib";
import { scope } from '@vkontakte-internal/di';
import { TIME_UNIT_LANG_CASE_MAP, TIME_UNITS } from './internal';
let Langs = class Langs {
    /**
     * Подставляет динамические значения в строку по ключам
     *
     * @param langText строка, в которую добавлем значения
     * @param tokens значения, подставляемые в строку
     */
    langReplace(langText, tokens) {
        for (const token in tokens) {
            if (!tokens.hasOwnProperty(token)) {
                continue;
            }
            const tokenName = `{${token}}`;
            langText = langText.replace(tokenName, tokens[token]);
        }
        return langText;
    }
    /**
     * 🗓✂️ Возвращает дату в формате **компактной** строки
     *
     * @params
     * @param dateValue преобразуемая дата
     * @param monthVariants варианты названий месяцев. Можно получить из get. Например, get('months_of') или get('months_sm_of')
     * @param options {ICompactDateFormatterOptions} опции для настройки форматирования даты
     *
     * @see Базовое форматирование даты {@link Langs.date}
     */
    compactDate(dateValue, monthVariants = this.getLang('months_of', true), options = {}) {
        const { excludeTime = false } = options;
        let { offset = 0 } = options;
        const dateTime = dateValue.getTime();
        offset *= 1000;
        const curTime = Date.now();
        const curDate = new Date(curTime);
        const date = new Date(dateTime + offset);
        if (!excludeTime &&
            dateTime > curTime &&
            dateTime - curTime < 86400 * 1000 &&
            curDate.getDate() === date.getDate()) {
            return this.date(dateValue, '{hour}:{minute} {am_pm}', monthVariants, options);
        }
        else if (date.getFullYear() !== curDate.getFullYear() || dateTime < curTime - 86400 * 182 * 1000) {
            return this.date(dateValue, this.getLang('global_date', true), monthVariants, options);
        }
        else {
            return this.date(dateValue, this.getLang('global_short_date', true), monthVariants, options);
        }
    }
    /**
     * ⏳ Преобразует время, выраженное в секундах, в формат строки `{DAY} {HOUR} {MINUTE}`
     *
     * @param {number} time время, выраженное в секундах
     * @param {Langs} langs плагин, инкапсулирующий логику работы с переводами
     *
     * @return {string} время в формате строки `{DAY} {HOUR} {MINUTE}`
     */
    formatTime(time, { textCase = 'nominative' } = {}) {
        /**
         * ⏳🈯 Ассоциативный кортеж между временными константами и их представлением в {@link Langs|переводах}
         */
        const TIME_LANGS_TUPLE = [
            /** 1 день */
            [TIME_UNITS.DAY, this.getLang(TIME_UNIT_LANG_CASE_MAP[textCase][TIME_UNITS.DAY], true)],
            /** 1 час */
            [TIME_UNITS.HOUR, this.getLang(TIME_UNIT_LANG_CASE_MAP[textCase][TIME_UNITS.HOUR], true)],
            /** 1 минута */
            [TIME_UNITS.MINUTE, this.getLang(TIME_UNIT_LANG_CASE_MAP[textCase][TIME_UNITS.MINUTE], true)],
        ];
        return TIME_LANGS_TUPLE.reduce((formattedTime, [timeUnit, langForTimeUnit]) => {
            const timeUnitCount = Math.floor(time / timeUnit);
            const formattedTimeUnitCount = timeUnitCount >= 1 ? this.numeric(timeUnitCount, langForTimeUnit) : '';
            time = time % timeUnit;
            return `${formattedTime && formattedTimeUnitCount ? `${formattedTime} ` : formattedTime}${formattedTimeUnitCount}`;
        }, '');
    }
    /**
     * Возвращает наличие кириллицы в текущей локализации
     */
    get isCyrillic() {
        return ['ru', 'be', 'ua', 'uk', 'kz'].includes(this.locale);
    }
};
Langs = __decorate([
    scope.platform({ abstract: true })
], Langs);
export { Langs };
//# sourceMappingURL=Langs.js.map