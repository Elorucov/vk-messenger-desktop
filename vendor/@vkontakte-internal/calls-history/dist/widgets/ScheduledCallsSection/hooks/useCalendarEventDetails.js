import { useCallback } from 'react';
import { useLangs } from '@vkontakte-internal/plugins';
import { createEventDescription, createEventTitle, createInviteStartText } from '../helpers';
/**
 * хук для использования в контейнере, нужен для получения
 * данных по событию и маппингу данных по нему
 */
export const useCalendarEventDetails = ({ meParticipant }) => {
    const { getLang, locale } = useLangs();
    /** возвращает отформатированную дату начала мероприятия */
    const getTitle = useCallback((event) => {
        return createEventTitle(event, locale);
    }, [locale]);
    const getDescription = useCallback((event, showShortCredentials = false) => {
        return createEventDescription({ event, meParticipant, getLang, locale, showShortCredentials });
    }, [meParticipant, locale]);
    const getDetailedDescription = useCallback((event) => {
        if (!event?.start) {
            return;
        }
        return {
            startText: createInviteStartText({ event, meParticipant, getLang, locale }),
            joinLink: event.joinLink,
            broadcastLink: event.broadcastLink,
            shortCredentials: event.shortCredentials,
        };
    }, [meParticipant, locale]);
    return {
        getDescription,
        getDetailedDescription,
        getTitle,
    };
};
//# sourceMappingURL=useCalendarEventDetails.js.map