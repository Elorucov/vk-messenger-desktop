import { dateFormatter } from '../../constants';
import { capitalize } from '../../helpers/helpers';
import { hour, numberFormatter, numberWithSignFormatter } from './constants';
import { isUndefined } from '@vkontakte/vkjs';
import { ERepeatCallVariant, mailRuWeekdays, ETranslationPlannedTimeVariant, timezones, } from '@vkontakte-internal/calls-core';
export const normalizeLocale = (locale) => {
    return locale === 'ru' ? 'ru-RU' : 'en-US';
};
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
export const dateToUnixTimestamp = (date) => {
    if (typeof date === 'number') {
        return Math.round(date / 1000);
    }
    return Math.round(date.valueOf() / 1000);
};
const formatTimes = (date, duration = hour, withOffset = false) => {
    let startDate = date.valueOf();
    let endDate = startDate + duration;
    if (withOffset) {
        const offset = new Date().getTimezoneOffset() * 60 * 1000;
        startDate = startDate + offset;
        endDate = endDate + offset;
    }
    const start = dateToUnixTimestamp(startDate);
    const end = dateToUnixTimestamp(endDate);
    return { start, end };
};
export const convertTimezoneToUTCZero = (date, timezone) => {
    const _d = typeof date === 'number' ? new Date(date) : date;
    if (!timezone) {
        return _d;
    }
    const timezoneOffset = (timezones[timezone]?.offset || 0) * 60 * 60 * 1000;
    const localOffset = _d.getTimezoneOffset() * 60 * 1000;
    const timestampUTCZero = _d.valueOf() - timezoneOffset - localOffset;
    return new Date(timestampUTCZero);
};
export const setDateToTimezoneOffset = (date, timezone) => {
    if (!timezone) {
        return date;
    }
    const timezoneOffset = (timezones[timezone]?.offset || 0) * 60 * 60 * 1000;
    const localOffset = date.getTimezoneOffset() * 60 * 1000;
    const timestampUTCZero = date.valueOf() + timezoneOffset + localOffset;
    return new Date(timestampUTCZero);
};
function createMailRuRecurrence(event) {
    const { repeatRule, repeatRuleEnd, timezone } = event;
    if (repeatRule === ERepeatCallVariant.Never) {
        return undefined;
    }
    function getFreq() {
        switch (repeatRule) {
            case ERepeatCallVariant.Daily:
                return 'DAILY';
            case ERepeatCallVariant.Weekly:
            case ERepeatCallVariant.WeeklyOnDayType:
                return 'WEEKLY';
            case ERepeatCallVariant.Monthly:
                return 'MONTHLY';
            case ERepeatCallVariant.Yearly:
                return 'YEARLY';
        }
        // for correct TS checks
        return 'YEARLY';
    }
    function getWeekdays(startDate) {
        if (repeatRule === ERepeatCallVariant.Weekly) {
            return [mailRuWeekdays[startDate.getDay()]];
        }
        else if (repeatRule === ERepeatCallVariant.WeeklyOnDayType) {
            switch (startDate.getDay()) {
                case 0:
                case 6:
                    return ['SA', 'SU'];
                default:
                    return ['MO', 'TU', 'WE', 'TH', 'FR'];
            }
        }
    }
    function getMonthdays(startDate) {
        if (repeatRule === ERepeatCallVariant.Monthly) {
            return [startDate.getDate()];
        }
    }
    const startDate = event.start;
    const result = {
        count: undefined,
        freq: getFreq(),
        interval: 1,
        monthdays: getMonthdays(startDate),
        until: repeatRuleEnd ? convertTimezoneToUTCZero(repeatRuleEnd, timezone) : undefined,
        weekdays: getWeekdays(startDate),
    };
    return result;
}
const getMailRuUrlParams = (event) => {
    const urlParams = {
        title: event.title,
        from: event.from.toISOString(),
        to: event.to.toISOString(),
    };
    ['description', 'fullDay', 'location', 'call'].forEach((key) => {
        if (event[key]) {
            urlParams[key] = String(event[key]);
        }
    });
    if (event.recurrence) {
        const { recurrence: rec } = event;
        urlParams.recurrence = JSON.stringify({
            freq: rec.freq,
            interval: rec.interval,
            count: rec.count ? rec.count : null,
            until: rec.until ? rec.until.toISOString() : null,
            weekdays: rec.freq === 'WEEKLY' && rec.weekdays
                ? rec.weekdays.map((day) => ({
                    day,
                    offset: null,
                }))
                : null,
            monthdays: rec.freq === 'MONTHLY' && rec.monthdays ? rec.monthdays : null,
            months: null,
        });
    }
    if (event.reminders) {
        urlParams.reminders = JSON.stringify(event.reminders);
    }
    return new URLSearchParams(urlParams);
};
export const createMailRuCalendarUrl = (calendarEvent) => {
    const { hostname } = window.location;
    const startDate = convertTimezoneToUTCZero(calendarEvent.start, calendarEvent.timezone);
    const params = getMailRuUrlParams({
        title: calendarEvent.title,
        from: startDate,
        fullDay: calendarEvent.duration === 86400000,
        to: new Date(startDate.getTime() + calendarEvent.duration),
        call: calendarEvent.joinLink,
        description: calendarEvent.description,
        location: calendarEvent.location,
        recurrence: calendarEvent.repeatRule ? createMailRuRecurrence(calendarEvent) : undefined,
    });
    params.append('action', 'createEvent');
    if (!hostname.includes('localhost')) {
        params.append('createContent', window.location.hostname);
    }
    return `https://x.calendar.mail.ru/?${params.toString().replace(/\+/gi, '%20')}`;
};
export const createGoogleCalendarUrl = (calendarEvent) => {
    const startDate = convertTimezoneToUTCZero(calendarEvent.start, calendarEvent.timezone);
    const { end, start } = formatTimes(startDate, calendarEvent.duration, true);
    const details = {
        action: 'TEMPLATE',
        dates: dateToTZFormat(start * 1000) + '/' + dateToTZFormat(end * 1000),
        text: calendarEvent.title,
        details: calendarEvent.description,
        location: calendarEvent.location,
        trp: 'true',
    };
    const params = new URLSearchParams(details);
    if (calendarEvent.repeatRule) {
        params.append('recur', `RRULE:${getRRule(calendarEvent.start, calendarEvent.repeatRule, calendarEvent.repeatRuleEnd)}`);
    }
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
export const openLinkInNewTab = (href, startDate, targetBlank = true) => {
    const $el = document.createElement('a');
    $el.download = `VK_Calls_Meeting_${dateFormatter.format(startDate)}.ics`;
    Object.assign($el, {
        target: targetBlank ? '_blank' : '_self',
        href: href,
    }).click();
    $el.remove();
};
/** @returns 20220323T085042Z */
function dateToTZFormat(date) {
    const _d = typeof date === 'number' ? new Date(date) : date;
    let result = _d.getFullYear().toString();
    result += numberFormatter.format(_d.getMonth() + 1); // 00-11 -> 01-12
    result += numberFormatter.format(_d.getDate());
    result += 'T';
    result += numberFormatter.format(_d.getHours());
    result += numberFormatter.format(_d.getMinutes());
    result += '00Z';
    return result;
}
function getRRule(date, repeatRule, end) {
    let result = '';
    switch (repeatRule) {
        case ERepeatCallVariant.Never:
        case undefined:
            break; // do nothing
        case ERepeatCallVariant.Daily:
            result = 'FREQ=DAILY;INTERVAL=1';
            break;
        case ERepeatCallVariant.Monthly:
            result = `FREQ=MONTHLY;BYMONTHDAY=${date.getDate()};INTERVAL=1`;
            break;
        case ERepeatCallVariant.Weekly:
            result = 'FREQ=WEEKLY;INTERVAL=1';
            break;
        case ERepeatCallVariant.WeeklyOnDayType: {
            if (isDayWorkday(date)) {
                result = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1';
            }
            else {
                result = 'FREQ=WEEKLY;BYDAY=SU,SA;INTERVAL=1';
            }
            break;
        }
        case ERepeatCallVariant.Yearly:
            result = `FREQ=YEARLY;BYMONTH=${date.getMonth() + 1};BYMONTHDAY=${date.getDate()}`;
            break;
    }
    if (end) {
        switch (repeatRule) {
            case ERepeatCallVariant.Daily:
            case ERepeatCallVariant.Monthly:
            case ERepeatCallVariant.Weekly:
            case ERepeatCallVariant.WeeklyOnDayType:
            case ERepeatCallVariant.Yearly:
                result += `;UNTIL=${dateToTZFormat(end)}`;
                break;
        }
    }
    return result;
}
const formatText = (text) => {
    return text
        .replace(/,/gm, ',')
        .replace(/;/gm, ';')
        .replace(/\r\n/gm, '\n')
        .replace(/\n/gm, '\\n')
        .replace(/(\\n)[\s\t]+/gm, '\\n');
};
export const ics = (calendarEvent) => {
    const formattedDescription = formatText(calendarEvent.description || '');
    const formattedLocation = formatText(calendarEvent.location || '');
    const { start, end } = formatTimes(calendarEvent.start, calendarEvent.duration);
    const timezone = calendarEvent.timezone || new Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startTime = dateToTZFormat(start * 1000);
    const endTime = dateToTZFormat(end * 1000);
    const calendarChunks = [
        {
            key: 'BEGIN',
            value: 'VCALENDAR',
        },
        {
            key: 'VERSION',
            value: '2.0',
        },
        {
            key: 'PRODID',
            value: '-//VK//VK Calls Web//',
        },
        {
            key: 'CALSCALE',
            value: 'GREGORIAN',
        },
        {
            key: 'METHOD',
            value: 'PUBLISH',
        },
        {
            key: 'CLASS',
            value: 'PUBLIC',
        },
        {
            key: 'TZURL',
            value: `http://tzurl.org/zoneinfo-outlook/${timezone}`,
        },
        {
            key: 'X-LIC-LOCATION',
            value: timezone,
        },
        {
            key: 'BEGIN',
            value: 'VTIMEZONE',
        },
        {
            key: 'TZID',
            value: timezone,
        },
        {
            key: 'END',
            value: 'VTIMEZONE',
        },
        {
            key: 'BEGIN',
            value: 'VEVENT',
        },
        {
            key: 'CREATED',
            value: startTime,
        },
        {
            key: 'DTSTART',
            value: `TZID=${timezone}:${startTime.slice(0, -1)}`,
        },
        {
            key: 'DTEND',
            value: `TZID=${timezone}:${endTime.slice(0, -1)}`,
        },
        {
            key: 'TZID',
            value: timezone,
        },
        {
            key: 'SUMMARY',
            value: calendarEvent.title,
        },
        {
            key: 'DESCRIPTION',
            value: formattedDescription,
        },
        {
            key: 'LOCATION',
            value: formattedLocation,
        },
        {
            key: 'ORGANIZER',
            value: calendarEvent.organizer,
        },
        {
            key: 'RRULE',
            value: getRRule(calendarEvent.start, calendarEvent.repeatRule, calendarEvent.repeatRuleEnd),
        },
        {
            key: 'END',
            value: 'VEVENT',
        },
        {
            key: 'END',
            value: 'VCALENDAR',
        },
    ];
    let calendarUrl = '';
    calendarChunks.forEach((chunk) => {
        if (!chunk.value) {
            return;
        }
        switch (true) {
            case chunk.key === 'DTSTART':
            case chunk.key === 'DTEND': {
                calendarUrl += `${chunk.key};${encodeURIComponent(`${chunk.value}\n`)}`;
                break;
            }
            case chunk.key == 'ORGANIZER': {
                const value = chunk.value;
                calendarUrl += `${chunk.key};${encodeURIComponent(`CN=${value.name}:MAILTO:${value.email}\n`)}`;
                break;
            }
            default: {
                calendarUrl += `${chunk.key}:${encodeURIComponent(`${chunk.value}\n`)}`;
                break;
            }
        }
    });
    return `data:text/calendar;charset=utf8,${calendarUrl}`;
};
/** является ли дата рабочим днем? */
export function isDayWorkday(date) {
    switch (date.getDay()) {
        case 0:
        case 6:
            return false;
        default:
            return true;
    }
}
/** возврашяет порядковый номер недели в месяце, по выбранной дате */
export function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Math.ceil((date.getDate() + (firstDay - 1)) / 7);
}
/** ключи дней недели в предложном падеже */
export const getWeekDayLang = (day, getLang) => {
    switch (day) {
        case 0: {
            return getLang('calls_on_sunday'); // воскресеньям
        }
        case 1: {
            return getLang('calls_on_monday'); // понедельникам
        }
        case 2: {
            return getLang('calls_on_tuesday'); // вторникам
        }
        case 3: {
            return getLang('calls_on_wednesday'); // средам
        }
        case 4: {
            return getLang('calls_on_thursday'); // четвергам
        }
        case 5: {
            return getLang('calls_on_friday'); // пятницам
        }
        case 6: {
            return getLang('calls_on_saturday'); // субботам
        }
    }
    return '';
};
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
/** возвращает по типу дня - "по рабочим или "по выходным" */
export const getTypeOfDay = (date, getLang) => {
    switch (date.getDay()) {
        case 0:
        case 6:
            return getLang('calls_on_dayoffs'); // по выходным
        default:
            return getLang('calls_on_workdays'); // по рабочим
    }
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
/** конвертирует миллисекунды в секунды */
export const convertMsToSeconds = (ms) => {
    return Math.round(ms / 1000);
};
/** конвертирует секунды в миллисекунды */
export const convertSecondsToMs = (sec) => {
    return Math.round(sec * 1000);
};
/** функция-санитайзер для приведения `rrule` к формату бекенда */
export const sanitizeRecurrenceRule = (date, rrule) => {
    switch (rrule) {
        case ERepeatCallVariant.WeeklyOnDayType: {
            if (isDayWorkday(date)) {
                return 'weekdays';
            }
            return 'weekend';
        }
        case undefined: {
            return 'never';
        }
        default: {
            return rrule;
        }
    }
};
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
export const getUserSelectOptions = (callParticipant) => {
    if (!callParticipant) {
        return undefined;
    }
    return [
        {
            value: callParticipant.id,
            label: callParticipant.name,
            profile: {
                ...callParticipant,
                photo_100: callParticipant.photo,
            },
        },
    ];
};
/** переводит дату в формат для бекенда */
export const mapDateValue = (date, timezone) => {
    if (!date) {
        return undefined;
    }
    const _d = typeof date === 'number' ? new Date(date) : date;
    const utcZero = convertTimezoneToUTCZero(_d, timezone);
    return dateToUnixTimestamp(utcZero);
};
const _mapFormDataStart = (params) => {
    const dateUTCZero = convertTimezoneToUTCZero(new Date(params.start), params.timezone);
    const time = dateToUnixTimestamp(dateUTCZero);
    const result = {
        mute_audio: params.muteAudio,
        mute_video: params.muteVideo,
        name: params.name,
        only_auth_users: params.onlyAuthUsers,
        duration: convertMsToSeconds(params.duration),
        time,
        recurrence_rule: sanitizeRecurrenceRule(dateUTCZero, params.rrule),
        waiting_hall: params.waitingHall,
        feedback: params.feedback,
        only_admin_can_share_movie: params.onlyAdminCanShareMovie,
        only_admin_can_record: params.onlyAdminCanRecord,
    };
    if (!isUndefined(params.broadcastId)) {
        result.broadcast_id = params.broadcastId;
    }
    if (!isUndefined(params.muteScreensharing)) {
        result.mute_screen_sharing = params.muteScreensharing;
    }
    else {
        // Для обратной совместимости нового и старого меню
        // todo убрать после обновления интерфейса на разделене
        result.mute_screen_sharing = params.muteVideo;
    }
    if (!isUndefined(params.groupId)) {
        result.group_id = params.groupId;
    }
    if (!isUndefined(params.skipNotification)) {
        result.skip_notification = params.skipNotification;
    }
    if (!isUndefined(params.showChatHistory)) {
        result.show_chat_history = params.showChatHistory;
    }
    if (params.rrule !== ERepeatCallVariant.Never) {
        if (!isUndefined(params.recurrenceUntilTime)) {
            result.recurrence_until_time = mapDateValue(params.recurrenceUntilTime);
        }
    }
    return result;
};
const _mapFormDataEdit = (params, call) => {
    const result = {
        ..._mapFormDataStart(params),
        call_id: call.call_id,
    };
    if (params.markerTime) {
        result.marker_time = params.markerTime;
    }
    if (params.broadcastDelete) {
        result.broadcast_delete = params.broadcastDelete;
    }
    if (params.showChatHistory) {
        result.show_chat_history = params.showChatHistory;
    }
    return result;
};
export function mapFormData(params, call) {
    if (call) {
        return _mapFormDataEdit(params, call);
    }
    return _mapFormDataStart(params);
}
// todo Пофиксить типы как зальют бек
export function mapBroadcastFormData(params, callParams) {
    const { broadcastDescription = '', broadcastTime, videoId, ownerId, privacyView, privacyComment, name, photoId, photoOwnerId, } = params;
    const data = {
        video_id: Number(videoId),
        owner_id: Number(ownerId),
        privacy_view: privacyView,
        privacy_comment: privacyComment,
        desc: broadcastDescription,
        start_time: mapDateValue(broadcastTime, callParams.timezone),
        name,
    };
    if (photoId === 0 && photoOwnerId === 0) {
        data.photo_id = photoId;
        data.photo_owner_id = photoOwnerId;
    }
    return data;
}
// Не pure, но цулесообразно, т.к. большая портянка повторяется в 2х местах
export function modifyParamsWithBroadcast({ submitParams, broadcast: { broadcastId, translationCheckbox, translationDescription, translationPrivacyView, translationPrivacyComment, translationTimeVariant, translationPreview, }, call, startTime, }) {
    let broadcastParams = null;
    const isAvailableBroadcast = submitParams.rrule === ERepeatCallVariant.Never;
    if (isAvailableBroadcast && translationCheckbox.checked && startTime && broadcastId) {
        const [ownerId, videoId] = broadcastId.split('_');
        broadcastParams = {
            privacyView: translationPrivacyView.value,
            privacyComment: translationPrivacyComment.value,
            ownerId: Number(ownerId),
            videoId: Number(videoId),
            broadcastTime: translationTimeVariant.value === ETranslationPlannedTimeVariant.EqualToCallTime
                ? submitParams.start
                : startTime,
            broadcastDescription: translationDescription || '',
            name: submitParams.name,
        };
        if (!translationPreview.imgSrc && translationPreview.hasUnrefinedImage) {
            broadcastParams.photoId = 0;
            broadcastParams.photoOwnerId = 0;
        }
        submitParams.broadcastId = broadcastId;
    }
    if ((!isAvailableBroadcast || !translationCheckbox.checked) && call?.broadcast?.video_id) {
        submitParams.broadcastDelete = 1;
    }
    return broadcastParams;
}
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
//# sourceMappingURL=utils.js.map