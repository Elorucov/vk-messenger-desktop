import { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
import { getCurrentWeekDay, getFormattedTimeFromSeconds, SECONDS_IN_MINUTE, } from '../../../core/utils/time';
import { useNow } from '../../hooks/useNow';
import { SECONDS_IN_THE_DAY } from '@vkontakte/vkjs';
const CHECK_INTERVAL = 5 * SECONDS_IN_MINUTE * 1_000;
/**
 * Возвращает нам расписание доступности пира при условии, что включен тоггл vkm_enable_schedule_edu
 * и если текущее время пира попадает в его расписание
 */
export const useUnavailableSchedule = (peer) => {
    const { lang } = useBrowserEnv();
    const { vkm_enable_schedule_edu } = useFeatureFlags();
    const now = useNow(CHECK_INTERVAL);
    const currentWeekDay = useMemo(() => getCurrentWeekDay(), []);
    const unavailabilityModeEndTime = useMemo(() => Peer.getUnavailabilityEndTime(peer), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [peer, now]);
    const unavailabilityMode = useMemo(() => Peer.getUnavailabilityEnabled(peer), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [peer, now]);
    if (!vkm_enable_schedule_edu ||
        !unavailabilityMode ||
        !unavailabilityModeEndTime) {
        return { enable: false };
    }
    let day = '';
    if (currentWeekDay !== unavailabilityModeEndTime.dayweek) {
        const now = Date.now();
        const weekDaysDelta = unavailabilityModeEndTime.dayweek >= currentWeekDay
            ? unavailabilityModeEndTime.dayweek - currentWeekDay
            : 7 - currentWeekDay + unavailabilityModeEndTime.dayweek;
        /**
         * Делаем -1, потому что в этом условии всегда переход через день, а значит нужно именно количество
         * полных дней между текущей датой, и датой завершения периода недоступности
         */
        const endTimeDelta = (weekDaysDelta - 1) * SECONDS_IN_THE_DAY;
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const remainder = SECONDS_IN_THE_DAY - (now - dayStart.getTime()) / 1000;
        const delta = remainder + endTimeDelta + unavailabilityModeEndTime.time;
        if (delta > SECONDS_IN_THE_DAY) {
            const days = [
                lang.use('me_settings_schedule_monday_genitive'),
                lang.use('me_settings_schedule_tuesday_genitive'),
                lang.use('me_settings_schedule_wednesday_genitive'),
                lang.use('me_settings_schedule_thursday_genitive'),
                lang.use('me_settings_schedule_friday_genitive'),
                lang.use('me_settings_schedule_saturday_genitive'),
                lang.use('me_settings_schedule_sunday_genitive'),
            ];
            day = days[unavailabilityModeEndTime.dayweek] ?? '';
        }
    }
    return {
        enable: true,
        time: getFormattedTimeFromSeconds(unavailabilityModeEndTime.time),
        day,
    };
};
//# sourceMappingURL=useUnavailableSchedule.js.map