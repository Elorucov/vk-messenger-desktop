/**
 * Убираем правило про ! оператор, потому что работаем с легаси форматом данных,
 * который совсем не был рассчитан на типизацию.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { initLang, langWordNumeric, langNumeric, langSex, } from '@vkontakte-internal/vkjs/lib/Lang';
import { decodeHTMLEntities } from '@vkontakte/vkjs';
import P from 'parsimmon';
import { Time } from '../../core/utils/time';
import { exhaustivenessCheck, isSameYear } from '../../core/utils/misc';
const DEBUG_LS_KEY = 'reforged-lang-debug';
export class Lang {
    logger;
    translations;
    isDebug = false;
    locale;
    decodedKeys = {};
    constructor(logger, translations) {
        this.logger = logger;
        this.translations = translations;
        initLang({
            source: () => translations.keys,
            config: () => translations.config,
        });
        this.locale = translations.config.locale;
        try {
            this.isDebug = !!localStorage.getItem(DEBUG_LS_KEY);
        }
        catch { }
    }
    toggleDebug = () => {
        this.isDebug = !this.isDebug;
        try {
            if (this.isDebug) {
                localStorage.setItem(DEBUG_LS_KEY, 'true');
            }
            else {
                localStorage.removeItem(DEBUG_LS_KEY);
            }
        }
        catch { }
        window.location.reload();
    };
    use = (key, ...opts) => {
        return this.fold(key, (x) => x, (xs) => xs.join(''), ...opts);
    };
    fold = (key, lift, join, ...opts) => {
        if (this.isDebug) {
            return lift(key);
        }
        try {
            const params = opts[0];
            let template = this.getTemplate(key);
            if (!template) {
                return lift(key);
            }
            if (!params) {
                if (Array.isArray(template)) {
                    return lift(key);
                }
                return lift(template);
            }
            if ('num' in params) {
                // @ts-expect-error
                params.values = {
                    formatted: this.formatNumber(params.num, params.formatted),
                    // @ts-expect-error
                    ...(params.values || {}),
                };
                if (params.formatted === 'short') {
                    params.num = Math.min(1e3, params.num);
                }
                if ('fallback' in params) {
                    template = langWordNumeric(params.num, template, 
                    // @ts-expect-error
                    this.getTemplate(params.fallback)).toString();
                }
                else {
                    template = langNumeric(params.num, template).toString();
                }
            }
            else if ('sex' in params) {
                const sexReverseMap = {
                    female: '1',
                    male: '2',
                    unknown: '*',
                };
                template = langSex(sexReverseMap[params.sex], template);
            }
            else if ('now' in params) {
                const now = new Date(params.now);
                const date = new Date(params.date);
                if (isTodayDate(now, date)) {
                    template = template[3];
                }
                else if (isPrevDayDate(now, date)) {
                    template = template[2];
                }
                else if (isNextDayDate(now, date)) {
                    template = template[4];
                }
                else {
                    template = template[1];
                }
                // @ts-expect-error
                params.values = {
                    ...this.splitDate(date, {
                        shortMonths: params.shortMonths,
                        genMonths: params.genMonths,
                        capMonths: params.capMonths,
                        shortWeekdays: params.shortWeekdays,
                    }),
                    // @ts-expect-error
                    ...(params.values || {}),
                };
            }
            if (Array.isArray(template) || !template) {
                return lift(key);
            }
            if ('values' in params && Object.keys(params.values).length > 0) {
                const parsed = parser.Grammar.tryParse(template);
                const reducer = (acc, token) => {
                    switch (token.type) {
                        case 'StaticPlaceholder': {
                            // @ts-expect-error
                            const value = params.values[token.name];
                            acc.push(value);
                            break;
                        }
                        case 'FunctionPlaceholder': {
                            // @ts-expect-error
                            const fn = params.values[token.name];
                            const inner = token.inner.reduce(reducer, []);
                            acc.push(fn(join(inner)));
                            break;
                        }
                        case 'Text':
                            acc.push(lift(token.text));
                            break;
                        default:
                            const _typeguard = token;
                    }
                    return acc;
                };
                const subs = parsed.reduce(reducer, []);
                return join(subs);
            }
            return lift(template);
        }
        catch {
            return lift(key);
        }
    };
    /*
     * time: 16:16 | 11:23
     * time-ago: только что | две минуты назад | 6 часов назад | datetime
     */
    formatDate = (timestamp, opts) => {
        const date = new Date(timestamp);
        const now = new Date(opts.now);
        const { shortMonths = false } = opts;
        try {
            switch (opts.variant) {
                case 'time': {
                    const { hour, minute, am_pm } = this.splitDate(date);
                    return `${hour}:${minute} ${am_pm}`;
                }
                case 'time-ago': {
                    const diffSecs = Math.floor((now.getTime() - timestamp) / 1000);
                    switch (true) {
                        case diffSecs < 60: {
                            return this.use('global_just_now');
                        }
                        case diffSecs < 60 * 60: {
                            const mins = Math.floor(diffSecs / 60);
                            return this.use('global_word_mins_ago', {
                                num: mins,
                                fallback: 'global_mins_ago',
                            });
                        }
                        case diffSecs < 60 * 60 * 12: {
                            const hours = Math.floor(diffSecs / 60 / 60);
                            return this.use('global_word_hours_ago', {
                                num: hours,
                                fallback: 'global_hours_ago',
                            });
                        }
                        default:
                            return isSameYear(now, new Date(timestamp))
                                ? this.use('global_short_date_time', {
                                    now: now.getTime(),
                                    date: timestamp,
                                    shortMonths,
                                })
                                : this.use('global_date_year_time', {
                                    now: now.getTime(),
                                    date: timestamp,
                                    shortMonths,
                                });
                    }
                }
                default:
                    return exhaustivenessCheck(opts.variant);
            }
        }
        catch (err) {
            this.logger.error(`[LANG] Ошибка форматирования даты ${opts.variant}`, err);
            return date.toISOString();
        }
    };
    formatNumber = (n, variant = 'regular') => {
        if (variant === 'regular') {
            return n.toString().split('.').join(this.translations.config.numDec);
        }
        let short;
        let suffix;
        switch (true) {
            case n > 1e9:
                short = n / 1e9;
                suffix = 'B';
                break;
            case n > 1e6:
                short = n / 1e6;
                suffix = 'M';
                break;
            case n > 1e3:
                short = n / 1e3;
                suffix = 'K';
                break;
            default:
                short = n;
                suffix = '';
        }
        const [beforePoint, afterPoint] = short.toFixed(1).split('.');
        const parts = Number(afterPoint) ? [beforePoint, afterPoint] : [beforePoint];
        return parts.join(this.translations.config.numDec) + suffix;
    };
    getTemplate = (key) => {
        if (!this.decodedKeys[key]) {
            const template = this.translations.keys[key];
            if (!template) {
                return;
            }
            this.decodedKeys[key] = Array.isArray(template)
                ? template.map(decodeHTML)
                : decodeHTML(template);
        }
        return this.decodedKeys[key];
    };
    splitDate = (date, opts = {}) => {
        const getMonthKeys = () => {
            const shortMonths = opts.shortMonths ?? false;
            const genMonths = opts.genMonths ?? true;
            const capMonths = opts.capMonths ?? false;
            if (shortMonths) {
                return this.getTemplate('global_months_short_of');
            }
            const pattern = `${genMonths}_${capMonths}`;
            switch (pattern) {
                case 'false_false':
                    return this.getTemplate('global_months');
                case 'true_true':
                    return this.getTemplate('global_months_cap_of');
                case 'true_false':
                    return this.getTemplate('global_months_of');
                case 'false_true':
                    return this.getTemplate('global_months_cap');
                default:
                    return exhaustivenessCheck(pattern);
            }
        };
        const monthNames = getMonthKeys();
        const weekdayNames = opts.shortWeekdays
            ? this.getTemplate('global_week_days_short')
            : this.getTemplate('global_week_days');
        const minute = date.getMinutes().toString().padStart(2, '0');
        let hour = date.getHours().toString().padStart(2, '0');
        const day = date.getDate();
        const month = monthNames[date.getMonth()] || monthNames[0];
        const weekday = weekdayNames[(date.getDay() + 6) % 7] || weekdayNames[0];
        const year = date.getFullYear();
        let am_pm = '';
        const { timeSys } = this.translations.config;
        if (timeSys[0] === '12hour') {
            am_pm = date.getHours() > 11 ? timeSys[2] : timeSys[1];
            hour = (date.getHours() % 12 === 0 ? 12 : date.getHours() % 12)
                .toString()
                .padStart(2, '0');
        }
        return { year, month, weekday, day, hour, minute, am_pm };
    };
    /**
     * Освободить ресурсы
     */
    dispose() {
        // пока здесь нечего подчищать
    }
}
function decodeHTML(template) {
    const templateWithBrakes = decodeHTMLEntities(template);
    return templateWithBrakes.replace(/<br\s*\/?>/gi, '\n');
}
/**
 * Проверяет, что переданная дата является сегодняшним днём
 */
