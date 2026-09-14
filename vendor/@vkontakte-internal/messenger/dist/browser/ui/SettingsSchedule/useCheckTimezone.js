import { useEffect } from 'react';
import { useDispatch, useFeatureFlags, useViewer } from '../../hooks/misc';
import * as Viewer from '../../../core/model/Viewer';
import { convertEduSchedule } from '../../../data/converter/PeerConverter';
import { useApiFetch } from '../../hooks/useApiFetch';
export const useCheckTimezone = () => {
    const dispatch = useDispatch();
    const apiFetch = useApiFetch();
    const { vkm_enable_schedule_edu } = useFeatureFlags();
    const { viewer, profileType } = useViewer();
    const { eduSchedule } = viewer;
    useEffect(() => {
        // если выключен тоггл или аккаунт не учебный
        // или если у пользователя никогда не было установлено расписания
        if (!vkm_enable_schedule_edu ||
            !Viewer.isEdu(profileType) ||
            !eduSchedule) {
            return;
        }
        const zone = eduSchedule.timezone;
        const ourZone = new Date().getTimezoneOffset() * -1;
        const refreshZone = async () => {
            try {
                await apiFetch('messagesEdu.saveUserSchedule', {
                    timezone: ourZone,
                });
                const responseUsers = await apiFetch('users.get', {});
                const responseViewer = responseUsers[0];
                if (!responseViewer?.educational_profile?.schedule) {
                    return;
                }
                const scheduleData = convertEduSchedule(responseViewer?.educational_profile?.schedule);
                dispatch({
                    type: 'UnavailabilitySchedule_Update',
                    userId: viewer.id,
                    schedule: {
                        timezone: scheduleData.timezone,
                        intervals: scheduleData.intervals,
                    },
                });
            }
            catch { }
        };
        if (zone !== ourZone) {
            refreshZone();
        }
    }, [
        apiFetch,
        dispatch,
        eduSchedule,
        profileType,
        viewer.id,
        vkm_enable_schedule_edu,
    ]);
};
//# sourceMappingURL=useCheckTimezone.js.map