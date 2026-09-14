import React from 'react';
import { Icon12ChevronRight, Icon20NotificationSlashOutline, } from '@vkontakte/icons';
import { useBrowserEnv, useViewer } from '../../hooks/misc';
import * as Peer from '../../../core/model/Peer';
import { useUnavailableSchedule } from '../../ui/SettingsSchedule/useUnavailableSchedule';
import '../../ui/ConvoHistoryScheduleFootnote/ConvoHistoryScheduleFootnote.css';
import { useRouter } from '../../ui/Router/Router';
export const ConvoHistoryScheduleFootnote = ({ peer }) => {
    const { lang, stats } = useBrowserEnv();
    const { viewer } = useViewer();
    const { navigate } = useRouter();
    const peerUnavailableScheduleData = useUnavailableSchedule(peer);
    const viewerUnavailableScheduleData = useUnavailableSchedule(viewer);
    const isNoRoleViewer = !Peer.hasEduOrganizationalRoles(viewer);
    const isNoRolePeer = !Peer.hasEduOrganizationalRoles(peer);
    const openSchedule = () => {
        stats.logEvent({
            type: 'type_navgo',
            type_navgo: {
                subtype: 'go',
                screen: 'im',
                screen_to: 'im_settings_do_not_disturb',
            },
        });
        navigate({
            kind: 'SettingsRoute',
            section: 'schedule',
        });
    };
    if (peerUnavailableScheduleData.enable && isNoRoleViewer) {
        // Ученик общается с пользователем который может включить расписание доступности, и оно распространяется на ученика
        return (React.createElement("div", { className: "ConvoHistoryScheduleFootnote__container" },
            React.createElement("div", { className: "ConvoHistoryScheduleFootnote" },
                React.createElement("div", null,
                    React.createElement(Icon20NotificationSlashOutline, null)),
                React.createElement("span", null, lang.use('me_schedule_unavailability_footnote_text', {
                    sex: Peer.sex(peer),
                    values: {
                        name: Peer.name(peer),
                        day: peerUnavailableScheduleData.day,
                        time: peerUnavailableScheduleData.time,
                    },
                })))));
    }
    if (viewerUnavailableScheduleData.enable && isNoRolePeer) {
        /*
          Учитель, или другая роль позволяющая составить расписание доступности, общается с пользователем который
          не может составить своё расписание доступности, т.е. ученик, родитель, и так далее
         */
        return (React.createElement("div", { className: "ConvoHistoryScheduleFootnote__container" },
            React.createElement("div", { className: "ConvoHistoryScheduleFootnote" },
                React.createElement("div", null,
                    React.createElement(Icon20NotificationSlashOutline, null)),
                React.createElement("div", null, lang.use('me_schedule_unavailability_viewer_footnote_text', {
                    values: {
                        day: viewerUnavailableScheduleData.day,
                        time: viewerUnavailableScheduleData.time,
                    },
                })),
                React.createElement("button", { className: "ConvoHistoryScheduleFootnote__scheduleButton", onClick: openSchedule },
                    React.createElement(Icon12ChevronRight, { className: "ConvoHistoryScheduleFootnote__scheduleButtonIcon", width: 16, height: 16 })))));
    }
    return null;
};
//# sourceMappingURL=ConvoHistoryScheduleFootnote.js.map