function isTodayDate(now, date) {
    const d = now.getDate();
    const m = now.getMonth();
    const y = now.getFullYear();
    return (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d);
}
/**
 * Проверяет, что переданная дата - вчерашний день
 */
function isPrevDayDate(now, date) {
    const prevDayDate = new Date(date.getTime() + Time.Day);
    return isTodayDate(now, prevDayDate);
}
/**
 * Проверяет, что переданная дата - завтрашний день
 */
function isNextDayDate(now, date) {
    const nextDayDate = new Date(date.getTime() - Time.Day);
    return isTodayDate(now, nextDayDate);
}
const parser = P.createLanguage({
    Grammar: (r) => P.alt(r.FunctionPlaceholder, r.StaticPlaceholder, r.Text).many(),
    StaticPlaceholder: (r) => P.seqObj(P.string('{'), ['name', r.Name], P.string('}')).map(({ name }) => ({
        type: 'StaticPlaceholder',
        name,
    })),
    FunctionPlaceholder: (r) => P.seqObj(P.string('{'), ['name', r.Name], P.string('}')).chain(({ name }) => {
        const inner = P.alt(r.StaticPlaceholder, r.Text)
            .many()
            .skip(P.string(`{/${name}}`));
        return inner.map((inner) => ({
            type: 'FunctionPlaceholder',
            name,
            inner,
        }));
    }),
    Name: () => P.regex(/[a-zA-Z0-9_]+/),
    Text: () => P.regex(/[^{}]+/).map((text) => ({
        type: 'Text',
        text: decodeHTMLEntities(text),
    })),
});
//# sourceMappingURL=Lang.js.map