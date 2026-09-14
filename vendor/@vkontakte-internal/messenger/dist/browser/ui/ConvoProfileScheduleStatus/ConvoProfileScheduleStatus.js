import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { useUnavailableSchedule } from '../../ui/SettingsSchedule/useUnavailableSchedule';
import { Icon28NotificationDisableOutline } from '@vkontakte/icons';
import '../../ui/ConvoProfileScheduleStatus/ConvoProfileScheduleStatus.css';
export const ConvoProfileScheduleStatus = ({ peer }) => {
    const { lang } = useBrowserEnv();
    const unavailableScheduleData = useUnavailableSchedule(peer);
    if (!unavailableScheduleData.enable) {
        return null;
    }
    return (React.createElement("div", { className: "ConvoProfileScheduleStatus__container" },
        React.createElement("div", { className: "ConvoProfileScheduleStatus__content" },
            React.createElement("div", { className: "ConvoProfileScheduleStatus__icon" },
                React.createElement(Icon28NotificationDisableOutline, null)),
            lang.use('me_convo_profile_schedule_status_text', {
                values: {
                    day: unavailableScheduleData.day,
                    time: unavailableScheduleData.time,
                },
            }))));
};
//# sourceMappingURL=ConvoProfileScheduleStatus.js.map