import { ERepeatCallVariant, timezones, capitalize, } from '@vkontakte-internal/calls-core';
import { getTypeOfDay } from './datetime';
const getWeekDayOnEachCase = (date, getLang) => {
    switch (date.getDay()) {
        case 0: // Каждое воскресенье
            return getLang('calls_on_each_sunday');
        case 1: // Каждый понедельник
            return getLang('calls_on_each_monday');
        case 2: // Каждый вторник
            return getLang('calls_on_each_tuesday');
        case 3: // Каждую среду
            return getLang('calls_on_each_wednesday');
        case 4: // Каждый четверг
            return getLang('calls_on_each_thursday');
        case 5: // Каждую пятницу
            return getLang('calls_on_each_friday');
        case 6: // Каждую субботу
            return getLang('calls_on_each_saturday');
        default:
            return '';
    }
};
export const numberWithSignFormatter = new Intl.NumberFormat('en-US', {
    signDisplay: 'exceptZero',
});
export const createDateTimeFormatter = (intlLocale) => {
    return new Intl.DateTimeFormat(intlLocale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    });
};
export const normalizeLocale = (locale) => {
    return locale === 'ru' ? 'ru-RU' : 'en-US';
};
export const getOptionText = (date, rrule, getLang) => {
    switch (rrule) {
        // Каждый день
        case ERepeatCallVariant.Daily:
            return getLang('calls_every_day');
        // Ежемесячно, 18 числа
        case ERepeatCallVariant.Monthly:
            return getLang('calls_day_of_each_month').replace('{date}', String(date.getDate()));
        // Каждый понедельник
        case ERepeatCallVariant.Weekly:
            return getWeekDayOnEachCase(date, getLang);
        // По будням, или по выходным
        case ERepeatCallVariant.WeeklyOnDayType: {
            return capitalize(getTypeOfDay(date, getLang));
        }
        // Каждый год
        case ERepeatCallVariant.Yearly:
            return getLang('calls_each_year');
        // Никогда
        case ERepeatCallVariant.Never:
            return getLang('calls_never');
    }
};
export const createEventTitle = (event, locale) => {
    if (!event) {
        return '';
    }
    let offsetStr = '';
    if (event.timezone) {
        offsetStr = ` (UTC${numberWithSignFormatter.format(timezones[event.timezone]?.offset || 0)})`;
    }
    return createDateTimeFormatter(normalizeLocale(locale)).format(event.start) + offsetStr;
};
export const createInviteStartText = ({ event, meParticipant, getLang, locale }) => {
    if (!event) {
        return '';
    }
    let result = `${getLang('calls_name_invited').replace('{name}', event.displayName || meParticipant?.name || '')}:\n`;
    if (event.title !== getLang('calls_default_meeting_name')) {
        result += `«${event.title}»`;
        result += '\n';
    }
    if (event.repeatRule !== ERepeatCallVariant.Never) {
        result += getOptionText(event.start, event.repeatRule, getLang);
    }
    else {
        result += createEventTitle(event, locale);
    }
    return result;
};
/**
 * Александр Лобастов приглашает на встречу в VK звонках:
 * Каждый месяц
 * Начиная 23 марта 2022 г. в 11:00
 *
 * Присоединиться по ссылке:
 * https://vk.com/call/join/... */
export const createEventDescription = (params) => {
    const { event, getLang, showShortCredentials } = params;
    if (!event?.start) {
        return '';
    }
    let result = createInviteStartText(params);
    result += `\r\n\r\n${getLang('calls_join_by_link')}:\r\n${event.joinLink}`;
    if (event.shortCredentials && showShortCredentials) {
        const shortLinkWithPassword = getLang('calls_short_link_with_password_template')
            .replace('{link}', event.shortCredentials.link_without_password)
            .replace('{password}', event.shortCredentials.password);
        result += `\r\n\r\n${getLang('calls_short_link_with_password')}:\r\n${shortLinkWithPassword}`;
    }
    if (event.broadcastLink) {
        result += `\r\n\r\n${getLang('calls_join_broadcast_link')}:\r\n${event.broadcastLink}`;
    }
    return result;
};
//# sourceMappingURL=createEvent.js.map