import { useMemo } from 'react';
import { browser } from '@vkontakte/calls-sdk';
import { useLang } from '../../hooks/useLang';
import { HOUR, MINUTE, DAY } from '../../helpers/date';
import { EDuration, EMediaPermission, DURATION_MAP, DURATION_LANG_MAP } from './constants';
import { ECalendar, hasIn } from '@vkontakte-internal/calls-core';
export const useOptions = (shouldSuggestMailRuCalendar) => {
    const { getLang } = useLang();
    const langMapMediaPermissions = useMemo(() => {
        return {
            [EMediaPermission.Allowed]: getLang('calls_create_call_by_link_phone_option_allow_always'),
            [EMediaPermission.DisabledOnEnter]: getLang('calls_create_call_by_link_phone_option_disallow_entrance'),
            [EMediaPermission.Disabled]: getLang('calls_create_call_by_link_phone_option_disallow_always'),
        };
    }, [getLang]);
    const calendarOptions = useMemo(() => {
        const os = browser.os();
        const result = [];
        for (const value of Object.values(ECalendar)) {
            switch (value) {
                case ECalendar.MailRu: {
                    if (shouldSuggestMailRuCalendar) {
                        result.push({ label: getLang('calls_mail_ru_short'), value });
                    }
                    break;
                }
                case ECalendar.Outlook: {
                    if (hasIn(os, 'Windows', 'MacOS')) {
                        result.push({ label: value, value });
                    }
                    break;
                }
                case ECalendar.iCloud: {
                    if (hasIn(os, 'MacOS')) {
                        result.push({ label: value, value });
                    }
                    break;
                }
                case ECalendar.Google: {
                    const label = getLang('calls_calendar').replace('{name}', ECalendar.Google);
                    result.push({ label, value });
                    break;
                }
                case ECalendar.Other: {
                    const label = getLang('calls_will_add_to_another_calendar');
                    result.push({ label, value });
                    break;
                }
            }
        }
        return result;
    }, [getLang]);
    const mediaOptions = useMemo(() => {
        return Object.keys(EMediaPermission).map((key) => {
            return {
                label: langMapMediaPermissions[EMediaPermission[key]],
                value: EMediaPermission[key],
            };
        });
    }, [getLang]);
    const durationOptions = useMemo(() => {
        const getLangDuration = (type, value, getLang) => {
            switch (type) {
                case 'm': {
                    return getLang('calls_min', value).replace('{time}', value.toString());
                }
                case 'h': {
                    return getLang('calls_hour_v2', value).replace('{hours}', value.toString());
                }
                case 'd': {
                    return getLang('calls_all_day');
                }
            }
        };
        return Object.values(EDuration).map((key) => {
            const langKey = DURATION_LANG_MAP[key];
            const { value, type } = (() => {
                switch (langKey) {
                    case 'calls_min':
                        return {
                            value: DURATION_MAP[key] / MINUTE,
                            type: 'm',
                        };
                    case 'calls_hour':
                        return {
                            value: DURATION_MAP[key] / HOUR,
                            type: 'h',
                        };
                    case 'calls_day':
                    default:
                        return {
                            value: DURATION_MAP[key] / DAY,
                            type: 'd',
                        };
                }
            })();
            return {
                label: getLangDuration(type, value, getLang),
                value: key,
            };
        });
    }, [getLang]);
    return {
        calendarOptions,
        durationOptions,
        mediaOptions,
    };
};
//# sourceMappingURL=useOptions.js.map